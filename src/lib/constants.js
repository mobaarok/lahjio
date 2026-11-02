// Fixed choices for the admin area. Values are saved in Firestore; labels are
// shown in the (English) admin. Learner pages translate values with
// t("level.beginner") and similar keys in i18n/messages.

export const ITEM_TYPES = [
  { value: "word", label: "Word" },
  { value: "phrase", label: "Phrase" },
];

export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export const COURSE_TYPES = [
  { value: "word", label: "Word course" },
  { value: "phrase", label: "Phrase course" },
  { value: "topic", label: "Topic course" },
  { value: "mixed", label: "Mixed course" },
];

// Finds the admin label for a saved value, e.g. labelOf(LEVELS, "beginner")
export function labelOf(options, value, key = "label") {
  return options.find((o) => o.value === value)?.[key] ?? value;
}

export const statusTone = { draft: "amber", published: "emerald", archived: "slate" };
