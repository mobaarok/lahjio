import { useState } from "react";
import Icon from "./Icon";
import { playWord } from "../lib/speak";

const sizes = {
  sm: "size-9",
  md: "size-11",
  lg: "size-16",
};

// Plays an item's own audio file, or Web Speech when it has none.
// Turns red if this device has no Arabic voice.
export default function AudioButton({ item, size = "md", className = "" }) {
  const [noVoice, setNoVoice] = useState(false);

  async function handleClick(event) {
    event.stopPropagation(); // don't flip a flashcard underneath
    const played = await playWord(item);
    setNoVoice(!played);
  }

  const label = noVoice ? "এই ডিভাইসে আরবি ভয়েস নেই" : "উচ্চারণ শোনো";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full transition active:scale-95 ${
        sizes[size]
      } ${
        noVoice
          ? "bg-red-50 text-red-600"
          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      } ${className}`}
    >
      <Icon name="volume" className={size === "lg" ? "size-8" : "size-5"} />
    </button>
  );
}
