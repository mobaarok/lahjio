import { useState } from "react";
import { Link } from "react-router-dom";
import QuizRunner from "../components/QuizRunner";
import ResultScreen from "../components/ResultScreen";
import { Alert, PageHeader, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useContent } from "../hooks/useContent";
import { useProgress } from "../hooks/useProgress";
import { bn } from "../lib/format";
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

  const [categoryId, setCategoryId] = useState("all");
  const [questions, setQuestions] = useState(null); // null = start screen
  const [finalScore, setFinalScore] = useState(null);

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

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
        title="কুইজ শেষ!"
        score={finalScore}
        total={questions.length}
        xp={finalScore * XP_CORRECT + wrong * XP_WRONG}
      >
        <button onClick={start} className={buttonClass("primary", "lg")}>
          আবার খেলো
        </button>
        <button onClick={() => setQuestions(null)} className={buttonClass("secondary", "lg")}>
          অন্য বিষয় বেছে নাও
        </button>
        {!user && (
          <Link to="/signup" className={buttonClass("ghost", "lg")}>
            XP আর অগ্রগতি সেভ করতে ফ্রি অ্যাকাউন্ট খোলো
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
      <PageHeader title="কুইজ" subtitle={`${bn(QUESTION_COUNT)}টি প্রশ্ন: পড়ে, দেখে আর শুনে উত্তর দাও।`} />

      <div className={`${cardClass} p-5`}>
        <p className="mb-3 font-semibold text-slate-800">কোন বিষয়ে?</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCategoryId("all")} className={chipClass(categoryId === "all")}>
            সব বিষয়
          </button>
          {content.categories.map((c) => (
            <button key={c.id} onClick={() => setCategoryId(c.id)} className={chipClass(categoryId === c.id)}>
              {c.name_bn}
            </button>
          ))}
        </div>

        <button
          onClick={start}
          disabled={topicItems.length < 2}
          className={buttonClass("primary", "lg", "mt-6 w-full")}
        >
          কুইজ শুরু করো
        </button>
        {topicItems.length < 2 && (
          <p className="mt-2 text-center text-sm text-slate-500">এই বিষয়ে এখনো যথেষ্ট শব্দ নেই।</p>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        আগে শিখে নিতে চাও?{" "}
        <Link to="/practice" className="font-semibold text-emerald-700 hover:underline">
          ফ্ল্যাশকার্ড প্র্যাকটিস
        </Link>
      </p>
    </div>
  );
}
