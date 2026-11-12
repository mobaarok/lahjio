// Makes audio files for items with ElevenLabs text to speech.
//
// Each file has the item's Arabic said twice: first by a male voice
// (Abdulrahman), then, after a short pause, by a female voice (Heba Mansuri).
// Files are saved as public/audio/<itemId>.mp3, the same place and name the
// app and the "Link audio files" button in Admin > Items expect.
//
// The items come from the local content packs (content-packs/*.json), which
// are the local copy of what is in Firestore. Nothing is written to Firestore
// here: after deploying, the owner clicks "Link audio files" in the admin.
//
// Needs ELEVENLABS_API_KEY in .env.elevenlabs (not in git). Run with:
//   npm run audio -- --test            5 sample items
//   npm run audio -- --ids a,b,c       only these item ids
//   npm run audio -- --all             every item
// Add --dry to only list what would be made, without calling ElevenLabs.
//
// Items that already have a file are skipped, so a stopped run can simply be
// started again, and the real recordings (s7-d1-01 to s7-d1-19) stay as they are.

import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const MALE_VOICE = "KfYUTAF49N2CPU3iKuMi"; // Abdulrahman
const FEMALE_VOICE = "v7UCHHCrHj1KBa4E41gb"; // Heba Mansuri
const MODEL = "eleven_v4"; // the owner liked v4 best for Saudi Arabic (2026-11-12)
const PAUSE_SECONDS = 0.2; // silence between the male and the female voice
// Quiet frames kept around the pause (each frame is about 26 ms). ElevenLabs
// adds some quiet after each clip; we keep only a little, so the gap is close
// to the owner's own recordings (s7-d1-*: about 0.25 s between the voices).
const KEEP_QUIET_AFTER_MALE = 3;
const KEEP_QUIET_BEFORE_FEMALE = 1;
const QUIET_GAIN = 132; // a frame with a "global gain" at or below this is near silence

const TEST_IDS = ["s7-d2-03", "s7-d2-01", "s7-d2-04", "wk-l1-03", "us-l1-03", "rd-l1-02"];

const root = path.resolve(import.meta.dirname, "..");
const packsDir = path.join(root, "content-packs");
const audioDir = path.join(root, "public", "audio");

// ---- 1. Read the options -------------------------------------------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
let wantedIds = null; // null = all items
if (args.includes("--test")) wantedIds = new Set(TEST_IDS);
const idsIndex = args.indexOf("--ids");
if (idsIndex !== -1) wantedIds = new Set(args[idsIndex + 1].split(","));
if (!wantedIds && !args.includes("--all") && !args.includes("--fix")) {
  console.log("Choose --test, --ids a,b,c or --all (add --dry to only list).");
  process.exit(1);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey && !dryRun) {
  console.log("ELEVENLABS_API_KEY is missing. Put it in .env.elevenlabs.");
  process.exit(1);
}

// ---- 2. Collect items from the content packs ------------------------------

// The same Arabic can appear in several packs with different ids (Firestore
// keeps only one of them). We make the audio once per Arabic text and save a
// copy under every id, so no credits are spent twice.
const idsByArabic = new Map();
for (const file of readdirSync(packsDir).filter((name) => name.endsWith(".json"))) {
  const pack = JSON.parse(readFileSync(path.join(packsDir, file), "utf8"));
  for (const item of pack.items || []) {
    const arabic = item.arabic.trim();
    if (!idsByArabic.has(arabic)) idsByArabic.set(arabic, new Set());
    idsByArabic.get(arabic).add(item.id);
  }
}

const fileFor = (id) => path.join(audioDir, `${id}.mp3`);

// One job per Arabic text that still needs at least one file
const jobs = [];
for (const [arabic, idSet] of idsByArabic) {
  const ids = [...idSet].filter((id) => !wantedIds || wantedIds.has(id));
  if (ids.length === 0) continue;
  // If any id already has a file (for example a real recording), skip the text
  if ([...idSet].some((id) => existsSync(fileFor(id)))) continue;
  jobs.push({ arabic, ids });
}

const characters = jobs.reduce((sum, job) => sum + job.arabic.length * 2, 0);
console.log(`${jobs.length} texts to make (${jobs.reduce((s, j) => s + j.ids.length, 0)} files), about ${characters} characters.`);
if (dryRun) {
  for (const job of jobs) console.log(`  ${job.ids.join(", ")}  ${job.arabic}`);
  process.exit(0);
}

// ---- 3. Joining MP3 files ----------------------------------------------------

// An MP3 file is a row of small "frames" of about 26 ms each, so two MP3s can
// be joined by putting one after the other. Two things must be taken out first:
// - the ID3 tag at the start (title info, no sound)
// - the "Info" (or "Xing") frame: a silent first frame that tells players how
//   long the file is. After joining it would still give the length of the male
//   voice only, and Android's player trusts it and stops before the female voice.
// Without it, players work out the length from the file size (all frames have
// the same bitrate), which is right for the joined file.

const BITRATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]; // MPEG-1 Layer III, kbit/s
const SAMPLE_RATES = [44100, 48000, 32000];

// Length in bytes of the frame whose 4-byte header starts at `at`, or 0 if no frame starts there
function frameLength(mp3, at) {
  if (at + 4 > mp3.length || mp3[at] !== 0xff || (mp3[at + 1] & 0xfe) !== 0xfa) return 0;
  const bitrate = BITRATES[mp3[at + 2] >> 4] * 1000;
  const sampleRate = SAMPLE_RATES[(mp3[at + 2] >> 2) & 0x03];
  if (!bitrate || !sampleRate) return 0;
  const padding = (mp3[at + 2] >> 1) & 0x01;
  return Math.floor((144 * bitrate) / sampleRate) + padding;
}

// Returns only the sound frames of an MP3 (no ID3 tag, no Info/Xing frame)
function soundFrames(mp3) {
  let at = 0;
  if (mp3.toString("latin1", 0, 3) === "ID3") {
    at = 10 + ((mp3[6] << 21) | (mp3[7] << 14) | (mp3[8] << 7) | mp3[9]);
  }
  const frames = [];
  while (at < mp3.length) {
    const length = frameLength(mp3, at);
    if (length === 0) break; // end of the sound (or something that isn't a frame)
    const frame = mp3.subarray(at, at + length);
    const mono = (frame[3] >> 6) === 3;
    const marker = frame.toString("latin1", mono ? 21 : 36, mono ? 25 : 40);
    if (marker !== "Info" && marker !== "Xing") frames.push(frame);
    at += length;
  }
  return Buffer.concat(frames);
}

// Frames that hold no sound, for the pause between the voices. They copy the
// header of the first sound frame (same bitrate, sample rate and mono/stereo).
function silence(sound, seconds) {
  const header = Buffer.from(sound.subarray(0, 4));
  header[2] &= ~0x02; // no padding byte, so every frame has the same length
  const sampleRate = SAMPLE_RATES[(header[2] >> 2) & 0x03];
  const frame = Buffer.alloc(frameLength(header, 0)); // header + zeros = no sound
  header.copy(frame, 0);
  const frameCount = Math.round((seconds * sampleRate) / 1152); // 1152 samples per frame
  return Buffer.concat(Array(frameCount).fill(frame));
}

// Splits sound frames into a list of single frames
function frames(sound) {
  const list = [];
  for (let at = 0; at < sound.length; ) {
    const length = frameLength(sound, at);
    if (length === 0) break;
    list.push(sound.subarray(at, at + length));
    at += length;
  }
  return list;
}

// How loud a frame is, roughly, without decoding it: the highest "global gain"
// in its side info. Speech is about 140 to 180, near silence below about 132.
function loudness(frame) {
  const mono = (frame[3] >> 6) === 3;
  const readBits = (start, count) => {
    let value = 0;
    for (let i = 0; i < count; i++) {
      const bit = 32 + start + i; // side info starts after the 4-byte header
      value = (value << 1) | ((frame[bit >> 3] >> (7 - (bit & 7))) & 1);
    }
    return value;
  };
  let offset = mono ? 18 : 20; // bits before the first granule's info
  let loudest = 0;
  for (let block = 0; block < (mono ? 2 : 4); block++) {
    loudest = Math.max(loudest, readBits(offset + 21, 8)); // global gain
    offset += 59;
  }
  return loudest;
}

const isZeroFrame = (frame) => frame.subarray(4).every((byte) => byte === 0);

// Joins the two voices: male, a short pause, female. Long quiet stretches at
// the end of the male clip and the start of the female clip are cut down.
function joinVoices(male, female) {
  const maleFrames = frames(male);
  let end = maleFrames.length;
  while (end > 0 && loudness(maleFrames[end - 1]) <= QUIET_GAIN) end--;
  end = Math.min(maleFrames.length, end + KEEP_QUIET_AFTER_MALE);

  const femaleFrames = frames(female);
  let start = 0;
  while (start < femaleFrames.length && loudness(femaleFrames[start]) <= QUIET_GAIN) start++;
  start = Math.max(0, start - KEEP_QUIET_BEFORE_FEMALE);

  return Buffer.concat([
    ...maleFrames.slice(0, end),
    silence(male, PAUSE_SECONDS),
    ...femaleFrames.slice(start),
  ]);
}

// --fix: brings files made earlier up to date without calling ElevenLabs:
// takes out Info frames (Android played only the male voice) and shortens the
// pause. The pause is found by its silent frames. Real recordings (s7-d1-*)
// are left alone.
if (args.includes("--fix")) {
  let fixed = 0;
  for (const name of readdirSync(audioDir)) {
    if (!name.endsWith(".mp3") || name.startsWith("s7-d1-")) continue;
    const before = readFileSync(path.join(audioDir, name));
    const list = frames(soundFrames(before));
    const pauseStart = list.findIndex(isZeroFrame);
    if (pauseStart === -1) continue;
    let pauseEnd = pauseStart;
    while (pauseEnd < list.length && isZeroFrame(list[pauseEnd])) pauseEnd++;
    const after = joinVoices(Buffer.concat(list.slice(0, pauseStart)), Buffer.concat(list.slice(pauseEnd)));
    if (after.equals(before)) continue;
    writeFileSync(path.join(audioDir, name), after);
    fixed++;
  }
  console.log(`Fixed ${fixed} files.`);
  process.exit(0);
}

// ---- 4. Call ElevenLabs ----------------------------------------------------

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Returns the MP3 bytes for one text in one voice. Retries when busy.
async function speak(text, voiceId) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ text, model_id: MODEL }),
      },
    );
    if (response.ok) return Buffer.from(await response.arrayBuffer());

    const message = await response.text();
    // 429 = too many requests at once; wait and try again
    if (response.status === 429 || response.status >= 500) {
      console.log(`  busy (${response.status}), retrying in ${attempt * 5}s...`);
      await wait(attempt * 5000);
      continue;
    }
    throw new Error(`ElevenLabs ${response.status}: ${message}`);
  }
  throw new Error("ElevenLabs kept saying busy; try again later.");
}

// ---- 5. Make the files ------------------------------------------------------

mkdirSync(audioDir, { recursive: true });
let done = 0;
for (const job of jobs) {
  const male = soundFrames(await speak(job.arabic, MALE_VOICE));
  const female = soundFrames(await speak(job.arabic, FEMALE_VOICE));
  const audio = joinVoices(male, female);
  for (const id of job.ids) writeFileSync(fileFor(id), audio);
  done++;
  console.log(`[${done}/${jobs.length}] ${job.ids.join(", ")}  ${job.arabic}`);
}
console.log("Done.");
