import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="mt-2">Page not found.</p>
      <Link to="/" className="mt-4 inline-block text-emerald-600 underline">
        Go home
      </Link>
    </div>
  );
}