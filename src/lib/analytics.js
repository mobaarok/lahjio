// Numbers for Admin > Analytics, read straight from Firestore (no server).
// Each page load reads every user profile and every lesson result once, which
// is fine on the free plan for the first few thousand learners.
import {
  collection,
  collectionGroup,
  getCountFromServer,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { listAll } from "./admin";
import { countryOf } from "./countries";
import { byOrder, dayKey } from "./format";

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
export const ONLINE_MINUTES = 5;

const toMillis = (value) => value?.toMillis?.() ?? null;

// The last `count` days as "2026-11-03" keys, oldest first
export function lastDays(count, now) {
  return Array.from({ length: count }, (_, i) => dayKey(new Date(now - (count - 1 - i) * DAY)));
}

// Every finished lesson of every learner: [{ uid, lessonId, course_id, best_score }]
export async function loadLessonResults() {
  const snapshot = await getDocs(collectionGroup(db, "lesson_progress"));
  return snapshot.docs
    .filter((d) => d.data().status === "completed")
    .map((d) => ({ uid: d.ref.parent.parent.id, lessonId: d.id, ...d.data() }));
}

// Every learner profile, plus how many lessons each one finished
export async function loadUsers(lessonResults) {
  const users = await getDocs(collection(db, "users"));

  const lessonsDone = {};
  for (const r of lessonResults) lessonsDone[r.uid] = (lessonsDone[r.uid] ?? 0) + 1;

  return users.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name ?? null,
      email: data.email ?? null,
      // Older profiles have no signup date: use their first activity instead
      signed_up_at: toMillis(data.signed_up_at) ?? toMillis(data.created_at),
      last_seen_at: toMillis(data.last_seen_at) ?? toMillis(data.last_active_at),
      last_active_date: data.last_active_date ?? null,
      locale: data.locale ?? null,
      country: countryOf(data.time_zone),
      xp: data.xp ?? 0,
      current_streak: data.current_streak ?? 0,
      longest_streak: data.longest_streak ?? 0,
      lessons_done: lessonsDone[d.id] ?? 0,
    };
  });
}

// Active learners per day: one cheap count query per day
export async function loadDailyActive(days) {
  const counts = await Promise.all(
    days.map((day) => getCountFromServer(query(collection(db, "activity"), where("day", "==", day))))
  );
  return days.map((day, i) => ({ day, count: counts[i].data().count }));
}

// Headline numbers from the user list
export function overview(users, now) {
  const today = dayKey(new Date(now));
  const since = (ms) => users.filter((u) => u.last_seen_at && u.last_seen_at >= now - ms).length;
  const joinedSince = (ms) => users.filter((u) => u.signed_up_at && u.signed_up_at >= now - ms).length;

  return {
    total: users.length,
    online: since(ONLINE_MINUTES * MINUTE),
    activeToday: users.filter((u) => u.last_active_date === today || (u.last_seen_at && dayKey(new Date(u.last_seen_at)) === today)).length,
    active7: since(7 * DAY),
    active30: since(30 * DAY),
    newToday: users.filter((u) => u.signed_up_at && dayKey(new Date(u.signed_up_at)) === today).length,
    new7: joinedSince(7 * DAY),
    new30: joinedSince(30 * DAY),
  };
}

// New signups per day for the chart
export function signupsPerDay(users, days) {
  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  for (const u of users) {
    if (!u.signed_up_at) continue;
    const day = dayKey(new Date(u.signed_up_at));
    if (day in counts) counts[day]++;
  }
  return days.map((day) => ({ day, count: counts[day] }));
}

// [{ label, count }] sorted by count, e.g. learners per country
export function countBy(users, field) {
  const counts = {};
  for (const u of users) {
    const key = u[field] ?? "Unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

// Streak groups: how many learners keep coming back
export function streakGroups(users) {
  const groups = [
    { label: "No streak", test: (s) => s === 0 },
    { label: "1-2 days", test: (s) => s >= 1 && s <= 2 },
    { label: "3-6 days", test: (s) => s >= 3 && s <= 6 },
    { label: "7-29 days", test: (s) => s >= 7 && s <= 29 },
    { label: "30+ days", test: (s) => s >= 30 },
  ];
  return groups.map((g) => ({ label: g.label, count: users.filter((u) => g.test(u.current_streak)).length }));
}

// Per course: learners who started and finished it, and each lesson's
// completions and average best score (to see where learners stop)
export async function loadCourseStats(lessonResults) {
  const courses = await listAll("courses");

  // "courseId/lessonId" -> { done, scoreTotal }, and courseId -> uid -> lessons done
  const byLesson = {};
  const byCourseUser = {};
  for (const r of lessonResults) {
    const key = `${r.course_id}/${r.lessonId}`;
    byLesson[key] ??= { done: 0, scoreTotal: 0 };
    byLesson[key].done++;
    byLesson[key].scoreTotal += r.best_score ?? 0;
    byCourseUser[r.course_id] ??= {};
    byCourseUser[r.course_id][r.uid] = (byCourseUser[r.course_id][r.uid] ?? 0) + 1;
  }

  const visible = courses.filter((c) => c.status !== "archived").sort(byOrder);
  return Promise.all(
    visible.map(async (course) => {
      const lessons = (await listAll("courses", course.id, "lessons"))
        .filter((l) => l.status === "published")
        .sort(byOrder);
      const learners = Object.values(byCourseUser[course.id] ?? {});
      return {
        id: course.id,
        title: course.title_en || course.title_bn,
        status: course.status,
        started: learners.length,
        finished: lessons.length ? learners.filter((n) => n >= lessons.length).length : 0,
        lessons: lessons.map((lesson) => {
          const stats = byLesson[`${course.id}/${lesson.id}`];
          return {
            id: lesson.id,
            title: lesson.title_en || lesson.title_bn,
            done: stats?.done ?? 0,
            averageScore: stats ? Math.round(stats.scoreTotal / stats.done) : null,
          };
        }),
      };
    })
  );
}

// Words learners miss most. Reads every saved answer of every learner, so it
// only runs when the admin clicks the button.
export async function loadHardestWords(items, limit = 15) {
  const snapshot = await getDocs(collectionGroup(db, "progress"));
  const totals = {};
  snapshot.forEach((d) => {
    const data = d.data();
    totals[d.id] ??= { right: 0, wrong: 0, learners: 0 };
    totals[d.id].right += data.times_correct ?? 0;
    totals[d.id].wrong += data.times_wrong ?? 0;
    totals[d.id].learners++;
  });

  const itemById = Object.fromEntries(items.map((i) => [i.id, i]));
  return Object.entries(totals)
    .filter(([, t]) => t.wrong > 0)
    .map(([id, t]) => ({
      id,
      item: itemById[id] ?? null,
      wrong: t.wrong,
      learners: t.learners,
      wrongRate: Math.round((t.wrong / (t.right + t.wrong)) * 100),
    }))
    .sort((a, b) => b.wrong - a.wrong || b.wrongRate - a.wrongRate)
    .slice(0, limit);
}
