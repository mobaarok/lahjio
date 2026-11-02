import { bn } from "../lib/format";
import { cardClass } from "../lib/styles";

// End-of-session summary for quizzes, practice and lessons
export default function ResultScreen({ title, score, total, xp, children }) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const message =
    percent === 100 ? "অসাধারণ! সব ঠিক!" : percent >= 70 ? "দারুণ হয়েছে!" : "চালিয়ে যাও, প্র্যাকটিসে সব সহজ হবে।";
  const emoji = percent === 100 ? "🏆" : percent >= 70 ? "🎉" : "💪";

  return (
    <div className={`${cardClass} mx-auto max-w-md p-8 text-center`}>
      <p className="animate-bounce text-6xl" aria-hidden="true">{emoji}</p>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-slate-600">{message}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4">
          <p className="text-3xl font-bold text-emerald-700">
            {bn(score)}/{bn(total)}
          </p>
          <p className="text-sm text-emerald-800">সঠিক উত্তর</p>
        </div>
        <div className="rounded-2xl bg-amber-50 p-4">
          <p className="text-3xl font-bold text-amber-600">+{bn(xp)}</p>
          <p className="text-sm text-amber-800">XP পেয়েছো</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">{children}</div>
    </div>
  );
}
