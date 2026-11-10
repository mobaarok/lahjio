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

// The path an item's audio file has when it's named after the item id
export function audioPathFor(itemId) {
  return `audio/${itemId}.mp3`;
}

// True if the site serves a real audio file at this path. The dev server
// answers missing files with the app's HTML page, so check the file type too.
async function audioFileExists(path) {
  try {
    const response = await fetch(path, { method: "HEAD", cache: "no-store" });
    return response.ok && (response.headers.get("content-type") ?? "").startsWith("audio");
  } catch {
    return false;
  }
}

// For every item without audio, checks if public/audio/<id>.mp3 is on the
// site and, if so, saves that path in the item's "audio" field.
// Items that already have audio are never changed. Returns the linked ids.
export async function linkAudioFiles(items) {
  const missing = items.filter((item) => !item.audio);

  // Check 20 files at a time, so hundreds of items don't flood the network
  const found = [];
  for (let start = 0; start < missing.length; start += 20) {
    const group = missing.slice(start, start + 20);
    const exists = await Promise.all(group.map((item) => audioFileExists(audioPathFor(item.id))));
    found.push(...group.filter((_, index) => exists[index]));
  }

  // Firestore allows 500 writes per batch; stay well below
  for (let start = 0; start < found.length; start += 400) {
    const batch = writeBatch(db);
    for (const item of found.slice(start, start + 400)) {
      batch.update(doc(db, "items", item.id), { audio: audioPathFor(item.id), updated_at: serverTimestamp() });
    }
    await batch.commit();
  }

  if (found.length > 0) await bumpVersion();
  return { checked: missing.length, linked: found.map((item) => item.id) };
}

// All content in one object (categories, items, courses with their lessons),
// for a backup file before a reset. Firestore dates become ISO text.
export async function exportContent() {
  const [categories, items, courses] = await Promise.all([
    listAll("categories"),
    listAll("items"),
    listAll("courses"),
  ]);
  for (const course of courses) {
    course.lessons = await listAll("courses", course.id, "lessons");
  }
  return withPlainDates({ exported_at: new Date().toISOString(), categories, items, courses });
}

// Firestore timestamps -> "2026-11-04T10:00:00.000Z", everywhere in an object
function withPlainDates(value) {
  if (value?.toDate) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(withPlainDates);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withPlainDates(v)]));
  }
  return value;
}

// Deletes every course, lesson, item and category. Learners' saved progress
// is kept; pages ignore progress for items and lessons that no longer exist.
// Download exportContent() first. Returns how many documents were deleted.
export async function deleteAllContent() {
  const [categories, items, courses] = await Promise.all([
    listAll("categories"),
    listAll("items"),
    listAll("courses"),
  ]);

  const paths = [
    ...categories.map((c) => ["categories", c.id]),
    ...items.map((i) => ["items", i.id]),
  ];
  for (const course of courses) {
    const lessons = await listAll("courses", course.id, "lessons");
    paths.push(...lessons.map((l) => ["courses", course.id, "lessons", l.id]));
    paths.push(["courses", course.id]);
  }

  for (let start = 0; start < paths.length; start += 400) {
    const batch = writeBatch(db);
    for (const path of paths.slice(start, start + 400)) batch.delete(doc(db, ...path));
    await batch.commit();
  }

  await bumpVersion();
  return paths.length;
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
