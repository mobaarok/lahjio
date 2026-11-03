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
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { refreshContent } from "../hooks/useContent";

// Every content change bumps the version, so learners download fresh content
export async function bumpVersion() {
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

// Publishes a course, its draft lessons and the draft items those lessons use.
// Archived lessons and items stay archived. Returns how many were published.
export async function publishCourse(courseId) {
  const [lessons, items] = await Promise.all([listAll("courses", courseId, "lessons"), listAll("items")]);
  const lessonsToPublish = lessons.filter((l) => l.status === "draft");

  const usedIds = new Set(lessons.filter((l) => l.status !== "archived").flatMap((l) => l.item_ids ?? []));
  const itemsToPublish = items.filter((i) => usedIds.has(i.id) && i.status === "draft");

  const writes = [
    ["courses", courseId],
    ...lessonsToPublish.map((l) => ["courses", courseId, "lessons", l.id]),
    ...itemsToPublish.map((i) => ["items", i.id]),
  ];

  // Firestore allows 500 writes per batch; stay well below
  for (let start = 0; start < writes.length; start += 400) {
    const batch = writeBatch(db);
    for (const path of writes.slice(start, start + 400)) {
      batch.update(doc(db, ...path), { status: "published", updated_at: serverTimestamp() });
    }
    await batch.commit();
  }

  await updateLessonCount(courseId);
  await bumpVersion();
  return { lessons: lessonsToPublish.length, items: itemsToPublish.length };
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
