import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase calls this on page load and on every login/logout
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {/* Wait until Firebase has checked the saved session, so logged-in
          users don't see a flash of the logged-out UI */}
      {!loading && children}
    </AuthContext.Provider>
  );
}