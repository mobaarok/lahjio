import { useState } from "react";
import { Link } from "react-router-dom";
import AudioButton from "../AudioButton";
import { useLocale } from "../../hooks/useLocale";
import { buttonClass, cardClass } from "../../lib/styles";

// One real question on the landing page, so visitors can try before signing up
const word = { id: "demo", arabic: "شكراً", bangla: "ধন্যবাদ", english: "Thank you", audio: null };
const options = [
  { id: "a", bangla: "বিদায়", english: "Goodbye" },
  { id: "demo", bangla: "ধন্যবাদ", english: "Thank you" },
  { id: "b", bangla: "পানি", english: "Water" },
  { id: "c", bangla: "আগামীকাল", english: "Tomorrow" },
];

export default function TryItDemo() {
  const { t, meaningOf } = useLocale();
  const [picked, setPicked] = useState(null);
  const answered = picked !== null;

  function optionClass(option) {
    const base = "rounded-2xl border-2 px-4 py-3 text-left font-medium transition";
    if (!answered) return `${base} border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50`;
    if (option.id === word.id) return `${base} border-emerald-500 bg-emerald-50 text-emerald-800`;
    if (option.id === picked) return `${base} border-red-400 bg-red-50 text-red-700`;
    return `${base} border-slate-200 bg-white opacity-50`;
  }

  return (
    <div className={`${cardClass} mx-auto max-w-lg p-6 sm:p-8`}>
      <p className="text-center text-sm font-medium text-slate-500">{t("quiz.prompt.ar-bn")}</p>
      <div className="mt-3 flex items-center justify-center gap-3">
        <p lang="ar" dir="rtl" className="text-5xl font-bold text-emerald-700">
          {word.arabic}
        </p>
        <AudioButton item={word} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button key={option.id} type="button" onClick={() => !answered && setPicked(option.id)} className={optionClass(option)}>
            {meaningOf(option)}
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-5 text-center">
          <p className={`text-lg font-bold ${picked === word.id ? "text-emerald-700" : "text-red-600"}`}>
            {picked === word.id ? t("landing.demo.right") : t("landing.demo.wrong")}
          </p>
          <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to="/signup" className={buttonClass("primary", "lg")}>
              {t("landing.demo.cta")}
            </Link>
            <button type="button" onClick={() => setPicked(null)} className={buttonClass("ghost", "lg")}>
              {t("landing.demo.again")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
