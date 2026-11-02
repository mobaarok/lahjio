import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import AuthCard from "../components/AuthCard";
import GoogleButton from "../components/GoogleButton";
import { Alert, Field } from "../components/ui";
import { getAuthErrorMessage } from "../lib/authErrors";
import { buttonClass, inputClass } from "../lib/styles";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("দুটি পাসওয়ার্ড মেলেনি।");
      return;
    }

    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // The name shows on the home page greeting
      if (name.trim()) await updateProfile(user, { displayName: name.trim() });
      navigate("/", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="ফ্রি অ্যাকাউন্ট খোলো" subtitle="অগ্রগতি সেভ হবে, যেকোনো ডিভাইস থেকে চালিয়ে যেতে পারবে।">
      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <GoogleButton onError={setError} />

      <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        অথবা ইমেইল দিয়ে
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="তোমার নাম">
          <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="ইমেইল">
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </Field>
        <Field label="পাসওয়ার্ড" hint="কমপক্ষে ৬ অক্ষর">
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
        </Field>
        <Field label="আবার পাসওয়ার্ড">
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={inputClass} />
        </Field>
        <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "w-full")}>
          {loading ? "অ্যাকাউন্ট খোলা হচ্ছে..." : "অ্যাকাউন্ট খোলো"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        অ্যাকাউন্ট খুললে তুমি আমাদের{" "}
        <Link to="/privacy" className="underline">গোপনীয়তা নীতি</Link> মেনে নিচ্ছো।
      </p>
      <p className="mt-4 text-center text-sm text-slate-600">
        আগেই অ্যাকাউন্ট আছে?{" "}
        <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
          লগইন করো
        </Link>
      </p>
    </AuthCard>
  );
}
