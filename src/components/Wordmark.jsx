// The "Lahjio" name as a logo: the j is an Arabic lam (ل) with two sound waves.
// It scales with the font size, so set the size with a text class, e.g. "text-3xl".
export default function Wordmark({ className = "" }) {
  return (
    <span
      role="img"
      aria-label="Lahjio"
      className={`inline-block whitespace-nowrap font-extrabold leading-tight text-[#0E6B4F] ${className}`}
    >
      Lah
      <svg
        viewBox="0 0 120 160"
        aria-hidden="true"
        className="mx-[0.03em] inline-block h-[0.93em] w-[0.68em] align-[-0.22em]"
      >
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M46 12 V100 C46 128 32 140 18 140 C8 140 4 134 4 128" stroke="#0E6B4F" strokeWidth="20" />
          <path d="M68 44 Q84 64 68 84" stroke="#F2A33A" strokeWidth="8" />
          <path d="M86 28 Q114 64 86 100" stroke="#F2A33A" strokeWidth="8" />
        </g>
      </svg>
      io
    </span>
  );
}
