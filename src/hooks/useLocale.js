import { createContext, useContext } from "react";

// Filled by <LocaleProvider> in context/LocaleContext.jsx
export const LocaleContext = createContext(null);

// Gives any component the current language and the helpers that use it:
//   t("nav.home")                    -> "হোম" or "Home"
//   t("words.found", { count: 3 })   -> fills {count} in the message
//   num(42)                          -> "৪২" in Bangla, "42" in English
//   meaningOf(item), pronunciationOf(item), noteOf(item), localized(course, "title")
//   contentLocale: language of lessons and meanings ("en" for Hindi and Urdu)
export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === null) {
    throw new Error("useLocale must be used inside <LocaleProvider>");
  }
  return context;
}
