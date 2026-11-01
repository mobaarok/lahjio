import { useState } from "react";
import { playWord } from "../lib/speak";

export default function WordCard({ word, listView }) {
  const [noVoice, setNoVoice] = useState(false);

  async function handlePlay() {
    const played = await playWord(word);
    setNoVoice(!played);
  }

  return (
    <article
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${
        listView ? "flex items-center justify-between gap-4 p-4" : "p-5"
      }`}
    >
      <div
        className={`flex items-center gap-3 ${
          listView ? "order-last" : "justify-between"
        }`}
      >
        <button
          onClick={handlePlay}
          aria-label={`${word.bangla} শব্দের উচ্চারণ শোনো`}
          className="shrink-0 rounded-full p-2 text-xl hover:bg-emerald-50"
        >
          🔊
        </button>
        <p
          dir="rtl"
          lang="ar"
          className={`font-bold text-emerald-700 ${
            listView ? "text-2xl" : "text-right text-3xl"
          }`}
        >
          {word.arabic}
        </p>
      </div>
      <div className={listView ? "" : "mt-3"}>
        <p className="text-lg font-semibold text-gray-900">{word.bangla}</p>
        <p className="text-sm text-gray-600">{word.bn_transliteration}</p>
        <p className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          {word.bn_category}
        </p>
        {noVoice && (
          <p className="mt-2 text-sm text-red-700">
            এই ডিভাইসে আরবি ভয়েস নেই।
          </p>
        )}
      </div>
    </article>
  );
}
