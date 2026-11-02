import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import { Spinner } from "./ui";

// Page frame: top bar, the current page, footer, and a tab bar on phones
export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      {/* Extra bottom padding on phones so the tab bar never covers content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:pb-12">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="hidden border-t border-slate-200 bg-white md:block">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-slate-500">
          <p>© Lahjio · বাংলায় আরবি শেখো</p>
          <Link to="/privacy" className="hover:text-slate-800">
            গোপনীয়তা নীতি
          </Link>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
