import { PageHeader } from "../components/ui";
import { useLocale } from "../hooks/useLocale";
import { cardClass } from "../lib/styles";

// Plain-language privacy policy. Review it before a public launch.
// Keep the "delete" section in step with public/delete-account/index.html,
// the page linked from the Google Play Store listing.
const sections = ["collect", "why", "where", "never", "delete", "contact"];

export default function Privacy() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("footer.privacy")} subtitle={t("privacy.subtitle")} />
      <div className={`${cardClass} divide-y divide-slate-100`}>
        {sections.map((key) => (
          <section key={key} className="p-5">
            <h2 className="font-semibold text-slate-900">{t(`privacy.${key}`)}</h2>
            <p className="mt-1 text-slate-600">{t(`privacy.${key}Text`)}</p>
            {/* A plain link (not a router link): it's a separate static page */}
            {key === "delete" && (
              <a href="./delete-account/" className="mt-2 inline-block font-medium text-emerald-700 hover:underline">
                {t("privacy.deleteLink")} →
              </a>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
