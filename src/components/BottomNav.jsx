import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import { useLocale } from "../hooks/useLocale";

// App-style tab bar, only shown on phones and tablets
const tabs = [
  { to: "/", key: "nav.home", icon: "home", end: true },
  { to: "/courses", key: "nav.courses", icon: "book" },
  { to: "/words", key: "nav.words", icon: "list" },
  { to: "/practice", key: "nav.practice", icon: "cards" },
  { to: "/account", key: "nav.profile", icon: "user" },
];

export default function BottomNav() {
  const { t } = useLocale();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                isActive ? "text-emerald-700" : "text-slate-500"
              }`
            }
          >
            <Icon name={tab.icon} className="size-6" />
            {t(tab.key)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
