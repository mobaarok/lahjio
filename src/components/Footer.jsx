import { Link } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import Wordmark from "./Wordmark";
import { useLocale } from "../hooks/useLocale";

// Worked out once when the app loads, not while rendering (React purity rule)
const YEAR = new Date().getFullYear();

const learnLinks = [
  { to: "/courses", key: "nav.courses" },
  { to: "/words", key: "nav.words" },
  { to: "/practice", key: "nav.practice" },
  { to: "/quiz", key: "nav.quiz" },
  { to: "/guide", key: "nav.guide" },
];

const aboutLinks = [
  { to: "/account", key: "footer.feedback" },
  { to: "/privacy", key: "footer.privacy" },
  { to: "/terms", key: "footer.terms" },
];

// Social pages. Paste each page's full link into `url` (e.g.
// "https://facebook.com/lahjio"). Without a link the icon shows faded and
// doesn't click, so nobody lands on a broken page.
const socialLinks = [
  {
    name: "Facebook",
    url: "",
    path: "M14 8h2V5h-2.5C11 5 10 6.6 10 8.7V10H8v3h2v7h3v-7h2.4l.6-3h-3V9c0-.6.4-1 1-1z",
  },
  {
    name: "YouTube",
    url: "",
    path: "M6 5h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4zm4 4v6l5-3z",
  },
  {
    name: "WhatsApp",
    url: "",
    path: "M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm-3 5c.4 0 .6 0 .8.5l.7 1.6c.1.3 0 .5-.2.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.4-.3.7-.2l1.6.7c.5.2.5.4.5.8 0 1-1 2-2 2-3.6 0-7-3.4-7-7 0-1 1-2 2-2z",
  },
  {
    name: "TikTok",
    url: "",
    path: "M14 3h3a4 4 0 0 0 4 4v3a7 7 0 0 1-4-1.3V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3z",
  },
];

// Round social icons; faded until a link is added above
function SocialLinks() {
  const { t } = useLocale();
  return (
    <ul className="flex gap-2">
      {socialLinks.map((social) => {
        const icon = (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor" fillRule="evenodd">
            <path d={social.path} />
          </svg>
        );
        const round = "flex size-9 items-center justify-center rounded-full bg-slate-100";
        return (
          <li key={social.name}>
            {social.url ? (
              <a
                href={social.url}
                target="_blank"
                rel="noreferrer"
                aria-label={social.name}
                className={`${round} text-emerald-700 hover:bg-emerald-100`}
              >
                {icon}
              </a>
            ) : (
              <span title={`${social.name}: ${t("footer.soon")}`} className={`${round} text-slate-300`}>
                {icon}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// A titled list of links, used for the "Learn" and "Lahjio" columns
function LinkColumn({ title, links }) {
  const { t } = useLocale();
  return (
    <div>
      <p className="font-semibold text-slate-800">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className="hover:text-emerald-700">
              {t(link.key)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Site footer: logo, links, notes and copyright.
// Extra bottom padding on phones so the tab bar never covers it.
export default function Footer() {
  const { t, num } = useLocale();

  return (
    <footer className="border-t border-slate-200 bg-white pb-24 text-sm text-slate-500 lg:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-[2fr_1fr_1fr]">
          <div className="space-y-3">
            <Wordmark className="text-3xl" />
            <p>{t("footer.tagline")}</p>
            <p>{t("footer.madeFor")}</p>
            <SocialLinks />
            <LanguageSwitcher />
          </div>
          <LinkColumn title={t("footer.learn")} links={learnLinks} />
          <LinkColumn title="Lahjio" links={aboutLinks} />
        </div>

        <div className="mt-8 space-y-1 rounded-xl bg-slate-50 p-4 text-xs">
          <p>{t("footer.install")}</p>
          <p>{t("footer.beta")}</p>
        </div>

        <p className="mt-6 text-xs">{t("footer.copyright", { year: num(YEAR) })}</p>
      </div>
    </footer>
  );
}
