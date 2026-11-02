import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { AuthContext } from "../hooks/useAuth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase calls this on page load and on every login/logout
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      let admin = false;

      // A user is an admin if admins/{uid} exists in Firestore
      if (firebaseUser) {
        try {
          const snapshot = await getDoc(doc(db, "admins", firebaseUser.uid));
          admin = snapshot.exists();
        } catch {
          admin = false; // couldn't check, so treat as a normal user
        }
      }

      setUser(firebaseUser);
      setIsAdmin(admin);
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  const value = { user, isAdmin, loading };

  return (
    <AuthContext.Provider value={value}>
      {/* Wait until Firebase has checked the saved session, so logged-in
          users don't see a flash of the logged-out UI */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
