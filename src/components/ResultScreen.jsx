import { useLocale } from "../hooks/useLocale";
import { cardClass } from "../lib/styles";

// End-of-session summary for quizzes, practice and lessons
export default function ResultScreen({ title, score, total, xp, children }) {
  const { t, num } = useLocale();
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const message = percent === 100 ? t("result.perfect") : percent >= 70 ? t("result.great") : t("result.keepGoing");
  const emoji = percent === 100 ? "🏆" : percent >= 70 ? "🎉" : "💪";

  return (
    <div className={`${cardClass} mx-auto max-w-md p-8 text-center`}>
      <p className="animate-bounce text-6xl" aria-hidden="true">{emoji}</p>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-slate-600">{message}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-3xl font-bold text-emerald-700">
            {num(score)}/{num(total)}
          </p>
          <p className="text-sm text-emerald-800">{t("result.correct")}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-3xl font-bold text-amber-600">+{num(xp)}</p>
          <p className="text-sm text-amber-800">{t("result.xp")}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">{children}</div>
    </div>
  );
}
