import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import Icon from "../components/Icon";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { Alert, Field, PageHeader } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";
import { sendFeedback } from "../lib/account";
import { authErrorKey } from "../lib/authErrors";
import { buttonClass, cardClass, inputClass } from "../lib/styles";

// Profile, language, feedback and logout
export default function Account() {
  const { user, isAdmin } = useAuth();
  const { t } = useLocale();
  const navigate = useNavigate();

  const [name, setName] = useState(user.displayName ?? "");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [busy, setBusy] = useState("");

  // Runs one action at a time and shows its result
  async function run(action, task, successKey) {
    setBusy(action);
    setMessage({ tone: "", text: "" });
    try {
      await task();
      if (successKey) setMessage({ tone: "success", text: t(successKey) });
    } catch (err) {
      setMessage({ tone: "error", text: t(authErrorKey(err.code)) });
    } finally {
      setBusy("");
    }
  }

  function handleName(e) {
    e.preventDefault();
    run("name", () => updateProfile(user, { displayName: name.trim() }), "account.nameSaved");
  }

  function handleFeedback(e) {
    e.preventDefault();
    if (!feedback.trim()) return;
    run(
      "feedback",
      async () => {
        await sendFeedback(user, feedback);
        setFeedback("");
      },
      "account.feedbackSent"
    );
  }

  // Leave this login-only page first; otherwise the logout sends us to /login
  async function handleLogout() {
    navigate("/", { replace: true });
    await signOut(auth);
  }

  const links = [
    { to: "/progress", key: "nav.progress", icon: "chart" },
    { to: "/quiz", key: "nav.quiz", icon: "quiz" },
    { to: "/privacy", key: "footer.privacy", icon: "lock" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title={t("nav.account")} subtitle={user.email} />

      {message.text && <Alert tone={message.tone}>{message.text}</Alert>}

      <nav className={`${cardClass} divide-y divide-slate-100`}>
        {links.map((link) => (
          <Link key={link.to} to={link.to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50">
            <Icon name={link.icon} className="size-5 text-emerald-700" />
            <span className="flex-1 font-medium text-slate-800">{t(link.key)}</span>
            <Icon name="right" className="size-4 text-slate-400" />
          </Link>
        ))}
        {isAdmin && (
          <Link to="/admin" className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50">
            <Icon name="shield" className="size-5 text-emerald-700" />
            <span className="flex-1 font-medium text-slate-800">Admin dashboard</span>
            <Icon name="right" className="size-4 text-slate-400" />
          </Link>
        )}
      </nav>

      <section className={`${cardClass} space-y-3 p-5`}>
        <p className="text-sm font-medium text-slate-700">{t("language.label")}</p>
        <LanguageSwitcher />
      </section>

      <form onSubmit={handleName} className={`${cardClass} space-y-3 p-5`}>
        <Field label={t("account.name")}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <button type="submit" disabled={busy === "name"} className={buttonClass("secondary")}>
          {t("account.saveName")}
        </button>
      </form>

      <form onSubmit={handleFeedback} className={`${cardClass} space-y-3 p-5`}>
        <Field label={t("account.feedback")} hint={t("account.feedbackHint")}>
          <textarea rows={4} maxLength={2000} value={feedback} onChange={(e) => setFeedback(e.target.value)} className={inputClass} />
        </Field>
        <button type="submit" disabled={busy === "feedback" || !feedback.trim()} className={buttonClass("primary")}>
          {t("account.send")}
        </button>
      </form>

      <button onClick={handleLogout} className={buttonClass("secondary", "lg", "w-full")}>
        <Icon name="logout" />
        {t("account.logout")}
      </button>
    </div>
  );
}
