import { days, weekOrder } from "./guide-data.js";
import { getCompletedDays, getCurrentUser, initThemeToggle, logoutUser } from "./site-utils.js";

const weekPageSlugs = {
  "Week 1": "week-1.html",
  "Week 2": "week-2.html",
  "Week 3": "week-3.html",
  "Week 4": "week-4.html",
  Bonus: "bonus-week.html"
};

const root = document.getElementById("dashboard-root");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderWeekProgress(completedDays) {
  return weekOrder
    .map((week) => {
      const entries = days.filter((entry) => entry.week === week);
      const completed = entries.filter((entry) => completedDays.includes(entry.day)).length;
      const weekPercent = Math.round((completed / entries.length) * 100);

      return `
        <article class="progress-card">
          <div>
            <p class="eyebrow">${week}</p>
            <h3>${entries[0]?.theme ?? "Continuation"}</h3>
            <p>${completed} of ${entries.length} lessons completed</p>
          </div>
          <div class="progress-track" aria-label="${weekPercent}% complete">
            <span style="width: ${weekPercent}%"></span>
          </div>
          <a class="text-link" href="${weekPageSlugs[week]}">Continue ${week}</a>
        </article>
      `;
    })
    .join("");
}

async function initDashboard() {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const completedDays = await getCompletedDays();
  const percent = Math.round((completedDays.length / days.length) * 100);

  root.innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="Spiritual Growth home">
          <span class="brand-mark">SG</span>
          <span>
            <strong>Spiritual Growth</strong>
            <em>After New Birth</em>
          </span>
        </a>

        <nav class="main-nav" aria-label="Main navigation">
          <a href="index.html">Home</a>
          <a href="studies.html">Studies</a>
          <a aria-current="page" href="dashboard.html">Dashboard</a>
        </nav>

        <div class="header-actions">
          <button class="icon-button" type="button" data-theme-toggle aria-label="Toggle dark mode">DM</button>
          <button class="button button-secondary" type="button" id="logout-button">Logout</button>
        </div>
      </header>

      <main class="page-stack">
        <section class="dashboard-hero">
          <div>
            <p class="eyebrow">Dashboard</p>
            <h1>Welcome, ${escapeHtml(user.name)}.</h1>
            <p>Track your growth journey and return to the next weekly study.</p>
          </div>
          <div class="completion-meter">
            <strong>${percent}%</strong>
            <span>${completedDays.length} of ${days.length} lessons completed</span>
          </div>
        </section>

        <section class="progress-grid" aria-label="Weekly progress">
          ${renderWeekProgress(completedDays)}
        </section>
      </main>
    </div>
  `;

  document.getElementById("logout-button").addEventListener("click", async () => {
    await logoutUser();
    window.location.href = "index.html";
  });

  initThemeToggle();
}

initDashboard();
