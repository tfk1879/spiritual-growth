import { days, weekIntros, weekOrder, weekQuotes } from "./guide-data.js";
import {
  canAccessPaidStudies,
  getCompletedDays,
  getCurrentUser,
  initThemeToggle,
  toggleCompletedDay
} from "./site-utils.js";

const weekPageSlugs = {
  "Week 1": "week-1.html",
  "Week 2": "week-2.html",
  "Week 3": "week-3.html",
  "Week 4": "week-4.html",
  Bonus: "bonus-week.html"
};

const weekName = document.body.dataset.week;
const weekIndex = weekOrder.indexOf(weekName);
const entries = days.filter((entry) => entry.week === weekName);
const root = document.getElementById("week-root");

function isFreeWeek(week) {
  return week === "Week 1";
}

function canViewWeek(week, user) {
  return isFreeWeek(week) || canAccessPaidStudies(user);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAdjacentWeek(offset) {
  const adjacentName = weekOrder[weekIndex + offset];
  if (!adjacentName) return "";

  return `<a class="button button-light" href="${weekPageSlugs[adjacentName]}">${offset < 0 ? "Previous" : "Next"}: ${adjacentName}</a>`;
}

function renderNotFound() {
  root.innerHTML = `
    <div class="site-shell">
      <section class="week-study-error">
        <p class="section-kicker">Study Page</p>
        <h1>Week not found</h1>
        <p>This study page could not find its weekly lessons.</p>
        <a class="button" href="index.html">Back Home</a>
      </section>
    </div>
  `;
}

function renderLockedPage() {
  const theme = entries[0].theme;

  document.title = `${weekName} Locked | Spiritual Growth After New Birth`;
  root.innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="Return to Spiritual Growth home">
          <span class="brand-mark">SG</span>
          <span>
            <strong>Spiritual Growth</strong>
            <em>After New Birth</em>
          </span>
        </a>

        <nav class="main-nav" aria-label="Main navigation">
          <a href="index.html">Home</a>
          <a href="studies.html">Studies</a>
          <a href="week-1.html">Free Week</a>
        </nav>

        <div class="header-actions">
          <button class="icon-button" type="button" data-theme-toggle aria-label="Toggle dark mode">DM</button>
          <a class="button button-secondary" href="signup.html">Sign Up</a>
        </div>
      </header>

      <main class="locked-study-page">
        <section class="locked-study-card">
          <p class="eyebrow">Members Only</p>
          <h1>${escapeHtml(weekName)} is locked.</h1>
          <p>
            ${escapeHtml(theme)} is part of the full study journey. Week 1 is free,
            and logged-in users can continue with the remaining studies.
          </p>
          <div class="locked-actions">
            <a class="button" href="signup.html">Create Account</a>
            <a class="button button-secondary" href="week-1.html">Read Free Week</a>
            <a class="button button-secondary" href="book.html">View Hardcopy</a>
          </div>
        </section>
      </main>
    </div>
  `;

  initThemeToggle();
}

function renderStudyPage({ user, completedDays }) {
  const theme = entries[0].theme;
  const stageLabel = weekName === "Bonus" ? "Continuation Study" : `Stage ${weekIndex + 1}`;

  document.title = `${weekName} Study | ${theme}`;

  root.innerHTML = `
    <div class="site-shell week-study-shell">
      <header class="hero week-study-hero">
        <div class="hero-backdrop"></div>
        <nav class="site-header study-header">
          <a class="brand" href="index.html" aria-label="Return to Spiritual Growth home">
            <span class="brand-mark">SG</span>
            <span>
              <strong>Spiritual Growth</strong>
              <em>After New Birth</em>
            </span>
          </a>

          <div class="main-nav">
            ${weekOrder
              .map(
                (name) => `
                  <a href="${weekPageSlugs[name]}" ${name === weekName ? 'aria-current="page"' : ""}>
                    ${name}
                  </a>
                `
              )
              .join("")}
          </div>

          <div class="header-actions">
            <button class="icon-button" type="button" data-theme-toggle aria-label="Toggle dark mode">DM</button>
            <a class="button button-secondary" href="studies.html">Studies</a>
            ${user ? `<a class="button" href="dashboard.html">Dashboard</a>` : `<a class="button" href="signup.html">Sign Up</a>`}
          </div>
        </nav>

        <section class="hero-grid" id="top">
          <div class="hero-copy">
            <p class="hero-kicker">${escapeHtml(stageLabel)}</p>
            <h1>${escapeHtml(weekName)} Study</h1>
            <p class="hero-text">${escapeHtml(weekIntros[weekName])}</p>

            <div class="hero-actions">
              <a class="button" href="#study-days">Start This Week</a>
              <a class="button button-outline" href="studies.html">Back to Studies</a>
            </div>
          </div>

          <aside class="hero-panel" aria-label="${escapeHtml(weekName)} overview">
            <p class="panel-label">${escapeHtml(weekName)}</p>
            <h2>${escapeHtml(theme)}</h2>
            <p class="panel-text">${escapeHtml(weekQuotes[weekName])}</p>
            <div class="hero-panel-list">
              <article>
                <strong>${entries.length} Study Days</strong>
                <p>Read Scripture, pray honestly, and take a clear obedience step each day.</p>
              </article>
              <article>
                <strong>Firebase Progress</strong>
                <p>Logged-in users save completed lessons to their Firestore profile.</p>
              </article>
            </div>
          </aside>
        </section>
      </header>

      <main class="content-stack">
        <section class="section-block" id="study-days">
          <div class="section-heading split-heading">
            <div>
              <p class="section-kicker">${escapeHtml(stageLabel)}</p>
              <h3>${escapeHtml(theme)}</h3>
            </div>
            <p>Each lesson is kept on this weekly page so new believers can move through the study one stage at a time.</p>
          </div>

          <div class="week-days-grid week-study-grid">
            ${entries
              .map(
                (entry) => `
                  <article class="day-card week-study-day" id="day-${entry.day}">
                    <div class="day-card-head">
                      <span class="day-chip">Day ${entry.day}</span>
                      <a
                        class="day-scripture"
                        href="https://www.biblegateway.com/passage/?search=${encodeURIComponent(entry.scripture)}"
                        target="_blank"
                        rel="noreferrer"
                      >
                        ${escapeHtml(entry.scripture)}
                      </a>
                    </div>

                    <h5>${escapeHtml(entry.title)}</h5>

                    <label class="completion-check">
                      <input
                        type="checkbox"
                        data-complete-day="${entry.day}"
                        ${completedDays.includes(entry.day) ? "checked" : ""}
                      >
                      <span>Mark as completed</span>
                    </label>

                    <div class="day-detail">
                      <span>Read + Reflect</span>
                      <p>${escapeHtml(entry.focus)}</p>
                    </div>
                    <div class="day-detail">
                      <span>Pray</span>
                      <p>${escapeHtml(entry.prayer)}</p>
                    </div>
                    <div class="day-detail">
                      <span>Act</span>
                      <p>${escapeHtml(entry.action)}</p>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>

        <nav class="week-study-nav" aria-label="Week study navigation">
          ${getAdjacentWeek(-1)}
          <a class="button" href="studies.html">All Studies</a>
          ${getAdjacentWeek(1)}
        </nav>
      </main>
    </div>
  `;

  initThemeToggle();
}

async function initWeekPage() {
  if (!entries.length) {
    renderNotFound();
    return;
  }

  const user = await getCurrentUser();
  if (!canViewWeek(weekName, user)) {
    renderLockedPage();
    return;
  }

  const completedDays = await getCompletedDays();
  renderStudyPage({ user, completedDays });
}

document.addEventListener("change", async (event) => {
  const checkbox = event.target.closest("[data-complete-day]");
  if (!checkbox) return;
  checkbox.disabled = true;
  await toggleCompletedDay(checkbox.dataset.completeDay, checkbox.checked);
  checkbox.disabled = false;
});

initWeekPage();
