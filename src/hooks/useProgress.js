import { createContext, useContext } from "react";

// Filled by <ProgressProvider> in context/ProgressContext.jsx
export const ProgressContext = createContext(null);

// Gives any page the learner's progress and the functions that save it
export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === null) {
    throw new Error("useProgress must be used inside <ProgressProvider>");
  }
  return context;
}
