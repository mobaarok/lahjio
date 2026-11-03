# Lahjio

A web app that teaches Saudi Arabic to Bangla-speaking expats in Saudi Arabia.
Learners study words and phrases, take lessons in courses, practise with
flashcards and quizzes, and build a daily streak. The interface is Bangla or
English; an English course for Indian learners and a Hindi interface are planned.

Live site: https://mobaarok.github.io/lahjio-beta/

## Project status (last updated 2026-11-03)

**Built and live** (`main` and `version1` both at `67cd9c1`):

- **Landing page:** premium design with a phone mockup, real-life phrases with audio, a try-it question, an FAQ and live content numbers
- **Logged-in dashboard:** streak, XP, daily goal, next lesson and word of the day
- **Words library:** search, word and phrase filter, topic filter, and card or list view
- **Courses and lessons:** lessons unlock in order. Each lesson has a learn stage, a quiz and results.
- **Practice:** flashcards in four modes (due review, new, hard, all) with spaced repetition
- **Quiz:** 10 questions of three types (read, pick the Arabic, listen). Guests can play too.
- **Progress page:** stats, daily goal setting, mastery levels, progress by topic and hardest words
- **Account:** edit name, language, feedback, logout and account deletion
- **Auth:** email and Google login, signup, password reset, privacy page
- **Admin dashboard (`/admin`):** items (draft, published, archived; duplicate Arabic check), categories, courses and lessons (item picker and ordering), and learner feedback
- **Languages:** Bangla (default) and English, with Hindi shown as coming soon
- **PWA manifest:** the app can be added to a phone home screen. There is no offline service worker yet.
- **Testing setup:** local Firebase emulators with seed data and test accounts

**Real Firestore content:**

- 213 published items in 12 categories: greetings, numbers, food, shopping, daily, plus (since 2026-11-03) time, work, boss, papers, store, taxi, hospital
- Course 1, "সৌদি আরবি: শুরুর কোর্স" / "Saudi Arabic: Beginner Course", with 5 published lessons, one per category. It has `languages: ["bn"]`, so English learners see "coming soon" until the owner ticks "English learners" in Admin > Courses
- Course 2, `everyday-life`, "সৌদি আরবি: দৈনন্দিন জীবন" / "Saudi Arabic: Everyday Life", with 12 published lessons (171 items from `content-packs/everyday-life.json`), for Bangla and English learners. Not yet reviewed by a native speaker.
- Two admin accounts, including the owner's `mobarokhrsa@gmail.com`. Admins are added by hand in the Firebase Console.

**Known gaps:**

- Native speakers haven't reviewed the words yet, and there are no native audio recordings (Web Speech reads every word)
- Audio is entered as a path or link in the admin form. There is no upload yet (Phase 2).
- No payments, no Android app, no analytics
- The main JavaScript bundle is about 330 KB; Firebase is the largest part

## What to do next

Agreed roadmap, in order. Ask the owner which step to start; they decide each session.

1. **Content:** add about 150 to 200 everyday items (work, shop, taxi, hospital, boss) in 10 to 15 lessons, as drafts for the owner to review. Tick "English learners" on courses that have English fields.
2. **Phase 2, audio upload:** upload recordings from the admin item form. First check if Firebase Storage needs the paid (Blaze) plan; if the owner won't add a card, compare a free host like Cloudinary.
3. **Lessons:** add short dialogues and sentence practice to lessons (the `dialogue` field is planned on lessons).
4. **Phase 5, real-user test:** give the app to 10 to 20 Bangladeshi expats in Riyadh for 2 to 4 weeks. Read feedback in Admin > Feedback, and add simple analytics.
5. **Hindi and the English course:** follow the steps in `src/i18n/locales.js`, and add Hindi fields to items.
6. **Phase 6, business:** free and paid tiers. Payments must update `users.plan` from a secure server (Cloud Functions), never the browser, and paid content needs its own protected documents. Later, a React Native app reusing the same Firebase data.

## Stack

- React 19 + Vite 8, plain JavaScript (no TypeScript)
- Tailwind CSS v4 through `@tailwindcss/vite`; theme fonts and the `full-bleed` utility live in `src/index.css`
- React Router 7 with `HashRouter` (GitHub Pages can't serve deep links on refresh)
- Firebase 9 modular SDK: Auth (email/password and Google) and Firestore
- Deployed to GitHub Pages with `npm run deploy` (builds, then pushes `dist` to the `gh-pages` branch)

## Commands

- `npm run dev`: dev server on http://localhost:5173, using the **real** Firebase project
- `npm run build`, `npx eslint src`
- `npm run check:i18n`: every text key used in the code exists in every language file
- `npm run deploy`: publishes the current local code to the live site

### Testing logged-in pages safely (local emulators)

Fake Firebase on this computer, so tests never touch real users or data:

1. `npm run emulators` (run it in the background): starts the emulators with the Java 21 and firebase-tools kept in `tools/` (not in git; see `scripts/emulators.mjs`). Android Studio's Java (`C:\Program Files\Android\Android Studio\jbr`) is the backup. Don't download them again; if `tools/` is missing, ask the owner first.
2. `npm run seed:emulators`: loads `scripts/seed-data.json` (5 categories, 42 items) and creates the test accounts listed in `scripts/seed-emulators.mjs`
3. `npm run dev:emulators`: the app with `.env.emulators` (project `demo-lahjio`). `.claude/launch.json` has it as `lahjio-emulators` on port 5180.

The admin test account can open `/admin`. Emulator data disappears when the emulators stop.

### Content packs

New content is written as a JSON file in `content-packs/` (categories, items, and one course with lessons). The owner loads it in **Admin > Import**, which adds everything as drafts and skips what already exists (same id or same Arabic). **Publish everything** on a course page publishes the course, its draft lessons and their draft items. Logic: `src/lib/contentPack.js` and `publishCourse()` in `src/lib/admin.js`.

## How the code is organised

- `src/pages/`: one file per screen. `Landing.jsx` is the public home page and `Dashboard.jsx` is home for logged-in learners; `Home.jsx` picks between them. `src/pages/admin/` is the English-only admin area.
- `src/components/`: shared pieces. `ui.jsx` has small building blocks (Spinner, Alert, Badge, Field, ProgressBar, StatCard, PageHeader, EmptyState). `Icon.jsx` has the line icons, and `components/landing/` holds the landing page parts.
- `src/lib/`: logic without UI.
  - `content.js`: loads published content and caches it on the device by `meta/content.version`
  - `admin.js`: admin writes; every write bumps the content version
  - `progress.js`: spaced repetition (boxes 0-5), XP, streaks, daily goal
  - `courses.js`: lesson unlock order and `coursesForLocale()`
  - `quiz.js`: builds quiz questions
  - `speak.js`: plays an item's audio file, falling back to Web Speech (ar-SA)
  - `account.js`: feedback and account deletion
  - `styles.js`: shared Tailwind class strings (`buttonClass`, `inputClass`, `cardClass`, `chipClass`)
  - `format.js`: `dayKey`, `shuffled`, `normalizeArabic`, `byOrder`
  - `constants.js`: admin labels for item types, levels, statuses and course types
- `src/hooks/`:
  - `useAuth`: user and isAdmin
  - `useProgress`: learner progress and the functions that save it
  - `useContent`: published content
  - `useLocale`: language and translation helpers
  - `useNow`: the current time, safe to use while rendering
- `src/context/`: the providers behind `useAuth`, `useProgress` and `useLocale`. Context objects live in the hook files, so provider files only export components (a React Fast Refresh lint rule).
- `src/i18n/`: `locales.js` lists the languages; `messages/bn.js` and `messages/en.js` hold all learner text.
- `scripts/`: `seed-emulators.mjs`, `seed-data.json`, `check-i18n.mjs`

## Firestore data

```
items/{itemId}               words and phrases: type, arabic, bangla, english,
                             bn_transliteration, en_transliteration, category_ids,
                             level, audio, status (draft|published|archived)
categories/{categoryId}      name_en, name_bn, order (also used as lesson topics)
courses/{courseId}           title_bn/en, description_bn/en, type, level,
                             languages, order, status, is_free, lesson_count
  lessons/{lessonId}         title_bn/en, category_id, item_ids (teaching order),
                             order, status, is_free
meta/content                 version, bumped on every content change
admins/{uid}                 exists = admin; added by hand in the Firebase Console
users/{uid}                  xp, current_streak, longest_streak, last_active_date,
                             today_key, today_count, daily_goal (never plan from the app)
  progress/{itemId}          known, box, times_correct, times_wrong, next_review_at
  lesson_progress/{lessonId} course_id, status, best_score
feedback/{id}                uid, email, message, created_at
```

Security rules are in `firestore.rules`. They are **not** deployed automatically:
paste them into Firebase Console > Firestore > Rules and publish after any change.
The published rules matched this file on 2026-11-03.

## Languages (i18n)

- The learner interface is Bangla (default) or English, chosen with the language switcher and saved in localStorage. Hindi is listed but disabled; `src/i18n/locales.js` explains how to switch it on.
- Never hard-code learner text. Add a key to both `messages/bn.js` and `messages/en.js` and use `const { t } = useLocale()`. Fill values with `t("words.found", { count })`.
- Run `npm run check:i18n` after adding text. If a key is built from a variable, such as ``t(`level.${x}`)``, add it to `dynamicKeys` in `scripts/check-i18n.mjs`.
- Show numbers with `num()`, and word meanings with `meaningOf(item)` and `pronunciationOf(item)` from `useLocale()`. English falls back to Bangla when an item has no English yet.
- Translated Firestore fields end in `_bn` / `_en`; read them with `localized(object, "title")`.
- Courses show only for the languages ticked on the course (`languages`). Use `coursesForLocale()`.
- Errors from hooks (`useContent`, `useProgress`) are message keys, shown with `t(error)`.

## Conventions

- The admin area is English only. Code and comments are English.
- Firestore fields use snake_case.
- Items 1-42 keep numeric string ids so old saved progress still matches.
- Never remove an item by deleting it: set `status: "archived"`, because progress and lessons point to items.
- Only published content reaches learners, and queries must filter `status == "published"` or the rules reject them.
- Don't call `Date.now()` or `Math.random()` while rendering (React purity lint). Use `useNow()`, or do it in event handlers.
- Keep components small and commented. The owner is learning React and wants code others can follow.
- Don't use fake reviews or made-up user numbers on the landing page.

## Working with the owner

- They build step by step and like to test each step themselves before moving on.
- Make code changes directly in the project, and explain what changed.
- Ask before pushing, deploying, or writing to the real Firestore database.
- Branches: new work goes on `main`. `version1` is the last known-good release, and the owner moves it forward when they ask.
- Never sign in to the real Firebase project with the owner's credentials. Use the local emulators for logged-in testing.
- Plan and roadmap discussions happen in chat first; the owner says when to start coding.
