// Admin-only writes. Firestore rules block these for everyone else.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { refreshContent } from "../hooks/useContent";

// Every content change bumps the version, so learners download fresh content
async function bumpVersion() {
  await setDoc(
    doc(db, "meta", "content"),
    { version: increment(1), updated_at: serverTimestamp() },
    { merge: true }
  );
  refreshContent();
}

export async function listAll(...path) {
  const snapshot = await getDocs(collection(db, ...path));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOne(...path) {
  const snapshot = await getDoc(doc(db, ...path));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// Adds a new document when id is empty, otherwise updates it. Returns the id.
async function save(path, id, data) {
  const payload = { ...data, updated_at: serverTimestamp() };

  if (id) {
    await setDoc(doc(db, ...path, id), payload, { merge: true });
  } else {
    payload.created_at = serverTimestamp();
    const ref = await addDoc(collection(db, ...path), payload);
    id = ref.id;
  }

  await bumpVersion();
  return id;
}

export function saveItem(id, data) {
  return save(["items"], id, data);
}

export function saveCourse(id, data) {
  return save(["courses"], id, data);
}

export async function saveLesson(courseId, lessonId, data) {
  const id = await save(["courses", courseId, "lessons"], lessonId, data);
  await updateLessonCount(courseId);
  return id;
}

// Stored on the course, so learners never have to count lessons
async function updateLessonCount(courseId) {
  const lessons = await listAll("courses", courseId, "lessons");
  await updateDoc(doc(db, "courses", courseId), {
    lesson_count: lessons.filter((l) => l.status === "published").length,
  });
}

// "Daily Life" -> "daily-life"
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function saveCategory(id, data, isNew) {
  if (isNew && (await getOne("categories", id))) {
    throw new Error(`A category with the id "${id}" already exists.`);
  }
  await setDoc(doc(db, "categories", id), data, { merge: true });
  await bumpVersion();
}

export async function listFeedback() {
  const snapshot = await getDocs(query(collection(db, "feedback"), orderBy("created_at", "desc")));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function deleteFeedback(id) {
  return deleteDoc(doc(db, "feedback", id));
}
