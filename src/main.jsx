import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BookOpen, Building2, Calendar, Heart, MapPin, Moon, Search, ShieldCheck, Sun, UserCheck, Users } from "lucide-react";
import "../styles.css";
import portraitUrl from "../assets/developer-portrait.jpeg";
import { days, foundationPoints, weekIntros, weekOrder, weekQuotes } from "../guide-data.js";
import { ondoProvinces } from "./provinces.js";
import {
  auth,
  canAccessPaidStudies,
  canUseAdminTools,
  createAdminInvitation,
  createProvince,
  decideAdminRequest,
  deleteProvince,
  ensureDefaultOndoProvinces,
  getCompletedDays,
  getAdminInvitation,
  getCurrentUser,
  isSuperAdmin,
  listAdminRequests,
  listProvinces,
  listUsersForAdmin,
  loginUser,
  logoutUser,
  registerUser,
  saveCompletedDays,
  subscribeToAuth,
  updateProvince,
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

const dailyWords = [
  { text: "The Lord is my shepherd; I shall not want.", reference: "Psalm 23:1" },
  { text: "Therefore if any man be in Christ, he is a new creature.", reference: "2 Corinthians 5:17" },
  { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13" },
  { text: "For I know the plans I have for you, declares the Lord.", reference: "Jeremiah 29:11" }
];

const scriptureCards = [
  { text: "For I know the plans I have for you, declares the Lord.", reference: "Jeremiah 29:11" },
  { text: "Therefore if any man be in Christ, he is a new creature.", reference: "2 Corinthians 5:17" },
  { text: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13" }
];

const growthSteps = ["Accept Christ", "Register & Join Community", "Meet Your Follow-up Mentor", "Attend Bible Classes", "Join a Service Unit", "Grow Spiritually", "Impact Others"];

const platformFeatures = [
  { icon: UserCheck, title: "Convert Registration", text: "Welcome new believers into a guided growth journey." },
  { icon: Heart, title: "Follow-Up Tracking", text: "Keep prayer, calls, visits, and mentorship visible." },
  { icon: Building2, title: "Province Management", text: "Connect every convert to the right province family." },
  { icon: BookOpen, title: "Bible Study Resources", text: "Give beginners a steady path through Scripture." },
  { icon: Users, title: "Spiritual Mentorship", text: "Help workers walk closely with every new believer." },
  { icon: Calendar, title: "Event Notifications", text: "Surface classes, services, and province programs." }
];

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
        {canUseAdminTools(user) ? <a aria-current={active === "admin" ? "page" : undefined} href="admin.html">Admin</a> : null}
      </nav>

      <div className="header-actions">
        <ThemeToggle />
        {user ? <a className="button button-secondary" href="dashboard.html">Dashboard</a> : <a className="button button-secondary" href="signup.html">Sign Up</a>}
      </div>
    </header>
  );
}

function HomePage({ user }) {
  const word = dailyWords[new Date().getDate() % dailyWords.length];

  return (
    <div className="site-shell">
      <Header active="home" user={user} />
      <main className="home-redesign">
        <section className="home-hero-v2">
          <img className="home-hero-bg" src={portraitUrl} alt="Warm Christian welcome atmosphere" />
          <div className="home-hero-overlay" />
          <div className="home-hero-content">
            <p className="hero-faith-pill">Hope • Growth • Salvation • Community • Purpose</p>
            <div className="hero-title-stack">
              <h1>Welcome Home.</h1>
              <h2>A place to grow in Christ, discover purpose, and transform your life.</h2>
            </div>
            <p className="hero-lead">Join a growing Christian community designed to help new believers grow spiritually, connect deeply, and walk confidently with God.</p>
            <div className="hero-actions">
              <a className="button" href="signup.html">Get Started</a>
              <a className="button button-light" href="#provinces">Join a Province</a>
              <a className="button button-outline" href="signup.html">Become a Worker</a>
            </div>
          </div>
          <aside className="daily-word-card" aria-label="Daily scripture">
            <span>Today's Word</span>
            <strong>“{word.text}”</strong>
            <em>— {word.reference}</em>
          </aside>
        </section>

        <section className="scripture-section" aria-label="Scripture inspiration">
          {scriptureCards.map((item, index) => (
            <article className="scripture-card" style={{ "--delay": `${index * 120}ms` }} key={item.reference}>
              <BookOpen size={22} />
              <p>“{item.text}”</p>
              <strong>— {item.reference}</strong>
            </article>
          ))}
        </section>

        <section className="new-life-section" id="about">
          <div className="new-life-copy">
            <p className="eyebrow">New Life in Christ</p>
            <h2>Your journey with Christ begins here.</h2>
            <p>No matter your past, God's grace is available for you. This platform was created to help you grow spiritually, build meaningful relationships, and discover your God-given purpose.</p>
            <p>You are not here by accident. God is calling you into a life of purpose, peace, and transformation.</p>
          </div>
          <div className="new-life-visual">
            <img src={portraitUrl} alt="Spiritual growth guide" />
            <div><strong>Faith grows best in community.</strong><span>Start your journey today.</span></div>
          </div>
        </section>

        <section className="province-section" id="provinces">
          <div className="section-heading split-heading">
            <div><p className="eyebrow">Province Connection</p><h2>Find a spiritual family near you.</h2></div>
            <a className="text-link" href="signup.html">Create Account</a>
          </div>
          <div className="province-home-grid">
            {ondoProvinces.map((province) => (
              <article className="province-home-card" key={province.id}>
                <MapPin size={22} />
                <h3>{province.provinceName}</h3>
                <p>{province.provinceLeader}</p>
                <div><span>{province.status} province</span><span>{province.event}</span></div>
                <a className="button button-secondary" href={province.href}>Join Province</a>
              </article>
            ))}
          </div>
        </section>

        <section className="growth-path-section">
          <div className="section-heading">
            <p className="eyebrow">Beginner Growth Path</p>
            <h2>Every great testimony begins with one encounter with God.</h2>
          </div>
          <div className="growth-timeline">
            {growthSteps.map((step, index) => (
              <article key={step}>
                <span>{index + 1}</span>
                <strong>{step}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="community-section">
          <article>
            <p className="eyebrow">Testimony</p>
            <h3>“This platform helped me reconnect with God and find a spiritual family.”</h3>
            <span>— Esther A.</span>
          </article>
          <article>
            <p className="eyebrow">Prayer Wall</p>
            <h3>Prayer requests are followed up with care, encouragement, and Scripture.</h3>
            <span>Mentors and workers stay connected.</span>
          </article>
          <article>
            <p className="eyebrow">Upcoming</p>
            <h3>New believers class, workers forum, and province fellowship updates.</h3>
            <span>Built for community rhythm.</span>
          </article>
        </section>

        <section className="features-section">
          <div className="section-heading">
            <p className="eyebrow">Platform Features</p>
            <h2>Designed for salvation, growth, and follow-up.</h2>
          </div>
          <div className="features-home-grid">
            {platformFeatures.map(({ icon: Icon, title, text }) => (
              <article className="feature-home-card" key={title}>
                <Icon size={24} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <footer className="home-footer" id="contact">
          <div>
            <p className="eyebrow">Spiritual Growth</p>
            <h2>Welcomed. Inspired. Hopeful. Connected.</h2>
            <p>Faith grows best in community. Start your journey today.</p>
          </div>
          <nav aria-label="Footer links">
            <a href="studies.html">Studies</a>
            <a href="signup.html">Create Account</a>
            <a href="login.html">Login</a>
            <a href="book.html">Hardcopy</a>
          </nav>
        </footer>
      </main>
    </div>
  );
}

function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [invitation, setInvitation] = useState(null);
  const [accountType, setAccountType] = useState("member");
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const invitationToken = isSignup ? new URLSearchParams(window.location.search).get("invite") || "" : "";
  const requestedProvinceId = isSignup ? new URLSearchParams(window.location.search).get("province") || "" : "";
  const selectedProvince = provinces.find((province) => province.id === selectedProvinceId);
  const requestsAdminAccess = ["province-admin", "assistant-admin"].includes(accountType) || Boolean(invitation);

  useEffect(() => {
    if (!isSignup) return;
    listProvinces({ activeOnly: true }).then((items) => {
      setProvinces(items);
      if (requestedProvinceId && items.some((province) => province.id === requestedProvinceId)) {
        setSelectedProvinceId(requestedProvinceId);
      }
    }).catch(() => setProvinces([]));
  }, [isSignup, requestedProvinceId]);

  useEffect(() => {
    if (!invitationToken) return;
    getAdminInvitation(invitationToken)
      .then((invite) => {
        setInvitation(invite);
        if (!invite || invite.status !== "pending") setError("This admin invitation is no longer available.");
      })
      .catch(() => setError("Unable to load this admin invitation."));
  }, [invitationToken]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      accountType,
      invitationToken,
      username: String(form.get("username") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      decisionType: String(form.get("decisionType") ?? "").trim(),
      gender: String(form.get("gender") ?? "").trim(),
      state: String(form.get("state") ?? "").trim(),
      provinceId: String(form.get("provinceId") ?? "").trim(),
      parish: String(form.get("parish") ?? "").trim(),
      conversionDate: String(form.get("conversionDate") ?? "").trim(),
      invitedBy: String(form.get("invitedBy") ?? "").trim(),
      baptismStatus: String(form.get("baptismStatus") ?? "").trim(),
      workerAssigned: String(form.get("workerAssigned") ?? "").trim(),
      requestedRole: String(form.get("requestedRole") ?? accountType).trim(),
      ministryPosition: String(form.get("ministryPosition") ?? "").trim(),
      yearsOfService: String(form.get("yearsOfService") ?? "").trim(),
      idCardFileName: form.get("idCard")?.name || "",
      passportPhotoFileName: form.get("passportPhoto")?.name || "",
      recommendationLetterFileName: form.get("recommendationLetter")?.name || "",
      occupation: String(form.get("occupation") ?? "").trim(),
      officeAddress: String(form.get("officeAddress") ?? "").trim(),
      homeAddress: String(form.get("homeAddress") ?? "").trim(),
      nearestBusStop: String(form.get("nearestBusStop") ?? "").trim(),
      prayerRequest: String(form.get("prayerRequest") ?? "").trim()
    };
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (isSignup && payload.name.length < 2) {
      setError("Please enter your full name.");
      setBusy(false);
      return;
    }

    if (isSignup && payload.password !== confirmPassword) {
      setError("Passwords do not match.");
      setBusy(false);
      return;
    }

    if (isSignup && !invitation && (requestsAdminAccess || provinces.length > 0) && !payload.provinceId) {
      setError("Please select your province.");
      setBusy(false);
      return;
    }

    if (isSignup && requestsAdminAccess && (!payload.username || !payload.ministryPosition || !payload.yearsOfService || !payload.idCardFileName || !payload.passportPhotoFileName)) {
      setError("Please complete the province admin verification fields.");
      setBusy(false);
      return;
    }

    if (isSignup && invitation && payload.email.toLowerCase() !== String(invitation.email).toLowerCase()) {
      setError("Use the email address that received this admin invitation.");
      setBusy(false);
      return;
    }

    const result = isSignup ? await registerUser(payload) : await loginUser(payload);
    if (!result.ok) {
      setError(result.message);
      setBusy(false);
      return;
    }
    window.location.href = canUseAdminTools(result.user) ? "admin.html" : "dashboard.html";
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
          <h1>{invitation ? "Activate your province admin account." : isSignup ? "Join the weekly growth journey." : "Welcome back."}</h1>
          <p>{invitation ? `You have been invited as ${invitation.roleType?.replaceAll("-", " ")}. Create your password to open the province dashboard.` : isSignup ? "Create an account to track weekly studies, mark lessons complete, and continue from your dashboard." : "Continue your weekly study journey with your email and password."}</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <div className="auth-field-grid">
            {isSignup && !invitation ? (
              <label className="auth-wide-field">
                <span>Account Type</span>
                <select value={accountType} onChange={(event) => setAccountType(event.target.value)} required>
                  <option value="member">Member</option>
                  <option value="worker">Worker</option>
                  <option value="province-admin">Province Admin</option>
                  <option value="assistant-admin">Assistant Admin</option>
                </select>
              </label>
            ) : null}
            {isSignup ? <label><span>Full Name</span><input name="name" type="text" autoComplete="name" defaultValue={invitation?.fullName || ""} readOnly={Boolean(invitation)} required /></label> : null}
            <label><span>Email</span><input name="email" type="email" autoComplete="email" defaultValue={invitation?.email || ""} readOnly={Boolean(invitation)} required /></label>
            <label>
              <span>Password</span>
              <span className="password-control">
                <input name="password" type={showPassword ? "text" : "password"} minLength="6" autoComplete={isSignup ? "new-password" : "current-password"} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button>
              </span>
            </label>
            {isSignup ? <label><span>Confirm Password</span><input name="confirmPassword" type={showPassword ? "text" : "password"} minLength="6" autoComplete="new-password" required /></label> : null}
            {isSignup ? (
              <>
                {requestsAdminAccess ? <label><span>Username</span><input name="username" type="text" defaultValue={invitation?.username || ""} readOnly={Boolean(invitation)} required /></label> : <label><span>Decision</span><select name="decisionType" required><option value="">Select decision</option><option value="accepted-christ">I accept Jesus Christ as my Lord and Saviour</option><option value="rededication">I re-dedicate my life to Jesus Christ</option></select></label>}
                <label><span>Phone Number</span><input name="phone" type="tel" autoComplete="tel" defaultValue={invitation?.phone || ""} required /></label>
                <label><span>Gender</span><select name="gender" defaultValue={invitation?.gender || ""} required><option value="">Select gender</option><option value="female">Female</option><option value="male">Male</option></select></label>
                {invitation ? <input name="provinceId" type="hidden" value={invitation.provinceId || ""} /> : <label><span>Province</span><select name="provinceId" value={selectedProvinceId} onChange={(event) => setSelectedProvinceId(event.target.value)} required={provinces.length > 0}><option value="">{provinces.length ? "Select province" : "No province yet"}</option>{provinces.map((province) => <option value={province.id} key={province.id}>{province.provinceName}</option>)}</select></label>}
                {requestsAdminAccess ? <label><span>Province Code</span><input name="state" value={selectedProvince?.provinceCode || ""} readOnly required /></label> : <label><span>State</span><input name="state" type="text" autoComplete="address-level1" required /></label>}
                {requestsAdminAccess ? <label><span>Province Location</span><input name="parish" value={selectedProvince?.stateRegion || ""} readOnly required /></label> : <label><span>Parish/Branch</span><input name="parish" type="text" required /></label>}
                {requestsAdminAccess ? <label><span>Position/Role</span><input name="ministryPosition" type="text" required /></label> : <label><span>Date of Conversion</span><input name="conversionDate" type="date" /></label>}
                {requestsAdminAccess ? <label><span>Requested Role</span><select name="requestedRole" defaultValue={accountType}><option value="province-admin">Province Admin</option><option value="assistant-admin">Assistant Admin</option></select></label> : <label><span>Baptism Status</span><select name="baptismStatus"><option value="not-recorded">Not recorded</option><option value="not-baptized">Not baptized</option><option value="scheduled">Scheduled</option><option value="baptized">Baptized</option></select></label>}
                {requestsAdminAccess ? <label><span>Parish/Branch</span><input name="officeAddress" type="text" required /></label> : <label><span>Invited By <em>Optional</em></span><input name="invitedBy" type="text" /></label>}
                {requestsAdminAccess ? <label><span>Years of Service</span><input name="yearsOfService" type="number" min="0" required /></label> : <label><span>Worker Assigned <em>Optional</em></span><input name="workerAssigned" type="text" /></label>}
                {requestsAdminAccess ? <label><span>ID Card Upload</span><input name="idCard" type="file" accept="image/*,.pdf" required /></label> : null}
                {requestsAdminAccess ? <label><span>Passport Photograph</span><input name="passportPhoto" type="file" accept="image/*" required /></label> : null}
                {requestsAdminAccess ? <label className="auth-wide-field"><span>Recommendation Letter <em>Optional</em></span><input name="recommendationLetter" type="file" accept="image/*,.pdf,.doc,.docx" /></label> : null}
                <label><span>Occupation <em>Optional</em></span><input name="occupation" type="text" autoComplete="organization-title" /></label>
                <label><span>Nearest Bus Stop <em>Optional</em></span><input name="nearestBusStop" type="text" /></label>
                <label className="auth-wide-field"><span>Home Address <em>Optional</em></span><input name="homeAddress" type="text" autoComplete="street-address" /></label>
                {!requestsAdminAccess ? <label className="auth-wide-field"><span>Office Address <em>Optional</em></span><input name="officeAddress" type="text" /></label> : null}
                <label className="auth-wide-field"><span>Prayer Request <em>Optional</em></span><textarea name="prayerRequest" rows="3" /></label>
              </>
            ) : null}
          </div>
          <p className="form-note">{isSignup && requestsAdminAccess ? "Admin access remains pending until a Super Admin reviews and approves your request." : isSignup ? "Your account helps save study progress and continue from your dashboard." : "Use the email and password from signup."}</p>
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
  const [provinces, setProvinces] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [followUpFilter, setFollowUpFilter] = useState("all");
  const [hardcopyFilter, setHardcopyFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState("");
  const [editingProvinceId, setEditingProvinceId] = useState("");
  const [setupWizardOpen, setSetupWizardOpen] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [setupComplete, setSetupComplete] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (!canUseAdminTools(user)) return;
    setLoadingUsers(true);
    listUsersForAdmin(user)
      .then((items) => setRows(items.sort((a, b) => String(a.name || a.email).localeCompare(String(b.name || b.email)))))
      .catch((error) => setMessage(error.message))
      .finally(() => setLoadingUsers(false));
  }, [user]);

  useEffect(() => {
    if (!user || !canUseAdminTools(user)) return;
    listProvinces({ includeDefaults: !isSuperAdmin(user) }).then(setProvinces).catch((error) => setMessage(error.message));
  }, [user]);

  useEffect(() => {
    if (!user || !isSuperAdmin(user)) return;
    listAdminRequests().then(setAdminRequests).catch((error) => setMessage(error.message));
  }, [user]);

  const provinceById = useMemo(() => Object.fromEntries(provinces.map((province) => [province.id, province])), [provinces]);

  async function reloadProvinces() {
    setProvinces(await listProvinces({ includeDefaults: !isSuperAdmin(user) }));
  }

  async function addOndoProvinces() {
    if (!isSuperAdmin(user)) return;
    setMessage("");
    try {
      setProvinces(await ensureDefaultOndoProvinces());
      setMessage("Ondo provinces added to the province register.");
    } catch (error) {
      setMessage(error.message || "Unable to add Ondo provinces.");
    }
  }

  async function completeFirstProvinceSetup(event) {
    event.preventDefault();
    if (!isSuperAdmin(user)) return;
    setMessage("");
    setSavingId("first-province-setup");
    const form = new FormData(event.currentTarget);
    const provincePayload = {
      provinceName: String(form.get("provinceName") ?? "").trim(),
      provinceCode: String(form.get("provinceCode") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      stateRegion: String(form.get("stateRegion") ?? "").trim(),
      provinceEmail: String(form.get("provinceEmail") ?? "").trim(),
      provincePhone: String(form.get("provincePhone") ?? "").trim(),
      provinceLeader: String(form.get("provinceLeader") ?? "").trim(),
      contactInfo: String(form.get("provincePhone") ?? "").trim(),
      status: "active"
    };
    const adminPayload = {
      fullName: String(form.get("adminName") ?? "").trim(),
      email: String(form.get("adminEmail") ?? "").trim(),
      phone: String(form.get("adminPhone") ?? "").trim(),
      username: String(form.get("adminUsername") ?? "").trim(),
      temporaryPassword: String(form.get("adminPassword") ?? "").trim(),
      roleType: String(form.get("roleType") ?? "province-admin"),
      accessLevel: "standard",
      accountStatus: "pending-verification"
    };

    if (Object.values(provincePayload).some((value) => !value) || !adminPayload.fullName || !adminPayload.email || !adminPayload.phone || !adminPayload.username || adminPayload.temporaryPassword.length < 6) {
      setMessage("Complete all required province and admin setup fields.");
      setSavingId("");
      return;
    }

    try {
      const province = await createProvince(provincePayload);
      await createAdminInvitation({ ...adminPayload, provinceId: province.id }, user);
      await reloadProvinces();
      setSetupStep(4);
      setSetupComplete(true);
      setMessage("Province created successfully. Province admin invitation prepared.");
      setTimeout(() => setSetupWizardOpen(false), 1400);
    } catch (error) {
      setMessage(error.message || "Unable to complete first province setup.");
    } finally {
      setSavingId("");
    }
  }

  async function reloadAdminRequests() {
    if (isSuperAdmin(user)) setAdminRequests(await listAdminRequests());
  }

  async function saveProvince(event) {
    event.preventDefault();
    if (!isSuperAdmin(user)) return;
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      provinceName: String(form.get("provinceName") ?? "").trim(),
      provinceCode: String(form.get("provinceCode") ?? "").trim(),
      address: String(form.get("address") ?? "").trim(),
      stateRegion: String(form.get("stateRegion") ?? "").trim(),
      provinceEmail: String(form.get("provinceEmail") ?? "").trim(),
      provincePhone: String(form.get("provincePhone") ?? "").trim(),
      provinceLeader: String(form.get("provinceLeader") ?? "").trim(),
      contactInfo: String(form.get("contactInfo") ?? "").trim(),
      status: String(form.get("status") ?? "active")
    };

    if (!payload.provinceName || !payload.provinceCode || !payload.stateRegion || !payload.address || !payload.provinceEmail || !payload.provincePhone) {
      setMessage("Province name, code, state, address, email, and phone are required.");
      return;
    }

    try {
      if (editingProvinceId) {
        await updateProvince(editingProvinceId, payload);
        setMessage("Province updated.");
      } else {
        await createProvince(payload);
        event.currentTarget.reset();
        setMessage("Province created.");
      }
      setEditingProvinceId("");
      await reloadProvinces();
    } catch (error) {
      setMessage(error.message || "Unable to save province.");
    }
  }

  async function removeProvince(provinceId) {
    if (!isSuperAdmin(user)) return;
    if (!window.confirm("Delete this province? Converts assigned to it will keep the old province id until transferred.")) return;
    setMessage("");
    try {
      await deleteProvince(provinceId);
      setMessage("Province deleted.");
      await reloadProvinces();
    } catch (error) {
      setMessage(error.message || "Unable to delete province.");
    }
  }

  async function reviewAdminRequest(request, decision) {
    if (!isSuperAdmin(user)) return;
    setSavingId(request.id);
    setMessage("");
    try {
      await decideAdminRequest(request, decision, user);
      setRows(rows.map((row) => (row.id === request.id ? { ...row, accountStatus: decision, role: request.requestedRole, provinceId: request.provinceId } : row)));
      await reloadAdminRequests();
      setMessage(`${request.fullName || request.email} ${decision}.`);
    } catch (error) {
      setMessage(error.message || "Unable to update this admin request.");
    } finally {
      setSavingId("");
    }
  }

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
    const columns = ["name", "email", "phone", "gender", "decisionType", "province", "state", "parish", "conversionDate", "invitedBy", "baptismStatus", "workerAssigned", "occupation", "homeAddress", "officeAddress", "nearestBusStop", "prayerRequest", "accessPlan", "role", "followUpStatus", "hardcopyStatus", "completedCount", "joinedAt", "adminNotes"];
    const values = filtered.map((row) => ({
      name: row.name || "Student",
      email: row.email || "",
      phone: row.phone || "",
      gender: row.gender || "",
      decisionType: row.decisionType || "",
      province: provinceById[row.provinceId]?.provinceName || "",
      state: row.state || "",
      parish: row.parish || "",
      conversionDate: row.conversionDate || "",
      invitedBy: row.invitedBy || "",
      baptismStatus: row.baptismStatus || "",
      workerAssigned: row.workerAssigned || "",
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
    const searchText = `${row.name} ${row.email} ${row.phone} ${row.gender} ${row.decisionType} ${provinceById[row.provinceId]?.provinceName} ${row.state} ${row.parish} ${row.invitedBy} ${row.workerAssigned} ${row.occupation} ${row.homeAddress} ${row.nearestBusStop} ${row.prayerRequest} ${row.role} ${row.accessPlan} ${row.followUpStatus} ${row.hardcopyStatus}`.toLowerCase();
    const hardcopyStatus = row.hardcopyStatus || (row.hardcopyInterest ? "interested" : "none");

    return searchText.includes(query.toLowerCase())
      && (roleFilter === "all" || (row.role || "student") === roleFilter)
      && (accessFilter === "all" || (row.accessPlan || "") === accessFilter)
      && (provinceFilter === "all" || (row.provinceId || "") === provinceFilter)
      && (followUpFilter === "all" || (row.followUpStatus || "none") === followUpFilter)
      && (hardcopyFilter === "all" || hardcopyStatus === hardcopyFilter);
  }), [rows, query, roleFilter, accessFilter, provinceFilter, followUpFilter, hardcopyFilter, provinceById]);
  const completedTotal = rows.reduce((sum, row) => sum + (row.completedDays?.length ?? 0), 0);
  const needsFollowUp = rows.filter((row) => row.followUpStatus === "needed").length;
  const activeStudents = rows.filter((row) => (row.completedDays?.length ?? 0) > 0).length;
  const selectedProvince = provinces.find((province) => province.id === editingProvinceId);

  if (!user) return <AuthPage mode="login" />;
  if (!canUseAdminTools(user)) {
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
          <div>
            <p className="eyebrow">{isSuperAdmin(user) ? "Super Admin Dashboard" : "Province Dashboard"}</p>
            <h1>{isSuperAdmin(user) ? "Monitor provinces and converts." : "Manage your province converts."}</h1>
            <p>{isSuperAdmin(user) ? "Create provinces, assign province admins, transfer converts, and review platform-wide activity." : "Register follow-up details, assign workers, and report on converts in your assigned province."}</p>
          </div>
          <div className="completion-meter"><ShieldCheck size={32} /><span>{isSuperAdmin(user) ? "Super Admin" : provinceById[user.provinceId]?.provinceName || "Province Admin"}</span></div>
        </section>
        <section className="admin-metrics">
          <article className="progress-card"><Building2 /><strong>{isSuperAdmin(user) ? provinces.length : 1}</strong><span>{isSuperAdmin(user) ? "Total provinces" : "Assigned province"}</span></article>
          <article className="progress-card"><Users /><strong>{rows.length}</strong><span>Total converts</span></article>
          <article className="progress-card"><strong>{completedTotal}</strong><span>Completed lessons marked</span></article>
          <article className="progress-card"><strong>{activeStudents}</strong><span>Active students</span></article>
          <article className="progress-card"><strong>{needsFollowUp}</strong><span>Need follow-up</span></article>
          <article className="progress-card"><strong>{rows.filter((row) => row.role === "province-admin").length}</strong><span>Province admins</span></article>
        </section>
        <section className="admin-action-grid" aria-label="Admin quick actions">
          <button type="button" onClick={() => { setFollowUpFilter("needed"); setRoleFilter("all"); setAccessFilter("all"); setProvinceFilter("all"); setHardcopyFilter("all"); }}>
            <strong>Follow up</strong>
            <span>Show students marked as needing care or contact.</span>
          </button>
          <button type="button" onClick={() => { setRoleFilter("province-admin"); setAccessFilter("all"); setFollowUpFilter("all"); setProvinceFilter("all"); setHardcopyFilter("all"); }}>
            <strong>Province admins</strong>
            <span>Review people assigned to administer province records.</span>
          </button>
          <button type="button" onClick={() => { setRoleFilter("student"); setAccessFilter(""); setFollowUpFilter("all"); setProvinceFilter("all"); setHardcopyFilter("all"); }}>
            <strong>No access</strong>
            <span>Review students who cannot open member studies.</span>
          </button>
          <button type="button" onClick={() => { setRoleFilter("all"); setAccessFilter("all"); setProvinceFilter("all"); setFollowUpFilter("all"); setHardcopyFilter("all"); setQuery(""); }}>
            <strong>All converts</strong>
            <span>Clear every filter and return to the full register.</span>
          </button>
        </section>
        {isSuperAdmin(user) ? (
          <section className="admin-panel province-panel">
            <div className="admin-section-heading">
              <div><p className="eyebrow">Province Management</p><h2>Create and assign provinces.</h2></div>
              <div className="province-card-actions">
                <button type="button" onClick={addOndoProvinces}>Add Ondo Provinces</button>
                {editingProvinceId ? <button type="button" onClick={() => setEditingProvinceId("")}>New Province</button> : null}
              </div>
            </div>
            {provinces.length === 0 && !setupWizardOpen ? (
              <section className="province-empty-state">
                <div className="province-empty-illustration" aria-hidden="true"><Building2 size={42} /><span /></div>
                <p className="eyebrow">Start Building Your Ministry Network</p>
                <h2>Welcome to Province Management</h2>
                <p>No provinces have been created yet. Create your first province to begin onboarding admins, registering new converts, and managing church activities across regions.</p>
                <p>Your ministry structure begins here. Set up your first province and empower leaders to manage spiritual growth, follow-up, and community engagement effectively.</p>
                <div className="province-empty-actions">
                  <button className="button" type="button" onClick={() => { setSetupWizardOpen(true); setSetupStep(1); setSetupComplete(false); }}>Create First Province</button>
                  <button className="button button-secondary" type="button" onClick={addOndoProvinces}>Use Ondo Province Templates</button>
                </div>
              </section>
            ) : setupWizardOpen ? (
              <form className="province-setup-wizard" onSubmit={completeFirstProvinceSetup}>
                <div className="setup-progress" aria-label="Province setup progress">
                  {["Province Information", "Province Admin Setup", "Assign Permissions", "Complete Setup"].map((label, index) => (
                    <button className={setupStep === index + 1 ? "is-active" : setupComplete && index + 1 < 4 ? "is-done" : ""} type="button" onClick={() => setSetupStep(index + 1)} key={label}>
                      <span>{index + 1}</span>
                      <strong>{label}</strong>
                    </button>
                  ))}
                </div>
                <div className={`province-form wizard-step ${setupStep === 1 ? "" : "is-hidden"}`}>
                    <label><span>Province Name</span><input name="provinceName" required /></label>
                    <label><span>Province Code</span><input name="provinceCode" required /></label>
                    <label><span>Province Address</span><input name="address" required /></label>
                    <label><span>State/Region</span><input name="stateRegion" required /></label>
                    <label><span>Province Pastor Name</span><input name="provinceLeader" required /></label>
                    <label><span>Contact Number</span><input name="provincePhone" type="tel" required /></label>
                    <label><span>Email Address</span><input name="provinceEmail" type="email" required /></label>
                </div>
                <div className={`province-form wizard-step ${setupStep === 2 ? "" : "is-hidden"}`}>
                    <label><span>Full Name</span><input name="adminName" required /></label>
                    <label><span>Email</span><input name="adminEmail" type="email" required /></label>
                    <label><span>Phone Number</span><input name="adminPhone" type="tel" required /></label>
                    <label><span>Username</span><input name="adminUsername" required /></label>
                    <label><span>Password</span><input name="adminPassword" type="text" minLength="6" required /></label>
                </div>
                <div className={`province-form wizard-step ${setupStep === 3 ? "" : "is-hidden"}`}>
                    <label><span>Permission Role</span><select name="roleType" required><option value="province-admin">Province Admin</option><option value="assistant-admin">Assistant Admin</option><option value="follow-up-officer">Follow-up Officer</option></select></label>
                    <article className="permission-summary"><strong>Province Admin</strong><span>Manage converts, follow-up, workers, and province reports.</span></article>
                    <article className="permission-summary"><strong>Assistant Admin</strong><span>Limited province management and reporting support.</span></article>
                    <article className="permission-summary"><strong>Follow-up Officer</strong><span>Follow-up task and convert care access only.</span></article>
                </div>
                {setupStep === 4 ? (
                  <div className="setup-complete-card">
                    <h3>{setupComplete ? "System Ready" : "Complete Setup"}</h3>
                    <p>{setupComplete ? "Your first province has been created and the province admin invitation is ready." : "Save the province, create the admin invitation, and prepare the dashboard."}</p>
                    <ul><li>✓ Province Created Successfully</li><li>✓ Province Admin Assigned</li><li>✓ Invitation Prepared</li><li>✓ System Ready</li></ul>
                  </div>
                ) : null}
                <div className="wizard-actions">
                  <button className="button button-secondary" type="button" onClick={() => setupStep === 1 ? setSetupWizardOpen(false) : setSetupStep(setupStep - 1)}>{setupStep === 1 ? "Cancel" : "Back"}</button>
                  {setupStep < 4 ? <button className="button" type="button" onClick={() => setSetupStep(setupStep + 1)}>Continue</button> : <button className="button" type="submit" disabled={savingId === "first-province-setup"}>{savingId === "first-province-setup" ? "Saving..." : "Complete Setup"}</button>}
                </div>
              </form>
            ) : (
              <>
            <form className="province-form" onSubmit={saveProvince} key={editingProvinceId || "new-province"}>
              <label><span>Province Name</span><input name="provinceName" defaultValue={selectedProvince?.provinceName || ""} required /></label>
              <label><span>Province Code</span><input name="provinceCode" defaultValue={selectedProvince?.provinceCode || ""} required /></label>
              <label><span>State/Region</span><input name="stateRegion" defaultValue={selectedProvince?.stateRegion || ""} required /></label>
              <label><span>Status</span><select name="status" defaultValue={selectedProvince?.status || "active"}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
              <label><span>Province Email</span><input name="provinceEmail" type="email" defaultValue={selectedProvince?.provinceEmail || ""} required /></label>
              <label><span>Province Phone</span><input name="provincePhone" type="tel" defaultValue={selectedProvince?.provincePhone || ""} required /></label>
              <label><span>Province Pastor/Leader</span><input name="provinceLeader" defaultValue={selectedProvince?.provinceLeader || ""} /></label>
              <label><span>Contact Information</span><input name="contactInfo" defaultValue={selectedProvince?.contactInfo || ""} /></label>
              <label className="auth-wide-field"><span>Province Address</span><input name="address" defaultValue={selectedProvince?.address || ""} required /></label>
              <button className="button" type="submit">{editingProvinceId ? "Update Province" : "Create Province"}</button>
            </form>
            <div className="province-list">
              {provinces.map((province) => (
                <article className="province-card" key={province.id}>
                  <div><strong>{province.provinceName}</strong><span>{province.provinceCode} · {province.stateRegion || "No region"} · {province.status}</span></div>
                  <div className="province-card-actions">
                    <button type="button" onClick={() => setEditingProvinceId(province.id)}>Edit</button>
                    <button type="button" onClick={() => removeProvince(province.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
              </>
            )}
          </section>
        ) : null}
        {isSuperAdmin(user) ? (
          <section className="admin-panel province-panel">
            <div className="admin-section-heading">
              <div><p className="eyebrow">Admin Approval Queue</p><h2>Review province admin applications.</h2></div>
            </div>
            <div className="province-list">
              {adminRequests.map((request) => (
                <article className="province-card admin-request-card" key={request.id}>
                  <div>
                    <strong>{request.fullName}</strong>
                    <span>{request.requestedRole?.replaceAll("-", " ")} · {provinceById[request.provinceId]?.provinceName || "No province"} · {request.status}</span>
                    <small>{request.email} · {request.phone} · {request.yearsOfService || "0"} years</small>
                    <small>ID: {request.idCardFileName || "missing"} · Passport: {request.passportPhotoFileName || "missing"} · Letter: {request.recommendationLetterFileName || "optional"}</small>
                  </div>
                  <div className="province-card-actions">
                    <button type="button" disabled={savingId === request.id || request.status !== "pending"} onClick={() => reviewAdminRequest(request, "approved")}>Approve</button>
                    <button type="button" disabled={savingId === request.id || request.status !== "pending"} onClick={() => reviewAdminRequest(request, "rejected")}>Reject</button>
                  </div>
                </article>
              ))}
              {adminRequests.length === 0 ? <p className="admin-result-count">No admin applications are waiting for review.</p> : null}
            </div>
          </section>
        ) : null}
        <section className="admin-panel">
          <div className="admin-toolbar">
            <label className="admin-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search converts, provinces, workers" /></label>
            <button className="button button-secondary" type="button" onClick={exportUsers}>Export CSV</button>
          </div>
          <div className="admin-filters" aria-label="User filters">
            <label><span>Role</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}><option value="all">All roles</option><option value="student">Converts</option>{isSuperAdmin(user) ? <option value="province-admin">Province Admins</option> : null}{isSuperAdmin(user) ? <option value="assistant-admin">Assistant Admins</option> : null}{isSuperAdmin(user) ? <option value="follow-up-officer">Follow-up Officers</option> : null}{isSuperAdmin(user) ? <option value="data-entry-officer">Data Entry Officers</option> : null}<option value="admin">Super Admins</option></select></label>
            {isSuperAdmin(user) ? <label><span>Province</span><select value={provinceFilter} onChange={(event) => setProvinceFilter(event.target.value)}><option value="all">All provinces</option><option value="">No province</option>{provinces.map((province) => <option value={province.id} key={province.id}>{province.provinceName}</option>)}</select></label> : null}
            <label><span>Access</span><select value={accessFilter} onChange={(event) => setAccessFilter(event.target.value)}><option value="all">All access</option><option value="">No access</option><option value="member">Member</option><option value="paid">Paid</option><option value="sponsored">Sponsored</option><option value="church-group">Church group</option></select></label>
            <label><span>Follow-up</span><select value={followUpFilter} onChange={(event) => setFollowUpFilter(event.target.value)}><option value="all">All follow-up</option><option value="none">None</option><option value="needed">Needed</option><option value="contacted">Contacted</option><option value="resolved">Resolved</option></select></label>
            <label><span>Hardcopy</span><select value={hardcopyFilter} onChange={(event) => setHardcopyFilter(event.target.value)}><option value="all">All hardcopy</option><option value="none">None</option><option value="interested">Interested</option><option value="ordered">Ordered</option><option value="delivered">Delivered</option></select></label>
          </div>
          {message ? <p className={message.startsWith("Saved") ? "form-success" : "form-error"}>{message}</p> : null}
          <p className="admin-result-count">{loadingUsers ? "Loading users..." : `Showing ${filtered.length} of ${rows.length} users`}</p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Contact</th><th>Province</th><th>Onboarding</th><th>Status</th><th>Plan</th><th>Role</th><th>Follow-up</th><th>Worker</th><th>Completed</th><th>Notes</th><th>Joined</th></tr></thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.name || "Student"}</strong></td>
                    <td><span>{row.email}</span><small>{row.phone || "No phone"}</small></td>
                    <td>
                      {isSuperAdmin(user) ? (
                        <select value={row.provinceId || ""} disabled={savingId === row.id} onChange={(event) => saveUserField(row, "provinceId", event.target.value)}>
                          <option value="">No province</option>
                          {provinces.map((province) => <option value={province.id} key={province.id}>{province.provinceName}</option>)}
                        </select>
                      ) : <span>{provinceById[row.provinceId]?.provinceName || "Assigned province"}</span>}
                      <small>{row.parish || "No parish"}</small>
                      <small>{row.state || "No state"}</small>
                    </td>
                    <td>
                      <span>{row.decisionType === "rededication" ? "Re-dedication" : row.decisionType === "accepted-christ" ? "Accepted Christ" : "Not recorded"}</span>
                      <small>{row.gender || "No gender"} · {row.baptismStatus || "No baptism status"}</small>
                      <small>{row.conversionDate || "No conversion date"}</small>
                      <small>{row.invitedBy ? `Invited by ${row.invitedBy}` : "No inviter"}</small>
                      <small>{row.nearestBusStop || "No bus stop"}</small>
                      {row.prayerRequest ? <small>Prayer: {row.prayerRequest}</small> : null}
                    </td>
                    <td>
                      <span className={`status-pill status-${row.role === "admin" || row.role === "province-admin" ? "admin" : "student"}`}>{row.role || "student"}</span>
                      <span className={`status-pill status-${row.followUpStatus === "needed" ? "needed" : "quiet"}`}>{row.followUpStatus || "no follow-up"}</span>
                      {isSuperAdmin(user) ? (
                        <select value={row.accountStatus || "active"} disabled={savingId === row.id || row.id === user.id} onChange={(event) => saveUserField(row, "accountStatus", event.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                          <option value="suspended">Suspended</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : <small>{row.accountStatus || "active"}</small>}
                    </td>
                    <td>
                      <select value={row.accessPlan ?? "member"} disabled={savingId === row.id || !isSuperAdmin(user)} onChange={(event) => saveUserField(row, "accessPlan", event.target.value)}>
                        <option value="">No access</option>
                        <option value="member">Member</option>
                        <option value="paid">Paid</option>
                        <option value="sponsored">Sponsored</option>
                        <option value="church-group">Church group</option>
                      </select>
                    </td>
                    <td>
                      <select value={row.role || "student"} disabled={savingId === row.id || row.id === user.id || !isSuperAdmin(user)} onChange={(event) => saveUserField(row, "role", event.target.value)}>
                        <option value="student">Convert</option>
                        <option value="province-admin">Province Admin</option>
                        <option value="assistant-admin">Assistant Admin</option>
                        <option value="follow-up-officer">Follow-up Officer</option>
                        <option value="data-entry-officer">Data Entry Officer</option>
                        <option value="admin">Super Admin</option>
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
                      <input value={row.workerAssigned || ""} disabled={savingId === row.id} onChange={(event) => setRows(rows.map((item) => (item.id === row.id ? { ...item, workerAssigned: event.target.value } : item)))} onBlur={(event) => saveUserField(row, "workerAssigned", event.target.value)} placeholder="Assign worker" />
                    </td>
                    <td><strong>{row.completedDays?.length ?? 0}</strong><small>of {days.length}</small></td>
                    <td>
                      <textarea value={row.adminNotes || ""} disabled={savingId === row.id} rows="2" onChange={(event) => setRows(rows.map((item) => (item.id === row.id ? { ...item, adminNotes: event.target.value } : item)))} onBlur={(event) => saveUserField(row, "adminNotes", event.target.value)} />
                    </td>
                    <td>{row.joinedAt ? new Date(row.joinedAt).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
                {!loadingUsers && filtered.length === 0 ? (
                  <tr><td colSpan="12"><div className="admin-empty">No converts match the current filters.</div></td></tr>
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
