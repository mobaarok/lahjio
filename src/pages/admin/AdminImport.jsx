import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Badge, Field, Spinner } from "../../components/ui";
import { deleteAllContent, exportContent } from "../../lib/admin";
import { planImport, runImport } from "../../lib/contentPack";
import { buttonClass, cardClass, inputClass } from "../../lib/styles";

// Load a content pack (a .json file from content-packs/) as drafts.
// Step 1: pick the file and see what will be added. Step 2: import.
export default function AdminImport() {
  const [plan, setPlan] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);

  async function handleFile(event) {
    const file = event.target.files[0];
    setPlan(null);
    setDone(null);
    setError("");
    if (!file) return;

    setBusy(true);
    try {
      const pack = JSON.parse(await file.text());
      setPlan(await planImport(pack));
    } catch (err) {
      setError(err instanceof SyntaxError ? "This file isn't valid JSON." : err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    setBusy(true);
    setError("");
    try {
      setDone(await runImport(plan));
      setPlan(null);
    } catch {
      setError("The import failed. Nothing is published; try again, it skips what already exists.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-slate-600">
        Adds new categories, items and a course with lessons from a content pack. Everything comes in as a
        draft, and nothing that already exists is changed.
      </p>

      <Field label="Content pack file (.json)">
        <input type="file" accept=".json,application/json" onChange={handleFile} className={inputClass} />
      </Field>

      {error && <Alert>{error}</Alert>}
      {busy && <Spinner label="Working..." />}

      {done && (
        <Alert tone="success">
          Imported {done.writes} documents as drafts.{" "}
          <Link to={`/admin/courses/${done.courseId}`} className="font-semibold underline">
            Open the course
          </Link>
        </Alert>
      )}

      {plan && !busy && <ImportSummary plan={plan} onImport={handleImport} />}

      <StartFresh />
    </div>
  );
}

// Saves an object as a .json file on this computer
function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Danger zone: back up all content to a file, then delete it from Firestore
function StartFresh() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState({ tone: "", text: "" });
  // The delete button only works after typing DELETE, so it can't be clicked by accident
  const [confirmText, setConfirmText] = useState("");

  async function handleBackup() {
    setBusy(true);
    try {
      const backup = await exportContent();
      downloadJson(backup, `lahjio-content-backup-${backup.exported_at.slice(0, 10)}.json`);
      setMessage({ tone: "success", text: `Backup downloaded: ${backup.items.length} items, ${backup.courses.length} courses.` });
    } catch {
      setMessage({ tone: "error", text: "Couldn't make the backup." });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (confirmText !== "DELETE") return;
    setBusy(true);
    try {
      const count = await deleteAllContent();
      setMessage({ tone: "success", text: `Deleted ${count} documents. Now import a content pack above.` });
      setConfirmText("");
    } catch {
      setMessage({ tone: "error", text: "Deleting stopped part way. Try again; it deletes what is left." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={`${cardClass} mt-10 space-y-3 border-red-200 p-5`}>
      <h2 className="font-semibold text-red-700">Start fresh</h2>
      <p className="text-sm text-slate-600">
        Removes all content: every course, lesson, item and category. Learners' accounts, XP and streaks
        stay. Download a backup first so nothing is lost for good.
      </p>
      {message.text && <Alert tone={message.tone}>{message.text}</Alert>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleBackup} disabled={busy} className={buttonClass("secondary")}>
          1. Download backup
        </button>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          aria-label="Type DELETE to allow deleting"
          className={inputClass}
        />
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy || confirmText !== "DELETE"}
          className={buttonClass("danger")}
        >
          2. Delete all content
        </button>
      </div>
    </section>
  );
}

// What the import will add and skip
function ImportSummary({ plan, onImport }) {
  const { pack } = plan;
  const nothingNew =
    plan.newCategories.length === 0 && plan.newItems.length === 0 && plan.newLessons.length === 0 && plan.courseExists;

  return (
    <div className={`${cardClass} space-y-4 p-5`}>
      <h2 className="font-semibold text-slate-900">{pack.name ?? "Content pack"}</h2>

      <ul className="space-y-1 text-sm text-slate-700">
        <li>
          <Badge tone="emerald">{plan.newCategories.length}</Badge> new categories
          {plan.newCategories.length > 0 && `: ${plan.newCategories.map((c) => c.name_en).join(", ")}`}
        </li>
        <li>
          <Badge tone="emerald">{plan.newItems.length}</Badge> new words and phrases
        </li>
        <li>
          <Badge tone="emerald">{plan.courseExists ? 0 : 1}</Badge> new course: {pack.course.title_en}
          {plan.courseExists && " (already exists, kept as it is)"}
        </li>
        <li>
          <Badge tone="emerald">{plan.newLessons.length}</Badge> new lessons
        </li>
      </ul>

      {plan.skippedItems.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700">
            Skipped {plan.skippedItems.length} items that already exist (lessons use the existing ones):
          </p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {plan.skippedItems.map(({ item, existingId }) => (
              <li key={item.id}>
                <Badge tone="amber">
                  <span lang="ar" dir="rtl">{item.arabic}</span> → #{existingId}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      {nothingNew ? (
        <Alert tone="info">Everything in this pack is already in the database.</Alert>
      ) : (
        <button type="button" onClick={onImport} className={buttonClass("primary")}>
          Import as drafts
        </button>
      )}
    </div>
  );
}
