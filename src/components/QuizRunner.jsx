import { useEffect, useState } from "react";
import AudioButton from "./AudioButton";
import { ProgressBar } from "./ui";
import { bn } from "../lib/format";
import { playWord } from "../lib/speak";
import { buttonClass, cardClass } from "../lib/styles";

const prompts = {
  "ar-bn": "এর অর্থ কী?",
  "bn-ar": "আরবিতে কোনটি?",
  listen: "শুনে অর্থ বেছে নাও",
};

// Shows one multiple-choice question at a time.
// questions come from lib/quiz.js makeQuestions().
// onAnswer(itemId, correct) runs after every answer; onFinish(score) at the end.
export default function QuizRunner({ questions, onAnswer, onFinish }) {
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [score, setScore] = useState(0);

  const question = questions[index];
  const answered = selectedId !== null;

  // Listening questions play the word as soon as they appear
  useEffect(() => {
    if (question.type === "listen") playWord(question.item);
  }, [question]);

  function choose(option) {
    if (answered) return;
    const correct = option.id === question.item.id;
    setSelectedId(option.id);
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

  const showArabicOptions = question.type === "bn-ar";

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar value={index + (answered ? 1 : 0)} max={questions.length} />
        <span className="shrink-0 text-sm text-slate-500">
          {bn(index + 1)}/{bn(questions.length)}
        </span>
      </div>

      <div className={`${cardClass} p-6 text-center`}>
        <p className="text-sm font-medium text-slate-500">{prompts[question.type]}</p>

        {question.type === "ar-bn" && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <p lang="ar" dir="rtl" className="text-5xl font-bold text-emerald-700">{question.item.arabic}</p>
            <AudioButton item={question.item} size="sm" />
          </div>
        )}
        {question.type === "bn-ar" && <p className="mt-4 text-3xl font-bold text-slate-900">{question.item.bangla}</p>}
        {question.type === "listen" && (
          <div className="mt-4 flex justify-center">
            <AudioButton item={question.item} size="lg" />
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-2">
        {question.options.map((option) => (
          <button key={option.id} type="button" onClick={() => choose(option)} className={optionClass(option)}>
            {showArabicOptions ? (
              <span lang="ar" dir="rtl" className="block text-right text-2xl">{option.arabic}</span>
            ) : (
              option.bangla
            )}
          </button>
        ))}
      </div>

      {answered && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-4">
          <div>
            <p className={`font-semibold ${selectedId === question.item.id ? "text-emerald-700" : "text-red-600"}`}>
              {selectedId === question.item.id ? "সঠিক! ✓" : "ভুল হয়েছে"}
            </p>
            <p className="text-sm text-slate-600">
              <span lang="ar" dir="rtl">{question.item.arabic}</span> · {question.item.bn_transliteration} ·{" "}
              {question.item.bangla}
            </p>
          </div>
          <button type="button" onClick={next} className={buttonClass("primary")} autoFocus>
            {index + 1 >= questions.length ? "ফলাফল দেখো" : "পরের প্রশ্ন"}
          </button>
        </div>
      )}
    </div>
  );
}
