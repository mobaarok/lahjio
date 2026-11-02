// Languages the app interface can be shown in.
//
// To switch on Hindi later:
// 1. Copy messages/en.js to messages/hi.js and translate the values
// 2. Import it in messages/index.js
// 3. Add Hindi meaning fields to items (e.g. "hindi", "hi_transliteration")
//    and handle them in meaningOf / pronunciationOf in context/LocaleContext.jsx
// 4. Set enabled: true below
export const LOCALES = [
  { code: "bn", label: "বাংলা", short: "বাং", digits: "০১২৩৪৫৬৭৮৯", enabled: true },
  { code: "en", label: "English", short: "EN", digits: null, enabled: true },
  { code: "hi", label: "हिन्दी", short: "हि", digits: "०१२३४५६७८९", enabled: false },
];

export const DEFAULT_LOCALE = "bn";
