import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../lib/googleAnalytics";

// Shows nothing. Tells Google Analytics about each page a visitor opens.
// Does nothing until Google Analytics is set up (see lib/googleAnalytics.js).
export default function PageViewTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
