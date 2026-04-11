import Task from "../models/Task.js";

// ── date helpers ──────────────────────────────────────────
const toDateKey = (d) => new Date(d).toISOString().slice(0, 10);

const daysBetween = (a, b) =>
  Math.round((new Date(b) - new Date(a)) / 86400000);

// ─────────────────────────────────────────────────────────
// GET /api/tasks
export const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(tasks);
};

// POST /api/tasks
export const createTask = async (req, res) => {
  const { title, priority } = req.body;
  if (!title) return res.status(400).json({ message: "Title is required" });
  const task = await Task.create({
    userId: req.user._id,
    title,
    priority: priority || "Pending",
    completed: false,
  });
  res.status(201).json(task);
};

// PUT /api/tasks/:id — toggle completed + track completedAt
export const toggleTask = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: "Task not found" });
  task.completed = !task.completed;
  task.completedAt = task.completed ? new Date() : null;
  await task.save();
  res.json(task);
};

// DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task deleted" });
};

// GET /api/tasks/stats
export const getStats = async (req, res) => {
  const total     = await Task.countDocuments({ userId: req.user._id });
  const completed = await Task.countDocuments({ userId: req.user._id, completed: true });
  res.json({ total, completed, pending: total - completed });
};

// ─────────────────────────────────────────────
// HISTORY ENDPOINTS
// ─────────────────────────────────────────────

// GET /api/tasks/history/daily?range=30
// Returns per-day breakdown for last N days
export const getDailyHistory = async (req, res) => {
  const days = Math.min(parseInt(req.query.range) || 30, 90);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const uid = req.user._id;

  // All tasks created in range
  const tasks = await Task.find({ userId: uid, createdAt: { $gte: since } })
    .select("title completed priority createdAt completedAt")
    .sort({ createdAt: -1 });

  // Group by date string YYYY-MM-DD
  const map = {};
  tasks.forEach((t) => {
    const day = t.createdAt.toISOString().slice(0, 10);
    if (!map[day]) map[day] = { date: day, total: 0, completed: 0, pending: 0, tasks: [] };
    map[day].total++;
    if (t.completed) map[day].completed++;
    else map[day].pending++;
    map[day].tasks.push({
      _id: t._id,
      title: t.title,
      completed: t.completed,
      priority: t.priority,
      completedAt: t.completedAt,
    });
  });

  // Fill missing days with zeros so chart is continuous
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(map[key] || { date: key, total: 0, completed: 0, pending: 0, tasks: [] });
  }

  res.json(result);
};

// GET /api/tasks/history/weekly?range=12
// Returns per-week breakdown for last N weeks
export const getWeeklyHistory = async (req, res) => {
  const weeks = Math.min(parseInt(req.query.range) || 12, 26);
  const since = new Date();
  since.setDate(since.getDate() - weeks * 7);
  since.setHours(0, 0, 0, 0);

  const uid = req.user._id;
  const tasks = await Task.find({ userId: uid, createdAt: { $gte: since } })
    .select("title completed priority createdAt completedAt");

  // ISO week helper: returns "YYYY-Www"
  const getWeekKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    const wn = 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
    return `${d.getFullYear()}-W${String(wn).padStart(2, "0")}`;
  };

  const getWeekLabel = (date) => {
    const d = new Date(date);
    // Monday of that week
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    const mon = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    d.setDate(d.getDate() + 6);
    const sun = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${mon} – ${sun}`;
  };

  const map = {};
  tasks.forEach((t) => {
    const key = getWeekKey(t.createdAt);
    if (!map[key]) map[key] = { week: key, label: getWeekLabel(t.createdAt), total: 0, completed: 0, pending: 0 };
    map[key].total++;
    if (t.completed) map[key].completed++;
    else map[key].pending++;
  });

  // Build ordered list
  const result = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const key = getWeekKey(d);
    result.push(map[key] || { week: key, label: getWeekLabel(d), total: 0, completed: 0, pending: 0 });
  }

  res.json(result);
};

// GET /api/tasks/history/monthly?range=6
// Returns per-month breakdown
export const getMonthlyHistory = async (req, res) => {
  const months = Math.min(parseInt(req.query.range) || 6, 12);
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const uid = req.user._id;
  const tasks = await Task.find({ userId: uid, createdAt: { $gte: since } })
    .select("title completed priority createdAt completedAt");

  const map = {};
  tasks.forEach((t) => {
    const key = t.createdAt.toISOString().slice(0, 7); // YYYY-MM
    const label = t.createdAt.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!map[key]) map[key] = { month: key, label, total: 0, completed: 0, pending: 0 };
    map[key].total++;
    if (t.completed) map[key].completed++;
    else map[key].pending++;
  });

  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    result.push(map[key] || { month: key, label, total: 0, completed: 0, pending: 0 });
  }

  res.json(result);
};

// ─────────────────────────────────────────────────────────
// GET /api/tasks/streaks
// ─────────────────────────────────────────────────────────
export const getStreaks = async (req, res) => {
  const uid = req.user._id;

  // Fetch all completed tasks (completedAt) + all created tasks (createdAt)
  const allTasks = await Task.find({ userId: uid })
    .select("completed completedAt createdAt")
    .lean();

  // ── 1. Days user COMPLETED at least one task (use completedAt) ──
  const completedDays = new Set(
    allTasks
      .filter((t) => t.completed && t.completedAt)
      .map((t) => toDateKey(t.completedAt))
  );

  // ── 2. Days user CREATED at least one task ──
  const activeDays = new Set(allTasks.map((t) => toDateKey(t.createdAt)));

  // ── 3. Current streak (consecutive days with ≥1 completed task, ending today or yesterday) ──
  const todayKey     = toDateKey(new Date());
  const yesterdayKey = toDateKey(new Date(Date.now() - 86400000));

  let currentStreak = 0;
  // Start from today; if today has no completions, allow yesterday as start
  let cursor = completedDays.has(todayKey) ? new Date() : new Date(Date.now() - 86400000);
  if (!completedDays.has(toDateKey(cursor))) {
    currentStreak = 0;
  } else {
    while (completedDays.has(toDateKey(cursor))) {
      currentStreak++;
      cursor = new Date(cursor.getTime() - 86400000);
    }
  }

  // ── 4. Longest streak ever ──
  const sortedDays = [...completedDays].sort();
  let longest = 0, run = 0, prevKey = null;
  for (const key of sortedDays) {
    if (prevKey && daysBetween(prevKey, key) === 1) {
      run++;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prevKey = key;
  }

  // ── 5. Last 90 days heatmap ──
  const heatmap = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const dayTasks = allTasks.filter((t) => toDateKey(t.createdAt) === key);
    const doneTasks = dayTasks.filter((t) => t.completed && t.completedAt && toDateKey(t.completedAt) === key);
    heatmap.push({
      date:      key,
      total:     dayTasks.length,
      completed: doneTasks.length,
      // intensity 0-4 for colour depth
      level: doneTasks.length === 0 ? 0
           : doneTasks.length === 1 ? 1
           : doneTasks.length <= 3  ? 2
           : doneTasks.length <= 6  ? 3 : 4,
    });
  }

  // ── 6. Weekly consistency (last 12 weeks: % of days with ≥1 completion) ──
  const weeklyConsistency = [];
  for (let w = 11; w >= 0; w--) {
    let daysWithCompletion = 0;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - w * 7 - 6);
    for (let d = 0; d < 7; d++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + d);
      if (completedDays.has(toDateKey(day))) daysWithCompletion++;
    }
    weeklyConsistency.push({
      week: `W${12 - w}`,
      days: daysWithCompletion,
      pct:  Math.round((daysWithCompletion / 7) * 100),
    });
  }

  // ── 7. Badges ──
  const totalCompleted = allTasks.filter((t) => t.completed).length;
  const badges = [
    { id: "first_task",   icon: "🎯", label: "First Blood",     desc: "Complete your first task",          earned: totalCompleted >= 1 },
    { id: "streak_3",     icon: "🔥", label: "On Fire",         desc: "3-day streak",                      earned: currentStreak >= 3 },
    { id: "streak_7",     icon: "⚡", label: "Week Warrior",    desc: "7-day streak",                      earned: currentStreak >= 7 },
    { id: "streak_14",    icon: "💎", label: "Diamond Grind",   desc: "14-day streak",                     earned: currentStreak >= 14 },
    { id: "streak_30",    icon: "👑", label: "Royalty",         desc: "30-day streak",                     earned: currentStreak >= 30 },
    { id: "tasks_10",     icon: "🏅", label: "Getting Started", desc: "Complete 10 tasks",                 earned: totalCompleted >= 10 },
    { id: "tasks_50",     icon: "🥈", label: "Hustler",         desc: "Complete 50 tasks",                 earned: totalCompleted >= 50 },
    { id: "tasks_100",    icon: "🥇", label: "Century Club",    desc: "Complete 100 tasks",                earned: totalCompleted >= 100 },
    { id: "longest_7",    icon: "🌟", label: "Consistent",      desc: "Longest streak of 7+ days",         earned: longest >= 7 },
    { id: "longest_30",   icon: "🏆", label: "Legend",          desc: "Longest streak of 30+ days",        earned: longest >= 30 },
    { id: "active_30",    icon: "📅", label: "Monthly Grinder", desc: "Active on 30 different days",       earned: activeDays.size >= 30 },
  ];

  res.json({
    currentStreak,
    longestStreak: longest,
    totalActiveDays: activeDays.size,
    totalCompletedDays: completedDays.size,
    totalCompleted,
    heatmap,
    weeklyConsistency,
    badges,
    todayDone: completedDays.has(todayKey),
  });
};
