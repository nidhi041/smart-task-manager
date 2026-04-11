import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";

const VIEWS = [
  { key: "daily",   label: "Daily",   icon: "📅" },
  { key: "weekly",  label: "Weekly",  icon: "🗓️" },
  { key: "monthly", label: "Monthly", icon: "📆" },
];

const RANGES = {
  daily:   [{ v: 7, l: "7 Days" }, { v: 14, l: "14 Days" }, { v: 30, l: "30 Days" }],
  weekly:  [{ v: 4, l: "4 Weeks" }, { v: 8, l: "8 Weeks" }, { v: 12, l: "12 Weeks" }],
  monthly: [{ v: 3, l: "3 Months" }, { v: 6, l: "6 Months" }, { v: 12, l: "12 Months" }],
};

// ── Mini bar chart (pure CSS) ──────────────────────────────
const BarChart = ({ data, view }) => {
  const maxVal = Math.max(...data.map((d) => d.total), 1);

  const label = (item) => {
    if (view === "daily") {
      const d = new Date(item.date + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    if (view === "weekly") return item.label?.split("–")[0]?.trim() || item.week;
    return item.label?.split(" ")[0] || item.month;
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div style={{ minWidth: Math.max(data.length * 52, 300), display: "flex", alignItems: "flex-end", gap: 6, height: 160, padding: "0 4px" }}>
        {data.map((item, i) => {
          const pct = item.total === 0 ? 0 : (item.completed / item.total) * 100;
          const barH = item.total === 0 ? 4 : Math.max((item.total / maxVal) * 130, 8);
          const compH = item.total === 0 ? 0 : (item.completed / item.total) * barH;
          return (
            <div key={i} className="flex flex-col items-center gap-1 group" style={{ flex: "0 0 46px" }}>
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute z-20 pointer-events-none"
                style={{
                  bottom: barH + 28,
                  background: "rgba(14,14,24,0.97)",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: 10, padding: "6px 10px",
                  fontSize: 11, whiteSpace: "nowrap", color: "#ede9e0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}>
                <div style={{ color: "#c9a84c", fontWeight: 700, marginBottom: 2 }}>{label(item)}</div>
                <div>Total: <b>{item.total}</b></div>
                <div style={{ color: "#34d399" }}>Done: <b>{item.completed}</b></div>
                <div style={{ color: "#fbbf24" }}>Pending: <b>{item.pending}</b></div>
                <div style={{ color: "#a78bfa" }}>Rate: <b>{Math.round(pct)}%</b></div>
              </div>

              {/* Bar stack */}
              <div className="relative flex flex-col justify-end rounded-lg overflow-hidden cursor-pointer"
                style={{
                  width: 32, height: barH,
                  background: "rgba(201,168,76,0.08)",
                  border: "1px solid rgba(201,168,76,0.12)",
                  transition: "all 0.3s ease",
                }}>
                {/* completed portion */}
                {compH > 0 && (
                  <div style={{
                    height: compH, width: "100%",
                    background: "linear-gradient(180deg,#f0d080,#c9a84c)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.6s cubic-bezier(0.22,1,0.36,1)",
                  }} />
                )}
              </div>

              {/* X label */}
              <span style={{ fontSize: 9, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.2, maxWidth: 46, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {label(item)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Total</span>
        </div>
      </div>
    </div>
  );
};

// ── Day detail panel ───────────────────────────────────────
const DayDetail = ({ item, onClose }) => {
  if (!item) return null;
  const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
  const PRIORITY_COLORS = {
    Planning: { bg: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "rgba(96,165,250,0.3)" },
    Pending:  { bg: "rgba(251,191,36,0.1)",  color: "#fbbf24", border: "rgba(251,191,36,0.3)" },
    Completed:{ bg: "rgba(52,211,153,0.1)",  color: "#34d399", border: "rgba(52,211,153,0.3)" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="card rounded-3xl p-6 w-full max-w-md pop-in max-h-[80vh] overflow-y-auto"
        style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.15) inset" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-[2px] mb-1" style={{ color: "var(--text-muted)" }}>
              {item.date || item.week || item.month}
            </p>
            <h3 className="text-xl font-black gold-text" style={{ fontFamily: "'Playfair Display',serif" }}>
              {item.label || item.date}
            </h3>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "var(--surface-bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            ✕
          </button>
        </div>

        {/* Summary pills */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {[
            { label: "Total",     value: item.total,     color: "#c9a84c" },
            { label: "Completed", value: item.completed, color: "#34d399" },
            { label: "Pending",   value: item.pending,   color: "#fbbf24" },
          ].map((s) => (
            <div key={s.label} className="text-center py-3 rounded-2xl"
              style={{ background: "var(--surface-bg)", border: "1px solid var(--border)" }}>
              <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>
            <span>Completion Rate</span>
            <span style={{ color: "#c9a84c", fontWeight: 700 }}>{pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-bg)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: "linear-gradient(90deg,#c9a84c,#f0d080)" }} />
          </div>
        </div>

        {/* Task list (daily only) */}
        {item.tasks?.length > 0 && (
          <>
            <p className="text-xs uppercase tracking-[2px] mb-3" style={{ color: "var(--text-muted)" }}>Tasks</p>
            <ul className="space-y-2">
              {item.tasks.map((t) => {
                const ps = PRIORITY_COLORS[t.priority] || PRIORITY_COLORS.Pending;
                return (
                  <li key={t._id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "var(--surface-bg)", border: "1px solid var(--border)" }}>
                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: t.completed ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "transparent",
                        border: t.completed ? "none" : "2px solid rgba(201,168,76,0.3)",
                      }}>
                      {t.completed && (
                        <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="flex-1 text-sm truncate"
                      style={{ color: t.completed ? "var(--text-muted)" : "var(--text)", textDecoration: t.completed ? "line-through" : "none" }}>
                      {t.title}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: ps.bg, color: ps.color, border: `1px solid ${ps.border}` }}>
                      {t.priority}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

// ── Summary streak card ────────────────────────────────────
const StreakCard = ({ data }) => {
  if (!data.length) return null;
  const activeDays = data.filter((d) => d.total > 0).length;
  const totalTasks = data.reduce((s, d) => s + d.total, 0);
  const totalDone  = data.reduce((s, d) => s + d.completed, 0);
  const bestDay    = [...data].sort((a, b) => b.completed - a.completed)[0];
  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { icon: "🔥", label: "Active Days",   value: activeDays },
        { icon: "📋", label: "Tasks Created", value: totalTasks },
        { icon: "✅", label: "Tasks Done",    value: totalDone },
        { icon: "🏆", label: "Success Rate",  value: `${overallPct}%` },
      ].map((s) => (
        <div key={s.label} className="card rounded-2xl p-4 text-center hover-lift">
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className="text-2xl font-black gold-text">{s.value}</div>
          <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ── Main History Page ──────────────────────────────────────
const History = () => {
  const [view, setView]       = useState("daily");
  const [range, setRange]     = useState(14);
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/history/${view}?range=${range}`);
      setData(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [view, range]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // When view changes, reset range to first option
  const handleViewChange = (v) => {
    setView(v);
    setRange(RANGES[v][1].v);
    setSelected(null);
  };

  const nonEmpty = data.filter((d) => d.total > 0);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb" style={{ width:480, height:480, background:"radial-gradient(circle,#c9a84c,transparent)", top:-140, left:-140 }} />
      <div className="orb" style={{ width:320, height:320, background:"radial-gradient(circle,#7c3aed,transparent)", bottom:"5%", right:-80 }} />

      <div className="max-w-3xl mx-auto relative z-10">

        {/* Page header */}
        <div className="mb-8 fade-up">
          <p className="text-xs uppercase tracking-[3px] mb-1" style={{ color: "var(--text-muted)" }}>✦ Your Journey</p>
          <h1 className="text-4xl font-black" style={{ fontFamily: "'Playfair Display',serif" }}>
            Task <span className="gold-text">History</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Track your progress, celebrate your wins, identify your patterns.
          </p>
        </div>

        {/* View + Range controls */}
        <div className="flex flex-wrap gap-3 mb-6 fade-up" style={{ animationDelay: "0.08s" }}>
          {/* View tabs */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface-bg)", border: "1px solid var(--border)" }}>
            {VIEWS.map((v) => (
              <button key={v.key} onClick={() => handleViewChange(v.key)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  view === v.key ? "gold-btn" : "nav-muted hover:text-yellow-400"
                }`}>
                <span>{v.icon}</span> {v.label}
              </button>
            ))}
          </div>

          {/* Range selector */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--surface-bg)", border: "1px solid var(--border)" }}>
            {RANGES[view].map((r) => (
              <button key={r.v} onClick={() => setRange(r.v)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  range === r.v ? "gold-btn" : "nav-muted hover:text-yellow-400"
                }`}>
                {r.l}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="fade-up" style={{ animationDelay: "0.12s" }}>
              <StreakCard data={data} />
            </div>

            {/* Bar chart card */}
            <div className="card rounded-3xl p-6 mb-6 fade-up" style={{ animationDelay: "0.16s" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[2px]" style={{ color: "var(--text-muted)" }}>
                    {view === "daily" ? "Daily" : view === "weekly" ? "Weekly" : "Monthly"} Overview
                  </p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text)" }}>
                    Gold bar = completed tasks
                  </p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
              <BarChart data={data} view={view} />
            </div>

            {/* Date-wise list */}
            <div className="card rounded-3xl p-6 fade-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-xs uppercase tracking-[2px] mb-4" style={{ color: "var(--text-muted)" }}>
                {view === "daily" ? "Day by Day" : view === "weekly" ? "Week by Week" : "Month by Month"} Breakdown
              </p>

              {nonEmpty.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">📭</div>
                  <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                    No tasks found in this period. Start adding tasks to build your history.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...nonEmpty].reverse().map((item, i) => {
                    const pct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
                    const dateLabel = view === "daily"
                      ? new Date(item.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
                      : view === "weekly" ? item.label
                      : item.label;

                    return (
                      <div key={i}
                        className="task-row slide-in rounded-2xl px-4 py-4 cursor-pointer"
                        style={{ animationDelay: `${i * 0.03}s` }}
                        onClick={() => setSelected(item)}>
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          {/* Date + pills */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div>
                              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{dateLabel}</p>
                              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                {item.total} task{item.total !== 1 ? "s" : ""} created
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
                                ✓ {item.completed} done
                              </span>
                              {item.pending > 0 && (
                                <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                                  style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.25)" }}>
                                  ⏳ {item.pending} pending
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right: pct + arrow */}
                          <div className="flex items-center gap-3 ml-auto">
                            <div className="text-right">
                              <div className="text-lg font-black" style={{ color: pct >= 80 ? "#34d399" : pct >= 50 ? "#c9a84c" : "#f87171" }}>
                                {pct}%
                              </div>
                              <div className="text-xs" style={{ color: "var(--text-muted)" }}>rate</div>
                            </div>
                            {/* Mini inline bar */}
                            <div className="w-20 h-1.5 rounded-full overflow-hidden hidden sm:block" style={{ background: "var(--surface-bg)" }}>
                              <div className="h-full rounded-full"
                                style={{ width: `${pct}%`, background: "linear-gradient(90deg,#c9a84c,#f0d080)", transition: "width 0.6s ease" }} />
                            </div>
                            {view === "daily" && (
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>→</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Day detail modal */}
      {selected && <DayDetail item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default History;
