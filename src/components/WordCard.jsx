import AudioButton from "./AudioButton";
import Icon from "./Icon";
import { Badge } from "./ui";
import { cardClass } from "../lib/styles";

// One word or phrase in the word list. listView shows a compact row.
export default function WordCard({ item, categoryLabel, known, listView }) {
  return (
    <article
      className={`${cardClass} transition hover:border-emerald-200 ${
        listView ? "flex items-center gap-4 p-4" : "flex flex-col p-5"
      }`}
    >
      <div className={`flex items-center gap-3 ${listView ? "order-last" : "justify-between"}`}>
        <AudioButton item={item} size="sm" />
        <p
          lang="ar"
          dir="rtl"
          className={`font-semibold text-emerald-700 ${listView ? "text-2xl" : "text-3xl"}`}
        >
          {item.arabic}
        </p>
      </div>

      <div className={listView ? "min-w-0 flex-1" : "mt-3"}>
        <p className="text-lg font-semibold text-slate-900">{item.bangla}</p>
        <p className="text-sm text-slate-500">{item.bn_transliteration}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {categoryLabel && <Badge tone="emerald">{categoryLabel}</Badge>}
          {item.type === "phrase" && <Badge tone="sky">বাক্যাংশ</Badge>}
          {known && (
            <Badge tone="amber">
              <Icon name="check" className="size-3" />
              জানি
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
}
