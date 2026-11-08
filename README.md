# Lahjio

Learn the Saudi Arabic people really speak in Riyadh and Jeddah, explained in Bangla.

Lahjio is a web app for Bangla-speaking expats working in Saudi Arabia. Learners
study words and phrases in short lessons, practise with flashcards and quizzes,
hear every word, and keep a daily streak.

- **Live site:** https://lahjio.app
- **Code:** https://github.com/mobaarok/lahjio
- **Firebase account:** mobarokhrsa@gmail.com (project `lahjio`)

## Current state (2026-11-09)

**Content:** 13 free courses, 72 lessons and 773 words and phrases in Saudi dialect,
many with short notes on when and how to say them. Not yet reviewed by a native speaker.

| Course | Lessons |
|---|---|
| Survival Arabic: 7 days | 7 |
| Work Arabic | 8 |
| Daily Life Arabic | 8 |
| Understanding Saudis | 7 |
| Job packs: drivers, delivery riders, construction, restaurant staff, cleaners, security, sales, optical shop | 4 each |
| Read Arabic in 10 days | 10 |

**For learners:** landing page, dashboard with streak, XP and daily goal, courses
with lessons that unlock in order, a words library, flashcards with spaced
repetition, quizzes, a progress page, email and Google login. The interface is
in Bangla, English, Hindi or Urdu (Hindi and Urdu show English lesson content for now).
Every word is spoken with the phone's Arabic voice, and the app can be added to a
phone's home screen.

**For the admin (`/admin`):** edit words, topics, courses and lessons, import content
packs, publish a whole course at once, see learner analytics, users and feedback.

**Not done yet:** native-speaker review, real audio recordings, dialogues in lessons,
paid courses and an Android app. The full roadmap is in [CLAUDE.md](CLAUDE.md).

## Built with

React 19, Vite 8, Tailwind CSS 4, React Router 7 and Firebase (Auth and Firestore).
Hosted on GitHub Pages with the custom domain `lahjio.app`.

## Run it on your computer

```bash
npm install
npm run dev
```

The app opens at http://localhost:5173 and uses the **real** Firebase project (settings in `.env`).

To test without touching real data, use the local Firebase emulators (they need
the Java and firebase-tools kept in `tools/`, which is not in git):

```bash
npm run emulators          # keep this running
npm run seed:emulators     # sample words and test accounts
npm run dev:emulators      # the app on http://localhost:5180
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run build` | Builds the site into `dist/` |
| `npx eslint src` | Checks the code |
| `npm run check:i18n` | Checks every text exists in all four languages |
| `npm run deploy` | Builds and publishes the site to https://lahjio.app |
| `npm run backup` | Saves the whole Firebase project to `backups/` (needs a service account key) |
| `npm run restore -- backups/<folder>` | Loads a backup into a new, empty Firebase project |

## Adding content

Each course is a JSON file in `content-packs/`, built by the Python scripts in
`scripts/content-packs/`. Load a file in **Admin > Import**, then click
**Publish everything** on the course page.

## Folders

- `src/pages/`: one file per screen (`src/pages/admin/` is the admin area)
- `src/components/`: shared pieces of the interface
- `src/lib/`: logic without interface (content loading, progress, quiz, admin writes)
- `src/i18n/`: the four interface languages
- `content-packs/`: the course content as JSON
- `scripts/`: emulators, backup and restore, content pack builders, checks
- `firestore.rules`: database security rules (published by hand, see CLAUDE.md)

More detail for developers, including the database structure and rules, is in [CLAUDE.md](CLAUDE.md).
