import { useLocale } from "../hooks/useLocale";
import { LOCALES } from "../i18n/locales";

// compact: a small dropdown for the top bar.
// Otherwise: buttons for every language, with planned ones shown as "soon".
export default function LanguageSwitcher({ compact = false }) {
  const { locale, setLocale, t } = useLocale();

  if (compact) {
    return (
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        aria-label={t("language.label")}
        className="rounded-lg border border-slate-200 bg-white py-1.5 pr-7 pl-2 text-sm font-medium text-slate-700"
      >
        {/* Short names keep the top bar small on phones. A select is as wide as
            its longest option, so planned languages show only their short name. */}
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} disabled={!l.enabled} title={l.enabled ? l.label : t("language.soon")}>
            {l.short}
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t("language.label")}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          disabled={!l.enabled}
          aria-pressed={locale === l.code}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            locale === l.code
              ? "border-emerald-600 bg-emerald-50 text-emerald-800"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {l.label}
          {!l.enabled && <span className="ml-1 text-xs font-normal">· {t("language.soon")}</span>}
        </button>
      ))}
    </div>
  );
}
