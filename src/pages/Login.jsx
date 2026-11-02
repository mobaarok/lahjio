import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AuthCard from "../components/AuthCard";
import GoogleButton from "../components/GoogleButton";
import { Alert, Field } from "../components/ui";
import { getAuthErrorMessage } from "../lib/authErrors";
import { buttonClass, inputClass } from "../lib/styles";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute passes the page the user wanted; go back there after login
  const redirectTo = location.state?.from ?? "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="আবার স্বাগতম!" subtitle="লগইন করে শেখা চালিয়ে যাও।">
      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <GoogleButton onError={setError} redirectTo={redirectTo} />

      <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        অথবা ইমেইল দিয়ে
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="ইমেইল">
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="পাসওয়ার্ড">
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-emerald-700 hover:underline">
            পাসওয়ার্ড ভুলে গেছো?
          </Link>
        </div>
        <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "w-full")}>
          {loading ? "লগইন হচ্ছে..." : "লগইন"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        নতুন?{" "}
        <Link to="/signup" className="font-semibold text-emerald-700 hover:underline">
          ফ্রি অ্যাকাউন্ট খোলো
        </Link>
      </p>
    </AuthCard>
  );
}
