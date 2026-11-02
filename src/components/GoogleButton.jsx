import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { getAuthErrorMessage } from "../lib/authErrors";
import { buttonClass } from "../lib/styles";

// "Continue with Google" for both login and signup.
// redirectTo is where to go after a successful login.
export default function GoogleButton({ onError, redirectTo = "/" }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleClick() {
    onError("");

    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      onError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={buttonClass("secondary", "lg", "w-full")}>
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
      </svg>
      {loading ? "Google খুলছে..." : "Google দিয়ে চালিয়ে যাও"}
    </button>
  );
}
