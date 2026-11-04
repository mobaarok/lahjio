import { useEffect, useState } from "react";
import AudioButton from "./AudioButton";
import { ProgressBar } from "./ui";
import { useLocale } from "../hooks/useLocale";
import { playWord } from "../lib/speak";
import { buttonClass, cardClass } from "../lib/styles";

// Shows one multiple-choice question at a time.
// questions come from lib/quiz.js makeQuestions().
// onAnswer(itemId, correct) runs after every answer; onFinish(score) at the end.
export default function QuizRunner({ questions, onAnswer, onFinish }) {
  const { t, num, meaningOf, pronunciationOf } = useLocale();
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState(0);

  const question = questions[index];
  const answered = selectedId !== null;
  const isRight = selectedId === question.item.id;

  // Listen and read questions play the word as soon as they appear.
  // "Pick the Arabic" waits until it's answered, so the sound doesn't give it away.
  useEffect(() => {
    if (question.type !== "bn-ar") playWord(question.item);
  }, [question]);

  function choose(option) {
    if (answered) return;
    const correct = option.id === question.item.id;
    setSelectedId(option.id);
    if (question.type === "bn-ar") playWord(question.item); // hear the right answer
    if (correct) setScore((s) => s + 1);
    onAnswer?.(question.item.id, correct);
  }

  function next() {
    if (index + 1 >= questions.length) {
      onFinish(score);
      return;
    }
    setIndex(index + 1);
    setSelectedId(null);
  }

  // Colours each option after an answer: green for right, red for a wrong pick
  function optionClass(option) {
    const base = "w-full rounded-2xl border-2 px-4 py-3.5 text-left text-lg font-medium transition";
    if (!answered) return `${base} border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.99]`;
    if (option.id === question.item.id) return `${base} border-emerald-500 bg-emerald-50 text-emerald-800`;
    if (option.id === selectedId) return `${base} border-red-400 bg-red-50 text-red-700`;
    return `${base} border-slate-200 bg-white opacity-60`;
  }

  // "bn-ar" questions show the meaning and ask for the Arabic
  const showArabicOptions = question.type === "bn-ar";

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar value={index + (answered ? 1 : 0)} max={questions.length} />
        <span className="shrink-0 text-sm text-slate-500">
          {num(index + 1)}/{num(questions.length)}
        </span>
      </div>

      <div className={`${cardClass} p-6 text-center`}>
        <p className="text-sm font-medium text-slate-500">{t(`quiz.prompt.${question.type}`)}</p>

        {question.type === "ar-bn" && (
          <div className="mt-4 flex flex-col items-center gap-2">
            {/* Most learners can't read Arabic yet: pronunciation big, Arabic small below */}
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-emerald-700">{pronunciationOf(question.item)}</p>
              <AudioButton item={question.item} size="sm" />
            </div>
            <p lang="ar" dir="rtl" className="text-xl text-slate-500">{question.item.arabic}</p>
          </div>
        )}
        {question.type === "bn-ar" && <p className="mt-4 text-3xl font-bold text-slate-900">{meaningOf(question.item)}</p>}
        {question.type === "listen" && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <AudioButton item={question.item} size="lg" />
            {/* The pronunciation helps when the device voice is unclear */}
            <p className="text-2xl font-bold text-emerald-700">{pronunciationOf(question.item)}</p>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {question.options.map((option) => (
          <button key={option.id} type="button" onClick={() => choose(option)} className={optionClass(option)}>
            {showArabicOptions ? (
              // Pronunciation first, the Arabic small on the other side
              <span className="flex items-center justify-between gap-3">
                <span className="text-lg font-semibold">{pronunciationOf(option)}</span>
                <span lang="ar" dir="rtl" className="text-lg text-slate-500">{option.arabic}</span>
              </span>
            ) : (
              meaningOf(option)
            )}
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-4">
          <div>
            <p className={`font-semibold ${isRight ? "text-emerald-700" : "text-red-600"}`}>
              {isRight ? t("quiz.right") : t("quiz.wrong")}
            </p>
            <p className="text-sm text-slate-600">
              <span lang="ar" dir="rtl">{question.item.arabic}</span> · {pronunciationOf(question.item)} ·{" "}
              {meaningOf(question.item)}
            </p>
          </div>
          <button type="button" onClick={next} className={buttonClass("primary")} autoFocus>
            {index + 1 >= questions.length ? t("quiz.seeResult") : t("quiz.next")}
          </button>
        </div>
      )}
    </div>
  );
}
