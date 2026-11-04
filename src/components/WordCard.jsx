import AudioButton from "./AudioButton";
import Icon from "./Icon";
import { Badge } from "./ui";
import { useLocale } from "../hooks/useLocale";
import { cardClass } from "../lib/styles";

// One word or phrase in the word list. listView shows a compact row.
export default function WordCard({ item, categoryLabel, known, listView }) {
  const { t, meaningOf, pronunciationOf, noteOf } = useLocale();

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
        <p className="text-lg font-semibold text-slate-900">{meaningOf(item)}</p>
        <p className="text-sm text-slate-500">{pronunciationOf(item)}</p>
        {/* Optional tip: hidden in the compact list view */}
        {!listView && noteOf(item) && <p className="mt-2 text-sm text-slate-600">💡 {noteOf(item)}</p>}
        <div className="mt-2 flex flex-wrap gap-1">
          {categoryLabel && <Badge tone="emerald">{categoryLabel}</Badge>}
          {item.type === "phrase" && <Badge tone="sky">{t("type.phrase")}</Badge>}
          {known && (
            <Badge tone="amber">
              <Icon name="check" className="size-3" />
              {t("words.known")}
            </Badge>
          )}
        </div>
      </div>
    </article>
  );
}
