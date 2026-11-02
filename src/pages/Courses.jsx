import { Link } from "react-router-dom";
import { Alert, Badge, EmptyState, PageHeader, ProgressBar, Spinner } from "../components/ui";
import { useContent } from "../hooks/useContent";
import { useProgress } from "../hooks/useProgress";
import { COURSE_TYPES, LEVELS, labelOf } from "../lib/constants";
import { completedCount } from "../lib/courses";
import { bn } from "../lib/format";
import { cardClass } from "../lib/styles";

// All published courses, with the learner's progress in each
export default function Courses() {
  const { content, loading, error } = useContent();
  const { lessonProgress } = useProgress();

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  const courses = content.courses.filter((c) => c.languages?.includes("bn") ?? true);

  return (
    <div>
      <PageHeader title="কোর্স" subtitle="ধাপে ধাপে লেসন শেষ করো, পরের লেসন খুলে যাবে।" />

      {courses.length === 0 ? (
        <EmptyState title="শীঘ্রই আসছে">
          কোর্স তৈরি হচ্ছে। ততক্ষণ{" "}
          <Link to="/words" className="font-semibold text-emerald-700">শব্দভাণ্ডার</Link> আর{" "}
          <Link to="/practice" className="font-semibold text-emerald-700">প্র্যাকটিস</Link> ব্যবহার করো।
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const done = completedCount(course, lessonProgress);
            const total = course.lessons.length;
            return (
              <Link key={course.id} to={`/courses/${course.id}`} className={`${cardClass} block p-5 transition hover:border-emerald-300 hover:shadow-md`}>
                <div className="flex flex-wrap gap-1">
                  <Badge tone="emerald">{labelOf(LEVELS, course.level, "bn")}</Badge>
                  <Badge>{labelOf(COURSE_TYPES, course.type, "bn")}</Badge>
                </div>
                <h2 className="mt-3 text-xl font-bold text-slate-900">{course.title_bn}</h2>
                {course.description_bn && <p className="mt-1 line-clamp-2 text-slate-600">{course.description_bn}</p>}
                <div className="mt-4 flex items-center gap-3">
                  <ProgressBar value={done} max={total} />
                  <span className="shrink-0 text-sm text-slate-500">
                    {bn(done)}/{bn(total)} লেসন
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
