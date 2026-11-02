import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import AuthCard from "../components/AuthCard";
import { Alert, Field } from "../components/ui";
import { useLocale } from "../hooks/useLocale";
import { authErrorKey } from "../lib/authErrors";
import { buttonClass, inputClass } from "../lib/styles";

// Firebase emails a link to choose a new password
export default function ForgotPassword() {
  const { t } = useLocale();
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
      else setError(t(authErrorKey(err.code)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title={t("reset.title")} subtitle={t("reset.subtitle")}>
      {sent ? (
        <Alert tone="success">{t("reset.sent")}</Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert>{error}</Alert>}
          <Field label={t("auth.email")}>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
          </Field>
          <button type="submit" disabled={loading} className={buttonClass("primary", "lg", "w-full")}>
            {loading ? t("reset.sending") : t("reset.button")}
          </button>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
          ← {t("reset.back")}
        </Link>
      </p>
    </AuthCard>
  );
}
