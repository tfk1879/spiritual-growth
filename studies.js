import { days, weekIntros, weekOrder } from "./guide-data.js";
import { canAccessPaidStudies, getCompletedDays, getCurrentUser, initThemeToggle } from "./site-utils.js";

const weekPageSlugs = {
  "Week 1": "week-1.html",
  "Week 2": "week-2.html",
  "Week 3": "week-3.html",
  "Week 4": "week-4.html",
  Bonus: "bonus-week.html"
};

const root = document.getElementById("studies-root");

function isFreeWeek(week) {
  return week === "Week 1";
}

function canOpenWeek(week, user) {
  return isFreeWeek(week) || canAccessPaidStudies(user);
}

function renderWeeks({ user, completedDays }) {
  return weekOrder
    .map((week, index) => {
      const entries = days.filter((entry) => entry.week === week);
      const completedCount = entries.filter((entry) => completedDays.includes(entry.day)).length;
      const theme = entries[0]?.theme ?? "Continuation";
      const locked = !canOpenWeek(week, user);

      return `
        <article class="study-directory-card ${locked ? "is-locked" : ""}">
          <div>
            <p class="eyebrow">
              ${isFreeWeek(week) ? "Free Preview" : locked ? "Members Only" : week === "Bonus" ? "Bonus" : `Week ${index + 1}`}
            </p>
            <h2>${theme}</h2>
            <p>${weekIntros[week]}</p>
          </div>
          <div class="study-meta">
            <span>${entries.length} lessons</span>
            <span>${completedCount} completed</span>
            ${locked ? "<span>Locked</span>" : ""}
          </div>
          ${
            locked
              ? `
                <div class="locked-actions">
                  <a class="button" href="signup.html">Create Account</a>
                  <a class="button button-secondary" href="book.html">View Hardcopy</a>
                </div>
              `
              : `<a class="button button-secondary" href="${weekPageSlugs[week]}">Open ${week}</a>`
          }
        </article>
      `;
    })
    .join("");
}

async function initStudiesPage() {
  const user = await getCurrentUser();
  const completedDays = await getCompletedDays();

  root.innerHTML = `
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="index.html" aria-label="Spiritual Growth After New Birth home">
          <span class="brand-mark">SG</span>
          <span>
            <strong>Spiritual Growth</strong>
            <em>After New Birth</em>
          </span>
        </a>

        <nav class="main-nav" aria-label="Main navigation">
          <a href="index.html">Home</a>
          <a aria-current="page" href="studies.html">Studies</a>
          <a href="index.html#about">About</a>
          <a href="index.html#contact">Contact</a>
        </nav>

        <div class="header-actions">
          <button class="icon-button" type="button" data-theme-toggle aria-label="Toggle dark mode">DM</button>
          ${
            user
              ? `<a class="button button-secondary" href="dashboard.html">Dashboard</a>`
              : `<a class="button button-secondary" href="signup.html">Sign Up</a>`
          }
        </div>
      </header>

      <main class="page-stack">
        <section class="page-hero compact-hero">
          <p class="eyebrow">Weekly Studies</p>
          <h1>Choose a classroom and grow one week at a time.</h1>
          <p>
            Week 1 is free to preview. Create an account to unlock the full weekly journey,
            track your progress, and prepare for the hardcopy version later.
          </p>
        </section>

        ${
          user
            ? ""
            : `
              <section class="access-banner">
                <div>
                  <p class="eyebrow">Free First Week</p>
                  <h2>Start with Week 1, then join to continue.</h2>
                  <p>Later, this same gate can connect to payments, subscriptions, or a hardcopy booking form.</p>
                </div>
                <div class="locked-actions">
                  <a class="button" href="week-1.html">Open Free Week</a>
                  <a class="button button-secondary" href="signup.html">Unlock Studies</a>
                </div>
              </section>
            `
        }

        <section class="studies-grid" aria-label="Weekly study directory">
          ${renderWeeks({ user, completedDays })}
        </section>
      </main>
    </div>
  `;

  initThemeToggle();
}

initStudiesPage();
