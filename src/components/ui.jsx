// Small building blocks shared by every page
import { cardClass } from "../lib/styles";
import { useLocale } from "../hooks/useLocale";

export function Spinner({ label }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <span className="size-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
      <p className="text-sm">{label ?? t("common.loading")}</p>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const alertTones = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
};

export function Alert({ children, tone = "error" }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border p-3 text-sm ${alertTones[tone]}`}>
      {children}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className={`${cardClass} px-6 py-12 text-center`}>
      <p className="text-lg font-semibold text-slate-800">{title}</p>
      {children && <div className="mt-2 text-slate-600">{children}</div>}
    </div>
  );
}

const badgeTones = {
  slate: "bg-slate-100 text-slate-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  sky: "bg-sky-50 text-sky-700",
};

export function Badge({ children, tone = "slate" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>
      {children}
    </span>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function ProgressBar({ value, max }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className={`${cardClass} p-4`}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
