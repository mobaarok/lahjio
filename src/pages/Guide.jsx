import { Link } from "react-router-dom";
import GuideSurvey from "../components/GuideSurvey";
import Icon from "../components/Icon";
import { PageHeader } from "../components/ui";
import { useLocale } from "../hooks/useLocale";
import { cardClass } from "../lib/styles";

// The Learning guide: study tips, how to learn Saudi Arabic, how to use
// Lahjio, and a short survey about the courses learners want next.
// Open to everyone; only the survey needs a login.

// Part 1: tips that work for any language
const generalTips = [
  { key: "little", emoji: "⏱️" },
  { key: "spaced", emoji: "🔁" },
  { key: "aloud", emoji: "🗣️" },
  { key: "use", emoji: "🛒" },
  { key: "mistakes", emoji: "💪" },
];

// Part 2: tips for Saudi Arabic as a Bangla speaker
const arabicTips = [
  { key: "dialect", emoji: "🇸🇦" },
  { key: "phrases", emoji: "🧰" },
  { key: "listen", emoji: "👂" },
  { key: "known", emoji: "🤝" },
  { key: "script", emoji: "✍️" },
];

// Part 3: the app's features, each with a link to its page
const features = [
  { key: "courses", icon: "book", to: "/courses" },
  { key: "practice", icon: "cards", to: "/practice" },
  { key: "quiz", icon: "quiz", to: "/quiz" },
  { key: "words", icon: "list", to: "/words" },
  { key: "goal", icon: "flame", to: "/progress" },
  { key: "progress", icon: "chart", to: "/progress" },
];

// The suggested daily routine, in order
const routine = ["lesson", "review", "quiz", "real"];

// The four parts, used for the "jump to" buttons at the top
const parts = ["general", "arabic", "app", "survey"];

// Scrolls to a part of the page. We can't use "#id" links because the
// app's router uses the # part of the address for page names.
function jumpTo(id) {
  document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// One numbered part of the guide with a title and short intro
function GuideSection({ id, number, children }) {
  const { t, num } = useLocale();
  return (
    <section id={`guide-${id}`} className="scroll-mt-20 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
          {num(number)}
        </span>
        <div>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{t(`guide.${id}.title`)}</h2>
          <p className="mt-1 text-slate-600">{t(`guide.${id}.intro`)}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// A card with a list of tips: emoji, short title and one or two sentences
function TipList({ part, tips }) {
  const { t } = useLocale();
  return (
    <ul className={`${cardClass} divide-y divide-slate-100`}>
      {tips.map((tip) => (
        <li key={tip.key} className="flex gap-4 p-5">
          <span className="text-2xl" aria-hidden="true">{tip.emoji}</span>
          <div>
            <h3 className="font-semibold text-slate-900">{t(`guide.${part}.${tip.key}`)}</h3>
            <p className="mt-1 text-slate-600">{t(`guide.${part}.${tip.key}Text`)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

// A card for one app feature that opens its page
function FeatureCard({ feature }) {
  const { t } = useLocale();
  return (
    <Link to={feature.to} className={`${cardClass} flex gap-4 p-5 transition hover:border-emerald-300`}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon name={feature.icon} className="size-6" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold text-slate-900">{t(`guide.app.${feature.key}`)}</span>
        <span className="mt-1 block text-sm text-slate-600">{t(`guide.app.${feature.key}Text`)}</span>
        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
          {t("guide.app.open")} <Icon name="right" className="size-4 rtl:rotate-180" />
        </span>
      </span>
    </Link>
  );
}

// The suggested daily routine as numbered steps on a green card
function DailyRoutine() {
  const { t, num } = useLocale();
  return (
    <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md sm:p-6">
      <h3 className="text-lg font-bold">{t("guide.routine.title")}</h3>
      <p className="mt-1 text-sm text-emerald-100">{t("guide.routine.intro")}</p>
      <ol className="mt-4 space-y-3">
        {routine.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-emerald-800">
              {num(i + 1)}
            </span>
            <span>
              <span className="block font-semibold">{t(`guide.routine.${step}`)}</span>
              <span className="block text-sm text-emerald-100">{t(`guide.routine.${step}Text`)}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm">{t("guide.routine.weekly")}</p>
    </div>
  );
}

export default function Guide() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <div>
        <PageHeader title={t("guide.title")} subtitle={t("guide.subtitle")} />
        {/* Quick buttons to jump to each part */}
        <div className="flex flex-wrap gap-2">
          {parts.map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => jumpTo(part)}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              {t(`guide.${part}.short`)}
            </button>
          ))}
        </div>
      </div>

      <GuideSection id="general" number={1}>
        <TipList part="general" tips={generalTips} />
      </GuideSection>

      <GuideSection id="arabic" number={2}>
        <TipList part="arabic" tips={arabicTips} />
      </GuideSection>

      <GuideSection id="app" number={3}>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.key} feature={feature} />
          ))}
        </div>
        <DailyRoutine />
      </GuideSection>

      <GuideSection id="survey" number={4}>
        <GuideSurvey />
      </GuideSection>
    </div>
  );
}
