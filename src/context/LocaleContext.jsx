import { useEffect, useState } from "react";
import { LocaleContext } from "../hooks/useLocale";
import { DEFAULT_LOCALE, LOCALES } from "../i18n/locales";
import { messages } from "../i18n/messages";

const STORAGE_KEY = "lahjio-locale";

// The saved language, if it is one we support. Storage can be blocked, so
// failures just fall back to the default.
function savedLocale() {
  try {
    const code = localStorage.getItem(STORAGE_KEY);
    return LOCALES.some((l) => l.code === code && l.enabled) ? code : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

// Holds the interface language and gives every page translation helpers
export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(savedLocale);
  const current = LOCALES.find((l) => l.code === locale);
  // Language of lessons and meanings; Hindi and Urdu use English for now
  const contentLocale = current.content;

  // Keeps <html lang>, the text direction and the browser tab title in the
  // chosen language. Urdu is right to left.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = current.dir;
    document.title = messages[locale]?.["meta.title"] ?? messages.en["meta.title"];
  }, [locale, current.dir]);

  function setLocale(code) {
    setLocaleState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Not saved, but the page still switches language
    }
  }

  // Looks up a message, falling back to English, then to the key itself.
  // "{name}" in a message is replaced with vars.name.
  function t(key, vars = {}) {
    const text = messages[locale]?.[key] ?? messages.en[key] ?? key;
    return text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ""));
  }

  // Numbers in the language's own digits
  function num(value) {
    if (!current.digits) return String(value);
    return String(value).replace(/\d/g, (d) => current.digits[d]);
  }

  // Meaning and pronunciation of a word or phrase in the content language.
  // English falls back to Bangla when an item has no English yet.
  function meaningOf(item) {
    return contentLocale === "en" ? item.english || item.bangla : item.bangla;
  }

  function pronunciationOf(item) {
    return contentLocale === "en"
      ? item.en_transliteration || item.bn_transliteration
      : item.bn_transliteration;
  }

  // The optional tip on an item (when to say it, or why). No fallback to the
  // other language: a Bangla note doesn't help an English learner.
  function noteOf(item) {
    return (contentLocale === "en" ? item.note_en : item.note_bn) || "";
  }

  // Picks a translated database field, e.g. localized(course, "title") reads
  // title_en or title_bn (by content language), and falls back to the other one
  function localized(object, field) {
    return object?.[`${field}_${contentLocale}`] || object?.[`${field}_bn`] || object?.[`${field}_en`] || "";
  }

  const value = { locale, contentLocale, setLocale, t, num, meaningOf, pronunciationOf, noteOf, localized };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
