import { useState } from "react";
import { Link } from "react-router-dom";
import Flashcard from "../components/Flashcard";
import Icon from "../components/Icon";
import ResultScreen from "../components/ResultScreen";
import { Alert, PageHeader, ProgressBar, Spinner } from "../components/ui";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useNow } from "../hooks/useNow";
import { useProgress } from "../hooks/useProgress";
import { shuffled } from "../lib/format";
import { isDue, XP_CORRECT, XP_WRONG } from "../lib/progress";
import { buttonClass, cardClass, chipClass } from "../lib/styles";

const SESSION_SIZE = 20; // short sessions are easier to finish

// Each mode picks which cards go into the deck
const modes = [
  { id: "due", icon: "flame" },
  { id: "new", icon: "plus" },
  { id: "hard", icon: "x" },
  { id: "all", icon: "shuffle" },
];

function itemsForMode(mode, items, progress, now) {
  if (mode === "due") {
    return items
      .filter((item) => isDue(progress[item.id], now))
      .sort((a, b) => (progress[a.id].next_review_at ?? 0) - (progress[b.id].next_review_at ?? 0));
  }
  if (mode === "new") return items.filter((item) => !progress[item.id]);
  if (mode === "hard") return items.filter((item) => progress[item.id] && !progress[item.id].known);
  return items;
}

// Flashcard practice. The deck is fixed when a session starts, so marking a
// card doesn't reshuffle the cards still to come.
export default function Practice() {
  const { content, loading, error } = useContent();
  const progressState = useProgress();
  const { progress, recordAnswer } = progressState;
  const { t, num, localized } = useLocale();
  const now = useNow();

  const [categoryId, setCategoryId] = useState("all");
  const [deck, setDeck] = useState(null); // null = choosing a mode
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState({ known: 0, unknown: 0 });

  if (loading || progressState.loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const items = content.items.filter((item) => categoryId === "all" || item.category_ids?.includes(categoryId));

  function start(mode) {
    let cards = itemsForMode(mode, items, progress, now);
    if (mode !== "due") cards = shuffled(cards);
    setDeck(cards.slice(0, SESSION_SIZE));
    setIndex(0);
    setFlipped(false);
    setResults({ known: 0, unknown: 0 });
  }

  function mark(known) {
    recordAnswer(deck[index].id, known);
    setResults((r) => ({ known: r.known + (known ? 1 : 0), unknown: r.unknown + (known ? 0 : 1) }));
    setIndex(index + 1);
    setFlipped(false);
  }

  // 1. Pick a mode
  if (!deck) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title={t("practice.title")} subtitle={t("practice.subtitle", { count: num(SESSION_SIZE) })} />

        <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
          <button onClick={() => setCategoryId("all")} className={chipClass(categoryId === "all")}>
            {t("filter.allTopics")}
          </button>
          {content.categories.map((c) => (
            <button key={c.id} onClick={() => setCategoryId(c.id)} className={chipClass(categoryId === c.id)}>
              {localized(c, "name")}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {modes.map((mode) => {
            const count = itemsForMode(mode.id, items, progress, now).length;
            return (
              <button
                key={mode.id}
                onClick={() => start(mode.id)}
                disabled={count === 0}
                className={`${cardClass} flex items-center gap-4 p-5 text-left transition hover:border-emerald-300 disabled:opacity-50`}
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon name={mode.icon} className="size-6" />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold text-slate-900">{t(`practice.mode.${mode.id}`)}</span>
                  <span className="block text-sm text-slate-500">{t(`practice.mode.${mode.id}Text`)}</span>
                </span>
                <span className="text-2xl font-bold text-emerald-700">{num(count)}</span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          {t("practice.quizPrompt")}{" "}
          <Link to="/quiz" className="font-semibold text-emerald-700 hover:underline">
            {t("practice.quizLink")}
          </Link>
        </p>
      </div>
    );
  }

  // 3. Session finished
  if (index >= deck.length) {
    return (
      <ResultScreen
        title={t("practice.done")}
        score={results.known}
        total={deck.length}
        xp={results.known * XP_CORRECT + results.unknown * XP_WRONG}
      >
        <button onClick={() => setDeck(null)} className={buttonClass("primary", "lg")}>
          {t("practice.again")}
        </button>
        <Link to="/" className={buttonClass("secondary", "lg")}>
          {t("common.goHome")}
        </Link>
      </ResultScreen>
    );
  }

  // 2. Practising
  const word = deck[index];
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-5 flex items-center gap-3">
        <button onClick={() => setDeck(null)} aria-label={t("common.close")} className="text-slate-500 hover:text-slate-800">
          <Icon name="x" />
        </button>
        <ProgressBar value={index} max={deck.length} />
        <span className="shrink-0 text-sm text-slate-500">
          {num(index + 1)}/{num(deck.length)}
        </span>
      </div>

      {/* A new key per card, so a flipped card doesn't spin back and reveal the next answer */}
      <Flashcard key={word.id} word={word} flipped={flipped} onFlip={() => setFlipped(!flipped)} />

      {flipped ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={() => mark(false)} className={buttonClass("danger", "lg")}>
            {t("practice.dontKnow")}
          </button>
          <button onClick={() => mark(true)} className={buttonClass("primary", "lg")}>
            {t("practice.know")}
          </button>
        </div>
      ) : (
        <button onClick={() => setFlipped(true)} className={buttonClass("secondary", "lg", "mt-6 w-full")}>
          {t("practice.showMeaning")}
        </button>
      )}
    </div>
  );
}
