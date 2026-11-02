import { createContext, useContext } from "react";

// Lives here, not in AuthContext.jsx, so that file only exports a component
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
}
