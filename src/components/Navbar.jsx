import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../hooks/useAuth";

const links = [
  { to: "/words", label: "Words" },
  { to: "/flashcards", label: "Flashcards" },
];

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition ${
    isActive
      ? "bg-emerald-100 text-emerald-700"
      : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // The Admin link only shows for admins
  const navLinks = isAdmin ? [...links, { to: "/admin", label: "Admin" }] : links;

  async function handleLogout() {
    await signOut(auth);
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-emerald-600">
          Lahjio
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="ml-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Log out
            </button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Login</NavLink>
              <Link
                to="/signup"
                className="ml-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="flex flex-col gap-1 border-t px-4 py-3 md:hidden">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Log out
            </button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/signup" className={linkClass} onClick={() => setOpen(false)}>Sign up</NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}