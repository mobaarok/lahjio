// Account actions: sending feedback and the Learning guide survey
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
