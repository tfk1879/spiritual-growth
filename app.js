import { foundationPoints } from "./guide-data.js";
import { getCurrentUser, initThemeToggle } from "./site-utils.js";

const root = document.getElementById("root");

function renderFoundationCards() {
  return foundationPoints
    .slice(0, 3)
    .map(
      (item) => `
        <article class="content-card">
          <p class="eyebrow">Foundation</p>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

async function initHomePage() {
  const currentUser = await getCurrentUser();

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
          <a aria-current="page" href="index.html">Home</a>
          <a href="studies.html">Studies</a>
          <a href="index.html#about">About</a>
          <a href="index.html#contact">Contact</a>
        </nav>

        <div class="header-actions">
          <button class="icon-button" type="button" data-theme-toggle aria-label="Toggle dark mode">DM</button>
          ${
            currentUser
              ? `<a class="button button-secondary" href="dashboard.html">Dashboard</a>`
              : `<a class="button button-secondary" href="signup.html">Sign Up</a>`
          }
        </div>
      </header>

      <main>
        <section class="home-hero">
          <div class="hero-copy">
            <p class="eyebrow">Weekly discipleship for new believers</p>
            <h1>Grow spiritually every week.</h1>
            <p>
              A clean, guided platform for learning Scripture, building spiritual habits,
              and taking steady next steps after receiving Christ.
            </p>
            <div class="hero-actions">
              <a class="button" href="signup.html">Join the Journey</a>
              <a class="button button-secondary" href="studies.html">Explore Weekly Studies</a>
            </div>
          </div>

          <div class="hero-media" aria-label="Spiritual growth guide portrait">
            <img src="assets/developer-portrait.jpeg" alt="Portrait of the study guide developer">
          </div>
        </section>

        <section class="section-block" id="about">
          <div class="section-heading">
            <p class="eyebrow">Mission</p>
            <h2>A simple path from new birth to steady growth.</h2>
            <p>
              This platform keeps the homepage peaceful and focused. Weekly activities live
              in their own study area, while the entrance explains the purpose and invites
              people to begin.
            </p>
          </div>
        </section>

        <section class="feature-band" aria-label="Featured teaching focus">
          <div class="feature-copy">
            <p class="eyebrow">Featured Focus</p>
            <h2>Start with identity before activity.</h2>
            <p>
              New believers need assurance first: Jesus saves by grace, welcomes us into
              God&apos;s family, and teaches us to grow through the Word, prayer, obedience,
              and fellowship.
            </p>
            <a class="text-link" href="week-1.html">Open Week 1: Assurance and Identity</a>
          </div>
          <div class="feature-list">
            ${renderFoundationCards()}
          </div>
        </section>

        <section class="cta-band" id="contact">
          <div>
            <p class="eyebrow">Next Step</p>
            <h2>Join our weekly growth journey.</h2>
            <p>Create an account, open the dashboard, and mark each weekly study as completed.</p>
          </div>
          <a class="button" href="signup.html">Create Account</a>
        </section>
      </main>
    </div>
  `;

  initThemeToggle();
}

initHomePage();
