import { PageHeader } from "../components/ui";
import { cardClass } from "../lib/styles";

// Plain-language privacy policy. Review it before a public launch.
const sections = [
  {
    title: "আমরা কী তথ্য রাখি",
    text: "তোমার নাম, ইমেইল, শেখার অগ্রগতি (কোন শব্দ জানো, কুইজের ফলাফল, XP, টানা দিন) আর তুমি যে মতামত পাঠাও।",
  },
  {
    title: "কেন রাখি",
    text: "যাতে তুমি যেকোনো ডিভাইস থেকে লগইন করে শেখা চালিয়ে যেতে পারো, আর আমরা অ্যাপটি আরও ভালো করতে পারি।",
  },
  {
    title: "কোথায় রাখা হয়",
    text: "তথ্য Google-এর Firebase সার্ভিসে নিরাপদে রাখা হয়। শুধু তুমি নিজের অগ্রগতি দেখতে পারো।",
  },
  {
    title: "আমরা কী করি না",
    text: "তোমার তথ্য আমরা কারও কাছে বিক্রি করি না, বিজ্ঞাপনের জন্যও ব্যবহার করি না।",
  },
  {
    title: "তথ্য মুছে ফেলা",
    text: "অ্যাকাউন্ট পেজ থেকে যেকোনো সময় অ্যাকাউন্ট মুছে ফেলতে পারো। তখন তোমার সব তথ্য মুছে যায়।",
  },
  {
    title: "যোগাযোগ",
    text: "কোনো প্রশ্ন থাকলে অ্যাকাউন্ট পেজের 'মতামত দাও' থেকে আমাদের লেখো।",
  },
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="গোপনীয়তা নীতি" subtitle="তোমার তথ্য নিয়ে আমরা কী করি, সহজ ভাষায়।" />
      <div className={`${cardClass} divide-y divide-slate-100`}>
        {sections.map((s) => (
          <section key={s.title} className="p-5">
            <h2 className="font-semibold text-slate-900">{s.title}</h2>
            <p className="mt-1 text-slate-600">{s.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
