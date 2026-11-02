import { Link } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import { buttonClass } from "../lib/styles";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <div className="py-20 text-center">
      <p lang="ar" dir="rtl" className="text-5xl font-bold text-emerald-700">
        عفواً
      </p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">{t("notFound.title")}</h1>
      <p className="mt-2 text-slate-600">{t("notFound.text")}</p>
      <Link to="/" className={buttonClass("primary", "lg", "mt-6")}>
        {t("common.goHome")}
      </Link>
    </div>
  );
}
