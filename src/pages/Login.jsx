import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import AuthCard from "../components/AuthCard";
import GoogleButton from "../components/GoogleButton";
import { Alert, Field } from "../components/ui";
import { useLocale } from "../hooks/useLocale";
import { authErrorKey } from "../lib/authErrors";
import { buttonClass, inputClass } from "../lib/styles";

export default function Login() {
  const { t } = useLocale();
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
      setError(t(authErrorKey(err.code)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t("login.title")} subtitle={t("login.subtitle")}>
      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <GoogleButton onError={setError} redirectTo={redirectTo} />

      <div className="my-5 flex items-center gap-3 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t("auth.orEmail")}
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label={t("auth.email")}>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
        </Field>
        <Field label={t("auth.password")}>
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
        </Field>
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-emerald-700 hover:underline">
            {t("login.forgot")}
          </Link>
        </div>
        <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "w-full")}>
          {loading ? t("login.loading") : t("nav.login")}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        {t("login.new")}{" "}
        <Link to="/signup" className="font-semibold text-emerald-700 hover:underline">
          {t("login.signupLink")}
        </Link>
      </p>
    </AuthCard>
  );
}
