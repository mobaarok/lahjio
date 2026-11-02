import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { LocaleProvider } from "./context/LocaleContext";
import { ProgressProvider } from "./context/ProgressContext";
import "./index.css";

// HashRouter (#/words) because GitHub Pages can't serve other paths on refresh
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LocaleProvider>
      <AuthProvider>
        <ProgressProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </ProgressProvider>
      </AuthProvider>
    </LocaleProvider>
  </StrictMode>
);
