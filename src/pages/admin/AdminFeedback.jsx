import { useEffect, useState } from "react";
import { Alert, EmptyState, Spinner } from "../../components/ui";
import { deleteFeedback, listFeedback } from "../../lib/admin";
import { buttonClass, cardClass } from "../../lib/styles";

// Messages learners send from their account page
export default function AdminFeedback() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    listFeedback()
      .then((loaded) => {
        if (!ignore) setEntries(loaded);
      })
      .catch(() => {
        if (!ignore) setError("Couldn't load feedback.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleDelete(id) {
    try {
      await deleteFeedback(id);
      setEntries((current) => current.filter((e) => e.id !== id));
    } catch {
      setError("Couldn't delete that message.");
    }
  }

  if (!entries) return error ? <Alert>{error}</Alert> : <Spinner label="Loading feedback..." />;
  if (entries.length === 0) return <EmptyState title="No feedback yet" />;

  return (
    <div className="space-y-3">
      {error && <Alert>{error}</Alert>}
      {entries.map((entry) => (
        <article key={entry.id} className={`${cardClass} p-4`}>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <span>
              {entry.email || "Unknown user"} · {entry.created_at?.toDate?.().toLocaleString() ?? "just now"}
            </span>
            <button type="button" onClick={() => handleDelete(entry.id)} className={buttonClass("ghost", "sm")}>
              Delete
            </button>
          </div>
          <p className="whitespace-pre-wrap text-slate-800">{entry.message}</p>
        </article>
      ))}
    </div>
  );
}
