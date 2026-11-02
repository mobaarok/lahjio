import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { Alert, Badge, EmptyState, Spinner } from "../../components/ui";
import { listAll } from "../../lib/admin";
import { COURSE_TYPES, LEVELS, STATUSES, labelOf, statusTone } from "../../lib/constants";
import { byOrder } from "../../lib/format";
import { buttonClass, cardClass } from "../../lib/styles";

export default function AdminCourses() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    listAll("courses")
      .then((loaded) => {
        if (!ignore) setCourses(loaded.sort(byOrder));
      })
      .catch(() => {
        if (!ignore) setError("Couldn't load courses.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!courses) return <Spinner label="Loading courses..." />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {courses.length} courses. Learners see published courses and their published lessons.
        </p>
        <Link to="/admin/courses/new" className={buttonClass("primary")}>
          <Icon name="plus" className="size-4" />
          New course
        </Link>
      </div>

      {courses.length === 0 ? (
        <EmptyState title="No courses yet">
          Create your first course, for example a Beginner course with topic lessons.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <li key={course.id}>
              <Link to={`/admin/courses/${course.id}`} className={`${cardClass} block p-5 hover:border-emerald-300`}>
                <p className="font-semibold text-slate-900">{course.title_en || course.title_bn}</p>
                <p className="text-sm text-slate-500">{course.title_bn}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge tone={statusTone[course.status]}>{labelOf(STATUSES, course.status)}</Badge>
                  <Badge>{labelOf(LEVELS, course.level)}</Badge>
                  <Badge>{labelOf(COURSE_TYPES, course.type)}</Badge>
                  <Badge tone="sky">{course.lesson_count ?? 0} published lessons</Badge>
                  {course.is_free && <Badge tone="emerald">Free</Badge>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
