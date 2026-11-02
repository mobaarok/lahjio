import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import AuthCard from "../components/AuthCard";
import GoogleButton from "../components/GoogleButton";
import { Alert, Field } from "../components/ui";
import { useLocale } from "../hooks/useLocale";
import { authErrorKey } from "../lib/authErrors";
import { buttonClass, inputClass } from "../lib/styles";

export default function Signup() {
  const { t } = useLocale();
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
      setError(t("signup.mismatch"));
      return;
    }

    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // The name shows on the home page greeting
      if (name.trim()) await updateProfile(user, { displayName: name.trim() });
      navigate("/", { replace: true });
    } catch (err) {
      setError(t(authErrorKey(err.code)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t("signup.title")} subtitle={t("signup.subtitle")}>
      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <GoogleButton onError={setError} />

      <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t("auth.orEmail")}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t("account.name")}>
          <input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label={t("auth.email")}>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </Field>
        <Field label={t("auth.password")} hint={t("signup.passwordHint")}>
          <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={inputClass} />
        </Field>
        <Field label={t("signup.confirm")}>
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={inputClass} />
        </Field>
        <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "w-full")}>
          {loading ? t("signup.loading") : t("signup.button")}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-slate-500">
        {t("signup.agree")}{" "}
        <Link to="/privacy" className="underline">{t("footer.privacy")}</Link>
      </p>
      <p className="mt-4 text-center text-sm text-slate-600">
        {t("signup.haveAccount")}{" "}
        <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
          {t("nav.login")}
        </Link>
      </p>
    </AuthCard>
  );
}
