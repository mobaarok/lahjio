import { Suspense } from "react";
import { Link, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import LanguageSwitcher from "./LanguageSwitcher";
import { Alert, Spinner } from "./ui";
import { useLocale } from "../hooks/useLocale";
import { useProgress } from "../hooks/useProgress";

// Page frame: top bar, the current page, footer, and a tab bar on phones
export default function Layout() {
  const { t } = useLocale();
  const { error, clearError } = useProgress();

  // overflow-x-clip lets full-bleed sections reach the screen edges without
  // adding a sideways scrollbar
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-12">
        {/* Saving progress failed (usually no internet) */}
        {error && (
          <div className="mb-4 flex items-start gap-2">
            <div className="flex-1">
              <Alert>{t(error)}</Alert>
            </div>
            <button onClick={clearError} className="p-2 text-sm text-slate-500" aria-label={t("common.close")}>
              ✕
            </button>
          </div>
        )}
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>

      {/* Extra bottom padding on phones so the tab bar never covers the footer */}
      <footer className="border-t border-slate-200 bg-white pb-24 lg:pb-0">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-800">Lahjio</p>
            <p>{t("footer.tagline")}</p>
          </div>
          <LanguageSwitcher />
          <Link to="/privacy" className="hover:text-slate-800">
            {t("footer.privacy")}
          </Link>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
}
