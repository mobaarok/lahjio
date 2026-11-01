import { Link } from "react-router-dom";

const features = [
  {
    icon: "📚",
    title: "বাংলা থেকে আরবি শব্দ",
    desc: "প্রতিদিনের দরকারি শব্দ, বাংলা অর্থ ও উচ্চারণসহ। ক্যাটেগরি ধরে সহজে শেখো।",
  },
  {
    icon: "🔊",
    title: "শুনে শেখো",
    desc: "প্রতিটি শব্দের পাশে 🔊 বাটন চাপলেই আরবি উচ্চারণ শুনতে পাবে।",
  },
  {
    icon: "🃏",
    title: "ফ্ল্যাশকার্ড",
    desc: "কার্ড উল্টে নিজেকে যাচাই করো। শাফল করে বারবার প্র্যাকটিস করো।",
  },
];

const steps = [
  { num: "১", text: "ফ্রি অ্যাকাউন্ট খোলো" },
  { num: "২", text: "শব্দ দেখো ও শুনো" },
  { num: "৩", text: "ফ্ল্যাশকার্ডে প্র্যাকটিস করো" },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center">
          <p
            dir="rtl"
            lang="ar"
            className="mb-4 text-5xl font-bold text-emerald-700 sm:text-6xl"
          >
            مرحباً
          </p>
          <h1 className="text-3xl font-bold text-gray-900 sm:text-5xl">
            বাংলায় শেখো আরবি,
            <br />
            ধাপে ধাপে
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-600">
            Lahjio-তে শব্দ শোনো, অর্থ জানো, আর ফ্ল্যাশকার্ডে প্র্যাকটিস করে
            আরবি ভাষা আয়ত্ত করো।
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white shadow hover:bg-emerald-700 sm:w-auto"
            >
              শুরু করো — ফ্রি
            </Link>
            <Link
              to="/login"
              className="w-full rounded-lg border border-emerald-600 px-6 py-3 font-semibold text-emerald-700 hover:bg-emerald-50 sm:w-auto"
            >
              লগইন
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
          কী কী পাবে
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="mt-2 text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
            কীভাবে কাজ করে
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xl font-bold text-white">
                  {s.num}
                </div>
                <p className="font-medium text-gray-800">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          আজই আরবি শেখা শুরু করো
        </h2>
        <p className="mt-2 text-gray-600">
          অ্যাকাউন্ট খুলতে এক মিনিটও লাগবে না।
        </p>
        <Link
          to="/signup"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-8 py-3 font-semibold text-white shadow hover:bg-emerald-700"
        >
          অ্যাকাউন্ট খোলো
        </Link>
      </section>
    </div>
  );
}