import { Link } from "react-router-dom";
import { Alert, Badge, PageHeader, ProgressBar, Spinner, StatCard } from "../components/ui";
import { useContent } from "../hooks/useContent";
import { useNow } from "../hooks/useNow";
import { useProgress } from "../hooks/useProgress";
import { bn } from "../lib/format";
import { DEFAULT_DAILY_GOAL, isDue, liveStreak, todayCount } from "../lib/progress";
import { cardClass, chipClass } from "../lib/styles";

const GOAL_OPTIONS = [10, 20, 30, 50];

// Stats, daily goal, mastery levels and the words that need more work
export default function Progress() {
  const { content, loading, error } = useContent();
  const progressState = useProgress();
  const { progress, lessonProgress, profile, setDailyGoal } = progressState;
  const now = useNow();

  if (loading || progressState.loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

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
  const lessonsDone = Object.values(lessonProgress).filter((l) => l.status === "completed").length;

  const hardWords = seen
    .filter((i) => progress[i.id].times_wrong > 0)
    .sort((a, b) => progress[b.id].times_wrong - progress[a.id].times_wrong)
    .slice(0, 6);

  return (
    <div>
      <PageHeader title="আমার অগ্রগতি" subtitle="প্রতিদিন একটু একটু করে এগিয়ে যাও।" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="মোট XP" value={profile?.xp ?? 0} />
        <StatCard label="টানা দিন 🔥" value={liveStreak(profile, now)} hint={`সেরা: ${bn(profile?.longest_streak ?? 0)} দিন`} />
        <StatCard label="জানা শব্দ" value={`${bn(known)}/${bn(items.length)}`} />
        <StatCard label="শেষ করা লেসন" value={lessonsDone} />
      </div>

      <section className={`${cardClass} mt-6 p-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">আজকের লক্ষ্য</h2>
            <p className="text-sm text-slate-500">
              {bn(Math.min(doneToday, goal))}/{bn(goal)}টি উত্তর
              {doneToday >= goal && " · লক্ষ্য পূরণ! 🎉"}
            </p>
          </div>
          <div className="flex gap-1" role="group" aria-label="দৈনিক লক্ষ্য বেছে নাও">
            {GOAL_OPTIONS.map((option) => (
              <button key={option} onClick={() => setDailyGoal(option)} aria-pressed={goal === option} className={chipClass(goal === option)}>
                {bn(option)}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar value={Math.min(doneToday, goal)} max={goal} />
        </div>
      </section>

      <section className={`${cardClass} mt-6 p-5`}>
        <h2 className="mb-4 font-semibold text-slate-900">শব্দের অবস্থা</h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-2xl font-bold text-slate-700">{bn(fresh)}</p>
            <p className="text-xs text-slate-500">নতুন</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="text-2xl font-bold text-amber-600">{bn(learning)}</p>
            <p className="text-xs text-amber-800">শিখছি</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <p className="text-2xl font-bold text-emerald-700">{bn(strong)}</p>
            <p className="text-xs text-emerald-800">পাকা</p>
          </div>
        </div>
        {due > 0 && (
          <Link to="/practice" className="mt-4 block rounded-xl bg-emerald-600 p-3 text-center font-semibold text-white hover:bg-emerald-700">
            {bn(due)}টি শব্দ রিভিউ করার সময় হয়েছে →
          </Link>
        )}
      </section>

      <section className={`${cardClass} mt-6 p-5`}>
        <h2 className="mb-4 font-semibold text-slate-900">বিষয় অনুযায়ী</h2>
        <ul className="space-y-3">
          {content.categories.map((category) => {
            const inCategory = items.filter((i) => i.category_ids?.includes(category.id));
            const knownHere = inCategory.filter((i) => progress[i.id]?.known).length;
            return (
              <li key={category.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{category.name_bn}</span>
                  <span className="text-slate-500">
                    {bn(knownHere)}/{bn(inCategory.length)}
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
          <h2 className="mb-4 font-semibold text-slate-900">যেগুলোতে বেশি ভুল হচ্ছে</h2>
          <ul className="divide-y divide-slate-100">
            {hardWords.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2">
                <span>
                  <span className="font-medium text-slate-800">{item.bangla}</span>
                  <span className="ml-2 text-sm text-slate-500">{item.bn_transliteration}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span lang="ar" dir="rtl" className="text-xl text-emerald-700">{item.arabic}</span>
                  <Badge tone="red">{bn(progress[item.id].times_wrong)} ভুল</Badge>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
