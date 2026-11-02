import { Link } from "react-router-dom";
import { Alert, Badge, EmptyState, PageHeader, ProgressBar, Spinner } from "../components/ui";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useProgress } from "../hooks/useProgress";
import { completedCount, coursesForLocale } from "../lib/courses";
import { cardClass } from "../lib/styles";

// Published courses for the current language, with the learner's progress
export default function Courses() {
  const { content, loading, error } = useContent();
  const { lessonProgress } = useProgress();
  const { t, num, locale, localized } = useLocale();

  if (loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const courses = coursesForLocale(content.courses, locale);

  return (
    <div>
      <PageHeader title={t("courses.title")} subtitle={t("courses.subtitle")} />

      {courses.length === 0 ? (
        <EmptyState title={t("courses.soonTitle")}>
          {t("courses.soonText")}{" "}
          <Link to="/words" className="font-semibold text-emerald-700">{t("nav.words")}</Link> ·{" "}
          <Link to="/practice" className="font-semibold text-emerald-700">{t("nav.practice")}</Link>
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const done = completedCount(course, lessonProgress);
            const total = course.lessons.length;
            return (
              <Link key={course.id} to={`/courses/${course.id}`} className={`${cardClass} block p-5 transition hover:border-emerald-300 hover:shadow-md`}>
                <div className="flex flex-wrap gap-1">
                  <Badge tone="emerald">{t(`level.${course.level}`)}</Badge>
                  <Badge>{t(`courseType.${course.type}`)}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-bold text-slate-900">{localized(course, "title")}</h2>
                <p className="mt-1 line-clamp-2 text-slate-600">{localized(course, "description")}</p>
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={done} max={total} />
                  <span className="shrink-0 text-sm text-slate-500">
                    {t("courses.lessonsDone", { done: num(done), total: num(total) })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
