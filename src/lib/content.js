// Learner content: published items, categories, courses and lessons.
// Saved on the device and downloaded again only when meta/content.version changes.
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { byOrder } from "./format";

const CACHE_KEY = "lahjio-content-v1";

// Firestore timestamps can't be saved as JSON, and learners don't need them
function toPlain(snapshot) {
  const data = { id: snapshot.id, ...snapshot.data() };
  delete data.created_at;
  delete data.updated_at;
  return data;
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY));
  } catch {
    return null;
  }
}

function writeCache(content) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // Storage full or blocked: the app still works, just without the cache
  }
}

function published(path) {
  return getDocs(query(collection(db, ...path), where("status", "==", "published")));
}

async function fetchPublished() {
  const [items, categories, courses] = await Promise.all([
    published(["items"]),
    getDocs(collection(db, "categories")),
    published(["courses"]),
  ]);

  const courseList = courses.docs.map(toPlain).sort(byOrder);
  const lessons = await Promise.all(
    courseList.map((course) => published(["courses", course.id, "lessons"]))
  );
  courseList.forEach((course, i) => {
    course.lessons = lessons[i].docs.map(toPlain).sort(byOrder);
  });

  return {
    items: items.docs.map(toPlain),
    categories: categories.docs.map(toPlain).sort(byOrder),
    courses: courseList,
  };
}

export async function loadContent() {
  const cached = readCache();
  let version;

  try {
    const meta = await getDoc(doc(db, "meta", "content"));
    version = meta.exists() ? meta.data().version : 0;
  } catch (err) {
    if (cached) return cached; // offline: use the saved copy
    throw err;
  }

  if (cached && cached.version === version) return cached;

  const content = { version, ...(await fetchPublished()) };
  writeCache(content);
  return content;
}

export function indexById(list) {
  return Object.fromEntries(list.map((entry) => [entry.id, entry]));
}
