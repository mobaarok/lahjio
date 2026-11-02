// Course helpers: which lessons are open, finished, and what to do next

const isCompleted = (lessonProgress, lesson) => lessonProgress[lesson.id]?.status === "completed";

// Lessons unlock in order: the first is always open, the rest open once the
// previous lesson is completed
export function lessonStates(course, lessonProgress) {
  return course.lessons.map((lesson, index) => {
    const completed = isCompleted(lessonProgress, lesson);
    const previousDone = index === 0 || isCompleted(lessonProgress, course.lessons[index - 1]);
    return { lesson, completed, unlocked: completed || previousDone };
  });
}

export function completedCount(course, lessonProgress) {
  return course.lessons.filter((lesson) => isCompleted(lessonProgress, lesson)).length;
}

export function nextLesson(course, lessonProgress) {
  return lessonStates(course, lessonProgress).find((s) => s.unlocked && !s.completed)?.lesson ?? null;
}

// The course to suggest on the home page: one already started, else the first
export function courseToContinue(courses, lessonProgress) {
  const withLessons = courses.filter((c) => c.lessons.length > 0);
  const started = withLessons.find((c) => {
    const done = completedCount(c, lessonProgress);
    return done > 0 && done < c.lessons.length;
  });
  return started ?? withLessons.find((c) => nextLesson(c, lessonProgress)) ?? null;
}
