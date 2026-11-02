import { Link } from "react-router-dom";
import AudioButton from "../components/AudioButton";
import Icon from "../components/Icon";
import { Alert, ProgressBar, Spinner } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { useContent } from "../hooks/useContent";
import { useNow } from "../hooks/useNow";
import { useProgress } from "../hooks/useProgress";
import { courseToContinue, nextLesson } from "../lib/courses";
import { bn } from "../lib/format";
import { DEFAULT_DAILY_GOAL, isDue, liveStreak, todayCount } from "../lib/progress";
import { buttonClass, cardClass } from "../lib/styles";

const DAY = 24 * 60 * 60 * 1000;

// Logged-out visitors see the landing page; learners see their dashboard
export default function Home() {
  const { user } = useAuth();
  return user ? <Dashboard user={user} /> : <Landing />;
}

const features = [
  { icon: "list", title: "দরকারি শব্দ ও বাক্য", text: "সৌদিতে প্রতিদিন যা লাগে: দোকান, কাজ, রাস্তা।" },
  { icon: "volume", title: "শুনে শেখো", text: "প্রতিটি শব্দের আরবি উচ্চারণ শুনতে পাবে।" },
  { icon: "cards", title: "ফ্ল্যাশকার্ড ও কুইজ", text: "কঠিন শব্দ বারবার ফিরে আসে, যতক্ষণ না মনে থাকে।" },
  { icon: "flame", title: "প্রতিদিনের অভ্যাস", text: "দৈনিক লক্ষ্য, XP আর টানা দিনের স্ট্রিক।" },
];

function Landing() {
  return (
    <div className="-mt-6">
      <section className="-mx-4 bg-gradient-to-b from-emerald-50 to-slate-50 px-4 py-16 text-center sm:py-24">
        <p lang="ar" dir="rtl" className="text-5xl font-bold text-emerald-700 sm:text-6xl">
          مرحباً
        </p>
        <h1 className="mt-4 text-3xl font-bold text-slate-900 sm:text-5xl">
          বাংলায় শেখো সৌদি আরবি,
          <br />
          ধাপে ধাপে
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
          দোকানে, কাজে, ট্যাক্সিতে: সৌদিতে প্রতিদিন যে আরবি লাগে, সেটাই শেখো। প্রতিদিন মাত্র ৫ মিনিট।
        </p>
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link to="/signup" className={buttonClass("primary", "lg")}>
            ফ্রি শুরু করো
          </Link>
          <Link to="/words" className={buttonClass("secondary", "lg")}>
            শব্দগুলো দেখো
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">কী কী পাবে</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className={`${cardClass} flex gap-4 p-5`}>
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Icon name={f.icon} className="size-6" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-slate-600">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-emerald-700 px-6 py-10 text-center text-white">
        <h2 className="text-2xl font-bold">আজই শুরু করো</h2>
        <p className="mt-2 text-emerald-100">অ্যাকাউন্ট খুলতে এক মিনিটও লাগবে না। পুরোপুরি ফ্রি।</p>
        <Link to="/signup" className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-emerald-800 hover:bg-emerald-50">
          অ্যাকাউন্ট খোলো
        </Link>
      </section>
    </div>
  );
}

function Dashboard({ user }) {
  const { content, loading, error } = useContent();
  const progressState = useProgress();
  const { progress, lessonProgress, profile } = progressState;
  const now = useNow();

  if (loading || progressState.loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  const name = user.displayName || "বন্ধু";
  const goal = profile?.daily_goal ?? DEFAULT_DAILY_GOAL;
  const doneToday = todayCount(profile, now);
  const streak = liveStreak(profile, now);
  const due = content.items.filter((i) => isDue(progress[i.id], now)).length;

  const course = courseToContinue(content.courses, lessonProgress);
  const lesson = course && nextLesson(course, lessonProgress);

  // Word of the day: the same for everyone on a given day
  const items = [...content.items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const wordOfDay = items.length > 0 ? items[Math.floor(now / DAY) % items.length] : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">আসসালামু আলাইকুম, {name}!</h1>
        <p className="mt-1 text-slate-600">আজ কী শিখবে?</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`${cardClass} p-4`}>
          <p className="flex items-center gap-1 text-sm text-slate-500">
            <Icon name="flame" className="size-4 text-amber-500" /> টানা দিন
          </p>
          <p className="mt-1 text-3xl font-bold text-amber-600">{bn(streak)}</p>
        </div>
        <div className={`${cardClass} p-4`}>
          <p className="text-sm text-slate-500">মোট XP</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{bn(profile?.xp ?? 0)}</p>
        </div>
      </div>

      <div className={`${cardClass} p-5`}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">আজকের লক্ষ্য</h2>
          <span className="text-sm text-slate-500">
            {bn(Math.min(doneToday, goal))}/{bn(goal)}
          </span>
        </div>
        <ProgressBar value={Math.min(doneToday, goal)} max={goal} />
        <p className="mt-2 text-sm text-slate-500">
          {doneToday >= goal ? "লক্ষ্য পূরণ! কাল আবার দেখা হবে 🎉" : "প্র্যাকটিস, কুইজ বা লেসনের প্রতিটি উত্তর গোনা হয়।"}
        </p>
      </div>

      {course && lesson && (
        <Link
          to={`/courses/${course.id}/lessons/${lesson.id}`}
          className="block rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-5 text-white shadow-md transition hover:shadow-lg"
        >
          <p className="text-sm text-emerald-100">{course.title_bn}</p>
          <p className="mt-1 text-xl font-bold">পরের লেসন: {lesson.title_bn}</p>
          <span className="mt-4 inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-800">
            চালিয়ে যাও <Icon name="right" className="size-4" />
          </span>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/practice" className={`${cardClass} flex items-center gap-4 p-5 transition hover:border-emerald-300`}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Icon name="cards" className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-slate-900">রিভিউ</span>
            <span className="block text-sm text-slate-500">
              {due > 0 ? `${bn(due)}টি শব্দ অপেক্ষা করছে` : "নতুন শব্দ প্র্যাকটিস করো"}
            </span>
          </span>
          <Icon name="right" className="size-5 text-slate-400" />
        </Link>
        <Link to="/quiz" className={`${cardClass} flex items-center gap-4 p-5 transition hover:border-emerald-300`}>
          <span className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
            <Icon name="quiz" className="size-6" />
          </span>
          <span className="flex-1">
            <span className="block font-semibold text-slate-900">কুইজ</span>
            <span className="block text-sm text-slate-500">১০টি প্রশ্নে নিজেকে যাচাই করো</span>
          </span>
          <Icon name="right" className="size-5 text-slate-400" />
        </Link>
      </div>

      {wordOfDay && (
        <div className={`${cardClass} p-5`}>
          <p className="text-sm font-medium text-emerald-700">আজকের শব্দ</p>
          <div className="mt-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold text-slate-900">{wordOfDay.bangla}</p>
              <p className="text-slate-500">{wordOfDay.bn_transliteration}</p>
            </div>
            <div className="flex items-center gap-3">
              <p lang="ar" dir="rtl" className="text-3xl font-bold text-emerald-700">{wordOfDay.arabic}</p>
              <AudioButton item={wordOfDay} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
