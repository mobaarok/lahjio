import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { getAuthErrorMessage } from "../lib/authErrors";

export default function GoogleButton({ onError }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleClick() {
    onError("");

    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      navigate("/words");
    } catch (err) {
      onError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="mt-4 w-full rounded border border-gray-300 bg-white p-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      {loading ? "Opening Google..." : "Continue with Google"}
    </button>
  );
}
