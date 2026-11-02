import { Link, NavLink } from "react-router-dom";
import Icon from "./Icon";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";
import { useNow } from "../hooks/useNow";
import { useProgress } from "../hooks/useProgress";
import { liveStreak } from "../lib/progress";
import { buttonClass } from "../lib/styles";

// Desktop links (message keys). Phones use <BottomNav> instead.
const links = [
  { to: "/", key: "nav.home", end: true },
  { to: "/courses", key: "nav.courses" },
  { to: "/words", key: "nav.words" },
  { to: "/practice", key: "nav.practice" },
  { to: "/quiz", key: "nav.quiz" },
  { to: "/progress", key: "nav.progress" },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const { user, isAdmin } = useAuth();
  const { profile } = useProgress();
  const { t, num } = useLocale();
  const now = useNow();
  const streak = liveStreak(profile, now);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
          <img src="./icon.svg" alt="" className="size-8" />
          Lahjio
        </Link>

        {user && (
          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {t(l.key)}
              </NavLink>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          {user ? (
            <>
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700"
                title={t("stats.streak")}
              >
                <Icon name="flame" className="size-4" />
                {num(streak)}
              </span>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass} title="Admin dashboard">
                  <Icon name="shield" />
                </NavLink>
              )}
              <Link
                to="/account"
                className="flex size-9 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white"
                aria-label={t("nav.account")}
              >
                {(user.displayName || user.email || "?").charAt(0).toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              {/* Hidden on phones to save space; the Profile tab leads to login there */}
              <span className="hidden sm:block">
                <Link to="/login" className={buttonClass("ghost", "sm")}>
                  {t("nav.login")}
                </Link>
              </span>
              <Link to="/signup" className={buttonClass("primary", "sm", "whitespace-nowrap")}>
                {t("nav.start")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
