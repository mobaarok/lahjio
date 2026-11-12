# Lahjio

A web app that teaches Saudi Arabic to Bangla-speaking expats in Saudi Arabia.
Learners study words and phrases, take lessons in courses, practise with
flashcards and quizzes, and build a daily streak. The interface is Bangla or
English, with Hindi and Urdu interfaces that show English lesson content for now.

Live site: https://lahjio.app (custom domain on GitHub Pages; `public/CNAME` keeps it on every deploy, so never delete that file).
Code: https://github.com/mobaarok/lahjio (renamed from `lahjio-beta` on 2026-11-09; GitHub redirects the old name). The local folder is still called `lahjio-beta`.

## Project status (last updated 2026-11-09)

**Built and live** (`version1` = `main` as of 2026-11-09: 13 courses, the new Firebase project `lahjio` and the lahjio.app domain):

- **Landing page:** premium design with a phone mockup, real-life phrases with audio, a try-it question, an FAQ and live content numbers
- **Logged-in dashboard:** streak, XP, daily goal, next lesson and word of the day
- **Words library:** search, word and phrase filter, topic filter, and card or list view
- **Courses and lessons:** lessons unlock in order. Each lesson has a learn stage, a quiz and results. Cards show the Bangla/English pronunciation big and the Arabic small (reading courses swap this), play the audio automatically, and show the item's "Good to know" note.
- **Practice:** flashcards in four modes (due review, new, hard, all) with spaced repetition
- **Quiz:** 10 questions of three types (read, pick the Arabic, listen), with the pronunciation shown next to the Arabic and audio played automatically. Guests can play too.
- **Progress page:** stats, daily goal setting, mastery levels, progress by topic and hardest words
- **Account:** edit name, language, feedback and logout (account deletion was removed)
- **Auth:** email and Google login, signup, password reset, privacy and terms pages
- **Admin dashboard (`/admin`):** items (draft, published, archived; duplicate Arabic check; Bangla/English notes), categories, courses and lessons (item picker and ordering, "Publish everything"), analytics, users, learner feedback, content import, and "Start fresh" (backup, then delete all content)
- **Languages:** Bangla (default), English, Hindi and Urdu (right to left). Hindi and Urdu have their own interface text but see English lessons and meanings, with a notice saying so
- **PWA manifest:** the app can be added to a phone home screen. There is no offline service worker yet.
- **Testing setup:** local Firebase emulators with seed data and test accounts
- **Backup and restore scripts** (`npm run backup`, `npm run restore`) for moving a whole Firebase project

**Firebase project:** `lahjio` (Firestore in `nam5`), since 2026-11-09. Everything was moved from the old project `lahjio-beta` (its settings are kept in `.env.lahjio-beta`, and the old project still exists): all 979 documents and the 4 login accounts with the same user ids, so progress and admin access carried over. The one email/password account came over without its password and needs "Forgot password" once. The backup used for the move is in `backups/lahjio-beta-2026-11-09/` (not in git).

**Real Firestore content** (replaced on 2026-11-04: all old courses, items and categories were deleted with Start fresh):

- 13 published courses, all free for now (`is_free: true`) and for Bangla and English learners, in this order: Survival Arabic: 7 days, Work Arabic, Daily Life Arabic, Understanding Saudis, 8 job packs (drivers, delivery riders, construction, restaurant staff, cleaners, security, sales, optical shop), Read Arabic in 10 days
- 72 lessons and 773 unique items in Saudi (Riyadh/Jeddah) dialect, many with Bangla and English notes. Not yet reviewed by a native speaker.
- The owner's plan: Survival and Read Arabic lesson 1 stay free; the other courses become paid once payments exist (Phase 6)
- Admins are added by hand in the Firebase Console. In `lahjio` only the owner (`mobarokhrsa@gmail.com`) is an admin so far; the old project's second admin was not moved.

**Known gaps:**

- Native speakers haven't reviewed the 773 items yet
- Audio files exist for every item (2026-11-12): real recordings for Survival day 1 (`s7-d1-01` to `s7-d1-19`), ElevenLabs voices for the rest. Native speakers haven't checked the ElevenLabs pronunciation yet, and single letters in Read Arabic may be said by name instead of sound
- Audio is entered as a path or link in the admin form. There is no upload yet (Phase 2).
- No payments (every course is free)

**Audio files:** `public/audio/<itemId>.mp3` (named by item id, one flat folder), deployed with the site, so they're served at `https://lahjio.app/audio/<itemId>.mp3`. The item's `audio` field stores the relative path `audio/<itemId>.mp3` (no leading slash). The web app plays it as is; other apps add `https://lahjio.app/` in front. To replace a recording, use a new file name (for example `-v2`) so phones don't keep the cached old file.

**ElevenLabs audio (`npm run audio`):** `scripts/make-audio.mjs` makes `public/audio/<itemId>.mp3` from the content packs with ElevenLabs model `eleven_v4`: Abdulrahman (male, `KfYUTAF49N2CPU3iKuMi`) says the Arabic, a short gap (about 0.3 s, like the owner's s7-d1 recordings), then Heba Mansuri (female, `v7UCHHCrHj1KBa4E41gb`). The joined file must not keep ElevenLabs' "Info" frame: Android's player trusts it and stops after the male voice. Options: `--test`, `--ids a,b`, `--all`, `--dry`, and `--fix` (cleans existing files without calling ElevenLabs). It skips items that already have a file. It needs the owner's key in `.env.elevenlabs` (git-ignored; the owner writes it, Claude never reads it) and a paid ElevenLabs plan (library voices aren't allowed on the free API). After making files: commit, deploy, then the owner clicks **Link audio files** in Admin > Items (it checks each file on the live site, so deploy first).

**Android app:** the owner is building an Android app in a separate project that uses the same Firebase project (`lahjio`) and the same Firestore data. Keep data changes compatible with it: don't rename fields or change what a field holds without checking with the owner.
- The main JavaScript bundle is about 385 KB and the Firebase bundle about 267 KB (114 KB and 82 KB gzipped)

**Loose ends from the 2026-11-09 move** (check with the owner):

- The one email/password learner must use "Forgot password" once
- The old project's second admin is not an admin in `lahjio`; add their uid to `admins` if needed
- Delete the old Firebase project `lahjio-beta` only after a few weeks of the new one working
- Login on https://lahjio.app (domain added to Authorized domains) has not been tested by Claude; the owner should confirm it on a phone

## What to do next

Agreed roadmap, in order. Ask the owner which step to start; they decide each session.

1. **Native-speaker review:** a Saudi speaker (ideally one from Riyadh and one from Jeddah) checks the Arabic, transliterations and notes of all 773 items, starting with Survival and the slang in Understanding Saudis. Fix mistakes in `scripts/content-packs/` (to keep the local copy right) and in Admin > Items.
2. **Phase 2, audio upload:** upload recordings from the admin item form. First check if Firebase Storage needs the paid (Blaze) plan; if the owner won't add a card, compare a free host like Cloudinary.
3. **Lessons:** add short dialogues and sentence practice to lessons (the `dialogue` field is planned on lessons).
4. **Phase 5, real-user test:** give the app to 10 to 20 Bangladeshi expats in Riyadh for 2 to 4 weeks. Read feedback in Admin > Feedback and usage in Admin > Analytics.
5. **Hindi and Urdu lessons:** the interfaces exist; add Hindi/Urdu fields to items and follow the steps in `src/i18n/locales.js`.
6. **Phase 6, business:** free and paid tiers (planned: Survival and Read Arabic lesson 1 free, the rest paid; the "Free course" tick exists but isn't enforced yet). Payments must update `users.plan` from a secure server (Cloud Functions), never the browser, and paid content needs its own protected documents. Later, a React Native app reusing the same Firebase data.

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
- `npm run deploy`: publishes the current local code to the live site (https://lahjio.app)
- `npm run backup` / `npm run restore`: see "Backup and restore" below

### Testing logged-in pages safely (local emulators)

Fake Firebase on this computer, so tests never touch real users or data:

1. `npm run emulators` (run it in the background): starts the emulators with the Java 21 and firebase-tools kept in `tools/` (not in git; see `scripts/emulators.mjs`). Android Studio's Java (`C:\Program Files\Android\Android Studio\jbr`) is the backup. Don't download them again; if `tools/` is missing, ask the owner first.
2. `npm run seed:emulators`: loads `scripts/seed-data.json` (5 categories, 42 items) and creates the test accounts listed in `scripts/seed-emulators.mjs`
3. `npm run dev:emulators`: the app with `.env.emulators` (project `demo-lahjio`). `.claude/launch.json` has it as `lahjio-emulators` on port 5180.

The admin test account can open `/admin`. `npm run seed:learners` adds 8 fake learners with activity and lesson results for Admin > Analytics (import a course first). Emulator data disappears when the emulators stop.

### Analytics

- **Admin > Analytics** and **Admin > Users** read Firestore directly (`src/lib/analytics.js`): every user profile and lesson result on each load, count queries for daily activity, and all saved answers only when "Load word stats" is clicked. Fine on the free plan for a few thousand learners; after that, move the sums to a daily Cloud Function.
- `VisitTracker` saves a visit when the app opens and a heartbeat every 3 minutes while it's on screen ("online now" = seen in the last 5 minutes). Country comes from the phone's time zone (`src/lib/countries.js`), so it's a good guess, not exact.
- Google Analytics (`src/lib/googleAnalytics.js`, `PageViewTracker`) covers visitors who don't sign up. It's off until `VITE_FIREBASE_MEASUREMENT_ID` is in `.env`, and always off with the emulators. Its reports are in the Firebase Console, not the admin.

### Backup and restore

- `npm run backup` saves a whole project to `backups/<project>-<date>/` (all documents, accounts, published rules, a SCHEMA.md). It needs a service account key in `tools/service-account.json`, which only the owner can create.
- `npm run restore -- backups/<folder>` loads a backup into a new, empty project, keeping user ids. Both have `:emulators` versions for testing.
- Without a key, the 2026-11-09 move used the Firebase CLI (`auth:export` / `auth:import`) for accounts and the owner's admin session in the app for Firestore.

### Content packs

- One JSON file per course in `content-packs/` (made 2026-11-04): `survival-7-days`, `work-arabic`, `daily-life-arabic`, `understanding-saudis`, `job-*` (8 job packs) and `read-arabic`. They are the local copy of what is in Firestore.
- They are generated by the Python scripts in `scripts/content-packs/` (`build.py` holds the shared topic list and `make_pack()`; one script per course). Edit a script and run it to rebuild its JSON. Items that repeat across courses (same Arabic) are imported once and shared, so keep the same meaning for the same Arabic.
- Course type `reading` (Read Arabic) shows the Arabic big and the pronunciation small in lessons and lesson quizzes; every other course shows the pronunciation first.

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
  - `account.js`: sending feedback
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
- `src/i18n/`: `locales.js` lists the languages; `messages/bn.js`, `en.js`, `hi.js` and `ur.js` hold all learner text.
- `scripts/`: emulators (`emulators.mjs`, `seed-emulators.mjs`, `seed-data.json`, `seed-learners.mjs`, `emulators.env`), `check-i18n.mjs`, `backup-firebase.mjs`, `restore-firebase.mjs`, and `content-packs/` (the Python scripts that build the course JSON files)
- `firebase-code-note.js` (project root) is an old note with the `lahjio-beta` web config; the app reads its config from `.env`

## Firestore data

```
items/{itemId}               words and phrases: type, arabic, bangla, english,
                             bn_transliteration, en_transliteration, category_ids,
                             level, audio, status (draft|published|archived),
                             note_bn, note_en (optional tip: when to say it, or why;
                             shown as "Good to know" in lessons, word cards, flashcards)
categories/{categoryId}      name_en, name_bn, order (also used as lesson topics)
courses/{courseId}           title_bn/en, description_bn/en, type, level,
                             languages, order, status, is_free, lesson_count
  lessons/{lessonId}         title_bn/en, category_id, item_ids (teaching order),
                             order, status, is_free
meta/content                 version, bumped on every content change
admins/{uid}                 exists = admin; added by hand in the Firebase Console
users/{uid}                  xp, current_streak, longest_streak, last_active_date,
                             today_key, today_count, daily_goal (never plan from the app),
                             name, email, locale, time_zone, signed_up_at, last_seen_at
                             (written by VisitTracker on every visit, for analytics)
  progress/{itemId}          known, box, times_correct, times_wrong, next_review_at
  lesson_progress/{lessonId} course_id, status, best_score
feedback/{id}                uid, email, message, created_at
activity/{uid}_{day}         uid, day: one note per learner per day they open the app
```

Security rules are in `firestore.rules`. They are **not** deployed automatically. Publish them after any change, with the owner's OK, either in Firebase Console > Firestore > Rules or with the Firebase CLI in `tools/` (signed in as the owner):
`node tools/firebase-tools/node_modules/firebase-tools/lib/bin/firebase.js deploy --only firestore:rules --project lahjio`.
The published rules in `lahjio` match this file (2026-11-09).

## Languages (i18n)

- The learner interface is Bangla (default), English, Hindi or Urdu, chosen with the language switcher and saved in localStorage. Each language in `src/i18n/locales.js` has a `content` language: Hindi and Urdu use `"en"`, so `meaningOf`, `localized` and `coursesForLocale` show English content and courses ticked for English learners. `ContentLanguageNotice` tells them. Urdu sets `<html dir="rtl">`.
- Every key must exist in `messages/bn.js`, `en.js`, `hi.js` and `ur.js`.
- Never hard-code learner text. Add a key to all four message files (`bn`, `en`, `hi`, `ur`) and use `const { t } = useLocale()`. Fill values with `t("words.found", { count })`.
- Run `npm run check:i18n` after adding text. If a key is built from a variable, such as ``t(`level.${x}`)``, add it to `dynamicKeys` in `scripts/check-i18n.mjs`.
- Show numbers with `num()`, and word meanings with `meaningOf(item)` and `pronunciationOf(item)` from `useLocale()`. English falls back to Bangla when an item has no English yet.
- Translated Firestore fields end in `_bn` / `_en`; read them with `localized(object, "title")`.
- Courses show only for the languages ticked on the course (`languages`). Use `coursesForLocale()`.
- Errors from hooks (`useContent`, `useProgress`) are message keys, shown with `t(error)`.

## Conventions

- The admin area is English only. Code and comments are English.
- Firestore fields use snake_case.
- Item ids: the emulator seed items use numeric string ids ("1" to "42"); real content uses pack prefixes such as `s7-d1-01` or `wk-l1-01`. Never change an id, because progress and lessons point to it.
- Never remove an item by deleting it: set `status: "archived"`, because progress and lessons point to items. The one exception is **Admin > Import > Start fresh**, which downloads a JSON backup and then deletes all courses, lessons, items and categories (learners' accounts, XP, streaks and saved progress stay; pages ignore progress for items and lessons that no longer exist).
- Only published content reaches learners, and queries must filter `status == "published"` or the rules reject them.
- Don't call `Date.now()` or `Math.random()` while rendering (React purity lint). Use `useNow()`, or do it in event handlers.
- Keep components small and commented. The owner is learning React and wants code others can follow.
- Don't use fake reviews or made-up user numbers on the landing page.

## Working with the owner

- They build step by step and like to test each step themselves before moving on.
- Make code changes directly in the project, and explain what changed.
- Ask before pushing, deploying, or writing to the real Firestore database.
- Branches: new work goes on `main`. `version1` is the last known-good release (moved to match `main` on 2026-11-09), and the owner moves it forward when they ask. `gh-pages` is the published site, written only by `npm run deploy`.
- Never sign in to the real Firebase project with the owner's credentials. Use the local emulators for logged-in testing. When real data must be read or written, the owner signs in themselves (in the browser pane) and approves it.
- The Firebase CLI in `tools/` is signed in as the owner. Use it only for what the owner asks (publishing rules, `auth:export`), and never read its stored tokens.
- The browser pane can't open Google (Firebase Console) or GitHub settings pages, so the owner does Console and GitHub settings steps. `gh` (GitHub CLI) isn't installed.
- Plan and roadmap discussions happen in chat first; the owner says when to start coding.
