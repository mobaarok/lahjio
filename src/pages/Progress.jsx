import { Link } from "react-router-dom";
import { Alert, Badge, PageHeader, ProgressBar, Spinner, StatCard } from "../components/ui";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useNow } from "../hooks/useNow";
import { useProgress } from "../hooks/useProgress";
import { DEFAULT_DAILY_GOAL, isDue, liveStreak, todayCount } from "../lib/progress";
import { cardClass, chipClass } from "../lib/styles";

const GOAL_OPTIONS = [10, 20, 30, 50];

// Stats, daily goal, mastery levels and the words that need more work
export default function Progress() {
  const { content, loading, error } = useContent();
  const progressState = useProgress();
  const { progress, lessonProgress, profile, setDailyGoal } = progressState;
  const { t, num, meaningOf, pronunciationOf, localized } = useLocale();
  const now = useNow();

  if (loading || progressState.loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const items = content.items;
  const goal = profile?.daily_goal ?? DEFAULT_DAILY_GOAL;
  const doneToday = todayCount(profile, now);

  // Box numbers come from spaced repetition: higher means remembered longer
  const seen = items.filter((i) => progress[i.id]);
  const strong = seen.filter((i) => progress[i.id].box >= 3).length;
  const learning = seen.length - strong;
  const fresh = items.length - seen.length;
  const known = items.filter((i) => progress[i.id]?.known).length;
  const due = items.filter((i) => isDue(progress[i.id], now)).length;
  // Only lessons that still exist (old results stay saved after a content reset)
  const lessonsDone = content.courses
    .flatMap((c) => c.lessons)
    .filter((l) => lessonProgress[l.id]?.status === "completed").length;

  const hardWords = seen
    .filter((i) => progress[i.id].times_wrong > 0)
    .sort((a, b) => progress[b.id].times_wrong - progress[a.id].times_wrong)
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title={t("progress.title")} subtitle={t("progress.subtitle")} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={t("stats.xp")} value={num(profile?.xp ?? 0)} />
        <StatCard
          label={`${t("stats.streak")} 🔥`}
          value={num(liveStreak(profile, now))}
          hint={t("progress.bestStreak", { count: num(profile?.longest_streak ?? 0) })}
        />
        <StatCard label={t("progress.knownWords")} value={`${num(known)}/${num(items.length)}`} />
        <StatCard label={t("progress.lessonsDone")} value={num(lessonsDone)} />
      </div>

      <section className={`${cardClass} mt-6 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">{t("goal.title")}</h2>
            <p className="text-sm text-slate-500">
              {t("progress.answersToday", { done: num(Math.min(doneToday, goal)), goal: num(goal) })}
              {doneToday >= goal && ` · ${t("progress.goalMet")}`}
            </p>
          </div>
          <div className="flex gap-1" role="group" aria-label={t("progress.chooseGoal")}>
            {GOAL_OPTIONS.map((option) => (
              <button key={option} onClick={() => setDailyGoal(option)} aria-pressed={goal === option} className={chipClass(goal === option)}>
                {num(option)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={Math.min(doneToday, goal)} max={goal} />
        </div>
      </section>

      <section className={`${cardClass} mt-6 p-5`}>
        <h2 className="mb-4 font-semibold text-slate-900">{t("progress.wordStatus")}</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-2xl font-bold text-slate-700">{num(fresh)}</p>
            <p className="text-xs text-slate-500">{t("progress.new")}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="text-2xl font-bold text-amber-600">{num(learning)}</p>
            <p className="text-xs text-amber-800">{t("progress.learning")}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="text-2xl font-bold text-emerald-700">{num(strong)}</p>
            <p className="text-xs text-emerald-800">{t("progress.strong")}</p>
          </div>
        </div>
        {due > 0 && (
          <Link to="/practice" className="mt-4 block rounded-xl bg-emerald-600 p-3 text-center font-semibold text-white hover:bg-emerald-700">
            {t("progress.reviewDue", { count: num(due) })}
          </Link>
        )}
      </section>

      <section className={`${cardClass} mt-6 p-5`}>
        <h2 className="mb-4 font-semibold text-slate-900">{t("progress.byTopic")}</h2>
        <ul className="space-y-3">
          {content.categories.map((category) => {
            const inCategory = items.filter((i) => i.category_ids?.includes(category.id));
            const knownHere = inCategory.filter((i) => progress[i.id]?.known).length;
            return (
              <li key={category.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{localized(category, "name")}</span>
                  <span className="text-slate-500">
                    {num(knownHere)}/{num(inCategory.length)}
                  </span>
                </div>
                <ProgressBar value={knownHere} max={inCategory.length} />
              </li>
            );
          })}
        </ul>
      </section>

      {hardWords.length > 0 && (
        <section className={`${cardClass} mt-6 p-5`}>
          <h2 className="mb-4 font-semibold text-slate-900">{t("progress.hardWords")}</h2>
          <ul className="divide-y divide-slate-100">
            {hardWords.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <span className="font-medium text-slate-800">{meaningOf(item)}</span>{" "}
                  <span className="text-sm text-slate-500">{pronunciationOf(item)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span lang="ar" dir="rtl" className="text-xl text-emerald-700">{item.arabic}</span>
                  <Badge tone="red">{t("progress.mistakes", { count: num(progress[item.id].times_wrong) })}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
