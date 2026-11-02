import { Link } from "react-router-dom";
import AudioButton from "../components/AudioButton";
import Icon from "../components/Icon";
import { Alert, ProgressBar, Spinner } from "../components/ui";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useNow } from "../hooks/useNow";
import { useProgress } from "../hooks/useProgress";
import { courseToContinue, coursesForLocale, nextLesson } from "../lib/courses";
import { DEFAULT_DAILY_GOAL, isDue, liveStreak, todayCount } from "../lib/progress";
import { cardClass } from "../lib/styles";

const DAY = 24 * 60 * 60 * 1000;

// The logged-in home page: streak, goal, next lesson and word of the day
export default function Dashboard({ user }) {
  const { content, loading, error } = useContent();
  const progressState = useProgress();
  const { progress, lessonProgress, profile } = progressState;
  const { t, num, locale, meaningOf, pronunciationOf, localized } = useLocale();
  const now = useNow();

  if (loading || progressState.loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const name = user.displayName || t("dashboard.friend");
  const goal = profile?.daily_goal ?? DEFAULT_DAILY_GOAL;
  const doneToday = todayCount(profile, now);
  const streak = liveStreak(profile, now);
  const due = content.items.filter((i) => isDue(progress[i.id], now)).length;

  const course = courseToContinue(coursesForLocale(content.courses, locale), lessonProgress);
  const lesson = course && nextLesson(course, lessonProgress);

  // Word of the day: the same for everyone on a given day
  const items = [...content.items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const wordOfDay = items.length > 0 ? items[Math.floor(now / DAY) % items.length] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t("dashboard.greeting", { name })}</h1>
        <p className="mt-1 text-slate-600">{t("dashboard.question")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`${cardClass} p-4`}>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <Icon name="flame" className="size-4 text-amber-500" /> {t("stats.streak")}
          </p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{num(streak)}</p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className="text-sm text-slate-500">{t("stats.xp")}</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{num(profile?.xp ?? 0)}</p>
        </div>
      </div>

      <div className={`${cardClass} p-5`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">{t("goal.title")}</h2>
          <span className="text-sm text-slate-500">
            {num(Math.min(doneToday, goal))}/{num(goal)}
          </span>
        </div>
        <ProgressBar value={Math.min(doneToday, goal)} max={goal} />
        <p className="mt-2 text-sm text-slate-500">{doneToday >= goal ? t("goal.done") : t("goal.hint")}</p>
      </div>

      {course && lesson && (
        <Link
          to={`/courses/${course.id}/lessons/${lesson.id}`}
          className="block rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md transition hover:shadow-lg"
        >
          <p className="text-sm text-emerald-100">{localized(course, "title")}</p>
          <p className="mt-1 text-xl font-bold">{t("dashboard.nextLesson", { title: localized(lesson, "title") })}</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-800">
            {t("dashboard.continue")} <Icon name="right" className="size-4" />
          </span>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/practice" className={`${cardClass} flex items-center gap-4 p-5 transition hover:border-emerald-300`}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Icon name="cards" className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-slate-900">{t("dashboard.review")}</span>
            <span className="block text-sm text-slate-500">
              {due > 0 ? t("dashboard.reviewWaiting", { count: num(due) }) : t("dashboard.reviewNone")}
            </span>
          </span>
          <Icon name="right" className="size-5 text-slate-400" />
        </Link>
        <Link to="/quiz" className={`${cardClass} flex items-center gap-4 p-5 transition hover:border-emerald-300`}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Icon name="quiz" className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-slate-900">{t("nav.quiz")}</span>
            <span className="block text-sm text-slate-500">{t("dashboard.quizText", { count: num(10) })}</span>
          </span>
          <Icon name="right" className="size-5 text-slate-400" />
        </Link>
      </div>

      {wordOfDay && (
        <div className={`${cardClass} p-5`}>
          <p className="text-sm font-medium text-emerald-700">{t("dashboard.wordOfDay")}</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-slate-900">{meaningOf(wordOfDay)}</p>
              <p className="text-slate-500">{pronunciationOf(wordOfDay)}</p>
            </div>
            <div className="flex items-center gap-3">
              <p lang="ar" dir="rtl" className="text-3xl font-bold text-emerald-700">{wordOfDay.arabic}</p>
              <AudioButton item={wordOfDay} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
