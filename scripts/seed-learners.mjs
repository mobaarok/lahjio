// Adds fake learners to the LOCAL emulators, so Admin > Analytics has
// something to show. Never touches the real project.
//
// Run after `npm run seed:emulators` (and after importing a course in
// Admin > Import, so learners have lessons to finish):
//   npm run seed:learners
//
// Each learner writes their own data while signed in, so the security rules
// are tested the same way the app uses them.
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";

const AUTH_URL = "http://127.0.0.1:9099";
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

// name, time zone, language, days since signup, days since last visit, lessons done
const learners = [
  ["Rahim Uddin", "Asia/Riyadh", "bn", 25, 0, 6],
  ["Karim Hossain", "Asia/Riyadh", "bn", 18, 1, 4],
  ["Jamal Ahmed", "Asia/Riyadh", "bn", 12, 0, 3],
  ["Salma Begum", "Asia/Dhaka", "bn", 9, 3, 2],
  ["Arif Khan", "Asia/Karachi", "ur", 7, 0, 1],
  ["Ravi Kumar", "Asia/Kolkata", "hi", 5, 2, 2],
  ["Nabil Islam", "Asia/Dubai", "en", 3, 0, 1],
  ["Faruk Mia", "Asia/Riyadh", "bn", 1, 1, 0],
];

const app = initializeApp({ apiKey: "fake-key", projectId: "demo-lahjio" });
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, AUTH_URL, { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);

const dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);

async function createAccount(email, password, displayName) {
  const response = await fetch(`${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName }),
  });
  await response.json(); // an existing account is fine: we just sign in
}

// The course's published lessons, in order (empty if no course was imported)
async function lessonsOf(courseId) {
  const snapshot = await getDocs(
    query(collection(db, "courses", courseId, "lessons"), where("status", "==", "published"))
  );
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => a.order - b.order);
}

for (const [index, [name, timeZone, locale, joinedDaysAgo, seenDaysAgo, lessonsDone]] of learners.entries()) {
  const email = `learner${index + 1}@lahjio.test`;
  await createAccount(email, "test-learner-pass", name);
  const { user } = await signInWithEmailAndPassword(auth, email, "test-learner-pass");
  const lessons = (await lessonsOf("everyday-life")).slice(0, lessonsDone);

  const lastSeen = now - seenDaysAgo * DAY - (seenDaysAgo === 0 ? index * 60 * 1000 : 0);
  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    locale,
    time_zone: timeZone,
    signed_up_at: Timestamp.fromMillis(now - joinedDaysAgo * DAY),
    last_seen_at: Timestamp.fromMillis(lastSeen),
    last_active_date: dayKey(lastSeen),
    xp: lessonsDone * 120 + 40,
    current_streak: seenDaysAgo <= 1 ? Math.min(joinedDaysAgo, lessonsDone + 1) : 0,
    longest_streak: lessonsDone + 2,
  });

  // Active on most days since joining
  for (let d = joinedDaysAgo; d >= seenDaysAgo; d--) {
    if ((d + index) % 3 === 0 && d !== seenDaysAgo) continue;
    const day = dayKey(now - d * DAY);
    await setDoc(doc(db, "activity", `${user.uid}_${day}`), { uid: user.uid, day });
  }

  for (const lesson of lessons) {
    await setDoc(doc(db, "users", user.uid, "lesson_progress", lesson.id), {
      course_id: "everyday-life",
      status: "completed",
      best_score: 60 + ((index * 7 + lesson.order) % 40),
    });
    // Some wrong answers on the lesson's words, more on the first two
    for (const [i, itemId] of lesson.item_ids.entries()) {
      await setDoc(doc(db, "users", user.uid, "progress", itemId), {
        known: i % 3 !== 0,
        box: 1,
        times_correct: 2,
        times_wrong: i < 2 ? 3 : i % 3 === 0 ? 1 : 0,
        next_review_at: Timestamp.fromMillis(now + DAY),
      });
    }
  }

  await signOut(auth);
  console.log(`${name}: ${lessons.length} lessons`);
}

console.log(`Added ${learners.length} fake learners (learner1..${learners.length}@lahjio.test).`);
process.exit(0);
