import Icon from "../Icon";
import { useLocale } from "../../hooks/useLocale";

// A drawing of the app on a phone, made with HTML, for the landing page hero.
// It's a picture only: nothing in it can be clicked.
export default function PhoneMockup() {
  const { t, num } = useLocale();

  return (
    <div className="relative mx-auto w-64 sm:w-72" aria-hidden="true">
      {/* Floating badges around the phone */}
      <div className="absolute top-16 -left-10 z-10 hidden rounded-2xl bg-white px-3 py-2 shadow-xl motion-safe:animate-float sm:block">
        <p className="flex items-center gap-1 text-sm font-bold text-amber-600">
          <Icon name="flame" className="size-4" /> {num(7)} {t("landing.mock.days")}
        </p>
      </div>
      <div className="absolute -right-8 bottom-28 z-10 hidden rounded-2xl bg-white px-3 py-2 shadow-xl [animation-delay:1.5s] motion-safe:animate-float sm:block">
        <p className="text-sm font-bold text-emerald-600">+{num(10)} XP</p>
      </div>

      {/* Phone frame */}
      <div className="rounded-[2.75rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl shadow-emerald-900/30">
        <div className="overflow-hidden rounded-[2rem] bg-slate-50">
          <div className="flex items-center justify-between px-5 pt-4 text-xs font-semibold text-slate-500">
            <span>9:41</span>
            <span className="flex items-center gap-1 text-amber-600">
              <Icon name="flame" className="size-3.5" /> {num(7)}
            </span>
          </div>

          <div className="px-5 pt-3 pb-6">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-2 w-3/5 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-5 text-xs font-medium text-slate-500">{t("quiz.prompt.ar-bn")}</p>

            <div className="mt-3 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-center text-white">
              <p lang="ar" dir="rtl" className="text-4xl font-bold">
                كم السعر
              </p>
              <p className="mt-1 text-sm text-emerald-100">{t("landing.mock.pronunciation")}</p>
            </div>

            <div className="mt-4 space-y-2 text-sm font-medium">
              <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50 px-3 py-2.5 text-emerald-800">
                ✓ {t("landing.mock.answer")}
              </div>
              <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-slate-600">
                {t("landing.mock.option1")}
              </div>
              <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-slate-600">
                {t("landing.mock.option2")}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white">
              {t("quiz.next")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
