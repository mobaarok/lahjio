import { useEffect, useState } from "react";
import { loadContent } from "../lib/content";

// Shared by every page, so content loads once per visit
let contentPromise = null;

export function refreshContent() {
  contentPromise = null;
}

export function useContent() {
  const [state, setState] = useState({ content: null, loading: true, error: "" });

  useEffect(() => {
    let ignore = false;
    contentPromise ??= loadContent();

    contentPromise
      .then((content) => {
        if (!ignore) setState({ content, loading: false, error: "" });
      })
      .catch(() => {
        contentPromise = null; // try again next time
        if (!ignore) {
          // A message key; pages show it with t(error)
          setState({ content: null, loading: false, error: "error.contentLoad" });
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return state;
}
