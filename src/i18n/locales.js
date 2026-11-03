// Languages the app interface can be shown in.
//
// content: which language lessons and word meanings are shown in. Hindi and
//   Urdu have their own interface text but no lesson translations yet, so
//   they use the English content and see courses ticked for English learners.
// dir: "rtl" for right-to-left scripts (Urdu).
//
// To give Hindi or Urdu its own lesson content later:
// 1. Add meaning fields to items (e.g. "hindi", "hi_transliteration")
//    and handle them in meaningOf / pronunciationOf in context/LocaleContext.jsx
// 2. Add the language to the course languages in Admin > Courses
// 3. Set content to the language's own code below
export const LOCALES = [
  { code: "bn", label: "বাংলা", short: "বাং", digits: "০১২৩৪৫৬৭৮৯", content: "bn", dir: "ltr", enabled: true },
  { code: "en", label: "English", short: "EN", digits: null, content: "en", dir: "ltr", enabled: true },
  { code: "hi", label: "हिन्दी", short: "हि", digits: null, content: "en", dir: "ltr", enabled: true },
  { code: "ur", label: "اردو", short: "اُر", digits: null, content: "en", dir: "rtl", enabled: true },
];

export const DEFAULT_LOCALE = "bn";

// The content language for an interface language, e.g. "hi" -> "en"
export function contentLanguage(code) {
  return LOCALES.find((l) => l.code === code)?.content ?? code;
}
