# Lahjio

A web app that teaches Saudi Arabic to Bangla-speaking expats in Saudi Arabia.
Learners study words and phrases, take lessons in courses, practise with
flashcards and quizzes, and build a daily streak. An English course for Indian
learners is planned, so content keeps English fields too.

Live site: https://mobaarok.github.io/lahjio-beta/

## Stack

- React 19 + Vite 8, plain JavaScript (no TypeScript)
- Tailwind CSS v4 through `@tailwindcss/vite`; theme fonts live in `src/index.css`
- React Router 7 with `HashRouter` (GitHub Pages can't serve deep links on refresh)
- Firebase 9 modular SDK: Auth (email/password and Google) and Firestore
- Deployed to GitHub Pages with `npm run deploy` (builds, then pushes `dist` to the `gh-pages` branch)

## Commands

- `npm run dev`: dev server on http://localhost:5173, using the real Firebase project
- `npm run build`, `npx eslint src`
- `npm run check:i18n`: every text key used in the code exists in every language file

### Testing logged-in pages safely (local emulators)

Fake Firebase on this computer, so tests never touch real users or data:

1. `npx firebase emulators:start --project demo-lahjio`: needs firebase-tools and Java 21 (the Firestore emulator is a Java program)
2. `npm run seed:emulators`: loads `scripts/seed-data.json` (5 categories, 42 items) and creates the test accounts listed in `scripts/seed-emulators.mjs`
3. `npm run dev:emulators`: the app with `.env.emulators` (project `demo-lahjio`)

The admin test account can open `/admin`. Emulator data disappears when the emulators stop.
- `npm run deploy`: publishes the current local code to the live site

## How the code is organised

- `src/pages/`: one file per screen. `src/pages/admin/` is the English-only admin area.
- `src/components/`: shared pieces. `ui.jsx` has small building blocks (Spinner, Alert, Badge, Field, ProgressBar, StatCard, PageHeader, EmptyState). `Icon.jsx` has the line icons.
- `src/lib/`: logic without UI.
  - `content.js`: loads published content and caches it on the device by `meta/content.version`
  - `admin.js`: admin writes; every write bumps the content version
  - `progress.js`: spaced repetition (boxes 0-5), XP, streaks, daily goal
  - `courses.js`: lesson unlock order; `quiz.js`: builds quiz questions
  - `speak.js`: plays an item's audio file, falling back to Web Speech (ar-SA)
  - `styles.js`: shared Tailwind class strings (`buttonClass`, `inputClass`, `cardClass`, `chipClass`)
  - `format.js`: Bangla digits (`bn`), `dayKey`, `shuffled`, `normalizeArabic`, `byOrder`
  - `constants.js`: item types, levels, statuses, course types
- `src/hooks/`: `useAuth` (user, isAdmin), `useProgress` (learner progress and save functions), `useContent` (published content), `useLocale` (language and translation helpers), `useNow` (current time for render)
- `src/i18n/`: `locales.js` lists the languages; `messages/bn.js` and `messages/en.js` hold all learner text
- `src/pages/Landing.jsx` is the public home page; `Dashboard.jsx` is home for logged-in learners; `components/landing/` has its pieces
- `src/context/`: the providers behind `useAuth` and `useProgress`. Context objects live in the hook files so provider files only export components (React Fast Refresh lint rule).

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
                             today_key, today_count, daily_goal
  progress/{itemId}          known, box, times_correct, times_wrong, next_review_at
  lesson_progress/{lessonId} course_id, status, best_score
feedback/{id}                uid, email, message, created_at
```

Security rules are in `firestore.rules`. They are **not** deployed automatically:
paste them into Firebase Console > Firestore > Rules and publish after any change.

## Languages (i18n)

- The learner interface is Bangla (default) or English, chosen with the language switcher and saved in localStorage. Hindi is listed but disabled; `src/i18n/locales.js` explains how to switch it on.
- Never hard-code learner text. Add a key to both `messages/bn.js` and `messages/en.js` and use `const { t } = useLocale()`. Fill values with `t("words.found", { count })`. Run `npm run check:i18n` after adding text, and if a key is built from a variable (``t(`level.${x}`)``), add it to `dynamicKeys` in `scripts/check-i18n.mjs`.
- Show numbers with `num()`, and word meanings with `meaningOf(item)` / `pronunciationOf(item)` from `useLocale()`. English falls back to Bangla when an item has no English yet.
- Translated Firestore fields end in `_bn` / `_en`; read them with `localized(object, "title")`.
- Courses show only for languages ticked on the course (`languages`). Use `coursesForLocale()`.
- Errors from hooks (`useContent`, `useProgress`) are message keys, shown with `t(error)`.

## Conventions

- The admin area is English only. Code and comments are English.
- Firestore fields use snake_case.
- Items 1-42 keep numeric string ids so old saved progress still matches.
- Never archive by deleting: set `status: "archived"`, because progress and lessons point to items.
- Only published content reaches learners, and queries must filter `status == "published"` or the rules reject them.
- Don't call `Date.now()` or `Math.random()` while rendering (React purity lint). Use `useNow()`, or do it in event handlers.
- Keep components small and commented. The owner is learning React and wants code others can follow.

## Working with the owner

- They build step by step and like to test each step themselves before moving on.
- Make code changes directly in the project, and explain what changed.
- Ask before pushing, deploying, or writing to the real Firestore database.
- Never sign in to the real Firebase project with the owner's credentials. Use the local emulators for logged-in testing.
