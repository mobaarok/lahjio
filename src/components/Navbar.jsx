import { Link, NavLink } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../hooks/useAuth";
import { useNow } from "../hooks/useNow";
import { useProgress } from "../hooks/useProgress";
import { liveStreak } from "../lib/progress";
import { bn } from "../lib/format";
import { buttonClass } from "../lib/styles";

// Desktop links. Phones use <BottomNav> instead.
const links = [
  { to: "/", label: "হোম", end: true },
  { to: "/courses", label: "কোর্স" },
  { to: "/words", label: "শব্দ" },
  { to: "/practice", label: "প্র্যাকটিস" },
  { to: "/quiz", label: "কুইজ" },
  { to: "/progress", label: "অগ্রগতি" },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { profile } = useProgress();
  const now = useNow();
  const streak = liveStreak(profile, now);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-700">
          <img src="./icon.svg" alt="" className="size-8" />
          Lahjio
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700"
              title="টানা দিন"
            >
              <Icon name="flame" className="size-4" />
              {bn(streak)}
            </span>
            {isAdmin && (
              <NavLink to="/admin" className={linkClass} title="Admin dashboard">
                <Icon name="shield" />
              </NavLink>
            )}
            <Link
              to="/account"
              className="flex size-9 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white"
              aria-label="অ্যাকাউন্ট"
            >
              {(user.displayName || user.email || "?").charAt(0).toUpperCase()}
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className={buttonClass("ghost", "sm")}>
              লগইন
            </Link>
            <Link to="/signup" className={buttonClass("primary", "sm")}>
              শুরু করো
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
