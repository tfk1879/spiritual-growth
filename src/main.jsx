import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Moon, Search, ShieldCheck, Sun, Users } from "lucide-react";
import "../styles.css";
import portraitUrl from "../assets/developer-portrait.jpeg";
import { days, foundationPoints, weekIntros, weekOrder, weekQuotes } from "../guide-data.js";
import {
  auth,
  canAccessPaidStudies,
  getCompletedDays,
  getCurrentUser,
  listUsersForAdmin,
  loginUser,
  logoutUser,
  registerUser,
  saveCompletedDays,
  subscribeToAuth,
  updateUserProfile
} from "./services.js";

const weekSlugs = {
  "Week 1": "week-1.html",
  "Week 2": "week-2.html",
  "Week 3": "week-3.html",
  "Week 4": "week-4.html",
  Bonus: "bonus-week.html"
};

const slugWeeks = {
  "/week-1.html": "Week 1",
  "/week-2.html": "Week 2",
  "/week-3.html": "Week 3",
  "/week-4.html": "Week 4",
  "/bonus-week.html": "Bonus"
};

function currentPath() {
  const path = window.location.pathname;
  return path === "/" ? "/index.html" : path;
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("spiritualGrowthTheme") === "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "";
    localStorage.setItem("spiritualGrowthTheme", dark ? "dark" : "light");
  }, [dark]);

  const label = dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button className="icon-button theme-toggle" type="button" aria-label={label} title={label} onClick={() => setDark((value) => !value)}>
      {dark ? <Sun className="theme-toggle-icon" /> : <Moon className="theme-toggle-icon" />}
    </button>
  );
}

function useCurrentUser() {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let alive = true;
    const unsubscribe = auth
      ? subscribeToAuth(async () => {
          const user = await getCurrentUser();
          if (alive) setState({ loading: false, user });
        })
      : null;

    getCurrentUser().then((user) => {
      if (alive) setState({ loading: false, user });
    });

    return () => {
      alive = false;
      unsubscribe?.();
    };
  }, []);

  return state;
}

function Header({ active = "home", user }) {
  return (
    <header className="site-header">
      <a className="brand" href="index.html" aria-label="Spiritual Growth After New Birth home">
        <span className="brand-mark">SG</span>
        <span>
          <strong>Spiritual Growth</strong>
          <em>After New Birth</em>
        </span>
      </a>

      <nav className="main-nav" aria-label="Main navigation">
        <a aria-current={active === "home" ? "page" : undefined} href="index.html">Home</a>
        <a aria-current={active === "studies" ? "page" : undefined} href="studies.html">Studies</a>
        <a href="index.html#about">About</a>
        <a href="index.html#contact">Contact</a>
        {user?.role === "admin" ? <a aria-current={active === "admin" ? "page" : undefined} href="admin.html">Admin</a> : null}
      </nav>

      <div className="header-actions">
        <ThemeToggle />
        {user ? <a className="button button-secondary" href="dashboard.html">Dashboard</a> : <a className="button button-secondary" href="signup.html">Sign Up</a>}
      </div>
    </header>
  );
}

function HomePage({ user }) {
  return (
    <div className="site-shell">
      <Header active="home" user={user} />
      <main>
        <section className="home-hero">
          <div className="hero-copy">
            <p className="eyebrow">Weekly discipleship for new believers</p>
            <h1>Grow spiritually every week.</h1>
            <p>A clean, guided platform for learning Scripture, building spiritual habits, and taking steady next steps after receiving Christ.</p>
            <div className="hero-actions">
              <a className="button" href="signup.html">Join the Journey</a>
              <a className="button button-secondary" href="studies.html">Explore Weekly Studies</a>
            </div>
          </div>
          <div className="hero-media" aria-label="Spiritual growth guide portrait">
            <img src={portraitUrl} alt="Portrait of the study guide developer" />
          </div>
        </section>

        <section className="section-block" id="about">
          <div className="section-heading">
            <p className="eyebrow">Mission</p>
            <h2>A simple path from new birth to steady growth.</h2>
            <p>This platform keeps the homepage peaceful and focused. Weekly activities live in their own study area, while the entrance explains the purpose and invites people to begin.</p>
          </div>
        </section>

        <section className="feature-band" aria-label="Featured teaching focus">
          <div className="feature-copy">
            <p className="eyebrow">Featured Focus</p>
            <h2>Start with identity before activity.</h2>
            <p>New believers need assurance first: Jesus saves by grace, welcomes us into God's family, and teaches us to grow through the Word, prayer, obedience, and fellowship.</p>
            <a className="text-link" href="week-1.html">Open Week 1: Assurance and Identity</a>
          </div>
          <div className="feature-list">
            {foundationPoints.slice(0, 3).map((item) => (
              <article className="content-card" key={item.title}>
                <p className="eyebrow">Foundation</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-band" id="contact">
          <div>
            <p className="eyebrow">Next Step</p>
            <h2>Join our weekly growth journey.</h2>
            <p>Create an account, open the dashboard, and mark each weekly study as completed.</p>
          </div>
          <a className="button" href="signup.html">Create Account</a>
        </section>
      </main>
    </div>
  );
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      phone: String(form.get("phone") ?? "").trim(),
      decisionType: String(form.get("decisionType") ?? "").trim(),
      occupation: String(form.get("occupation") ?? "").trim(),
      officeAddress: String(form.get("officeAddress") ?? "").trim(),
      homeAddress: String(form.get("homeAddress") ?? "").trim(),
      nearestBusStop: String(form.get("nearestBusStop") ?? "").trim(),
      prayerRequest: String(form.get("prayerRequest") ?? "").trim()
    };

    if (isSignup && payload.name.length < 2) {
      setError("Please enter your full name.");
      setBusy(false);
      return;
    }

    const result = isSignup ? await registerUser(payload) : await loginUser(payload);
    if (!result.ok) {
      setError(result.message);
      setBusy(false);
      return;
    }
    window.location.href = result.user?.role === "admin" ? "admin.html" : "dashboard.html";
  }

  return (
    <main className="auth-layout">
      <section className="auth-panel">
        <div className="auth-topline">
          <a className="brand auth-brand" href="index.html" aria-label="Spiritual Growth home">
            <span className="brand-mark">SG</span>
            <span><strong>Spiritual Growth</strong><em>After New Birth</em></span>
          </a>
          <ThemeToggle />
        </div>
        <div className="auth-heading">
          <p className="eyebrow">{isSignup ? "Sign Up" : "Login"}</p>
          <h1>{isSignup ? "Join the weekly growth journey." : "Welcome back."}</h1>
          <p>{isSignup ? "Create an account to track weekly studies, mark lessons complete, and continue from your dashboard." : "Continue your weekly study journey with your email and password."}</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field-grid">
            {isSignup ? <label><span>Full Name</span><input name="name" type="text" autoComplete="name" required /></label> : null}
            <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
            <label>
              <span>Password</span>
              <span className="password-control">
                <input name="password" type={showPassword ? "text" : "password"} minLength="6" autoComplete={isSignup ? "new-password" : "current-password"} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
              </span>
            </label>
            {isSignup ? (
              <>
                <label><span>Decision</span><select name="decisionType" required><option value="">Select decision</option><option value="accepted-christ">I accept Jesus Christ as my Lord and Saviour</option><option value="rededication">I re-dedicate my life to Jesus Christ</option></select></label>
                <label><span>Phone Number</span><input name="phone" type="tel" autoComplete="tel" required /></label>
                <label><span>Occupation <em>Optional</em></span><input name="occupation" type="text" autoComplete="organization-title" /></label>
                <label><span>Nearest Bus Stop <em>Optional</em></span><input name="nearestBusStop" type="text" /></label>
                <label className="auth-wide-field"><span>Home Address <em>Optional</em></span><input name="homeAddress" type="text" autoComplete="street-address" /></label>
                <label className="auth-wide-field"><span>Office Address <em>Optional</em></span><input name="officeAddress" type="text" /></label>
                <label className="auth-wide-field"><span>Prayer Request <em>Optional</em></span><textarea name="prayerRequest" rows="3" /></label>
              </>
            ) : null}
          </div>
          <p className="form-note">{isSignup ? "Your account helps save study progress and continue from your dashboard." : "Use the email and password from signup."}</p>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button auth-submit" type="submit" disabled={busy}>{busy ? "Please wait..." : isSignup ? "Create Account" : "Login"}</button>
        </form>
        <p className="auth-switch">{isSignup ? "Already have an account? " : "Need an account? "}<a href={isSignup ? "login.html" : "signup.html"}>{isSignup ? "Login" : "Sign up"}</a></p>
        <a className="auth-back-link" href="studies.html">Browse studies first</a>
      </section>
      <aside className="auth-side">
        <div className="auth-side-copy">
          <p className="eyebrow">Membership Desk</p>
          <h2>Learn, complete, and keep growing.</h2>
          <p>A focused registration page helps the platform feel ready for real students: clear fields, calm design, and a direct path into the dashboard.</p>
        </div>
        <div className="auth-benefits" aria-label="Account benefits">
          <article><strong>Track progress</strong><span>See completed lessons from your dashboard.</span></article>
          <article><strong>Study weekly</strong><span>Move through each classroom at a steady pace.</span></article>
          <article><strong>Build consistency</strong><span>Return to Scripture, prayer, and action steps.</span></article>
        </div>
      </aside>
    </main>
  );
}

function StudiesPage({ user }) {
  const [completedDays, setCompletedDays] = useState([]);

  useEffect(() => {
    getCompletedDays().then(setCompletedDays);
  }, [user]);

  return (
    <div className="site-shell">
      <Header active="studies" user={user} />
      <main className="page-stack">
        <section className="page-hero compact-hero">
          <p className="eyebrow">Weekly Studies</p>
          <h1>Choose a classroom and grow one week at a time.</h1>
          <p>Week 1 is free to preview. Create an account to unlock the full weekly journey, track your progress, and prepare for the hardcopy version later.</p>
        </section>
        {!user ? (
          <section className="access-banner">
            <div><p className="eyebrow">Free First Week</p><h2>Start with Week 1, then join to continue.</h2><p>The same gate can later connect to payments, subscriptions, or a hardcopy booking form.</p></div>
            <div className="locked-actions"><a className="button" href="week-1.html">Open Free Week</a><a className="button button-secondary" href="signup.html">Unlock Studies</a></div>
          </section>
        ) : null}
        <section className="studies-grid" aria-label="Weekly study directory">
          {weekOrder.map((week, index) => {
            const entries = days.filter((entry) => entry.week === week);
            const completed = entries.filter((entry) => completedDays.includes(entry.day)).length;
            const locked = week !== "Week 1" && !canAccessPaidStudies(user);
            return (
              <article className={`study-directory-card ${locked ? "is-locked" : ""}`} key={week}>
                <div>
                  <p className="eyebrow">{week === "Week 1" ? "Free Preview" : locked ? "Members Only" : week === "Bonus" ? "Bonus" : `Week ${index + 1}`}</p>
                  <h2>{entries[0]?.theme ?? "Continuation"}</h2>
                  <p>{weekIntros[week]}</p>
                </div>
                <div className="study-meta"><span>{entries.length} lessons</span><span>{completed} completed</span>{locked ? <span>Locked</span> : null}</div>
                {locked ? <div className="locked-actions"><a className="button" href="signup.html">Create Account</a><a className="button button-secondary" href="book.html">View Hardcopy</a></div> : <a className="button button-secondary" href={weekSlugs[week]}>Open {week}</a>}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}

function WeekPage({ weekName, user }) {
  const entries = days.filter((entry) => entry.week === weekName);
  const weekIndex = weekOrder.indexOf(weekName);
  const [completedDays, setCompletedDays] = useState([]);

  useEffect(() => {
    getCompletedDays().then(setCompletedDays);
  }, [user]);

  if (!entries.length) return <NotFound />;
  if (weekName !== "Week 1" && !canAccessPaidStudies(user)) {
    return (
      <div className="site-shell">
        <Header active="studies" user={user} />
        <main className="locked-study-page">
          <section className="locked-study-card">
            <p className="eyebrow">Members Only</p>
            <h1>{weekName} is locked.</h1>
            <p>{entries[0].theme} is part of the full study journey. Week 1 is free, and logged-in users can continue with the remaining studies.</p>
            <div className="locked-actions"><a className="button" href="signup.html">Create Account</a><a className="button button-secondary" href="week-1.html">Read Free Week</a></div>
          </section>
        </main>
      </div>
    );
  }

  const theme = entries[0].theme;
  const stageLabel = weekName === "Bonus" ? "Continuation Study" : `Stage ${weekIndex + 1}`;

  async function toggle(day, checked) {
    const next = checked ? [...new Set([...completedDays, day])] : completedDays.filter((item) => item !== day);
    setCompletedDays(next);
    await saveCompletedDays(next);
  }

  return (
    <div className="site-shell week-study-shell">
      <header className="hero week-study-hero">
        <div className="hero-backdrop" />
        <nav className="site-header study-header">
          <a className="brand" href="index.html"><span className="brand-mark">SG</span><span><strong>Spiritual Growth</strong><em>After New Birth</em></span></a>
          <div className="main-nav">{weekOrder.map((name) => <a key={name} href={weekSlugs[name]} aria-current={name === weekName ? "page" : undefined}>{name}</a>)}</div>
          <div className="header-actions"><ThemeToggle /><a className="button button-secondary" href="studies.html">Studies</a>{user ? <a className="button" href="dashboard.html">Dashboard</a> : <a className="button" href="signup.html">Sign Up</a>}</div>
        </nav>
        <section className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="hero-kicker">{stageLabel}</p>
            <h1>{weekName} Study</h1>
            <p className="hero-text">{weekIntros[weekName]}</p>
            <div className="hero-actions"><a className="button" href="#study-days">Start This Week</a><a className="button button-outline" href="studies.html">Back to Studies</a></div>
          </div>
          <aside className="hero-panel" aria-label={`${weekName} overview`}>
            <p className="panel-label">{weekName}</p>
            <h2>{theme}</h2>
            <p className="panel-text">{weekQuotes[weekName]}</p>
            <div className="hero-panel-list">
              <article><strong>{entries.length} Study Days</strong><p>Read Scripture, pray honestly, and take a clear obedience step each day.</p></article>
              <article><strong>Saved Progress</strong><p>Logged-in users can save completed lessons and continue from the dashboard.</p></article>
            </div>
          </aside>
        </section>
      </header>
      <main className="content-stack">
        <section className="section-block" id="study-days">
          <div className="section-heading split-heading"><div><p className="section-kicker">{stageLabel}</p><h3>{theme}</h3></div><p>Each lesson is kept on this weekly page so new believers can move through the study one stage at a time.</p></div>
          <div className="week-days-grid week-study-grid">
            {entries.map((entry) => (
              <article className="day-card week-study-day" id={`day-${entry.day}`} key={entry.day}>
                <div className="day-card-head"><span className="day-chip">Day {entry.day}</span><a className="day-scripture" href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(entry.scripture)}`} target="_blank" rel="noreferrer">{entry.scripture}</a></div>
                <h5>{entry.title}</h5>
                <label className="completion-check"><input type="checkbox" checked={completedDays.includes(entry.day)} onChange={(event) => toggle(entry.day, event.target.checked)} /><span>Mark as completed</span></label>
                <div className="day-detail"><span>Read + Reflect</span><p>{entry.focus}</p></div>
                <div className="day-detail"><span>Pray</span><p>{entry.prayer}</p></div>
                <div className="day-detail"><span>Act</span><p>{entry.action}</p></div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function DashboardPage({ user }) {
  const [completedDays, setCompletedDays] = useState([]);

  useEffect(() => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }
    getCompletedDays().then(setCompletedDays);
  }, [user]);

  if (!user) return null;
  const percent = Math.round((completedDays.length / days.length) * 100);

  return (
    <div className="site-shell">
      <Header active="dashboard" user={user} />
      <main className="page-stack">
        <section className="dashboard-hero">
          <div><p className="eyebrow">Dashboard</p><h1>Welcome, {user.name}.</h1><p>Track your growth journey and return to the next weekly study.</p></div>
          <div className="completion-meter"><strong>{percent}%</strong><span>{completedDays.length} of {days.length} lessons completed</span></div>
        </section>
        <section className="progress-grid" aria-label="Weekly progress">
          {weekOrder.map((week) => {
            const entries = days.filter((entry) => entry.week === week);
            const completed = entries.filter((entry) => completedDays.includes(entry.day)).length;
            const weekPercent = Math.round((completed / entries.length) * 100);
            return (
              <article className="progress-card" key={week}>
                <div><p className="eyebrow">{week}</p><h3>{entries[0]?.theme ?? "Continuation"}</h3><p>{completed} of {entries.length} lessons completed</p></div>
                <div className="progress-track" aria-label={`${weekPercent}% complete`}><span style={{ width: `${weekPercent}%` }} /></div>
                <a className="text-link" href={weekSlugs[week]}>Continue {week}</a>
              </article>
            );
          })}
        </section>
        <button className="button button-secondary" type="button" onClick={async () => { await logoutUser(); window.location.href = "index.html"; }}>Logout</button>
      </main>
    </div>
  );
}

function AdminPage({ user }) {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [hardcopyFilter, setHardcopyFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") return;
    setLoadingUsers(true);
    listUsersForAdmin()
      .then((items) => setRows(items.sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email)))))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoadingUsers(false));
  }, [user]);

  async function saveUserField(row, field, value) {
    setMessage("");
    setSavingId(row.id);
    const nextRows = rows.map((item) => (item.id === row.id ? { ...item, [field]: value } : item));
    setRows(nextRows);

    try {
      await updateUserProfile(row.id, { [field]: value });
      setMessage(`Saved ${row.name || row.email}.`);
    } catch (error) {
      setRows(rows);
      setMessage(error.message || "Unable to save this user.");
    } finally {
      setSavingId("");
    }
  }

  function exportUsers() {
    const columns = ["name", "email", "phone", "decisionType", "occupation", "homeAddress", "officeAddress", "nearestBusStop", "prayerRequest", "accessPlan", "role", "followUpStatus", "hardcopyStatus", "completedCount", "joinedAt", "adminNotes"];
    const values = filtered.map((row) => ({
      name: row.name || "Student",
      email: row.email || "",
      phone: row.phone || "",
      decisionType: row.decisionType || "",
      occupation: row.occupation || "",
      homeAddress: row.homeAddress || "",
      officeAddress: row.officeAddress || "",
      nearestBusStop: row.nearestBusStop || "",
      prayerRequest: row.prayerRequest || "",
      accessPlan: row.accessPlan || "member",
      role: row.role || "student",
      followUpStatus: row.followUpStatus || "none",
      hardcopyStatus: row.hardcopyStatus || (row.hardcopyInterest ? "interested" : "none"),
      completedCount: row.completedDays?.length ?? 0,
      joinedAt: row.joinedAt || "",
      adminNotes: row.adminNotes || ""
    }));
    const csv = [columns.join(","), ...values.map((row) => columns.map((column) => `"${String(row[column]).replaceAll('"', '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `spiritual-growth-users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const filtered = useMemo(() => rows.filter((row) => {
    const searchText = `${row.name} ${row.email} ${row.phone} ${row.decisionType} ${row.occupation} ${row.homeAddress} ${row.nearestBusStop} ${row.prayerRequest} ${row.role} ${row.accessPlan} ${row.followUpStatus} ${row.hardcopyStatus}`.toLowerCase();
    const hardcopyStatus = row.hardcopyStatus || (row.hardcopyInterest ? "interested" : "none");

    return searchText.includes(query.toLowerCase())
      && (roleFilter === "all" || (row.role || "student") === roleFilter)
      && (accessFilter === "all" || (row.accessPlan || "") === accessFilter)
      && (followUpFilter === "all" || (row.followUpStatus || "none") === followUpFilter)
      && (hardcopyFilter === "all" || hardcopyStatus === hardcopyFilter);
  }), [rows, query, roleFilter, accessFilter, followUpFilter, hardcopyFilter]);
  const completedTotal = rows.reduce((sum, row) => sum + (row.completedDays?.length ?? 0), 0);
  const needsFollowUp = rows.filter((row) => row.followUpStatus === "needed").length;
  const hardcopyLeads = rows.filter((row) => row.hardcopyInterest || row.hardcopyStatus === "interested" || row.hardcopyStatus === "ordered").length;
  const activeStudents = rows.filter((row) => (row.completedDays?.length ?? 0) > 0).length;

  if (!user) return <AuthPage mode="login" />;
  if (user.role !== "admin") {
    return (
      <div className="site-shell">
        <Header user={user} active="admin" />
        <main className="page-stack"><section className="locked-study-card"><p className="eyebrow">Admin</p><h1>Admin access required.</h1><p>Your account does not currently have permission to open this dashboard.</p></section></main>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <Header user={user} active="admin" />
      <main className="page-stack">
        <section className="dashboard-hero">
          <div><p className="eyebrow">Admin Dashboard</p><h1>Monitor students and study activity.</h1><p>Review registered users, access plans, completion totals, and account metadata.</p></div>
          <div className="completion-meter"><ShieldCheck size={32} /><span>Admin</span></div>
        </section>
        <section className="admin-metrics">
          <article className="progress-card"><Users /><strong>{rows.length}</strong><span>Total users</span></article>
          <article className="progress-card"><strong>{completedTotal}</strong><span>Completed lessons marked</span></article>
          <article className="progress-card"><strong>{activeStudents}</strong><span>Active students</span></article>
          <article className="progress-card"><strong>{needsFollowUp}</strong><span>Need follow-up</span></article>
          <article className="progress-card"><strong>{hardcopyLeads}</strong><span>Hardcopy leads</span></article>
          <article className="progress-card"><strong>{rows.filter((row) => row.role === "admin").length}</strong><span>Admins</span></article>
        </section>
        <section className="admin-action-grid" aria-label="Admin quick actions">
          <button type="button" onClick={() => { setFollowUpFilter("needed"); setRoleFilter("all"); setAccessFilter("all"); setHardcopyFilter("all"); }}>
            <strong>Follow up</strong>
            <span>Show students marked as needing care or contact.</span>
          </button>
          <button type="button" onClick={() => { setHardcopyFilter("interested"); setRoleFilter("all"); setAccessFilter("all"); setFollowUpFilter("all"); }}>
            <strong>Hardcopy list</strong>
            <span>Find people interested in printed study materials.</span>
          </button>
          <button type="button" onClick={() => { setRoleFilter("student"); setAccessFilter(""); setFollowUpFilter("all"); setHardcopyFilter("all"); }}>
            <strong>No access</strong>
            <span>Review students who cannot open member studies.</span>
          </button>
          <button type="button" onClick={() => { setRoleFilter("all"); setAccessFilter("all"); setFollowUpFilter("all"); setHardcopyFilter("all"); setQuery(""); }}>
            <strong>All users</strong>
            <span>Clear every filter and return to the full register.</span>
          </button>
        </section>
        <section className="admin-panel">
          <div className="admin-toolbar">
            <label className="admin-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" /></label>
            <button className="button button-secondary" type="button" onClick={exportUsers}>Export CSV</button>
          </div>
          <div className="admin-filters" aria-label="User filters">
            <label><span>Role</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">All roles</option><option value="student">Students</option><option value="admin">Admins</option></select></label>
            <label><span>Access</span><select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}><option value="all">All access</option><option value="">No access</option><option value="member">Member</option><option value="paid">Paid</option><option value="sponsored">Sponsored</option><option value="church-group">Church group</option></select></label>
            <label><span>Follow-up</span><select value={followUpFilter} onChange={(event) => setFollowUpFilter(event.target.value)}><option value="all">All follow-up</option><option value="none">None</option><option value="needed">Needed</option><option value="contacted">Contacted</option><option value="resolved">Resolved</option></select></label>
            <label><span>Hardcopy</span><select value={hardcopyFilter} onChange={(event) => setHardcopyFilter(event.target.value)}><option value="all">All hardcopy</option><option value="none">None</option><option value="interested">Interested</option><option value="ordered">Ordered</option><option value="delivered">Delivered</option></select></label>
          </div>
          {message ? <p className={message.startsWith("Saved") ? "form-success" : "form-error"}>{message}</p> : null}
          <p className="admin-result-count">{loadingUsers ? "Loading users..." : `Showing ${filtered.length} of ${rows.length} users`}</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Contact</th><th>Decision Card</th><th>Status</th><th>Plan</th><th>Role</th><th>Follow-up</th><th>Hardcopy</th><th>Completed</th><th>Notes</th><th>Joined</th></tr></thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.name || "Student"}</strong></td>
                    <td><span>{row.email}</span><small>{row.phone || "No phone"}</small></td>
                    <td>
                      <span>{row.decisionType === "rededication" ? "Re-dedication" : row.decisionType === "accepted-christ" ? "Accepted Christ" : "Not recorded"}</span>
                      <small>{row.occupation || "No occupation"}</small>
                      <small>{row.nearestBusStop || "No bus stop"}</small>
                      {row.prayerRequest ? <small>Prayer: {row.prayerRequest}</small> : null}
                    </td>
                    <td>
                      <span className={`status-pill status-${row.role === "admin" ? "admin" : "student"}`}>{row.role || "student"}</span>
                      <span className={`status-pill status-${row.followUpStatus === "needed" ? "needed" : "quiet"}`}>{row.followUpStatus || "no follow-up"}</span>
                    </td>
                    <td>
                      <select value={row.accessPlan ?? "member"} disabled={savingId === row.id} onChange={(event) => saveUserField(row, "accessPlan", event.target.value)}>
                        <option value="">No access</option>
                        <option value="member">Member</option>
                        <option value="paid">Paid</option>
                        <option value="sponsored">Sponsored</option>
                        <option value="church-group">Church group</option>
                      </select>
                    </td>
                    <td>
                      <select value={row.role || "student"} disabled={savingId === row.id || row.id === user.id} onChange={(event) => saveUserField(row, "role", event.target.value)}>
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select value={row.followUpStatus || "none"} disabled={savingId === row.id} onChange={(event) => saveUserField(row, "followUpStatus", event.target.value)}>
                        <option value="none">None</option>
                        <option value="needed">Needed</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <select value={row.hardcopyStatus || (row.hardcopyInterest ? "interested" : "none")} disabled={savingId === row.id} onChange={(event) => saveUserField(row, "hardcopyStatus", event.target.value)}>
                        <option value="none">None</option>
                        <option value="interested">Interested</option>
                        <option value="ordered">Ordered</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </td>
                    <td><strong>{row.completedDays?.length ?? 0}</strong><small>of {days.length}</small></td>
                    <td>
                      <textarea value={row.adminNotes || ""} disabled={savingId === row.id} rows="2" onChange={(event) => setRows(rows.map((item) => (item.id === row.id ? { ...item, adminNotes: event.target.value } : item)))} onBlur={(event) => saveUserField(row, "adminNotes", event.target.value)} />
                    </td>
                    <td>{row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
                {!loadingUsers && filtered.length === 0 ? (
                  <tr><td colSpan="11"><div className="admin-empty">No users match the current filters.</div></td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function BookPage({ user }) {
  return (
    <div className="site-shell">
      <Header user={user} />
      <main className="page-stack">
        <section className="page-hero compact-hero"><p className="eyebrow">Hardcopy</p><h1>Spiritual Growth After New Birth</h1><p>A book-style path for churches, follow-up classes, and new believers who prefer printed study material.</p></section>
        <section className="studies-grid">{weekOrder.map((week) => <article className="content-card" key={week}><p className="eyebrow">{week}</p><h3>{days.find((day) => day.week === week)?.theme}</h3><p>{weekIntros[week]}</p></article>)}</section>
        <a className="button" href="softcopy.html">Open Softcopy</a>
      </main>
    </div>
  );
}

function SoftcopyPage({ user }) {
  return (
    <div className="site-shell">
      <Header user={user} />
      <main className="page-stack">
        <section className="page-hero compact-hero"><p className="eyebrow">PDF Softcopy</p><h1>Printable 30-day guide.</h1><p>Use your browser print dialog to save or share a clean softcopy.</p><button className="button" type="button" onClick={() => window.print()}>Download as PDF</button></section>
        <section className="week-days-grid">{days.map((entry) => <article className="day-card" key={entry.day}><span className="day-chip">Day {entry.day}</span><h5>{entry.title}</h5><p>{entry.scripture}</p><p>{entry.focus}</p></article>)}</section>
      </main>
    </div>
  );
}

function NotFound() {
  return <div className="site-shell"><main className="week-study-error"><p className="section-kicker">Page</p><h1>Page not found</h1><p>This page could not be found.</p><a className="button" href="index.html">Back Home</a></main></div>;
}

function App() {
  const { loading, user } = useCurrentUser();
  const path = currentPath();

  if (loading) return <div className="site-shell"><main className="week-study-error"><p className="section-kicker">Loading</p><h1>Preparing your study space...</h1></main></div>;
  if (path === "/login.html") return <AuthPage mode="login" />;
  if (path === "/signup.html") return <AuthPage mode="signup" />;
  if (path === "/studies.html") return <StudiesPage user={user} />;
  if (path === "/dashboard.html") return <DashboardPage user={user} />;
  if (path === "/admin.html") return <AdminPage user={user} />;
  if (path === "/book.html") return <BookPage user={user} />;
  if (path === "/softcopy.html") return <SoftcopyPage user={user} />;
  if (slugWeeks[path]) return <WeekPage weekName={slugWeeks[path]} user={user} />;
  if (path === "/index.html") return <HomePage user={user} />;
  return <NotFound />;
}

createRoot(document.getElementById("root")).render(<App />);
