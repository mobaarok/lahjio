// Web Speech helper: reads Arabic text aloud

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
