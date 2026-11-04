import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import AudioButton from "../components/AudioButton";
import Icon from "../components/Icon";
import QuizRunner from "../components/QuizRunner";
import ResultScreen from "../components/ResultScreen";
import { Alert, EmptyState, ProgressBar, Spinner } from "../components/ui";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useProgress } from "../hooks/useProgress";
import { lessonStates } from "../lib/courses";
import { XP_CORRECT, XP_LESSON, XP_WRONG } from "../lib/progress";
import { makeQuestions } from "../lib/quiz";
import { buttonClass, cardClass } from "../lib/styles";

// A lesson has three stages: learn each item, take a short quiz, see results.
// App.jsx gives this page a new key per lesson, so its state starts fresh.
export default function Lesson() {
  const { courseId, lessonId } = useParams();
  const { content, loading, error } = useContent();
  const progressState = useProgress();
  const { lessonProgress, recordAnswer, completeLesson } = progressState;
  const { t, num, meaningOf, pronunciationOf, noteOf, localized } = useLocale();

  const [stage, setStage] = useState("learn"); // "learn" | "quiz" | "done"
  const [cardIndex, setCardIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);

  if (loading || progressState.loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const course = content.courses.find((c) => c.id === courseId);
  const lessonIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course?.lessons[lessonIndex];

  if (!lesson) {
    return (
      <EmptyState title={t("lesson.notFound")}>
        <Link to="/courses" className="font-semibold text-emerald-700">{t("course.allCourses")}</Link>
      </EmptyState>
    );
  }

  const backLink = `/courses/${course.id}`;
  const state = lessonStates(course, lessonProgress)[lessonIndex];
  if (!state.unlocked) {
    return (
      <EmptyState title={t("lesson.lockedTitle")}>
        {t("lesson.lockedText")}{" "}
        <Link to={backLink} className="font-semibold text-emerald-700">{t("lesson.backToCourse")}</Link>
      </EmptyState>
    );
  }

  // Only published items reach learners; skip any that were archived
  const itemById = Object.fromEntries(content.items.map((i) => [i.id, i]));
  const items = (lesson.item_ids ?? []).map((id) => itemById[id]).filter(Boolean);
  const next = course.lessons[lessonIndex + 1];

  if (items.length === 0) {
    return <EmptyState title={t("lesson.emptyTitle")}>{t("lesson.emptyText")}</EmptyState>;
  }

  function startQuiz() {
    setQuestions(makeQuestions(items, content.items, Math.min(items.length, 10)));
    setStage("quiz");
  }

  function finishQuiz(finalScore) {
    setScore(finalScore);
    completeLesson(course.id, lesson.id, Math.round((finalScore / questions.length) * 100));
    setStage("done");
  }

  function restart() {
    setCardIndex(0);
    setStage("learn");
  }

  if (stage === "done") {
    const wrong = questions.length - score;
    return (
      <ResultScreen
        title={t("lesson.done")}
        score={score}
        total={questions.length}
        xp={XP_LESSON + score * XP_CORRECT + wrong * XP_WRONG}
      >
        {next && (
          <Link to={`/courses/${course.id}/lessons/${next.id}`} className={buttonClass("primary", "lg")}>
            {t("dashboard.nextLesson", { title: localized(next, "title") })}
          </Link>
        )}
        <button onClick={restart} className={buttonClass("secondary", "lg")}>
          {t("lesson.again")}
        </button>
        <Link to={backLink} className={buttonClass("ghost", "lg")}>
          {t("lesson.backToCourse")}
        </Link>
      </ResultScreen>
    );
  }

  if (stage === "quiz") {
    return <QuizRunner questions={questions} onAnswer={recordAnswer} onFinish={finishQuiz} />;
  }

  // Learn stage: one item at a time
  const item = items[cardIndex];
  const isLast = cardIndex === items.length - 1;

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-5 flex items-center gap-3">
        <Link to={backLink} aria-label={t("lesson.backToCourse")} className="text-slate-500 hover:text-slate-800">
          <Icon name="x" />
        </Link>
        <ProgressBar value={cardIndex + 1} max={items.length} />
        <span className="shrink-0 text-sm text-slate-500">
          {num(cardIndex + 1)}/{num(items.length)}
        </span>
      </div>

      <p className="mb-2 text-sm font-medium text-emerald-700">{localized(lesson, "title")} · {t("lesson.learn")}</p>

      <div className={`${cardClass} p-8 text-center`}>
        <p lang="ar" dir="rtl" className="text-5xl font-bold text-emerald-700">{item.arabic}</p>
        <p className="mt-3 text-lg text-slate-500">{pronunciationOf(item)}</p>
        <div className="my-6 flex justify-center">
          <AudioButton key={item.id} item={item} size="lg" />
        </div>
        <p className="text-2xl font-bold text-slate-900">{meaningOf(item)}</p>
      </div>

      {/* Optional tip from the item: when to say it, or why */}
      {noteOf(item) && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-start">
          <p className="text-sm font-semibold text-amber-800">💡 {t("lesson.note")}</p>
          <p className="mt-1 text-slate-700">{noteOf(item)}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => setCardIndex(cardIndex - 1)}
          disabled={cardIndex === 0}
          className={buttonClass("secondary", "lg")}
        >
          {t("lesson.previous")}
        </button>
        {isLast ? (
          <button onClick={startQuiz} className={buttonClass("primary", "lg")}>
            {t("lesson.startQuiz")}
          </button>
        ) : (
          <button onClick={() => setCardIndex(cardIndex + 1)} className={buttonClass("primary", "lg")}>
            {t("lesson.next")}
          </button>
        )}
      </div>
    </div>
  );
}
