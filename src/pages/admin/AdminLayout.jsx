import { Suspense } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { PageHeader, Spinner } from "../../components/ui";
import { chipClass } from "../../lib/styles";

// The admin area is in English, since only the team uses it
const tabs = [
  { to: "/admin", label: "Items", end: true },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/courses", label: "Courses" },
  { to: "/admin/feedback", label: "Feedback" },
];

export default function AdminLayout() {
  return (
    <div lang="en">
      <PageHeader title="Admin dashboard" subtitle="Manage what learners see in the app." />

      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => chipClass(isActive)}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Suspense fallback={<Spinner label="Loading..." />}>
        <Outlet />
      </Suspense>
    </div>
  );
}
