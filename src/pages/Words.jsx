import { useState } from "react";
import words from "../data/words.json";
import WordCard from "../components/WordCard";

const categories = [
  ...new Map(words.map((w) => [w.category_id, w.bn_category])),
];

const buttonClass = (isActive) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-600 text-white"
      : "border border-gray-300 bg-white text-slate-600 hover:bg-slate-100"
  }`;

export default function Words() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [listView, setListView] = useState(false);

  const query = search.trim().toLowerCase();

  const filteredWords = words.filter((w) => {
    const inCategory = categoryId === null || w.category_id === categoryId;
    const matchesSearch = [
      w.arabic,
      w.bangla,
      w.english,
      w.bn_transliteration,
      w.en_transliteration,
    ].some((text) => text.toLowerCase().includes(query));

    return inCategory && matchesSearch;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">শব্দ তালিকা</h1>

      <input
        type="search"
        placeholder="শব্দ খোঁজো (আরবি, বাংলা বা ইংরেজি)"
        aria-label="শব্দ খোঁজো"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded border border-gray-300 bg-white p-3"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryId(null)}
          aria-pressed={categoryId === null}
          className={buttonClass(categoryId === null)}
        >
          সব
        </button>
        {categories.map(([id, name]) => (
          <button
            key={id}
            onClick={() => setCategoryId(id)}
            aria-pressed={categoryId === id}
            className={buttonClass(categoryId === id)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-600">{filteredWords.length}টি শব্দ</p>
        <div className="flex gap-2">
          <button
            onClick={() => setListView(false)}
            aria-pressed={!listView}
            className={buttonClass(!listView)}
          >
            কার্ড
          </button>
          <button
            onClick={() => setListView(true)}
            aria-pressed={listView}
            className={buttonClass(listView)}
          >
            তালিকা
          </button>
        </div>
      </div>

      {filteredWords.length === 0 ? (
        <p className="mt-10 text-center text-gray-600">
          কোনো শব্দ পাওয়া যায়নি।
        </p>
      ) : (
        <div
          className={`mt-4 grid gap-4 ${
            listView ? "" : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {filteredWords.map((word) => (
            <WordCard key={word.id} word={word} listView={listView} />
          ))}
        </div>
      )}
    </div>
  );
}
