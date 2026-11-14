// Account actions: deleting the account, sending feedback and the Learning guide survey
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";

// "Deletes" an account without removing anything: it only marks the profile
// with is_deleted, so progress and feedback stay for the owner. The login
// still exists, but AuthProvider signs out anyone whose profile has this mark.
export function markAccountDeleted(user) {
  return setDoc(
    doc(db, "users", user.uid),
    { is_deleted: true, deleted_at: serverTimestamp() },
    { merge: true }
  );
}

export function sendFeedback(user, message) {
  return addDoc(collection(db, "feedback"), {
    uid: user.uid,
    email: user.email ?? "",
    message: message.trim(),
    created_at: serverTimestamp(),
  });
}

// The Learning guide survey: which courses learners want next.
// Saved in the same `feedback` collection, so it shows up in Admin > Feedback
// without any new security rules. `kind: "survey"` marks it, `survey` holds
// the answers for counting later, and `message` is a readable English summary.
export function sendSurvey(user, answers, locale) {
  const lines = [
    "Learning guide survey",
    `Topics: ${answers.topics.join(", ") || "-"}`,
    `Course types: ${answers.types.join(", ") || "-"}`,
    `Level: ${answers.level || "-"}`,
    `Job: ${answers.job.trim() || "-"}`,
    `Comment: ${answers.comment.trim() || "-"}`,
  ];
  return addDoc(collection(db, "feedback"), {
    uid: user.uid,
    email: user.email ?? "",
    message: lines.join("\n"),
    kind: "survey",
    survey: {
      topics: answers.topics,
      types: answers.types,
      level: answers.level,
      job: answers.job.trim(),
      comment: answers.comment.trim(),
    },
    locale,
    created_at: serverTimestamp(),
  });
}
