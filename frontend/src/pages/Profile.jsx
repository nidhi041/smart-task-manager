import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

/* ── helpers ── */
const MOTIVATIONS = [
  { min: 80, icon: "🔥", msg: "You're absolutely on fire. Keep crushing it." },
  { min: 50, icon: "💪", msg: "Solid progress. Push through the finish line." },
  { min: 1,  icon: "🎯", msg: "Every task completed is a victory. Start now." },
  { min: 0,  icon: "🚀", msg: "Your journey begins with the first task." },
];

const Toast = ({ msg, type }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pop-in px-5 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-2xl"
    style={{
      background: type === "success" ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
      border: `1px solid ${type === "success" ? "rgba(52,211,153,0.4)" : "rgba(239,68,68,0.4)"}`,
      color:  type === "success" ? "#34d399" : "#f87171",
      backdropFilter: "blur(16px)",
    }}>
    {type === "success" ? "✅" : "⚠️"} {msg}
  </div>
);

const Field = ({ label, value, onChange, placeholder, type = "text", maxLength, hint }) => (
  <div>
    <div className="flex justify-between items-center mb-1.5">
      <label className="text-xs uppercase tracking-[2px] font-medium" style={{ color: "var(--text-muted)" }}>{label}</label>
      {maxLength && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{value.length}/{maxLength}</span>}
    </div>
    {type === "textarea" ? (
      <textarea
        className="input-field w-full px-4 py-3 rounded-xl text-sm resize-none"
        rows={3} placeholder={placeholder} value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input type={type}
        className="input-field w-full px-4 py-3 rounded-xl text-sm"
        placeholder={placeholder} value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)} />
    )}
    {hint && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{hint}</p>}
  </div>
);

/* ══════════════════════════════════════════════════════════ */
const Profile = () => {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef(null);

  const [stats,   setStats]   = useState({ total: 0, completed: 0, pending: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Edit form state
  const [form, setForm] = useState({ name: "", bio: "", location: "", website: "" });
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile,    setAvatarFile]    = useState(null); // base64 string

  // Password form
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState({ cur: false, nw: false, cf: false });

  // UI state
  const [saving,    setSaving]    = useState(false);
  const [savingPw,  setSavingPw]  = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // profile | security

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Populate form from user context
  useEffect(() => {
    if (user) {
      setForm({
        name:     user.name     || "",
        bio:      user.bio      || "",
        location: user.location || "",
        website:  user.website  || "",
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    api.get("/tasks/stats")
      .then((r) => setStats(r.data))
      .finally(() => setStatsLoading(false));
  }, []);

  /* ── Avatar pick ── */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2_000_000) { showToast("Image must be under 2MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setAvatarFile(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    try {
      await api.put("/auth/avatar", { avatar: avatarFile });
      await refreshUser();
      setAvatarFile(null);
      showToast("Profile photo updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to upload photo", "error");
    } finally { setSavingAvatar(false); }
  };

  /* ── Save profile ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast("Name cannot be empty", "error"); return; }
    setSaving(true);
    try {
      await api.put("/auth/profile", form);
      await refreshUser();
      showToast("Profile updated successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update profile", "error");
    } finally { setSaving(false); }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { showToast("Passwords don't match", "error"); return; }
    if (pwForm.newPassword.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    setSavingPw(true);
    try {
      await api.put("/auth/password", {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      showToast("Password changed successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to change password", "error");
    } finally { setSavingPw(false); }
  };

  const pct        = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const motivation = MOTIVATIONS.find((m) => pct >= m.min) || MOTIVATIONS[3];
  const initials   = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb" style={{ width:500, height:500, background:"radial-gradient(circle,#c9a84c,transparent)", top:-160, right:-160 }} />
      <div className="orb" style={{ width:340, height:340, background:"radial-gradient(circle,#7c3aed,transparent)", bottom:"5%", left:-80 }} />

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <div className="max-w-2xl mx-auto relative z-10 space-y-5">

        {/* ── Hero avatar card ── */}
        <div className="card rounded-3xl p-8 fade-up relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.1), transparent 65%)" }} />

          <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center text-3xl font-black text-black"
                style={{
                  background: avatarPreview ? "transparent" : "linear-gradient(135deg,#c9a84c,#f0d080)",
                  boxShadow: "0 0 0 4px rgba(201,168,76,0.2), 0 0 40px rgba(201,168,76,0.25)",
                }}>
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : initials}
              </div>

              {/* Camera button */}
              <button onClick={() => fileRef.current.click()}
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)", border: "3px solid var(--bg)", boxShadow: "0 4px 12px rgba(201,168,76,0.4)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-black gold-text" style={{ fontFamily: "'Playfair Display',serif" }}>
                {user?.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
              {user?.bio && <p className="text-sm mt-2" style={{ color: "var(--text)" }}>{user.bio}</p>}

              <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                {user?.location && (
                  <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                    📍 {user.location}
                  </span>
                )}
                {user?.website && (
                  <a href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                    target="_blank" rel="noreferrer"
                    className="text-xs flex items-center gap-1 hover:text-yellow-400 transition-colors"
                    style={{ color: "#c9a84c" }}>
                    🔗 {user.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                  📅 Joined {memberSince}
                </span>
              </div>

              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: "#c9a84c" }}>
                ✦ TaskFlow Elite Member
              </div>
            </div>
          </div>

          {/* Save avatar button — only shows when new photo picked */}
          {avatarFile && (
            <div className="mt-5 flex gap-3 justify-center sm:justify-start relative z-10">
              <button onClick={handleSaveAvatar} disabled={savingAvatar}
                className="gold-btn px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-60">
                {savingAvatar
                  ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Uploading...</>
                  : "💾 Save Photo"}
              </button>
              <button onClick={() => { setAvatarPreview(user?.avatar || ""); setAvatarFile(null); }}
                className="px-5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: "var(--surface-bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 fade-up" style={{ animationDelay: "0.08s" }}>
          {[
            { label: "Total",     value: stats.total,     icon: "📋", color: "#c9a84c" },
            { label: "Completed", value: stats.completed, icon: "✅", color: "#34d399" },
            { label: "Pending",   value: stats.pending,   icon: "🔥", color: "#f97316" },
          ].map((s) => (
            <div key={s.label} className="card rounded-2xl p-4 text-center hover-lift relative overflow-hidden group">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 50% 0%, ${s.color}18, transparent 70%)` }} />
              {statsLoading
                ? <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
                : <>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-black gold-text">{s.value}</div>
                    <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{s.label}</div>
                  </>}
            </div>
          ))}
        </div>

        {/* ── Progress ── */}
        {!statsLoading && stats.total > 0 && (
          <div className="card rounded-2xl px-5 py-4 fade-up" style={{ animationDelay: "0.12s" }}>
            <div className="flex justify-between text-xs mb-2">
              <span className="uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Completion Rate</span>
              <span className="font-bold" style={{ color: "#c9a84c" }}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: "var(--surface-bg)" }}>
              <div className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg,#c9a84c,#f0d080)" }} />
            </div>
            <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
              {motivation.icon} {motivation.msg}
            </p>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-2xl fade-up" style={{ background: "var(--surface-bg)", border: "1px solid var(--border)", animationDelay: "0.14s" }}>
          {[
            { key: "profile",  label: "✏️  Edit Profile" },
            { key: "security", label: "🔒  Security" },
          ].map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === t.key ? "gold-btn" : "nav-muted hover:text-yellow-400"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Edit Profile Tab ── */}
        {activeTab === "profile" && (
          <div className="card rounded-3xl p-6 fade-up" style={{ animationDelay: "0.16s" }}>
            <p className="text-xs uppercase tracking-[2px] mb-5 font-semibold" style={{ color: "var(--text-muted)" }}>
              Personal Information
            </p>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })}
                placeholder="Your full name" maxLength={50} />
              <Field label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })}
                placeholder="Tell the world who you are..." type="textarea" maxLength={160}
                hint="Max 160 characters" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })}
                  placeholder="City, Country" maxLength={60} />
                <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })}
                  placeholder="yoursite.com" maxLength={100} />
              </div>

              {/* Read-only email */}
              <div>
                <label className="block text-xs uppercase tracking-[2px] mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>
                  Email Address
                </label>
                <div className="px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                  style={{ background: "var(--surface-bg)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <span>🔒</span> {user?.email}
                  <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>Cannot be changed</span>
                </div>
              </div>

              <button type="submit" disabled={saving}
                className="gold-btn w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {saving
                  ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                  : "Save Changes →"}
              </button>
            </form>
          </div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === "security" && (
          <div className="card rounded-3xl p-6 fade-up" style={{ animationDelay: "0.16s" }}>
            <p className="text-xs uppercase tracking-[2px] mb-5 font-semibold" style={{ color: "var(--text-muted)" }}>
              Change Password
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {[
                { key: "currentPassword", label: "Current Password", showKey: "cur",  ph: "Your current password" },
                { key: "newPassword",     label: "New Password",     showKey: "nw",   ph: "Min. 6 characters" },
                { key: "confirm",         label: "Confirm Password", showKey: "cf",   ph: "Repeat new password" },
              ].map(({ key, label, showKey, ph }) => (
                <div key={key}>
                  <label className="block text-xs uppercase tracking-[2px] mb-1.5 font-medium" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={showPw[showKey] ? "text" : "password"}
                      className="input-field w-full px-4 py-3 pr-11 rounded-xl text-sm"
                      placeholder={ph}
                      value={pwForm[key]}
                      onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                      required />
                    <button type="button"
                      onClick={() => setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm transition-colors"
                      style={{ color: "var(--text-muted)" }}>
                      {showPw[showKey] ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              ))}

              {/* Password strength indicator */}
              {pwForm.newPassword && (
                <div>
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map((i) => {
                      const len = pwForm.newPassword.length;
                      const hasUpper = /[A-Z]/.test(pwForm.newPassword);
                      const hasNum   = /[0-9]/.test(pwForm.newPassword);
                      const hasSpec  = /[^A-Za-z0-9]/.test(pwForm.newPassword);
                      const score = [len >= 6, len >= 10, hasUpper || hasNum, hasSpec].filter(Boolean).length;
                      const colors = ["#f87171","#fbbf24","#c9a84c","#34d399"];
                      return (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                          style={{ background: i <= score ? colors[score - 1] : "var(--surface-bg)" }} />
                      );
                    })}
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {(() => {
                      const len = pwForm.newPassword.length;
                      const hasUpper = /[A-Z]/.test(pwForm.newPassword);
                      const hasNum   = /[0-9]/.test(pwForm.newPassword);
                      const hasSpec  = /[^A-Za-z0-9]/.test(pwForm.newPassword);
                      const score = [len >= 6, len >= 10, hasUpper || hasNum, hasSpec].filter(Boolean).length;
                      return ["Too short","Weak","Fair","Strong","Very strong"][score];
                    })()}
                  </p>
                </div>
              )}

              <button type="submit" disabled={savingPw}
                className="gold-btn w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 mt-2">
                {savingPw
                  ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Updating...</>
                  : "Update Password →"}
              </button>
            </form>

            {/* Security info */}
            <div className="mt-5 p-4 rounded-2xl space-y-2" style={{ background: "var(--surface-bg)", border: "1px solid var(--border)" }}>
              <p className="text-xs uppercase tracking-[2px] font-semibold mb-3" style={{ color: "var(--text-muted)" }}>Account Info</p>
              {[
                { icon: "🔐", label: "Password",      value: "••••••••" },
                { icon: "📅", label: "Member Since",  value: memberSince },
                { icon: "🛡️", label: "Account Status", value: "Active & Secure" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-1">
                  <span className="text-sm flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                    {row.icon} {row.label}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Profile;
