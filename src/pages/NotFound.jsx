import { Link } from "react-router-dom";
import { buttonClass } from "../lib/styles";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p lang="ar" dir="rtl" className="text-5xl font-bold text-emerald-700">
        عفواً
      </p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">পেজটি পাওয়া যায়নি</h1>
      <p className="mt-2 text-slate-600">লিংকটি ভুল হতে পারে, বা পেজটি সরিয়ে ফেলা হয়েছে।</p>
      <Link to="/" className={buttonClass("primary", "lg", "mt-6")}>
        হোমে ফিরে যাও
      </Link>
    </div>
  );
}
