import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import AuthCard from "../components/AuthCard";
import { Alert, Field } from "../components/ui";
import { getAuthErrorMessage } from "../lib/authErrors";
import { buttonClass, inputClass } from "../lib/styles";

// Firebase emails a link to choose a new password
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists for this email
      if (err.code === "auth/user-not-found") setSent(true);
      else setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="পাসওয়ার্ড রিসেট" subtitle="তোমার ইমেইলে নতুন পাসওয়ার্ড দেওয়ার লিংক পাঠানো হবে।">
      {sent ? (
        <Alert tone="success">
          এই ইমেইলে অ্যাকাউন্ট থাকলে একটি লিংক পাঠানো হয়েছে। ইনবক্স আর স্প্যাম ফোল্ডার দেখো।
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label="ইমেইল">
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </Field>
          <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "w-full")}>
            {loading ? "পাঠানো হচ্ছে..." : "লিংক পাঠাও"}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
          ← লগইনে ফিরে যাও
        </Link>
      </p>
    </AuthCard>
  );
}
