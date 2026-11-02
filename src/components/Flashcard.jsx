import AudioButton from "./AudioButton";
import { useLocale } from "../hooks/useLocale";

const faceClass =
  "absolute inset-0 flex flex-col items-center justify-center rounded-3xl p-6 shadow-lg backface-hidden";

// A card that flips in 3D: Arabic on the front, the meaning on the back.
// The parent decides whether it is flipped.
export default function Flashcard({ word, flipped, onFlip }) {
  const { t, meaningOf, pronunciationOf } = useLocale();

  return (
    <div className="relative mx-auto h-80 w-full max-w-md perspective-distant">
      <button
        type="button"
        onClick={onFlip}
        aria-label={t("flashcard.flip")}
        className={`relative h-full w-full transition-transform duration-500 transform-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front: Arabic and pronunciation */}
        <div className={`${faceClass} bg-gradient-to-br from-emerald-600 to-teal-700 text-white`} aria-hidden={flipped}>
          <p lang="ar" dir="rtl" className="text-5xl font-bold">
            {word.arabic}
          </p>
          <p className="mt-3 text-lg text-emerald-50">{pronunciationOf(word)}</p>
          <p className="mt-8 text-sm text-emerald-100">{t("flashcard.tapHint")}</p>
        </div>

        {/* Back: meaning and pronunciation */}
        <div className={`${faceClass} rotate-y-180 border border-slate-200 bg-white`} aria-hidden={!flipped}>
          <p className="text-3xl font-bold text-slate-900">{meaningOf(word)}</p>
          <p className="mt-3 text-lg text-slate-600">{pronunciationOf(word)}</p>
        </div>
      </button>

      {/* Outside the flip button, so it stays on top on both sides */}
      <AudioButton item={word} className="absolute top-4 right-4 bg-white/90" />
    </div>
  );
}
