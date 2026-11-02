import { useEffect, useState } from "react";
import Icon from "../../components/Icon";
import { Alert, Field, Spinner } from "../../components/ui";
import { listAll, saveCategory, slugify } from "../../lib/admin";
import { byOrder } from "../../lib/format";
import { buttonClass, cardClass, inputClass } from "../../lib/styles";

// One editable category row
function CategoryRow({ category, itemCount, onSave, onMove, isFirst, isLast }) {
  const [nameEn, setNameEn] = useState(category.name_en);
  const [nameBn, setNameBn] = useState(category.name_bn);
  const changed = nameEn !== category.name_en || nameBn !== category.name_bn;

  return (
    <li className="flex flex-wrap items-center gap-2 px-4 py-3">
      <div className="flex flex-col">
        <button type="button" onClick={() => onMove(-1)} disabled={isFirst} aria-label="Move up" className="text-slate-400 hover:text-slate-800 disabled:opacity-30">
          <Icon name="up" className="size-4" />
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={isLast} aria-label="Move down" className="text-slate-400 hover:text-slate-800 disabled:opacity-30">
          <Icon name="down" className="size-4" />
        </button>
      </div>
      <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} aria-label="English name" className={`${inputClass} min-w-32 flex-1`} />
      <input value={nameBn} onChange={(e) => setNameBn(e.target.value)} aria-label="Bangla name" className={`${inputClass} min-w-32 flex-1`} />
      <span className="w-20 text-xs text-slate-500">{itemCount} items</span>
      <button
        type="button"
        disabled={!changed}
        onClick={() => onSave({ name_en: nameEn.trim(), name_bn: nameBn.trim() })}
        className={buttonClass("secondary", "sm")}
      >
        Save
      </button>
    </li>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [items, setItems] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [newEn, setNewEn] = useState("");
  const [newBn, setNewBn] = useState("");

  useEffect(() => {
    let ignore = false;
    Promise.all([listAll("categories"), listAll("items")])
      .then(([loadedCategories, loadedItems]) => {
        if (ignore) return;
        setCategories(loadedCategories.sort(byOrder));
        setItems(loadedItems);
      })
      .catch(() => {
        if (!ignore) setMessage({ tone: "error", text: "Couldn't load categories." });
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  if (!categories) return message.text ? <Alert>{message.text}</Alert> : <Spinner label="Loading categories..." />;

  // Runs a save, shows the result, then reloads the list
  async function run(task, successText) {
    try {
      await task();
      setMessage({ tone: "success", text: successText });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMessage({ tone: "error", text: err.message || "Couldn't save." });
    }
  }

  function handleAdd(event) {
    event.preventDefault();
    const id = slugify(newEn);
    if (!id || !newBn.trim()) {
      setMessage({ tone: "error", text: "Both names are required, and the English name needs letters." });
      return;
    }
    const lastOrder = categories.at(-1)?.order ?? 0;
    run(async () => {
      await saveCategory(id, { name_en: newEn.trim(), name_bn: newBn.trim(), order: lastOrder + 10 }, true);
      setNewEn("");
      setNewBn("");
    }, "Category added.");
  }

  // Swaps the order number with the neighbour above or below
  function handleMove(index, direction) {
    const a = categories[index];
    const b = categories[index + direction];
    run(async () => {
      await saveCategory(a.id, { order: b.order }, false);
      await saveCategory(b.id, { order: a.order }, false);
    }, "Order updated.");
  }

  return (
    <div className="space-y-6">
      {message.text && <Alert tone={message.tone}>{message.text}</Alert>}

      <form onSubmit={handleAdd} className={`${cardClass} grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end`}>
        <Field label="English name" hint={newEn ? `ID: ${slugify(newEn) || "(needs letters)"}` : "Also used as the ID"}>
          <input value={newEn} onChange={(e) => setNewEn(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Bangla name">
          <input value={newBn} onChange={(e) => setNewBn(e.target.value)} className={inputClass} />
        </Field>
        <button type="submit" className={`${buttonClass("primary")} sm:mb-5`}>
          Add category
        </button>
      </form>

      <ul className={`${cardClass} divide-y divide-slate-100`}>
        {categories.map((category, index) => (
          <CategoryRow
            key={`${category.id}-${reloadKey}`}
            category={category}
            itemCount={items.filter((i) => i.category_ids?.includes(category.id)).length}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
            onMove={(direction) => handleMove(index, direction)}
            onSave={(data) => run(() => saveCategory(category.id, data, false), "Category saved.")}
          />
        ))}
      </ul>
    </div>
  );
}
