import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
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

      <Footer />

      <BottomNav />
    </div>
  );
}
