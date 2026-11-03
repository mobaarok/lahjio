// Account actions: sending feedback
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export function sendFeedback(user, message) {
  return addDoc(collection(db, "feedback"), {
    uid: user.uid,
    email: user.email ?? "",
    message: message.trim(),
    created_at: serverTimestamp(),
  });
}
