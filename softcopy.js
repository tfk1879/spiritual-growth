import { days, foundationPoints, weekIntros, weekOrder } from "./guide-data.js";

const weeks = weekOrder.map((week) => {
  const entries = days.filter((entry) => entry.week === week);
  return {
    name: week,
    theme: entries[0]?.theme ?? "",
    summary: weekIntros[week],
    entries
  };
});

const root = document.getElementById("softcopy-root");

root.innerHTML = `
  <div class="softcopy-shell">
    <header class="softcopy-hero">
      <div>
        <p class="eyebrow">PDF Softcopy</p>
        <h1>Spiritual Growth After New Birth</h1>
        <p class="hero-copy">
          A 30-day printable guide for new believers in Jesus. Open this page on the web, then use the PDF action to
          save or share a clean softcopy.
        </p>
      </div>
      <div class="hero-actions no-print">
        <a class="button ghost" href="index.html">Back to Website</a>
        <a class="button ghost" href="book.html">Open Book Manuscript</a>
        <button class="button" id="print-guide" type="button">Download as PDF</button>
      </div>
    </header>

    <section class="intro-panel">
      <article>
        <span>30</span>
        <strong>Daily guides</strong>
        <p>Each day includes a Scripture, a reflection focus, a prayer direction, and an action step.</p>
      </article>
      <article>
        <span>5</span>
        <strong>Guided sections</strong>
        <p>The journey is grouped into four full weeks plus a final continuation section.</p>
      </article>
      <article>
        <span>3</span>
        <strong>Daily movements</strong>
        <p>Read the Word, pray honestly, and take one practical step of obedience.</p>
      </article>
    </section>

    <section class="foundations-block">
      <p class="eyebrow">Foundations First</p>
      <h2>What every new believer needs to know right away</h2>
      <div class="foundation-grid">
        ${foundationPoints
          .map(
            (item) => `
              <article class="foundation-card">
                <h3>${item.title}</h3>
                <p>${item.text}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    ${weeks
      .map(
        (week, index) => `
          <section class="week-block">
            <div class="week-header">
              <div>
                <p class="eyebrow">${week.name}</p>
                <h2>${week.theme}</h2>
                <p>${week.summary}</p>
              </div>
              <div class="week-meta">
                <div class="meta-card">
                  <strong>Stage ${index + 1}</strong>
                  <span>${week.entries.length} days</span>
                </div>
              </div>
            </div>

            <div class="day-list">
              ${week.entries
                .map(
                  (entry) => `
                    <article class="day-card">
                      <div class="day-top">
                        <div>
                          <span class="day-number">Day ${entry.day}</span>
                          <h3>${entry.title}</h3>
                        </div>
                        <span class="verse">${entry.scripture}</span>
                      </div>
                      <div class="detail-block">
                        <strong>Read + Reflect</strong>
                        <p>${entry.focus}</p>
                      </div>
                      <div class="detail-block">
                        <strong>Pray</strong>
                        <p>${entry.prayer}</p>
                      </div>
                      <div class="detail-block">
                        <strong>Act</strong>
                        <p>${entry.action}</p>
                      </div>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("")}
  </div>
`;

document.getElementById("print-guide").addEventListener("click", () => {
  window.print();
});
