import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate("/login"); };

  const navLink = (to, label) => {
    const active = pathname === to;
    return (
      <Link to={to}
        className="relative text-sm font-medium transition-colors nav-link"
        style={{ color: active ? "#c9a84c" : undefined }}>
        {label}
        {active && (
          <span className="absolute -bottom-1 left-0 right-0 h-px rounded-full"
            style={{ background: "linear-gradient(90deg,#c9a84c,#f0d080)" }} />
        )}
      </Link>
    );
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <span className="text-xl transition-transform group-hover:scale-110 duration-300"
            style={{ filter: "drop-shadow(0 0 8px rgba(201,168,76,0.6))" }}>⚡</span>
          <span className="font-black text-lg gold-text" style={{ fontFamily: "'Playfair Display',serif" }}>
            TaskFlow
          </span>
        </Link>

        <div className="flex items-center gap-5">
          {user && (
            <>
              {navLink("/dashboard", "Dashboard")}
              {navLink("/history",   "History")}
              {navLink("/profile",   "Profile")}
              <div className="w-px h-4" style={{ background: "var(--border)" }} />
              <span className="text-sm nav-muted hidden sm:block">
                Hey, <span className="font-semibold" style={{ color: "#c9a84c" }}>{user?.name?.split(" ")[0]}</span>
              </span>
            </>
          )}

          {/* Theme toggle */}
          <button onClick={toggle} aria-label="Toggle theme"
            className="theme-toggle-btn w-9 h-9 rounded-xl flex items-center justify-center text-base">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {user && (
            <button onClick={handleLogout}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all nav-muted uppercase tracking-wider"
              style={{ border: "1px solid var(--border-input)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#c9a84c"; e.currentTarget.style.color="#c9a84c"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=""; e.currentTarget.style.color=""; }}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
