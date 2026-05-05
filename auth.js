import { getCurrentUser, initThemeToggle, loginUser, registerUser } from "./site-utils.js";

const root = document.getElementById("auth-root");
const mode = root.dataset.authMode;
const isSignup = mode === "signup";

async function initAuthPage() {
  if ((await getCurrentUser()) && isSignup) {
    window.location.href = "dashboard.html";
    return;
  }

  root.innerHTML = `
    <div class="auth-layout">
      <section class="auth-panel">
        <div class="auth-topline">
          <a class="brand auth-brand" href="index.html" aria-label="Spiritual Growth home">
            <span class="brand-mark">SG</span>
            <span>
              <strong>Spiritual Growth</strong>
              <em>After New Birth</em>
            </span>
          </a>

          <button class="icon-button theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark mode"></button>
        </div>

        <div class="auth-heading">
          <p class="eyebrow">${isSignup ? "Sign Up" : "Login"}</p>
          <h1>${isSignup ? "Join the weekly growth journey." : "Welcome back."}</h1>
          <p>
            ${
              isSignup
                ? "Create a Firebase account to track weekly studies, mark lessons complete, and continue from your dashboard."
                : "Continue your weekly study journey with your Firebase account."
            }
          </p>
        </div>

        <form class="auth-form" id="auth-form">
          <div class="auth-field-grid">
            ${
              isSignup
                ? `
                  <label>
                    <span>Full Name</span>
                    <input name="name" type="text" autocomplete="name" placeholder="Your full name" required>
                  </label>
                `
                : ""
            }
            <label>
              <span>Email</span>
              <input name="email" type="email" autocomplete="email" placeholder="name@example.com" required>
            </label>
            <label>
              <span>Password</span>
              <span class="password-control">
                <input
                  id="password-input"
                  name="password"
                  type="password"
                  autocomplete="${isSignup ? "new-password" : "current-password"}"
                  minlength="6"
                  placeholder="At least 6 characters"
                  required
                >
                <button type="button" id="password-toggle" aria-controls="password-input" aria-label="Show password">Show</button>
              </span>
            </label>
            ${
              isSignup
                ? `
                  <label>
                    <span>Phone Number <em>Optional</em></span>
                    <input name="phone" type="tel" autocomplete="tel" placeholder="For reminders later">
                  </label>
                `
                : ""
            }
          </div>

          <p class="form-note">
            ${isSignup ? "Firebase Authentication will manage the account. Firestore stores profile and access details." : "Use the email and password from your signup."}
          </p>
          <p class="form-error" id="form-error" role="alert"></p>
          <button class="button auth-submit" type="submit">${isSignup ? "Create Account" : "Login"}</button>
        </form>

        <p class="auth-switch">
          ${
            isSignup
              ? `Already have an account? <a href="login.html">Login</a>`
              : `Need an account? <a href="signup.html">Sign up</a>`
          }
        </p>

        <a class="auth-back-link" href="studies.html">Browse studies first</a>
      </section>

      <aside class="auth-side">
        <div class="auth-side-copy">
          <p class="eyebrow">Membership Desk</p>
          <h2>Learn, complete, and keep growing.</h2>
          <p>
            A focused registration page helps the whole platform feel ready for real students:
            clear fields, calm design, and a direct path into the dashboard.
          </p>
        </div>

        <div class="auth-benefits" aria-label="Account benefits">
          <article>
            <strong>Track progress</strong>
            <span>See completed lessons from your dashboard.</span>
          </article>
          <article>
            <strong>Study weekly</strong>
            <span>Move through each classroom at a steady pace.</span>
          </article>
          <article>
            <strong>Build consistency</strong>
            <span>Return to Scripture, prayer, and action steps.</span>
          </article>
        </div>
      </aside>
    </div>
  `;

  document.getElementById("password-toggle").addEventListener("click", () => {
    const input = document.getElementById("password-input");
    const button = document.getElementById("password-toggle");
    const showing = input.type === "text";

    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
    button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });

  document.getElementById("auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector(".auth-submit");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const error = document.getElementById("form-error");

    error.textContent = "";

    if (isSignup && name.length < 2) {
      error.textContent = "Please enter your full name.";
      return;
    }

    if (password.length < 6) {
      error.textContent = "Password must be at least 6 characters.";
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = isSignup ? "Creating Account..." : "Logging In...";

    const result = isSignup
      ? await registerUser({ name, email, password, phone })
      : await loginUser({ email, password });

    if (!result.ok) {
      error.textContent = result.message;
      submitButton.disabled = false;
      submitButton.textContent = isSignup ? "Create Account" : "Login";
      return;
    }

    window.location.href = "dashboard.html";
  });

  initThemeToggle();
}

initAuthPage().catch((error) => {
  console.error("Unable to initialize auth page.", error);
  root.innerHTML = `
    <div class="auth-layout">
      <section class="auth-panel">
        <div class="auth-heading">
          <p class="eyebrow">Login</p>
          <h1>Login is temporarily unavailable.</h1>
          <p>Please refresh the page. If this continues, check your network connection and Firebase settings.</p>
        </div>
        <p class="form-error" role="alert">The login screen could not finish loading.</p>
        <a class="button" href="login.html">Reload Login</a>
      </section>
    </div>
  `;
});
