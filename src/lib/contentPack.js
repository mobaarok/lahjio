// Content packs: a JSON file with new categories, items and one course with
// lessons (see content-packs/). Admin > Import loads a pack in two steps:
// planImport() shows what will change, runImport() writes it.
// Everything is saved as a draft, so learners see nothing until it's published.
import { doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { bumpVersion, listAll } from "./admin";
import { normalizeArabic } from "./format";

// Firestore allows 500 writes per batch; stay well below
const BATCH_SIZE = 400;

// Arabic without vowel marks and question marks, for the duplicate check
const arabicKey = (text) => normalizeArabic(text).replace(/[؟?]/g, "").trim();

// Throws a readable error if the file isn't a content pack
export function checkPack(pack) {
  if (!Array.isArray(pack?.categories) || !Array.isArray(pack?.items) || !pack?.course?.id) {
    throw new Error("This file isn't a content pack. It needs categories, items and a course.");
  }
  for (const item of pack.items) {
    if (!item.id || !item.arabic || !item.bangla) {
      throw new Error(`Item "${item.id ?? "?"}" is missing its id, Arabic or Bangla.`);
    }
  }
}

// Compares the pack with the database and returns what is new and what is skipped
export async function planImport(pack) {
  checkPack(pack);
  const [categories, items, courses, lessons] = await Promise.all([
    listAll("categories"),
    listAll("items"),
    listAll("courses"),
    listAll("courses", pack.course.id, "lessons"),
  ]);

  const categoryIds = new Set(categories.map((c) => c.id));
  const itemIds = new Set(items.map((i) => i.id));
  const idByArabic = new Map(items.map((i) => [arabicKey(i.arabic), i.id]));
  const lessonIds = new Set(lessons.map((l) => l.id));

  const newItems = [];
  const skippedItems = []; // { item, existingId }
  // Pack item id -> the id lessons should use (an existing item when it's a duplicate)
  const useId = {};

  for (const item of pack.items) {
    const existingId = itemIds.has(item.id) ? item.id : idByArabic.get(arabicKey(item.arabic));
    if (existingId) {
      skippedItems.push({ item, existingId });
      useId[item.id] = existingId;
    } else {
      newItems.push(item);
      useId[item.id] = item.id;
    }
  }

  const lastOrder = Math.max(0, ...courses.map((c) => c.order ?? 0));

  return {
    pack,
    newCategories: pack.categories.filter((c) => !categoryIds.has(c.id)),
    newItems,
    skippedItems,
    courseExists: courses.some((c) => c.id === pack.course.id),
    courseOrder: lastOrder + 10,
    newLessons: pack.course.lessons
      .filter((l) => !lessonIds.has(l.id))
      .map((l) => ({ ...l, item_ids: l.item_ids.map((id) => useId[id]).filter(Boolean) })),
  };
}

// Writes the plan. Existing documents are never changed.
export async function runImport(plan) {
  const { pack } = plan;
  const now = serverTimestamp();
  const writes = []; // [path, data]

  for (const { id, ...category } of plan.newCategories) {
    writes.push([["categories", id], category]);
  }

  for (const { id, ...item } of plan.newItems) {
    writes.push([
      ["items", id],
      { level: "beginner", audio: null, ...item, status: "draft", created_at: now, updated_at: now },
    ]);
  }

  const { id: courseId, ...course } = pack.course;
  delete course.lessons; // lessons are their own documents, below
  if (!plan.courseExists) {
    writes.push([
      ["courses", courseId],
      { ...course, order: plan.courseOrder, status: "draft", lesson_count: 0, created_at: now, updated_at: now },
    ]);
  }

  for (const { id, ...lesson } of plan.newLessons) {
    writes.push([
      ["courses", courseId, "lessons", id],
      { is_free: true, ...lesson, status: "draft", created_at: now, updated_at: now },
    ]);
  }

  // Send the writes in batches
  for (let start = 0; start < writes.length; start += BATCH_SIZE) {
    const batch = writeBatch(db);
    for (const [path, data] of writes.slice(start, start + BATCH_SIZE)) {
      batch.set(doc(db, ...path), data);
    }
    await batch.commit();
  }

  await bumpVersion();
  return { writes: writes.length, courseId };
}
