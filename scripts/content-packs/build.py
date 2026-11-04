# Shared builder for content packs. Each course script (work.py, daily.py,
# saudis.py, jobs.py, read.py) calls make_pack(), which writes one JSON file
# to content-packs/. Run from this folder, e.g.:  python work.py
# Row: (type, arabic, bangla, bn_tr, english, en_tr[, note_bn, note_en])
import json, os

W, P = "word", "phrase"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "content-packs")

# Every topic used by any course. A pack only carries the ones it uses;
# the import skips categories that already exist.
CATEGORIES = {c[0]: c for c in [
    ("greetings", "Greetings", "সালাম ও পরিচয়", 10),
    ("polite", "Yes, no and thanks", "হ্যাঁ, না ও ধন্যবাদ", 20),
    ("understand", "Understanding", "বোঝা ও জিজ্ঞেস করা", 30),
    ("numbers", "Numbers", "সংখ্যা", 40),
    ("money", "Prices and money", "দাম ও টাকা", 50),
    ("directions", "Directions", "পথ ও দিক", 60),
    ("boss", "Boss and instructions", "বস ও নির্দেশ", 70),
    ("customers", "Customers", "কাস্টমার", 80),
    ("time", "Time and waiting", "সময় ও অপেক্ষা", 90),
    ("problems", "Problems and complaints", "সমস্যা ও অভিযোগ", 100),
    ("transport", "Taxi and delivery", "ট্যাক্সি ও ডেলিভারি", 110),
    ("shopping", "Shopping and market", "বাজার ও কেনাকাটা", 120),
    ("food", "Restaurant and food", "রেস্টুরেন্ট ও খাবার", 130),
    ("health", "Pharmacy and clinic", "ফার্মেসি ও ক্লিনিক", 140),
    ("phone-bank", "Phone, bank and transfers", "ফোন, ব্যাংক ও টাকা পাঠানো", 150),
    ("slang", "Slang and fast speech", "সৌদি স্ল্যাং ও দ্রুত কথা", 160),
    ("papers", "Salary, leave and iqama", "বেতন, ছুটি ও ইকামা", 170),
    ("driving", "Driving", "গাড়ি চালানো", 180),
    ("construction", "Construction", "নির্মাণ কাজ", 190),
    ("cleaning", "Cleaning", "পরিষ্কারের কাজ", 200),
    ("security", "Security", "সিকিউরিটি", 210),
    ("sales", "Sales", "বিক্রি ও সেলস", 220),
    ("optical", "Optical shop", "চশমার দোকান", 225),
    ("letters", "Arabic letters", "আরবি অক্ষর", 230),
    ("signs", "Signs and menus", "সাইন ও মেনু", 240),
]}


def make_pack(file_name, course, lessons, prefix, free_lessons=None):
    """course: dict without lessons. lessons: [(category, lesson_id, title_bn, title_en, rows)].
    free_lessons: lesson numbers (1-based) that stay free when the course is paid."""
    items, lesson_docs, seen, used_cats = [], [], set(), []
    for number, (cat, lesson_id, title_bn, title_en, rows) in enumerate(lessons, start=1):
        if cat not in used_cats:
            used_cats.append(cat)
        ids = []
        for n, row in enumerate(rows, start=1):
            typ, ar, bn, bn_tr, en, en_tr = row[:6]
            note_bn, note_en = (row[6], row[7]) if len(row) > 6 else ("", "")
            assert ar not in seen, f"duplicate in {file_name}: {ar}"
            assert len(row) in (6, 8), f"bad row in {file_name}: {row}"
            seen.add(ar)
            item_id = f"{prefix}-l{number}-{n:02d}"
            item = {"id": item_id, "type": typ, "arabic": ar, "bangla": bn, "english": en,
                    "bn_transliteration": bn_tr, "en_transliteration": en_tr, "category_ids": [cat]}
            if note_bn:
                item["note_bn"] = note_bn
            if note_en:
                item["note_en"] = note_en
            items.append(item)
            ids.append(item_id)
        is_free = course["is_free"] or number in (free_lessons or [])
        lesson_docs.append({"id": lesson_id, "title_bn": title_bn, "title_en": title_en,
                            "category_id": cat, "item_ids": ids, "order": number * 10,
                            "is_free": is_free})

    categories = [{"id": c, "name_en": CATEGORIES[c][1], "name_bn": CATEGORIES[c][2],
                   "order": CATEGORIES[c][3]} for c in used_cats]
    pack = {"name": course["title_en"], "categories": categories, "items": items,
            "course": {**course, "level": course.get("level", "beginner"),
                       "languages": ["bn", "en"], "lessons": lesson_docs}}
    path = os.path.join(OUT, file_name)
    with open(path, "w", encoding="utf8", newline="\n") as f:
        json.dump(pack, f, ensure_ascii=False, indent=2)
        f.write("\n")
    notes = sum(1 for i in items if "note_bn" in i)
    print(f"{file_name}: {len(lesson_docs)} lessons, {len(items)} items, {notes} with notes")
