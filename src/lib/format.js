// Language-aware number formatting lives in useLocale().num

// Local calendar day as "2026-11-03", used for streaks
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Removes Arabic vowel marks, so "شُكْراً" and "شكرا" count as the same word
export function normalizeArabic(text) {
  return text
    .replace(/[ً-ْٰـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function byOrder(a, b) {
  return (a.order ?? 0) - (b.order ?? 0);
}
