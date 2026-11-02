import { cardClass } from "../lib/styles";

// Centered card used by login, signup and password reset
export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className={`${cardClass} p-6 sm:p-8`}>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
