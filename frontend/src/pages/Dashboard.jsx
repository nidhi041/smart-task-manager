import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Confetti from "../components/Confetti";

const QUOTES = [
  "The secret of getting ahead is getting started.",
  "Champions don't wait for the right moment — they create it.",
  "Discipline is the bridge between goals and accomplishment.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Dream big. Start small. Act now.",
];

const WIN_MESSAGES = [
  { title: "Crushed it! 🔥", sub: "One step closer to greatness." },
  { title: "That's a W! 🏆", sub: "Champions are built one task at a time." },
  { title: "Unstoppable! ⚡", sub: "Keep that momentum going." },
  { title: "Legend move! 👑", sub: "You're building something great." },
  { title: "Boom! Done! 🎯", sub: "Nothing can stop you now." },
];

const PRIORITY_STYLES = {
  Planning: { pill: "bg-blue-500/10 text-blue-400 border-blue-400/30",  dot: "#60a5fa" },
  Pending:  { pill: "bg-amber-500/10 text-amber-400 border-amber-400/30", dot: "#fbbf24" },
  Completed:{ pill: "bg-emerald-500/10 text-emerald-400 border-emerald-400/30", dot: "#34d399" },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks]   = useState([]);
  const [stats, setStats]   = useState({ total: 0, completed: 0, pending: 0 });
  const [form, setForm]     = useState({ title: "", priority: "Pending" });
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading]   = useState(true);
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState("");
  const [confetti, setConfetti] = useState(false);
  const [winMsg, setWinMsg]     = useState(null);
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const quoteTimer = useRef(null);

  // Rotate quote every 7s
  useEffect(() => {
    quoteTimer.current = setInterval(() =>
      setQuoteIdx((i) => (i + 1) % QUOTES.length), 7000);
    return () => clearInterval(quoteTimer.current);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([api.get("/tasks"), api.get("/tasks/stats")]);
      setTasks(t.data);
      setStats(s.data);
    } catch { setError("Failed to load tasks."); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setAdding(true);
    try {
      await api.post("/tasks", form);
      setForm({ title: "", priority: "Pending" });
      fetchAll();
    } catch { setError("Failed to add task."); }
    finally  { setAdding(false); }
  };

  const toggleTask = async (id, wasCompleted) => {
    await api.put(`/tasks/${id}`);
    if (!wasCompleted) {
      // just got completed → celebrate
      const msg = WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
      setWinMsg(msg);
      setConfetti(true);
    }
    fetchAll();
  };

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`);
    fetchAll();
  };

  const filtered = tasks
    .filter((t) => filter === "completed" ? t.completed : filter === "pending" ? !t.completed : true)
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  // ── Derived metrics (single source of truth) ──
  const totalTasks       = stats.total;
  const completedTasks   = stats.completed;
  const completionPct    = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const productivityScore = completionPct; // same formula, named clearly

  // ── Smart insight line ──
  const insightLine = (() => {
    if (totalTasks === 0)          return { text: "Let's get started. Add your first task 🚀",      color: "#c9a84c" };
    if (completionPct === 100)     return { text: "Perfect score! You crushed every task today 👑",  color: "#34d399" };
    if (completionPct >= 50)       return { text: "Great progress! You're on track 🔥",              color: "#34d399" };
    return                                { text: "You're getting there, keep pushing 💪",           color: "#fbbf24" };
  })();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="orb" style={{ width:520, height:520, background:"radial-gradient(circle,#c9a84c,transparent)", top:-160, left:-160 }} />
      <div className="orb" style={{ width:380, height:380, background:"radial-gradient(circle,#7c3aed,transparent)", bottom:"5%", right:-120 }} />
      <div className="orb" style={{ width:260, height:260, background:"radial-gradient(circle,#c9a84c,transparent)", top:"45%", right:"20%" }} />

      {/* Confetti burst */}
      <Confetti active={confetti} onDone={() => setConfetti(false)} />

      {/* Win celebration modal */}
      {winMsg && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          onClick={() => setWinMsg(null)}>
          <div className="card rounded-3xl p-10 text-center max-w-sm w-full fade-up"
            style={{ border: "1px solid rgba(201,168,76,0.4)", boxShadow: "0 0 60px rgba(201,168,76,0.2)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl font-black gold-text mb-2" style={{ fontFamily: "'Playfair Display',serif" }}>
              {winMsg.title}
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>{winMsg.sub}</p>
            <button className="gold-btn px-8 py-2.5 rounded-xl text-sm" onClick={() => setWinMsg(null)}>
              Keep Going →
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto relative z-10 space-y-6">

        {/* ── Greeting ── */}
        <div className="fade-up">
          <p className="text-xs uppercase tracking-[3px] mb-1" style={{ color: "var(--text-muted)" }}>
            ✦ Your Command Center
          </p>
          <h1 className="text-4xl font-black leading-tight" style={{ fontFamily: "'Playfair Display',serif" }}>
            Hello, <span className="gold-text">{user?.name?.split(" ")[0]}</span>
          </h1>
          <div className="mt-2 flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5 text-sm">❝</span>
            <p className="text-sm italic transition-all duration-500" style={{ color: "var(--text-muted)" }}>
              {QUOTES[quoteIdx]}
            </p>
          </div>
          {/* ── Insight line ── */}
          <div className="insight-line mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: `${insightLine.color}12`, border: `1px solid ${insightLine.color}30`, color: insightLine.color }}>
            {insightLine.text}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up" style={{ animationDelay: "0.08s" }}>
          {[
            { label: "Total",              value: totalTasks,             icon: "📋", color: "#c9a84c", cardClass: "card-total" },
            { label: "Pending",            value: stats.pending,          icon: "🔥", color: "#f97316", cardClass: "card-pending" },
            { label: "Completed",          value: completedTasks,         icon: "✅", color: "#34d399", cardClass: "card-completed" },
            { label: "Productivity Score", value: `${productivityScore}%`,icon: "⚡", color: "#a78bfa", cardClass: "card-productivity" },
          ].map((s) => (
            <div key={s.label} className={`stat-card card rounded-2xl p-4 text-center relative overflow-hidden group ${s.cardClass}`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}18, transparent 70%)` }} />
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-black gold-text">{s.value}</div>
              <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Progress bar ── */}
        {totalTasks > 0 && (
          <div className="card rounded-2xl px-5 py-4 fade-up" style={{ animationDelay: "0.14s" }}>
            <div className="flex justify-between text-xs mb-2" style={{ color: "var(--text-muted)" }}>
              <span className="uppercase tracking-wider">Overall Progress</span>
              <span className="text-yellow-400 font-bold">{completionPct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
        )}

        {/* ── Main card ── */}
        <div className="main-card card rounded-3xl p-6 fade-up" style={{ animationDelay: "0.18s" }}>

          {/* Add task */}
          <form onSubmit={addTask} className="flex gap-2 mb-6 flex-wrap">
            <input
              type="text"
              className="input-field flex-1 min-w-40 px-4 py-3 rounded-xl text-sm"
              placeholder="What will you conquer today?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className="input-field px-3 py-3 rounded-xl text-sm cursor-pointer"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="Planning">📋 Planning</option>
              <option value="Pending">🔥 Pending</option>
              <option value="Completed">✅ Completed</option>
            </select>
            <button type="submit" disabled={adding}
              className="btn-action gold-btn px-5 py-3 rounded-xl text-sm disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap">
              {adding
                ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                : <><span className="text-base leading-none">+</span> Add Task</>}
            </button>
          </form>

          {/* Divider */}
          <div className="h-px mb-5" style={{ background: "var(--border)" }} />

          {/* Filter + Search */}
          <div className="flex gap-3 mb-5 flex-wrap items-center">
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface-bg)", border: "1px solid var(--border)" }}>
              {["all", "pending", "completed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    filter === f ? "gold-btn" : "nav-muted hover:text-yellow-400"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <div className="flex-1 relative min-w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
              <input type="text"
                className="input-field w-full pl-8 pr-4 py-2 rounded-xl text-sm"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Task list */}
          {loading ? (
            <div className="flex justify-center py-14">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                Your canvas is clear. Add a task and start winning.
              </p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filtered.map((task, i) => {
                const ps = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Pending;
                return (
                  <li key={task._id}
                    className="task-row slide-in group flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all cursor-default"
                    style={{ animationDelay: `${i * 0.04}s` }}>

                    {/* Left: checkbox + text */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleTask(task._id, task.completed)}
                        className={`btn-toggle-complete flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${task.completed ? "is-done" : ""}`}
                        style={{
                          borderColor: task.completed ? "#c9a84c" : "rgba(201,168,76,0.3)",
                          background: task.completed ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "transparent",
                          boxShadow: task.completed ? "0 0 12px rgba(201,168,76,0.5)" : "none",
                        }}>
                        {task.completed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>

                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate transition-all duration-300"
                          style={{
                            color: task.completed ? "var(--text-muted)" : "var(--text)",
                            textDecoration: task.completed ? "line-through" : "none",
                          }}>
                          {task.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Right: badge + delete */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${ps.pill}`}>
                        {task.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="btn-delete opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                        style={{ color: "#f87171", background: "rgba(239,68,68,0.08)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
