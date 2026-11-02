import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AudioButton from "../../components/AudioButton";
import { Alert, Field, Spinner } from "../../components/ui";
import { listAll, saveItem } from "../../lib/admin";
import { ITEM_TYPES, LEVELS, STATUSES } from "../../lib/constants";
import { byOrder, normalizeArabic } from "../../lib/format";
import { buttonClass, cardClass, inputClass } from "../../lib/styles";

const emptyItem = {
  type: "word",
  arabic: "",
  bangla: "",
  english: "",
  bn_transliteration: "",
  en_transliteration: "",
  category_ids: [],
  level: "beginner",
  audio: "",
  status: "draft",
};

// Only these fields are saved, so nothing extra sneaks into Firestore
function toSaved(form) {
  return {
    type: form.type,
    arabic: form.arabic.trim(),
    bangla: form.bangla.trim(),
    english: form.english.trim(),
    bn_transliteration: form.bn_transliteration.trim(),
    en_transliteration: form.en_transliteration.trim(),
    category_ids: form.category_ids,
    level: form.level,
    audio: form.audio.trim() || null,
    status: form.status,
  };
}

// Add a new item (/admin/items/new) or edit one (/admin/items/:itemId)
export default function AdminItemEdit() {
  const { itemId } = useParams();
  const isNew = itemId === "new";
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([listAll("items"), listAll("categories")])
      .then(([items, loadedCategories]) => {
        if (ignore) return;
        const existing = items.find((i) => i.id === itemId);
        if (!isNew && !existing) {
          setLoadError("This item doesn't exist.");
          return;
        }
        setAllItems(items);
        setCategories(loadedCategories.sort(byOrder));
        setForm(isNew ? emptyItem : { ...emptyItem, ...existing, audio: existing.audio ?? "" });
      })
      .catch(() => {
        if (!ignore) setLoadError("Couldn't load this item.");
      });
    return () => {
      ignore = true;
    };
  }, [itemId, isNew]);

  if (loadError) return <Alert>{loadError}</Alert>;
  if (!form) return <Spinner label="Loading item..." />;

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  function toggleCategory(id) {
    update(
      "category_ids",
      form.category_ids.includes(id)
        ? form.category_ids.filter((c) => c !== id)
        : [...form.category_ids, id]
    );
  }

  // Returns an error message, or "" when the form is fine
  function validate() {
    if (!form.arabic.trim() || !form.bangla.trim() || !form.bn_transliteration.trim()) {
      return "Arabic, Bangla meaning and Bangla pronunciation are required.";
    }
    if (form.category_ids.length === 0) return "Pick at least one category.";

    const duplicate = allItems.find(
      (i) => i.id !== itemId && normalizeArabic(i.arabic) === normalizeArabic(form.arabic)
    );
    if (duplicate) return `This Arabic already exists: "${duplicate.bangla}" (id ${duplicate.id}).`;
    return "";
  }

  async function handleSave(event, statusOverride) {
    event?.preventDefault();
    const problem = validate();
    if (problem) {
      setMessage({ tone: "error", text: problem });
      return;
    }

    const data = toSaved({ ...form, status: statusOverride ?? form.status });
    setSaving(true);
    setMessage({ tone: "", text: "" });
    try {
      const savedId = await saveItem(isNew ? null : itemId, data);
      setForm((current) => ({ ...current, status: data.status }));
      if (isNew) {
        navigate(`/admin/items/${savedId}`, { replace: true });
      }
      setMessage({ tone: "success", text: "Saved." });
    } catch {
      setMessage({ tone: "error", text: "Couldn't save. Check your connection and try again." });
    } finally {
      setSaving(false);
    }
  }

  const textField = (field, label, props = {}) => (
    <Field label={label}>
      <input
        value={form[field]}
        onChange={(e) => update(field, e.target.value)}
        className={inputClass}
        {...props}
      />
    </Field>
  );

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin" className="text-sm text-emerald-700 hover:underline">
          ← All items
        </Link>
        <h2 className="text-xl font-bold text-slate-900">{isNew ? "New item" : "Edit item"}</h2>
      </div>

      {message.text && <Alert tone={message.tone}>{message.text}</Alert>}

      <section className={`${cardClass} grid gap-4 p-5 sm:grid-cols-2`}>
        <Field label="Type">
          <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputClass}>
            {ITEM_TYPES.map((t) => (
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

        <div className="sm:col-span-2">
          <Field label="Arabic *">
            <div className="flex gap-2">
              <input
                value={form.arabic}
                onChange={(e) => update("arabic", e.target.value)}
                lang="ar"
                dir="rtl"
                required
                className={`${inputClass} text-2xl`}
              />
              <AudioButton item={{ arabic: form.arabic, audio: form.audio || null }} />
            </div>
          </Field>
        </div>

        {textField("bangla", "Bangla meaning *", { required: true })}
        {textField("bn_transliteration", "Bangla pronunciation *", { required: true })}
        {textField("english", "English meaning")}
        {textField("en_transliteration", "English pronunciation")}

        <div className="sm:col-span-2">
          <Field label="Audio file" hint='Path like "audio/42.mp3" in public/audio, or a full link. Empty uses the device voice.'>
            <input value={form.audio} onChange={(e) => update("audio", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className={`${cardClass} p-5`}>
        <p className="mb-3 text-sm font-medium text-slate-700">Categories *</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <label
              key={c.id}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                form.category_ids.includes(c.id)
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.category_ids.includes(c.id)}
                onChange={() => toggleCategory(c.id)}
              />
              {c.name_en} · {c.name_bn}
            </label>
          ))}
        </div>
      </section>

      <section className={`${cardClass} flex flex-wrap items-end justify-between gap-4 p-5`}>
        <Field label="Status" hint="Only published items are shown to learners.">
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>

        <div className="flex flex-wrap gap-2">
          {!isNew && form.status !== "archived" && (
            <button
              type="button"
              onClick={() => handleSave(null, "archived")}
              disabled={saving}
              className={buttonClass("secondary")}
            >
              Archive
            </button>
          )}
          <button type="submit" disabled={saving} className={buttonClass("primary")}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </section>
    </form>
  );
}
