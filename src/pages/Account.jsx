import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "../firebase";
import Icon from "../components/Icon";
import { Alert, Field, PageHeader } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { deleteAccount, sendFeedback } from "../lib/account";
import { getAuthErrorMessage } from "../lib/authErrors";
import { buttonClass, cardClass, inputClass } from "../lib/styles";

// Profile, feedback, logout and account deletion
export default function Account() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user.displayName ?? "");
  const [feedback, setFeedback] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState({ tone: "", text: "" });
  const [busy, setBusy] = useState("");

  // Runs one action at a time and shows its result
  async function run(action, task, successText) {
    setBusy(action);
    setMessage({ tone: "", text: "" });
    try {
      await task();
      if (successText) setMessage({ tone: "success", text: successText });
    } catch (err) {
      setMessage({ tone: "error", text: getAuthErrorMessage(err.code) });
    } finally {
      setBusy("");
    }
  }

  function handleName(e) {
    e.preventDefault();
    run("name", () => updateProfile(user, { displayName: name.trim() }), "নাম সেভ হয়েছে।");
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
      "ধন্যবাদ! তোমার মতামত আমরা পেয়েছি।"
    );
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/", { replace: true });
  }

  function handleDelete() {
    run("delete", async () => {
      await deleteAccount(user);
      navigate("/", { replace: true });
    });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="অ্যাকাউন্ট" subtitle={user.email} />

      {message.text && <Alert tone={message.tone}>{message.text}</Alert>}

      <nav className={`${cardClass} divide-y divide-slate-100`}>
        {[
          { to: "/progress", label: "আমার অগ্রগতি", icon: "chart" },
          { to: "/quiz", label: "কুইজ", icon: "quiz" },
          { to: "/privacy", label: "গোপনীয়তা নীতি", icon: "lock" },
          ...(isAdmin ? [{ to: "/admin", label: "Admin dashboard", icon: "shield" }] : []),
        ].map((link) => (
          <Link key={link.to} to={link.to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50">
            <Icon name={link.icon} className="size-5 text-emerald-700" />
            <span className="flex-1 font-medium text-slate-800">{link.label}</span>
            <Icon name="right" className="size-4 text-slate-400" />
          </Link>
        ))}
      </nav>

      <form onSubmit={handleName} className={`${cardClass} space-y-3 p-5`}>
        <Field label="তোমার নাম">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <button type="submit" disabled={busy === "name"} className={buttonClass("secondary")}>
          নাম সেভ করো
        </button>
      </form>

      <form onSubmit={handleFeedback} className={`${cardClass} space-y-3 p-5`}>
        <Field label="মতামত দাও" hint="কী ভালো লাগছে, কী কঠিন লাগছে, কোন শব্দ চাও: সব জানাও।">
          <textarea rows={4} maxLength={2000} value={feedback} onChange={(e) => setFeedback(e.target.value)} className={inputClass} />
        </Field>
        <button type="submit" disabled={busy === "feedback" || !feedback.trim()} className={buttonClass("primary")}>
          পাঠাও
        </button>
      </form>

      <button onClick={handleLogout} className={buttonClass("secondary", "lg", "w-full")}>
        <Icon name="logout" />
        লগআউট
      </button>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-800">অ্যাকাউন্ট মুছে ফেলো</h2>
        <p className="mt-1 text-sm text-red-700">
          তোমার সব অগ্রগতি, XP আর মতামত চিরতরে মুছে যাবে। এটি ফেরানো যাবে না। নিশ্চিত হলে নিচে "মুছে ফেলো" লেখো।
        </p>
        <input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          aria-label="নিশ্চিত করতে মুছে ফেলো লেখো"
          className={`${inputClass} mt-3`}
        />
        <button
          onClick={handleDelete}
          disabled={confirmText.trim() !== "মুছে ফেলো" || busy === "delete"}
          className={buttonClass("danger", "md", "mt-3")}
        >
          {busy === "delete" ? "মুছে ফেলা হচ্ছে..." : "চিরতরে মুছে ফেলো"}
        </button>
      </section>
    </div>
  );
}
