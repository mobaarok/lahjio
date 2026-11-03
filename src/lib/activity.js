// Usage tracking for Admin > Analytics. Kept small on purpose:
// - users/{uid}: name, email, signup date, language, time zone, last_seen_at
// - activity/{uid}_{day}: one note per learner per day they open the app
// Only the learner and admins can read these (see firestore.rules).
import { doc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { dayKey } from "./format";

// The phone's time zone, e.g. "Asia/Riyadh". Shown as a country in the admin.
function timeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

// Called when a logged-in learner opens the app (and when they change language)
export async function recordVisit(user, locale) {
  const signedUp = Date.parse(user.metadata?.creationTime ?? "");

  await Promise.all([
    setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName ?? null,
        email: user.email ?? null,
        locale,
        time_zone: timeZone(),
        last_seen_at: serverTimestamp(),
        ...(Number.isNaN(signedUp) ? {} : { signed_up_at: Timestamp.fromMillis(signedUp) }),
      },
      { merge: true }
    ),
    markActiveToday(user.uid),
  ]);
}

// Called every few minutes while the app is open, for "online now"
export async function recordHeartbeat(uid) {
  await Promise.all([
    setDoc(doc(db, "users", uid), { last_seen_at: serverTimestamp() }, { merge: true }),
    markActiveToday(uid), // keeps the daily note right if the app stays open past midnight
  ]);
}

function markActiveToday(uid) {
  const day = dayKey();
  return setDoc(doc(db, "activity", `${uid}_${day}`), { uid, day });
}
