import { useLocale } from "../hooks/useLocale";
import { LOCALES } from "../i18n/locales";

// A small note for languages whose lessons aren't translated yet (Hindi and
// Urdu): the interface is in their language, but meanings are in English.
export default function ContentLanguageNotice() {
  const { locale, contentLocale, t } = useLocale();
  if (locale === contentLocale) return null;

  const language = LOCALES.find((l) => l.code === locale)?.label;
  return (
    <p role="note" className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-800">
      {t("contentLang.notice", { language })}
    </p>
  );
}
