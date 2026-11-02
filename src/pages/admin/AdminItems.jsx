import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { Alert, Badge, EmptyState, Spinner } from "../../components/ui";
import { listAll } from "../../lib/admin";
import { ITEM_TYPES, STATUSES, labelOf, statusTone } from "../../lib/constants";
import { byOrder } from "../../lib/format";
import { buttonClass, cardClass, inputClass } from "../../lib/styles";

// Newest first; the first 42 imported items share a date, so sort those by id
function newestFirst(a, b) {
  const dateA = a.created_at?.toMillis?.() ?? 0;
  const dateB = b.created_at?.toMillis?.() ?? 0;
  return dateB - dateA || Number(a.id) - Number(b.id);
}

export default function AdminItems() {
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");

  useEffect(() => {
    let ignore = false;
    Promise.all([listAll("items"), listAll("categories")])
      .then(([loadedItems, loadedCategories]) => {
        if (ignore) return;
        setItems(loadedItems.sort(newestFirst));
        setCategories(loadedCategories.sort(byOrder));
      })
      .catch(() => {
        if (!ignore) setError("Couldn't load items. Check your connection and that you're an admin.");
      });
    return () => {
      ignore = true;
    };
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!items) return <Spinner label="Loading items..." />;

  const query = search.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      (type === "all" || item.type === type) &&
      (status === "all" || item.status === status) &&
      (categoryId === "all" || item.category_ids?.includes(categoryId)) &&
      [item.arabic, item.bangla, item.english, item.bn_transliteration, item.en_transliteration]
        .some((text) => (text ?? "").toLowerCase().includes(query))
  );

  const categoryName = (id) => categories.find((c) => c.id === id)?.name_en ?? id;
  const countBy = (value) => items.filter((i) => i.status === value).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {items.length} items · {countBy("published")} published · {countBy("draft")} drafts ·{" "}
          {countBy("archived")} archived
        </p>
        <Link to="/admin/items/new" className={buttonClass("primary", "md")}>
          <Icon name="plus" className="size-4" />
          New item
        </Link>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Arabic, Bangla or English"
          aria-label="Search items"
          className={`${inputClass} lg:col-span-1`}
        />
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass} aria-label="Type">
          <option value="all">All types</option>
          {ITEM_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} aria-label="Status">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClass}
          aria-label="Category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name_en}</option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState title="No items match">Try a different search or filter.</EmptyState>
      ) : (
        <ul className={`${cardClass} divide-y divide-slate-100`}>
          {visible.map((item) => (
            <li key={item.id}>
              <Link
                to={`/admin/items/${item.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.bangla}</p>
                  <p className="truncate text-sm text-slate-500">
                    {item.english || "No English yet"} · {item.bn_transliteration}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Badge tone={statusTone[item.status]}>{labelOf(STATUSES, item.status)}</Badge>
                    <Badge>{labelOf(ITEM_TYPES, item.type)}</Badge>
                    {item.category_ids?.map((id) => (
                      <Badge key={id} tone="sky">{categoryName(id)}</Badge>
                    ))}
                    {!item.audio && <Badge tone="red">No audio</Badge>}
                  </div>
                </div>
                <p lang="ar" dir="rtl" className="shrink-0 text-2xl font-semibold text-emerald-700">
                  {item.arabic}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
