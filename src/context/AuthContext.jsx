import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { AuthContext } from "../hooks/useAuth";

// True if the user's profile is marked deleted (see markAccountDeleted).
// If the check fails (for example no internet), let them in.
async function isDeletedAccount(uid) {
  try {
    const snapshot = await getDoc(doc(db, "users", uid));
    return snapshot.exists() && snapshot.data().is_deleted === true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // Set when a deleted account tried to sign in, so Layout can say why
  const [deletedSignIn, setDeletedSignIn] = useState(false);

  useEffect(() => {
    // Firebase calls this on page load and on every login/logout
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // A deleted account is signed out again before any page sees it.
      // signOut runs this function once more with no user, which ends loading.
      if (firebaseUser && (await isDeletedAccount(firebaseUser.uid))) {
        setDeletedSignIn(true);
        await signOut(auth);
        return;
      }

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

  const value = {
    user,
    isAdmin,
    loading,
    deletedSignIn,
    clearDeletedSignIn: () => setDeletedSignIn(false),
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Wait until Firebase has checked the saved session, so logged-in
          users don't see a flash of the logged-out UI */}
      {!loading && children}
    </AuthContext.Provider>
  );
}
