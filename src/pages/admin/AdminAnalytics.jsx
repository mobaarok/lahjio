import { useEffect, useState } from "react";
import { Alert, Spinner, StatCard } from "../../components/ui";
import { listAll } from "../../lib/admin";
import {
  countBy,
  lastDays,
  loadCourseStats,
  loadDailyActive,
  loadHardestWords,
  loadLessonResults,
  loadUsers,
  ONLINE_MINUTES,
  overview,
  signupsPerDay,
  streakGroups,
} from "../../lib/analytics";
import { LOCALES } from "../../i18n/locales";
import { buttonClass, cardClass } from "../../lib/styles";

const CHART_DAYS = 30;

// How learners use the app: users, activity, countries, courses and words.
// Everything loads once when the page opens; "Refresh" loads it again.
export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      const now = Date.now();
      const days = lastDays(CHART_DAYS, now);
      const lessonResults = await loadLessonResults();
      const [users, dailyActive, courses] = await Promise.all([
        loadUsers(lessonResults),
        loadDailyActive(days),
        loadCourseStats(lessonResults),
      ]);
      return { now, users, dailyActive, signups: signupsPerDay(users, days), courses };
    }

    load()
      .then((loaded) => {
        if (!ignore) setData(loaded);
      })
      .catch(() => {
        if (!ignore) setError("Couldn't load analytics. Check that the new Firestore rules are published.");
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Spinner label="Loading analytics..." />;

  const stats = overview(data.users, data.now);
  const languageName = (code) => LOCALES.find((l) => l.code === code)?.label ?? "Not recorded yet";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Updated {new Date(data.now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Counts every
          account, including admins and test accounts.
        </p>
        <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={buttonClass("secondary", "sm")}>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label="Registered" value={stats.total} hint={`${stats.new7} new this week`} />
        <StatCard label="Online now" value={stats.online} hint={`Used the app in the last ${ONLINE_MINUTES} min`} />
        <StatCard label="Active today" value={stats.activeToday} hint={`${stats.newToday} joined today`} />
        <StatCard label="Active 7 days" value={stats.active7} />
        <StatCard label="Active 30 days" value={stats.active30} />
        <StatCard label="New 30 days" value={stats.new30} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DayChart title="Active learners per day" rows={data.dailyActive} note="Counting starts from this update." />
        <DayChart title="New signups per day" rows={data.signups} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <BarList
          title="Countries"
          note="Guessed from the phone's time zone."
          rows={countBy(data.users, "country")}
        />
        <BarList
          title="App language"
          rows={countBy(data.users, "locale").map((r) => ({ ...r, label: languageName(r.label) }))}
        />
        <BarList title="Current streaks" rows={streakGroups(data.users)} sorted={false} />
      </div>

      <CourseStats courses={data.courses} />
      <HardestWords />
    </div>
  );
}

// A white card with a title, used by every section
function Panel({ title, note, children }) {
  return (
    <section className={`${cardClass} p-5`}>
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {note && <p className="text-xs text-slate-500">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// One bar per day. Hover (or tap) a bar to see its date and number.
function DayChart({ title, rows, note }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const short = (day) => day.slice(5).replace("-", "/"); // "2026-11-03" -> "11/03"

  return (
    <Panel title={title} note={note ?? `${total} in the last ${rows.length} days`}>
      <div className="flex h-36 items-end gap-0.5 border-b border-slate-200">
        {rows.map((r) => (
          <div key={r.day} className="group relative flex h-full flex-1 items-end" title={`${r.day}: ${r.count}`}>
            <div
              className="w-full rounded-t-[4px] bg-emerald-600 group-hover:bg-emerald-800"
              style={{ height: r.count ? `${(r.count / max) * 100}%` : 0 }}
              aria-label={`${r.day}: ${r.count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-500">
        <span>{short(rows[0].day)}</span>
        <span>highest: {max}</span>
        <span>{short(rows.at(-1).day)}</span>
      </div>
    </Panel>
  );
}

// Labelled horizontal bars, e.g. learners per country
function BarList({ title, note, rows, sorted = true }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  const shown = sorted ? rows.slice(0, 8) : rows;

  return (
    <Panel title={title} note={note}>
      {shown.length === 0 ? (
        <p className="text-sm text-slate-500">No data yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {shown.map((r) => (
            <li key={r.label} className="text-sm">
              <div className="flex justify-between gap-2">
                <span className="truncate text-slate-700">{r.label}</span>
                <span className="font-semibold text-slate-900">{r.count}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

// Each course: who started and finished it, and how far learners get
function CourseStats({ courses }) {
  return (
    <Panel title="Courses and lessons" note="Lessons in order. A drop between two lessons shows where learners stop.">
      <div className="space-y-6">
        {courses.map((course) => {
          const max = Math.max(1, ...course.lessons.map((l) => l.done));
          return (
            <div key={course.id}>
              <p className="font-semibold text-slate-800">
                {course.title}
                {course.status !== "published" && <span className="ml-2 text-xs text-amber-700">({course.status})</span>}
              </p>
              <p className="text-sm text-slate-500">
                {course.started} started · {course.finished} finished all {course.lessons.length} lessons
              </p>
              <ol className="mt-3 space-y-1.5">
                {course.lessons.map((lesson, index) => (
                  <li key={lesson.id} className="grid grid-cols-[minmax(0,12rem)_1fr_5.5rem] items-center gap-3 text-sm">
                    <span className="truncate text-slate-700">
                      {index + 1}. {lesson.title}
                    </span>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${(lesson.done / max) * 100}%` }} />
                    </div>
                    <span className="text-right text-slate-600">
                      {lesson.done} done
                      {lesson.averageScore !== null && <span className="block text-xs">avg {lesson.averageScore}%</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// Loads only on click, because it reads every saved answer of every learner
function HardestWords() {
  const [words, setWords] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleLoad() {
    setBusy(true);
    setError("");
    try {
      const items = await listAll("items");
      setWords(await loadHardestWords(items));
    } catch {
      setError("Couldn't load word stats.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Hardest words" note="The words learners answer wrong most often, across everyone.">
      {error && <Alert>{error}</Alert>}
      {!words ? (
        <button type="button" onClick={handleLoad} disabled={busy} className={buttonClass("secondary", "sm")}>
          {busy ? "Loading..." : "Load word stats"}
        </button>
      ) : words.length === 0 ? (
        <p className="text-sm text-slate-500">No wrong answers yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 text-sm">
          {words.map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0">
                <span className="block truncate text-slate-800">{w.item?.english || w.item?.bangla || `#${w.id}`}</span>
                <span className="text-xs text-slate-500">
                  {w.learners} learners · wrong {w.wrongRate}% of the time
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span lang="ar" dir="rtl" className="text-xl text-emerald-700">
                  {w.item?.arabic}
                </span>
                <span className="w-16 text-right font-semibold text-slate-900">{w.wrong} wrong</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
