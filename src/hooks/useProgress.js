import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

// Saved at users/{uid}/progress/{wordId}. Only use this on logged-in pages.
export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState({}); // { wordId: true or false }
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false; // skip the result if the page closed while loading

    getDocs(collection(db, "users", user.uid, "progress"))
      .then((snapshot) => {
        if (ignore) return;
        const saved = {};
        snapshot.forEach((d) => {
          saved[d.id] = d.data().known;
        });
        setProgress(saved);
      })
      .catch(() => {
        if (!ignore) setError("আগের অগ্রগতি লোড করা যায়নি।");
      });

    return () => {
      ignore = true;
    };
  }, [user.uid]);

  async function markWord(wordId, known) {
    setError("");
    setProgress((current) => ({ ...current, [wordId]: known }));

    try {
      await setDoc(doc(db, "users", user.uid, "progress", String(wordId)), {
        known,
        updatedAt: serverTimestamp(),
      });
    } catch {
      setError("অগ্রগতি সেভ করা যায়নি।");
    }
  }

  return { progress, error, markWord };
}
