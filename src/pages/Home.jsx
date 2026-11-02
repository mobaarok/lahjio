import Dashboard from "./Dashboard";
import Landing from "./Landing";
import { useAuth } from "../hooks/useAuth";

// Logged-out visitors see the landing page; learners see their dashboard
export default function Home() {
  const { user } = useAuth();
  return user ? <Dashboard user={user} /> : <Landing />;
}
