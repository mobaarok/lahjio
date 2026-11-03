// Google Analytics (through Firebase) for visitors, including people who
// never sign up: page views, country and city, device. The reports live in the
// Firebase Console > Analytics, not in our admin dashboard.
//
// Off until VITE_FIREBASE_MEASUREMENT_ID is set in .env, and always off with
// the local emulators. The analytics code downloads only when it's on.
import { app } from "../firebase";

const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;
const enabled = Boolean(measurementId) && import.meta.env.VITE_USE_EMULATORS !== "true";

let started = null; // a promise of { analytics, logEvent }, or null when off

function start() {
  if (!enabled) return null;
  started ??= import("firebase/analytics").then(async (module) => {
    if (!(await module.isSupported())) return null; // e.g. some private browsers
    // We send page views ourselves (below), because the app uses #/ links
    const analytics = module.initializeAnalytics(app, { config: { send_page_view: false } });
    return { analytics, logEvent: module.logEvent };
  });
  return started;
}

// Called on every page change, e.g. trackPageView("/courses")
export async function trackPageView(path) {
  try {
    const ga = await start();
    ga?.logEvent(ga.analytics, "page_view", {
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    });
  } catch {
    // Analytics must never break the app
  }
}
