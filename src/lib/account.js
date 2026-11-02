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
import { deleteUser } from "firebase/auth";
import { db } from "../firebase";

export function sendFeedback(user, message) {
  return addDoc(collection(db, "feedback"), {
    uid: user.uid,
    email: user.email ?? "",
    message: message.trim(),
    created_at: serverTimestamp(),
  });
}

// Deletes progress, lesson results, feedback and the profile, then the login.
// Firebase may ask for a fresh login first (auth/requires-recent-login).
export async function deleteAccount(user) {
  const refs = [];
  for (const name of ["progress", "lesson_progress"]) {
    const snapshot = await getDocs(collection(db, "users", user.uid, name));
    snapshot.forEach((d) => refs.push(d.ref));
  }
  const feedback = await getDocs(query(collection(db, "feedback"), where("uid", "==", user.uid)));
  feedback.forEach((d) => refs.push(d.ref));
  refs.push(doc(db, "users", user.uid));

  // A batch can hold up to 500 deletes
  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  await deleteUser(user);
}
