export default function WordCard({ word, listView }) {
  return (
    <article
      className={`rounded-xl border border-gray-200 bg-white shadow-sm ${
        listView ? "flex items-center justify-between gap-4 p-4" : "p-5"
      }`}
    >
      <p
        dir="rtl"
        lang="ar"
        className={`font-bold text-emerald-700 ${
          listView ? "order-last text-2xl" : "text-right text-3xl"
        }`}
      >
        {word.arabic}
      </p>
      <div className={listView ? "" : "mt-3"}>
        <p className="text-lg font-semibold text-gray-900">{word.bangla}</p>
        <p className="text-sm text-gray-600">{word.bn_transliteration}</p>
        <p className="mt-2 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
          {word.bn_category}
        </p>
      </div>
    </article>
  );
}
