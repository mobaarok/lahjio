import { useState } from "react";
import words from "../data/words.json";
import Flashcard from "../components/Flashcard";

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

  function goTo(newIndex) {
    setIndex((newIndex + deck.length) % deck.length); // wraps at both ends
    setFlipped(false);
  }

  function handleShuffle() {
    setDeck(shuffled(deck));
    setIndex(0);
    setFlipped(false);
  }

  const word = deck[index];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">ফ্ল্যাশকার্ড</h1>
      <p className="mt-2 mb-6 text-sm text-gray-600">
        {index + 1} / {deck.length}
      </p>

      {/* The key gives each word a fresh card, so a flipped card
          doesn't spin back and show the next word's meaning */}
      <Flashcard
        key={word.id}
        word={word}
        flipped={flipped}
        onFlip={() => setFlipped(!flipped)}
      />

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
