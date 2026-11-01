import { useState } from "react";
import words from "../data/words.json";
import Flashcard from "../components/Flashcard";
import { useProgress } from "../hooks/useProgress";

const buttonClass =
  "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100";

function shuffled(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Flashcards() {
  const [deck, setDeck] = useState(words);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { progress, error, markWord } = useProgress();

  function goTo(newIndex) {
    setIndex((newIndex + deck.length) % deck.length); // wraps at both ends
    setFlipped(false);
  }

  function handleShuffle() {
    setDeck(shuffled(deck));
    setIndex(0);
    setFlipped(false);
  }

  function handleMark(known) {
    markWord(word.id, known);
    goTo(index + 1);
  }

  const word = deck[index];
  const knownCount = words.filter((w) => progress[w.id] === true).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">ফ্ল্যাশকার্ড</h1>
      <p className="mt-2 mb-6 text-sm text-gray-600">
        {index + 1} / {deck.length} · জানি: {knownCount}
      </p>

      {/* The key gives each word a fresh card, so a flipped card
          doesn't spin back and show the next word's meaning */}
      <Flashcard
        key={word.id}
        word={word}
        flipped={flipped}
        onFlip={() => setFlipped(!flipped)}
      />

      {/* Hidden until the card is flipped, but keeps its space */}
      <div
        className={`mt-6 flex justify-center gap-2 ${
          flipped ? "" : "invisible"
        }`}
      >
        <button
          onClick={() => handleMark(false)}
          className="rounded-md bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          জানি না
        </button>
        <button
          onClick={() => handleMark(true)}
          className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          জানি
        </button>
      </div>

      {error && (
        <p className="mt-3 text-center text-sm text-red-700">{error}</p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button onClick={() => goTo(index - 1)} className={buttonClass}>
          আগের
        </button>
        <button onClick={handleShuffle} className={buttonClass}>
          শাফল করো
        </button>
        <button onClick={() => goTo(index + 1)} className={buttonClass}>
          পরের
        </button>
      </div>
    </div>
  );
}
