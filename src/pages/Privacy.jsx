import { PageHeader } from "../components/ui";
import { useLocale } from "../hooks/useLocale";
import { cardClass } from "../lib/styles";

// Plain-language privacy policy. Review it before a public launch.
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
          </section>
        ))}
      </div>
    </div>
  );
}
