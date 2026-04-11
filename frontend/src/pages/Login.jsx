import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb" style={{ width:500, height:500, background:"radial-gradient(circle,#c9a84c,transparent)", top:-180, left:-180 }} />
      <div className="orb" style={{ width:350, height:350, background:"radial-gradient(circle,#7c3aed,transparent)", bottom:-80, right:-100 }} />

      <div className="w-full max-w-md relative z-10 fade-up">
        {/* Top badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs uppercase tracking-[2px] mb-6"
            style={{ border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c", background: "rgba(201,168,76,0.06)" }}>
            ✦ TaskFlow
          </div>
          <h1 className="text-4xl font-black gold-text" style={{ fontFamily: "'Playfair Display',serif" }}>
            Welcome Back
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Your goals are waiting. Sign in and own the day.
          </p>
        </div>

        <div className="card rounded-3xl p-8" style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,168,76,0.1) inset" }}>
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[2px] mb-2 font-medium" style={{ color: "var(--text-muted)" }}>
                Email Address
              </label>
              <input type="email"
                className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[2px] mb-2 font-medium" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <input type="password"
                className="input-field w-full px-4 py-3.5 rounded-xl text-sm"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required />
            </div>

            <button type="submit" disabled={loading}
              className="gold-btn w-full py-3.5 rounded-xl text-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Signing in...</>
                : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              New here?{" "}
              <Link to="/signup" className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors">
                Create your account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          "The journey of a thousand miles begins with a single step."
        </p>
      </div>
    </div>
  );
};

export default Login;
