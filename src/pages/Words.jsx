import { useState } from "react";
import Icon from "../components/Icon";
import WordCard from "../components/WordCard";
import { Alert, EmptyState, PageHeader, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { useProgress } from "../hooks/useProgress";
import { chipClass, inputClass } from "../lib/styles";

const typeFilters = ["all", "word", "phrase"];

// The public word and phrase library, with search and filters
export default function Words() {
  const { content, loading, error } = useContent();
  const { user } = useAuth();
  const { progress } = useProgress();
  const { t, num, localized } = useLocale();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [listView, setListView] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <Alert>{t(error)}</Alert>;

  const categoryName = Object.fromEntries(content.categories.map((c) => [c.id, localized(c, "name")]));
  const query = search.trim().toLowerCase();

  const visible = content.items.filter(
    (item) =>
      (type === "all" || item.type === type) &&
      (categoryId === "all" || item.category_ids?.includes(categoryId)) &&
      [item.arabic, item.bangla, item.english, item.bn_transliteration, item.en_transliteration].some((text) =>
        (text ?? "").toLowerCase().includes(query)
      )
  );

  return (
    <div>
      <PageHeader title={t("words.title")} subtitle={t("words.subtitle")} />

      <div className="relative">
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder={t("words.search")}
          aria-label={t("words.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputClass} pl-10`}
        />
      </div>

      {/* Scrolls sideways on small phones instead of wrapping into many rows */}
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {typeFilters.map((value) => (
          <button key={value} onClick={() => setType(value)} aria-pressed={type === value} className={chipClass(type === value)}>
            {t(`type.${value}`)}
          </button>
        ))}
        <span className="mx-1 w-px shrink-0 bg-slate-200" />
        <button onClick={() => setCategoryId("all")} aria-pressed={categoryId === "all"} className={chipClass(categoryId === "all")}>
          {t("filter.allTopics")}
        </button>
        {content.categories.map((c) => (
          <button key={c.id} onClick={() => setCategoryId(c.id)} aria-pressed={categoryId === c.id} className={chipClass(categoryId === c.id)}>
            {localized(c, "name")}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">{t("words.found", { count: num(visible.length) })}</p>
        <div className="flex rounded-xl border border-slate-200 bg-white p-1">
          {[
            { value: false, key: "words.cards" },
            { value: true, key: "words.list" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setListView(option.value)}
              aria-pressed={listView === option.value}
              className={`rounded-lg px-3 py-1 text-sm font-medium ${
                listView === option.value ? "bg-emerald-600 text-white" : "text-slate-600"
              }`}
            >
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-4">
          <EmptyState title={t("words.noneTitle")}>{t("words.noneText")}</EmptyState>
        </div>
      ) : (
        <div className={`mt-4 grid gap-3 ${listView ? "" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {visible.map((item) => (
            <WordCard
              key={item.id}
              item={item}
              categoryLabel={categoryName[item.category_ids?.[0]]}
              known={Boolean(user) && progress[item.id]?.known}
              listView={listView}
            />
          ))}
        </div>
      )}
    </div>
  );
}
