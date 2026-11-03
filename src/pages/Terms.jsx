import { PageHeader } from "../components/ui";
import { useLocale } from "../hooks/useLocale";
import { cardClass } from "../lib/styles";

// Plain-language terms of use, built like the Privacy page. Review it before
// paid plans launch.
const sections = ["use", "content", "account", "free", "changes", "contact"];

export default function Terms() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t("footer.terms")} subtitle={t("terms.subtitle")} />
      <div className={`${cardClass} divide-y divide-slate-100`}>
        {sections.map((key) => (
          <section key={key} className="p-5">
            <h2 className="font-semibold text-slate-900">{t(`terms.${key}`)}</h2>
            <p className="mt-1 text-slate-600">{t(`terms.${key}Text`)}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
