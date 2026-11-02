// Audio helpers: play a word's own file, or read it with Web Speech

let currentAudio = null; // the audio file playing now, if any

// Plays a word. Returns true if it played, false if no sound was possible.
export async function playWord(word) {
  if (currentAudio) currentAudio.pause(); // stop the previous word
  currentAudio = null;

  // 1. Own audio file: used when the item has an "audio" path or link
  if (word.audio) {
    const audio = new Audio(word.audio);
    currentAudio = audio;
    window.speechSynthesis?.cancel();

    try {
      await audio.play();
      return true;
    } catch {
      // The file couldn't play, for example a wrong path or missing file.
      // If another word was clicked while it loaded, don't fall back
      if (currentAudio !== audio) return true;
      currentAudio = null;
    }
  }

  // 2. Fallback: no audio file, or it failed, so use Web Speech
  return speakArabic(word.arabic);
}

export function speakArabic(text) {
  if (!("speechSynthesis" in window)) return false;

  const voices = window.speechSynthesis.getVoices();
  const arabicVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("ar"));
  const arabicVoice =
    arabicVoices.find((v) => v.lang.toLowerCase().endsWith("sa")) ?? arabicVoices[0];

  // Some browsers load voices late, so an empty list doesn't mean there are none
  if (voices.length > 0 && !arabicVoice) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  utterance.rate = 0.8; // a little slower for learners
  if (arabicVoice) utterance.voice = arabicVoice;

  window.speechSynthesis.cancel(); // stop the previous word
  window.speechSynthesis.speak(utterance);
  return true;
}
