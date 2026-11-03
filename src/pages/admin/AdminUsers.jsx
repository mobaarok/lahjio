import { useEffect, useState } from "react";
import { Alert, Badge, EmptyState, Spinner } from "../../components/ui";
import { loadLessonResults, loadUsers, ONLINE_MINUTES } from "../../lib/analytics";
import { LOCALES } from "../../i18n/locales";
import { cardClass, inputClass } from "../../lib/styles";

const SORTS = [
  { value: "last_seen_at", label: "Last seen" },
  { value: "signed_up_at", label: "Newest" },
  { value: "xp", label: "Most XP" },
  { value: "lessons_done", label: "Most lessons" },
  { value: "current_streak", label: "Longest streak" },
];

// "5 min ago", "3 days ago"
function timeAgo(ms, now) {
  if (!ms) return "—";
  const minutes = Math.round((now - ms) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

const formatDate = (ms) => (ms ? new Date(ms).toLocaleDateString() : "—");

// Every learner with their activity and progress, searchable and sortable
export default function AdminUsers() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("last_seen_at");

  useEffect(() => {
    let ignore = false;
    loadLessonResults()
      .then(loadUsers)
      .then((users) => {
        if (!ignore) setData({ users, now: Date.now() });
      })
      .catch(() => {
        if (!ignore) setError("Couldn't load users. Check that the new Firestore rules are published.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Spinner label="Loading users..." />;

  const query = search.trim().toLowerCase();
  const visible = data.users
    .filter((u) => [u.name, u.email, u.country].some((text) => (text ?? "").toLowerCase().includes(query)))
    .sort((a, b) => (b[sort] ?? 0) - (a[sort] ?? 0));
  const isOnline = (u) => u.last_seen_at && data.now - u.last_seen_at < ONLINE_MINUTES * 60000;
  const languageName = (code) => LOCALES.find((l) => l.code === code)?.label ?? "—";

  return (
    <div>
      <p className="mb-4 text-sm text-slate-600">
        {data.users.length} learners. Learners who never opened the app after this update may have no name or country
        yet.
      </p>

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email or country"
          aria-label="Search users"
          className={inputClass}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass} aria-label="Sort by">
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No users match">Try a different search.</EmptyState>
      ) : (
        <div className={`${cardClass} overflow-x-auto`}>
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Learner</th>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium">Language</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
                <th className="px-4 py-3 text-right font-medium">XP</th>
                <th className="px-4 py-3 text-right font-medium">Streak</th>
                <th className="px-4 py-3 text-right font-medium">Lessons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((u) => (
                <tr key={u.uid}>
                  <td className="max-w-56 px-4 py-3">
                    <p className="truncate font-medium text-slate-900">{u.name || "No name"}</p>
                    <p className="truncate text-xs text-slate-500">{u.email || u.uid}</p>
                  </td>
                  <td className="px-4 py-3">{u.country}</td>
                  <td className="px-4 py-3">{languageName(u.locale)}</td>
                  <td className="px-4 py-3">{formatDate(u.signed_up_at)}</td>
                  <td className="px-4 py-3">
                    {isOnline(u) ? <Badge tone="emerald">Online</Badge> : timeAgo(u.last_seen_at, data.now)}
                  </td>
                  <td className="px-4 py-3 text-right">{u.xp}</td>
                  <td className="px-4 py-3 text-right">
                    {u.current_streak}
                    <span className="block text-xs text-slate-500">best {u.longest_streak}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{u.lessons_done}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
