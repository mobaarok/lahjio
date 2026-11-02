// Account actions: feedback and deleting all of a user's data
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

export function sendFeedback(user, message) {
  return addDoc(collection(db, "feedback"), {
    uid: user.uid,
    email: user.email ?? "",
    message: message.trim(),
    created_at: serverTimestamp(),
  });
}

// Firebase only lets a login delete itself shortly after signing in.
// Checking first means we never delete the data but leave the login behind.
export function isRecentLogin(user, maxMinutes = 5) {
  const lastSignIn = Date.parse(user.metadata.lastSignInTime ?? "");
  return Date.now() - lastSignIn < maxMinutes * 60 * 1000;
}

// Deletes progress, lesson results, feedback and the profile.
// The page then deletes the login itself with deleteUser().
export async function deleteUserData(uid) {
  const refs = [];
  for (const name of ["progress", "lesson_progress"]) {
    const snapshot = await getDocs(collection(db, "users", uid, name));
    snapshot.forEach((d) => refs.push(d.ref));
  }
  const feedback = await getDocs(query(collection(db, "feedback"), where("uid", "==", uid)));
  feedback.forEach((d) => refs.push(d.ref));
  refs.push(doc(db, "users", uid));

  // A batch can hold up to 500 deletes
  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}
