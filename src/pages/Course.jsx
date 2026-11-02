import { Link, useParams } from "react-router-dom";
import Icon from "../components/Icon";
import { Alert, Badge, EmptyState, ProgressBar, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useProgress } from "../hooks/useProgress";
import { completedCount, lessonStates } from "../lib/courses";
import { buttonClass, cardClass } from "../lib/styles";

// One course: its lessons, which are done, open or locked
export default function Course() {
  const { courseId } = useParams();
  const { content, loading, error } = useContent();
  const { user } = useAuth();
  const { lessonProgress } = useProgress();
  const { t, num, localized } = useLocale();

  if (loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const course = content.courses.find((c) => c.id === courseId);
  if (!course) {
    return (
      <EmptyState title={t("course.notFound")}>
        <Link to="/courses" className="font-semibold text-emerald-700">{t("course.allCourses")}</Link>
      </EmptyState>
    );
  }

  const states = lessonStates(course, lessonProgress);
  const done = completedCount(course, lessonProgress);
  const topicName = Object.fromEntries(content.categories.map((c) => [c.id, localized(c, "name")]));

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/courses" className="text-sm text-emerald-700 hover:underline">
        ← {t("course.allCourses")}
      </Link>

      <div className="mt-3 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white">
        <Badge tone="emerald">{t(`level.${course.level}`)}</Badge>
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{localized(course, "title")}</h1>
        <p className="mt-2 text-emerald-50">{localized(course, "description")}</p>
        <div className="mt-5 flex items-center gap-3">
          <ProgressBar value={done} max={course.lessons.length} />
          <span className="shrink-0 text-sm">
            {num(done)}/{num(course.lessons.length)}
          </span>
        </div>
      </div>

      {!user && (
        <div className="mt-4">
          <Alert tone="info">
            {t("course.signupHint")}{" "}
            <Link to="/signup" className="font-semibold underline">{t("course.signupLink")}</Link>
          </Alert>
        </div>
      )}

      <ol className="mt-6 space-y-3">
        {states.map(({ lesson, completed, unlocked }, index) => {
          const topic = topicName[lesson.category_id];
          const body = (
            <>
              <span
                className={`flex size-11 shrink-0 items-center justify-center rounded-full font-bold ${
                  completed
                    ? "bg-emerald-600 text-white"
                    : unlocked
                      ? "bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {completed ? <Icon name="check" /> : unlocked ? num(index + 1) : <Icon name="lock" className="size-4" />}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-900">{localized(lesson, "title")}</span>
                <span className="block text-sm text-slate-500">
                  {t("course.itemCount", { count: num(lesson.item_ids?.length ?? 0) })}
                  {topic ? ` · ${topic}` : ""}
                </span>
              </span>
              {completed && (
                <Badge tone="emerald">{t("course.best", { score: num(lessonProgress[lesson.id]?.best_score ?? 0) })}</Badge>
              )}
            </>
          );

          return (
            <li key={lesson.id}>
              {unlocked ? (
                <Link
                  to={`/courses/${course.id}/lessons/${lesson.id}`}
                  className={`${cardClass} flex items-center gap-4 p-4 transition hover:border-emerald-300`}
                >
                  {body}
                </Link>
              ) : (
                <div className={`${cardClass} flex items-center gap-4 p-4 opacity-60`} aria-label={t("course.locked")}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {course.lessons.length === 0 && <p className="mt-6 text-center text-slate-500">{t("course.noLessons")}</p>}

      {!user && course.lessons.length > 0 && (
        <Link to="/signup" className={buttonClass("primary", "lg", "mt-6 w-full")}>
          {t("landing.ctaStart")}
        </Link>
      )}
    </div>
  );
}
