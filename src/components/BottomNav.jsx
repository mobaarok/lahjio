import { NavLink } from "react-router-dom";
import Icon from "./Icon";

// App-style tab bar, only shown on phones
const tabs = [
  { to: "/", label: "হোম", icon: "home", end: true },
  { to: "/courses", label: "কোর্স", icon: "book" },
  { to: "/words", label: "শব্দ", icon: "list" },
  { to: "/practice", label: "প্র্যাকটিস", icon: "cards" },
  { to: "/account", label: "প্রোফাইল", icon: "user" },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
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
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
