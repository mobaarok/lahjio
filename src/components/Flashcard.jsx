import { useState } from "react";
import { playWord } from "../lib/speak";

const faceClass =
  "absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm backface-hidden";

export default function Flashcard({ word, flipped, onFlip }) {
  const [noVoice, setNoVoice] = useState(false);

  async function handlePlay() {
    const played = await playWord(word);
    setNoVoice(!played);
  }

  return (
    <div>
      <div className="relative mx-auto h-72 max-w-md perspective-distant">
        <button
          type="button"
          onClick={onFlip}
          aria-label="কার্ড উল্টাও"
          className={`relative h-full w-full transition-transform duration-500 transform-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front: Arabic and pronunciation */}
          <div className={faceClass} aria-hidden={flipped}>
            <p
              dir="rtl"
              lang="ar"
              className="text-5xl font-bold text-emerald-700"
            >
              {word.arabic}
            </p>
            <p className="mt-3 text-lg text-gray-600">
              {word.bn_transliteration}
            </p>
            <p className="mt-6 text-sm text-gray-500">
              অর্থ দেখতে কার্ডে চাপ দাও
            </p>
          </div>

          {/* Back: meaning and pronunciation */}
          <div className={`${faceClass} rotate-y-180`} aria-hidden={!flipped}>
            <p className="text-3xl font-bold text-gray-900">{word.bangla}</p>
            <p className="mt-3 text-lg text-gray-600">
              {word.bn_transliteration}
            </p>
          </div>
        </button>

        {/* Sits outside the flip button, so it stays on top on both sides */}
        <button
          type="button"
          onClick={handlePlay}
          aria-label="উচ্চারণ শোনো"
          className="absolute right-3 top-3 rounded-full p-2 text-xl hover:bg-emerald-50"
        >
          🔊
        </button>
      </div>

      {noVoice && (
        <p className="mt-3 text-center text-sm text-red-700">
          এই ডিভাইসে আরবি ভয়েস নেই।
        </p>
      )}
    </div>
  );
}
