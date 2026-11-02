import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ProgressContext } from "../hooks/useProgress";
import {
  loadProgress,
  nextEntry,
  nextProfile,
  saveAnswer,
  saveDailyGoal,
  saveLessonResult,
  XP_CORRECT,
  XP_LESSON,
  XP_WRONG,
} from "../lib/progress";

const emptyProgress = { progress: {}, lessonProgress: {}, profile: null };

// Loads the logged-in user's progress once and shares it with every page.
// Changes show on screen right away and are saved to Firestore in the background.
export function ProgressProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState({ uid: null, ...emptyProgress });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return; // logged out: nothing to load
    let ignore = false;

    loadProgress(user.uid)
      .then((loaded) => {
        if (!ignore) setData({ uid: user.uid, ...loaded });
      })
      .catch(() => {
        if (ignore) return;
        setData({ uid: user.uid, ...emptyProgress });
        setError("আগের অগ্রগতি লোড করা যায়নি।");
      });

    return () => {
      ignore = true;
    };
  }, [user]);

  // Only use the data if it belongs to the user who is logged in now
  const ready = Boolean(user) && data.uid === user.uid;
  const current = ready ? data : emptyProgress;

  async function recordAnswer(itemId, correct) {
    if (!ready) return;
    const now = Date.now();
    const entry = nextEntry(data.progress[itemId], correct, now);
    const xpGained = correct ? XP_CORRECT : XP_WRONG;
    const newProfile = nextProfile(data.profile, { answers: 1, xp: xpGained }, now);

    setData((prev) => ({
      ...prev,
      progress: { ...prev.progress, [itemId]: entry },
      profile: { ...prev.profile, ...newProfile },
    }));

    try {
      await saveAnswer(user.uid, itemId, entry, data.profile, newProfile, xpGained);
    } catch {
      setError("অগ্রগতি সেভ করা যায়নি। ইন্টারনেট সংযোগ দেখো।");
    }
  }

  async function completeLesson(courseId, lessonId, score) {
    if (!ready) return;
    const bestScore = Math.max(data.lessonProgress[lessonId]?.best_score ?? 0, score);
    const newProfile = nextProfile(data.profile, { xp: XP_LESSON }, Date.now());

    setData((prev) => ({
      ...prev,
      lessonProgress: {
        ...prev.lessonProgress,
        [lessonId]: { course_id: courseId, status: "completed", best_score: bestScore },
      },
      profile: { ...prev.profile, ...newProfile },
    }));

    try {
      await saveLessonResult(user.uid, courseId, lessonId, bestScore, data.profile, newProfile, XP_LESSON);
    } catch {
      setError("লেসনের ফলাফল সেভ করা যায়নি।");
    }
  }

  async function setDailyGoal(goal) {
    if (!ready) return;
    setData((prev) => ({ ...prev, profile: { ...prev.profile, daily_goal: goal } }));
    try {
      await saveDailyGoal(user.uid, goal);
    } catch {
      setError("লক্ষ্য সেভ করা যায়নি।");
    }
  }

  const value = {
    loading: Boolean(user) && !ready,
    error,
    clearError: () => setError(""),
    ...current,
    recordAnswer,
    completeLesson,
    setDailyGoal,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
