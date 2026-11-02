import { Link } from "react-router-dom";
import AudioButton from "../components/AudioButton";
import Icon from "../components/Icon";
import PhoneMockup from "../components/landing/PhoneMockup";
import TryItDemo from "../components/landing/TryItDemo";
import { useContent } from "../hooks/useContent";
import { useLocale } from "../hooks/useLocale";
import { coursesForLocale } from "../lib/courses";
import { buttonClass, cardClass } from "../lib/styles";

// Everyday situations with a real phrase each. Visitors can play the audio.
const situations = [
  { key: "shop", emoji: "🛒", item: { id: "s1", arabic: "كم السعر", audio: null } },
  { key: "taxi", emoji: "🚕", item: { id: "s2", arabic: "وين", audio: null } },
  { key: "work", emoji: "🧰", item: { id: "s3", arabic: "أبغى", audio: null } },
  { key: "friends", emoji: "🤝", item: { id: "s4", arabic: "كيف حالك", audio: null } },
];

const steps = ["learn", "practice", "remember"];
const features = [
  { key: "words", icon: "list" },
  { key: "audio", icon: "volume" },
  { key: "review", icon: "cards" },
  { key: "habit", icon: "flame" },
];
const faqs = ["free", "letters", "dialect", "phone", "time"];

// The public home page for visitors who are not logged in
export default function Landing() {
  const { t, num, locale } = useLocale();
  const { content } = useContent();

  // Real numbers from the content, shown once it has loaded
  const stats = content && [
    { value: `${num(content.items.length)}+`, label: t("landing.stats.items") },
    {
      value: num(coursesForLocale(content.courses, locale).reduce((sum, c) => sum + c.lessons.length, 0)),
      label: t("landing.stats.lessons"),
    },
    { value: num(3), label: t("landing.stats.quizTypes") },
  ];

  return (
    <div className="-mt-6">
      {/* Hero */}
      <section className="full-bleed relative overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-slate-50">
        <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-24 size-96 rounded-full bg-amber-100/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-800 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
              {t("landing.badge")}
            </span>
            <h1 className="mt-6 text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-6xl">
              {t("landing.title1")}{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                {t("landing.titleHighlight")}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 lg:mx-0">{t("landing.subtitle")}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/signup" className={buttonClass("primary", "lg", "shadow-lg shadow-emerald-600/25")}>
                {t("landing.ctaStart")}
              </Link>
              <a href="#try" className={buttonClass("secondary", "lg")}>
                {t("landing.ctaTry")}
              </a>
            </div>

            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-slate-600 lg:justify-start">
              {["free", "minutes", "audio"].map((key) => (
                <li key={key} className="flex items-center gap-1.5">
                  <Icon name="check" className="size-4 text-emerald-600" />
                  {t(`landing.trust.${key}`)}
                </li>
              ))}
            </ul>
          </div>

          <PhoneMockup />
        </div>
      </section>

      {/* Numbers */}
      {stats && (
        <section className="mx-auto -mt-6 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
          {stats.map((s) => (
            <div key={s.label} className={`${cardClass} p-4 text-center sm:p-6`}>
              <p className="text-2xl font-extrabold text-emerald-700 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">{s.label}</p>
            </div>
          ))}
        </section>
      )}

      {/* Real situations */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-wider text-emerald-700 uppercase">{t("landing.situations.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{t("landing.situations.title")}</h2>
          <p className="mt-3 text-slate-600">{t("landing.situations.subtitle")}</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {situations.map((s) => (
            <div key={s.key} className={`${cardClass} group p-5 transition hover:-translate-y-1 hover:shadow-lg`}>
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden="true">{s.emoji}</span>
                <AudioButton item={s.item} size="sm" />
              </div>
              <p className="mt-4 font-semibold text-slate-900">{t(`landing.situations.${s.key}`)}</p>
              <p lang="ar" dir="rtl" className="mt-2 text-right text-2xl font-semibold text-emerald-700">
                {s.item.arabic}
              </p>
              <p className="text-sm text-slate-500">{t(`landing.situations.${s.key}Meaning`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Try it */}
      <section id="try" className="full-bleed scroll-mt-20 bg-gradient-to-br from-slate-900 to-emerald-950 px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("landing.try.title")}</h2>
          <p className="mt-3 text-emerald-100">{t("landing.try.subtitle")}</p>
        </div>
        <div className="mt-10">
          <TryItDemo />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-24">
        <h2 className="text-center text-3xl font-bold text-slate-900 sm:text-4xl">{t("landing.how.title")}</h2>
        <ol className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
          {steps.map((key, i) => (
            <li key={key} className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-2xl font-bold text-white shadow-lg shadow-emerald-600/25">
                {num(i + 1)}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{t(`landing.how.${key}`)}</h3>
              <p className="mt-1 text-slate-600">{t(`landing.how.${key}Text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="pb-16 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.key} className={`${cardClass} flex gap-4 p-6`}>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon name={f.icon} className="size-6" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{t(`landing.features.${f.key}`)}</h3>
                <p className="mt-1 text-slate-600">{t(`landing.features.${f.key}Text`)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl pb-16 sm:pb-24">
        <h2 className="text-center text-3xl font-bold text-slate-900">{t("landing.faq.title")}</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((key) => (
            <details key={key} className={`${cardClass} group p-5`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900">
                {t(`landing.faq.${key}Q`)}
                <Icon name="down" className="size-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-slate-600">{t(`landing.faq.${key}A`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-14 text-center text-white">
        <div className="pointer-events-none absolute -right-16 -bottom-16 size-64 rounded-full bg-white/10 blur-2xl" />
        <p lang="ar" dir="rtl" className="text-4xl font-bold text-emerald-100">
          يلا نبدأ
        </p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t("landing.final.title")}</h2>
        <p className="mt-2 text-emerald-100">{t("landing.final.subtitle")}</p>
        <Link
          to="/signup"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 font-semibold text-emerald-800 shadow-lg hover:bg-emerald-50"
        >
          {t("landing.ctaStart")}
        </Link>
      </section>
    </div>
  );
}
