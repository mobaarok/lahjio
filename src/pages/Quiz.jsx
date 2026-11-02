import { useState } from "react";
import { Link } from "react-router-dom";
import QuizRunner from "../components/QuizRunner";
import ResultScreen from "../components/ResultScreen";
import { Alert, PageHeader, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useProgress } from "../hooks/useProgress";
import { XP_CORRECT, XP_WRONG } from "../lib/progress";
import { makeQuestions } from "../lib/quiz";
import { buttonClass, cardClass, chipClass } from "../lib/styles";

const QUESTION_COUNT = 10;

// A 10-question multiple-choice quiz, optionally on one topic.
// Anyone can play; answers are only saved for logged-in learners.
export default function Quiz() {
  const { content, loading, error } = useContent();
  const { recordAnswer } = useProgress();
  const { user } = useAuth();
  const { t, num, localized } = useLocale();

  const [categoryId, setCategoryId] = useState("all");
  const [questions, setQuestions] = useState(null); // null = start screen
  const [finalScore, setFinalScore] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const pool = content.items;
  const topicItems = pool.filter((item) => categoryId === "all" || item.category_ids?.includes(categoryId));

  function start() {
    setQuestions(makeQuestions(topicItems, pool, QUESTION_COUNT));
    setFinalScore(null);
  }

  if (questions && finalScore !== null) {
    const wrong = questions.length - finalScore;
    return (
      <ResultScreen
        title={t("quiz.done")}
        score={finalScore}
        total={questions.length}
        xp={finalScore * XP_CORRECT + wrong * XP_WRONG}
      >
        <button onClick={start} className={buttonClass("primary", "lg")}>
          {t("quiz.playAgain")}
        </button>
        <button onClick={() => setQuestions(null)} className={buttonClass("secondary", "lg")}>
          {t("quiz.otherTopic")}
        </button>
        {!user && (
          <Link to="/signup" className={buttonClass("ghost", "lg")}>
            {t("quiz.signupToSave")}
          </Link>
        )}
      </ResultScreen>
    );
  }

  if (questions) {
    return <QuizRunner questions={questions} onAnswer={recordAnswer} onFinish={setFinalScore} />;
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title={t("nav.quiz")} subtitle={t("quiz.subtitle", { count: num(QUESTION_COUNT) })} />

      <div className={`${cardClass} p-5`}>
        <p className="mb-3 font-semibold text-slate-800">{t("quiz.whichTopic")}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategoryId("all")} className={chipClass(categoryId === "all")}>
            {t("filter.allTopics")}
          </button>
          {content.categories.map((c) => (
            <button key={c.id} onClick={() => setCategoryId(c.id)} className={chipClass(categoryId === c.id)}>
              {localized(c, "name")}
            </button>
          ))}
        </div>

        <button onClick={start} disabled={topicItems.length < 2} className={buttonClass("primary", "lg", "mt-6 w-full")}>
          {t("quiz.start")}
        </button>
        {topicItems.length < 2 && <p className="mt-2 text-center text-sm text-slate-500">{t("quiz.notEnough")}</p>}
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        {t("quiz.learnFirst")}{" "}
        <Link to="/practice" className="font-semibold text-emerald-700 hover:underline">
          {t("quiz.practiceLink")}
        </Link>
      </p>
    </div>
  );
}
