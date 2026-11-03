import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";
import { recordHeartbeat, recordVisit } from "../lib/activity";

// How often an open app says "still here", for "online now" in the admin
const HEARTBEAT_MS = 3 * 60 * 1000;

// Shows nothing. Records visits of logged-in learners for Admin > Analytics.
// Tracking errors are ignored: they must never get in a learner's way.
export default function VisitTracker() {
  const { user } = useAuth();
  const { locale } = useLocale();

  // A visit when the app opens, a learner logs in, or the language changes
  useEffect(() => {
    if (!user) return;
    recordVisit(user, locale).catch(() => {});
  }, [user, locale]);

  // A heartbeat every few minutes, only while the app is on screen
  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") recordHeartbeat(user.uid).catch(() => {});
    }, HEARTBEAT_MS);
    return () => clearInterval(timer);
  }, [user]);

  return null;
}
