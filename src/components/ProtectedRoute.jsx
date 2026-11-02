import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wraps pages that need a login. adminOnly also requires an admin.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) {
    // Remember the page, so login can send the user back to it
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in but not an admin: send them home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
