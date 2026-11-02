import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ProgressProvider } from "./context/ProgressContext";
import "./index.css";

// HashRouter (#/words) because GitHub Pages can't serve other paths on refresh
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ProgressProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </ProgressProvider>
    </AuthProvider>
  </StrictMode>
);
