// Fixed choices used across the app. Keep values in English (saved in
// Firestore) and labels for display.

export const ITEM_TYPES = [
  { value: "word", label: "Word", bn: "শব্দ" },
  { value: "phrase", label: "Phrase", bn: "বাক্যাংশ" },
];

export const LEVELS = [
  { value: "beginner", label: "Beginner", bn: "শুরুর স্তর" },
  { value: "intermediate", label: "Intermediate", bn: "মাঝারি স্তর" },
  { value: "advanced", label: "Advanced", bn: "উচ্চ স্তর" },
];

export const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export const COURSE_TYPES = [
  { value: "word", label: "Word course", bn: "শব্দ কোর্স" },
  { value: "phrase", label: "Phrase course", bn: "বাক্য কোর্স" },
  { value: "topic", label: "Topic course", bn: "বিষয়ভিত্তিক কোর্স" },
  { value: "mixed", label: "Mixed course", bn: "মিশ্র কোর্স" },
];

// Finds the label for a saved value, e.g. labelOf(LEVELS, "beginner", "bn")
export function labelOf(options, value, key = "label") {
  return options.find((o) => o.value === value)?.[key] ?? value;
}

export const statusTone = { draft: "amber", published: "emerald", archived: "slate" };
