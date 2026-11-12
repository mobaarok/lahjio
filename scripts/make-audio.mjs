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
const PAUSE_SECONDS = 0.7; // silence between the male and the female voice

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
if (!wantedIds && !args.includes("--all")) {
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

// ---- 3. Call ElevenLabs ----------------------------------------------------

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

// ---- 4. Silence between the two voices ------------------------------------

// An MP3 file is a row of small "frames" of about 26 ms each, so two MP3s can
// be joined by putting one after the other. For the pause we add frames that
// hold no sound. They copy the header of ElevenLabs' own first frame (same
// bitrate, sample rate and mono/stereo), so players treat them like the rest.
// Removes the ID3 tag (title info, no sound) at the start of an MP3, if any,
// so the joined file doesn't have a tag in the middle
function withoutTag(mp3) {
  if (mp3.toString("latin1", 0, 3) !== "ID3") return mp3;
  const size = (mp3[6] << 21) | (mp3[7] << 14) | (mp3[8] << 7) | mp3[9];
  return mp3.subarray(10 + size);
}

function silence(mp3, seconds) {
  const header = Buffer.from(withoutTag(mp3).subarray(0, 4));
  header[2] &= ~0x02; // no padding byte, so every frame has the same length

  const bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]; // MPEG-1 Layer III
  const sampleRates = [44100, 48000, 32000];
  const bitrate = bitrates[header[2] >> 4] * 1000;
  const sampleRate = sampleRates[(header[2] >> 2) & 0x03];
  const frameLength = Math.floor((144 * bitrate) / sampleRate);

  // Each frame is the header followed by zeros (zeros = no sound)
  const frame = Buffer.alloc(frameLength);
  header.copy(frame, 0);
  const frameCount = Math.round((seconds * sampleRate) / 1152); // 1152 samples per frame
  return Buffer.concat(Array(frameCount).fill(frame));
}

// ---- 5. Make the files ------------------------------------------------------

mkdirSync(audioDir, { recursive: true });
let done = 0;
for (const job of jobs) {
  const male = await speak(job.arabic, MALE_VOICE);
  const female = await speak(job.arabic, FEMALE_VOICE);
  const audio = Buffer.concat([withoutTag(male), silence(male, PAUSE_SECONDS), withoutTag(female)]);
  for (const id of job.ids) writeFileSync(fileFor(id), audio);
  done++;
  console.log(`[${done}/${jobs.length}] ${job.ids.join(", ")}  ${job.arabic}`);
}
console.log("Done.");
