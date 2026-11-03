import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { Alert, Badge, Field, Spinner } from "../../components/ui";
import { getOne, listAll, publishCourse, saveCourse, saveLesson } from "../../lib/admin";
import { COURSE_TYPES, LEVELS, STATUSES, labelOf, statusTone } from "../../lib/constants";
import { byOrder } from "../../lib/format";
import { buttonClass, cardClass, inputClass } from "../../lib/styles";

const emptyCourse = {
  title_bn: "",
  title_en: "",
  description_bn: "",
  description_en: "",
  type: "mixed",
  level: "beginner",
  languages: ["bn"],
  order: 10,
  status: "draft",
  is_free: true,
};

function toSaved(form) {
  return {
    title_bn: form.title_bn.trim(),
    title_en: form.title_en.trim(),
    description_bn: form.description_bn.trim(),
    description_en: form.description_en.trim(),
    type: form.type,
    level: form.level,
    languages: form.languages,
    order: Number(form.order) || 0,
    status: form.status,
    is_free: form.is_free,
  };
}

// Course details on top, its lessons below
export default function AdminCourseEdit() {
  const { courseId } = useParams();
  const isNew = courseId === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (isNew) {
        const courses = await listAll("courses");
        const lastOrder = Math.max(0, ...courses.map((c) => c.order ?? 0));
        return { course: { ...emptyCourse, order: lastOrder + 10 }, lessons: [] };
      }
      const [course, loadedLessons] = await Promise.all([
        getOne("courses", courseId),
        listAll("courses", courseId, "lessons"),
      ]);
      return { course: course && { ...emptyCourse, ...course }, lessons: loadedLessons.sort(byOrder) };
    }

    load()
      .then((result) => {
        if (ignore) return;
        if (!result.course) {
          setMessage({ tone: "error", text: "This course doesn't exist." });
          return;
        }
        setForm(result.course);
        setLessons(result.lessons);
      })
      .catch(() => {
        if (!ignore) setMessage({ tone: "error", text: "Couldn't load this course." });
      });

    return () => {
      ignore = true;
    };
  }, [courseId, isNew, reloadKey]);

  if (!form) return message.text ? <Alert>{message.text}</Alert> : <Spinner label="Loading course..." />;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  function toggleLanguage(code) {
    update(
      "languages",
      form.languages.includes(code) ? form.languages.filter((l) => l !== code) : [...form.languages, code]
    );
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form.title_bn.trim() || form.languages.length === 0) {
      setMessage({ tone: "error", text: "A Bangla title and at least one language are required." });
      return;
    }
    setSaving(true);
    try {
      const savedId = await saveCourse(isNew ? null : courseId, toSaved(form));
      setMessage({ tone: "success", text: "Course saved." });
      if (isNew) navigate(`/admin/courses/${savedId}`, { replace: true });
    } catch {
      setMessage({ tone: "error", text: "Couldn't save the course." });
    } finally {
      setSaving(false);
    }
  }

  // One click to make the whole course live: course, lessons and their items
  async function handlePublishAll() {
    if (!window.confirm("Publish this course, all its draft lessons and their draft items? Learners will see them.")) {
      return;
    }
    setSaving(true);
    try {
      const result = await publishCourse(courseId);
      setMessage({
        tone: "success",
        text: `Published the course, ${result.lessons} lessons and ${result.items} items.`,
      });
      update("status", "published");
      setReloadKey((k) => k + 1);
    } catch {
      setMessage({ tone: "error", text: "Couldn't publish everything. Try again; it skips what's already published." });
    } finally {
      setSaving(false);
    }
  }

  // Swaps order numbers with the neighbouring lesson
  async function moveLesson(index, direction) {
    const a = lessons[index];
    const b = lessons[index + direction];
    try {
      await saveLesson(courseId, a.id, { order: b.order });
      await saveLesson(courseId, b.id, { order: a.order });
      setReloadKey((k) => k + 1);
    } catch {
      setMessage({ tone: "error", text: "Couldn't change the lesson order." });
    }
  }

  const textField = (field, label, multiline = false) => (
    <Field label={label}>
      {multiline ? (
        <textarea rows={3} value={form[field]} onChange={(e) => update(field, e.target.value)} className={inputClass} />
      ) : (
        <input value={form[field]} onChange={(e) => update(field, e.target.value)} className={inputClass} />
      )}
    </Field>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/courses" className="text-sm text-emerald-700 hover:underline">
          ← All courses
        </Link>
        <h2 className="text-xl font-bold text-slate-900">{isNew ? "New course" : "Edit course"}</h2>
      </div>

      {message.text && <Alert tone={message.tone}>{message.text}</Alert>}

      <form onSubmit={handleSave} className={`${cardClass} grid gap-4 p-5 sm:grid-cols-2`}>
        {textField("title_bn", "Title (Bangla) *")}
        {textField("title_en", "Title (English)")}
        {textField("description_bn", "Description (Bangla)", true)}
        {textField("description_en", "Description (English)", true)}

        <Field label="Type">
          <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
            {COURSE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Level">
          <select value={form.level} onChange={(e) => update("level", e.target.value)} className={inputClass}>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Order" hint="Lower numbers show first.">
          <input type="number" value={form.order} onChange={(e) => update("order", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        <div className="flex flex-wrap gap-4 text-sm text-slate-700 sm:col-span-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.languages.includes("bn")} onChange={() => toggleLanguage("bn")} />
            Bangla learners
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.languages.includes("en")} onChange={() => toggleLanguage("en")} />
            English learners
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_free} onChange={(e) => update("is_free", e.target.checked)} />
            Free course
          </label>
        </div>

        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" disabled={saving} className={buttonClass("primary")}>
            {saving ? "Saving..." : "Save course"}
          </button>
          {!isNew && (
            <button type="button" onClick={handlePublishAll} disabled={saving} className={buttonClass("secondary")}>
              Publish everything
            </button>
          )}
        </div>
      </form>

      {!isNew && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">Lessons</h3>
            <Link to={`/admin/courses/${courseId}/lessons/new`} className={buttonClass("secondary", "sm")}>
              <Icon name="plus" className="size-4" />
              New lesson
            </Link>
          </div>

          {lessons.length === 0 ? (
            <p className="text-sm text-slate-500">No lessons yet.</p>
          ) : (
            <ol className={`${cardClass} divide-y divide-slate-100`}>
              {lessons.map((lesson, index) => (
                <li key={lesson.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex flex-col">
                    <button type="button" onClick={() => moveLesson(index, -1)} disabled={index === 0} aria-label="Move up" className="text-slate-400 hover:text-slate-800 disabled:opacity-30">
                      <Icon name="up" className="size-4" />
                    </button>
                    <button type="button" onClick={() => moveLesson(index, 1)} disabled={index === lessons.length - 1} aria-label="Move down" className="text-slate-400 hover:text-slate-800 disabled:opacity-30">
                      <Icon name="down" className="size-4" />
                    </button>
                  </div>
                  <Link to={`/admin/courses/${courseId}/lessons/${lesson.id}`} className="flex flex-1 flex-wrap items-center justify-between gap-2 hover:text-emerald-700">
                    <span className="font-medium">
                      {index + 1}. {lesson.title_en || lesson.title_bn}
                    </span>
                    <span className="flex gap-1">
                      <Badge tone={statusTone[lesson.status]}>{labelOf(STATUSES, lesson.status)}</Badge>
                      <Badge>{lesson.item_ids?.length ?? 0} items</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
    </div>
  );
}
