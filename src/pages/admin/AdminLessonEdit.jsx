import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { Alert, Badge, Field, Spinner } from "../../components/ui";
import { getOne, listAll, saveLesson } from "../../lib/admin";
import { STATUSES, statusTone, labelOf } from "../../lib/constants";
import { byOrder } from "../../lib/format";
import { buttonClass, cardClass, inputClass } from "../../lib/styles";

const emptyLesson = {
  title_bn: "",
  title_en: "",
  category_id: "",
  item_ids: [],
  order: 10,
  status: "draft",
  is_free: true,
};

// Edit a lesson and pick its words and phrases, in teaching order
export default function AdminLessonEdit() {
  const { courseId, lessonId } = useParams();
  const isNew = lessonId === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      getOne("courses", courseId),
      isNew ? null : getOne("courses", courseId, "lessons", lessonId),
      listAll("courses", courseId, "lessons"),
      listAll("items"),
      listAll("categories"),
    ])
      .then(([loadedCourse, lesson, lessons, loadedItems, loadedCategories]) => {
        if (ignore) return;
        if (!loadedCourse || (!isNew && !lesson)) {
          setMessage({ tone: "error", text: "This lesson doesn't exist." });
          return;
        }
        const lastOrder = Math.max(0, ...lessons.map((l) => l.order ?? 0));
        setCourse(loadedCourse);
        setItems(loadedItems.filter((i) => i.status !== "archived"));
        setCategories(loadedCategories.sort(byOrder));
        setForm(isNew ? { ...emptyLesson, order: lastOrder + 10 } : { ...emptyLesson, ...lesson });
      })
      .catch(() => {
        if (!ignore) setMessage({ tone: "error", text: "Couldn't load this lesson." });
      });
    return () => {
      ignore = true;
    };
  }, [courseId, lessonId, isNew]);

  if (!form) return message.text ? <Alert>{message.text}</Alert> : <Spinner label="Loading lesson..." />;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const itemById = Object.fromEntries(items.map((i) => [i.id, i]));
  const selected = form.item_ids.filter((id) => itemById[id]);

  function addItems(ids) {
    update("item_ids", [...form.item_ids, ...ids.filter((id) => !form.item_ids.includes(id))]);
  }

  function removeItem(id) {
    update("item_ids", form.item_ids.filter((i) => i !== id));
  }

  function moveItem(index, direction) {
    const ids = [...form.item_ids];
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    update("item_ids", ids);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!form.title_bn.trim() || form.item_ids.length === 0) {
      setMessage({ tone: "error", text: "A Bangla title and at least one item are required." });
      return;
    }
    setSaving(true);
    try {
      const data = {
        title_bn: form.title_bn.trim(),
        title_en: form.title_en.trim(),
        category_id: form.category_id || null,
        item_ids: form.item_ids,
        order: Number(form.order) || 0,
        status: form.status,
        is_free: form.is_free,
      };
      const savedId = await saveLesson(courseId, isNew ? null : lessonId, data);
      setMessage({ tone: "success", text: "Lesson saved." });
      if (isNew) navigate(`/admin/courses/${courseId}/lessons/${savedId}`, { replace: true });
    } catch {
      setMessage({ tone: "error", text: "Couldn't save the lesson." });
    } finally {
      setSaving(false);
    }
  }

  const query = search.trim().toLowerCase();
  const available = items
    .filter((i) => !form.item_ids.includes(i.id))
    .filter((i) => [i.arabic, i.bangla, i.english].some((t) => (t ?? "").toLowerCase().includes(query)))
    .slice(0, 30);
  const categoryItemIds = items
    .filter((i) => i.status === "published" && i.category_ids?.includes(form.category_id))
    .map((i) => i.id);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to={`/admin/courses/${courseId}`} className="text-sm text-emerald-700 hover:underline">
          ← {course.title_en || course.title_bn}
        </Link>
        <h2 className="text-xl font-bold text-slate-900">{isNew ? "New lesson" : "Edit lesson"}</h2>
      </div>

      {message.text && <Alert tone={message.tone}>{message.text}</Alert>}

      <section className={`${cardClass} grid gap-4 p-5 sm:grid-cols-2`}>
        <Field label="Title (Bangla) *">
          <input value={form.title_bn} onChange={(e) => update("title_bn", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Title (English)">
          <input value={form.title_en} onChange={(e) => update("title_en", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Topic">
          <select value={form.category_id ?? ""} onChange={(e) => update("category_id", e.target.value)} className={inputClass}>
            <option value="">No topic</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_en} · {c.name_bn}</option>
            ))}
          </select>
        </Field>
        <Field label="Order" hint="Lessons unlock in this order.">
          <input type="number" value={form.order} onChange={(e) => update("order", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm text-slate-700">
          <input type="checkbox" checked={form.is_free} onChange={(e) => update("is_free", e.target.checked)} />
          Free lesson
        </label>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className={`${cardClass} p-5`}>
          <h3 className="mb-3 font-semibold text-slate-900">In this lesson ({selected.length})</h3>
          {selected.length === 0 ? (
            <p className="text-sm text-slate-500">Add words and phrases from the list.</p>
          ) : (
            <ol className="space-y-2">
              {form.item_ids.map((id, index) => {
                const item = itemById[id];
                if (!item) return null; // archived or deleted
                return (
                  <li key={id} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                    <span className="w-6 text-sm text-slate-400">{index + 1}</span>
                    <span className="flex-1 truncate text-sm">
                      {item.bangla}
                      {item.status !== "published" && (
                        <span className="ml-2"><Badge tone={statusTone[item.status]}>{labelOf(STATUSES, item.status)}</Badge></span>
                      )}
                    </span>
                    <span lang="ar" dir="rtl" className="text-lg text-emerald-700">{item.arabic}</span>
                    <button type="button" onClick={() => moveItem(index, -1)} disabled={index === 0} aria-label="Move up" className="text-slate-400 hover:text-slate-800 disabled:opacity-30">
                      <Icon name="up" className="size-4" />
                    </button>
                    <button type="button" onClick={() => moveItem(index, 1)} disabled={index === form.item_ids.length - 1} aria-label="Move down" className="text-slate-400 hover:text-slate-800 disabled:opacity-30">
                      <Icon name="down" className="size-4" />
                    </button>
                    <button type="button" onClick={() => removeItem(id)} aria-label="Remove" className="text-slate-400 hover:text-red-600">
                      <Icon name="x" className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="mt-3 text-xs text-slate-500">Draft items stay hidden from learners until published.</p>
        </div>

        <div className={`${cardClass} p-5`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">Add items</h3>
            {form.category_id && categoryItemIds.length > 0 && (
              <button type="button" onClick={() => addItems(categoryItemIds)} className={buttonClass("secondary", "sm")}>
                Add all from topic
              </button>
            )}
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search to add"
            aria-label="Search items to add"
            className={`${inputClass} mb-3`}
          />
          <ul className="max-h-96 space-y-1 overflow-y-auto">
            {available.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => addItems([item.id])}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-emerald-50"
                >
                  <span className="flex items-center gap-2">
                    <Icon name="plus" className="size-4 text-emerald-600" />
                    {item.bangla}
                  </span>
                  <span lang="ar" dir="rtl" className="text-lg text-slate-700">{item.arabic}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <button type="submit" disabled={saving} className={buttonClass("primary", "lg")}>
        {saving ? "Saving..." : "Save lesson"}
      </button>
    </form>
  );
}
