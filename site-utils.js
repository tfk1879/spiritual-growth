import { auth, db, isFirebaseConfigured } from "./firebase-service.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const COMPLETED_KEY = "spiritualGrowthCompleted";
const THEME_KEY = "spiritualGrowthTheme";

let authStatePromise;

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function firebaseSetupError() {
  return {
    ok: false,
    message: "Firebase is not configured yet. Add your Firebase config in firebase-config.js."
  };
}

function publicUser(firebaseUser, profile = {}) {
  if (!firebaseUser) return null;
  const userProfile = profile ?? {};

  return {
    id: firebaseUser.uid,
    name: userProfile.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Student",
    email: firebaseUser.email,
    phone: userProfile.phone || "",
    joinedAt: userProfile.joinedAt || "",
    accessPlan: userProfile.accessPlan || "member"
  };
}

function waitForAuthState() {
  if (!isFirebaseConfigured()) return Promise.resolve(null);
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  authStatePromise ??= new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

  return authStatePromise;
}

export async function getCurrentUser() {
  if (!isFirebaseConfigured()) return null;

  const firebaseUser = await waitForAuthState();
  if (!firebaseUser) return null;

  const profile = await getUserProfile(firebaseUser.uid);
  return publicUser(firebaseUser, profile);
}

export async function getUserProfile(uid) {
  if (!isFirebaseConfigured() || !uid) return null;

  try {
    const snapshot = await getDoc(doc(db, "users", uid));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.warn("Unable to read user profile from Firestore.", error);
    return null;
  }
}

export async function registerUser({ name, email, password, phone = "" }) {
  if (!isFirebaseConfigured()) return firebaseSetupError();

  try {
    const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    const user = credential.user;
    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();

    await updateProfile(user, { displayName: cleanName });
    const joinedAt = new Date().toISOString();

    try {
      await setDoc(doc(db, "users", user.uid), {
        name: cleanName,
        email: user.email,
        phone: cleanPhone,
        accessPlan: "member",
        hardcopyInterest: false,
        completedDays: [],
        createdAt: serverTimestamp(),
        joinedAt
      });
    } catch (error) {
      console.warn("Account created, but Firestore profile was not saved.", error);
    }

    return {
      ok: true,
      user: publicUser(user, {
        name: cleanName,
        phone: cleanPhone,
        accessPlan: "member",
        joinedAt
      })
    };
  } catch (error) {
    return {
      ok: false,
      message: getAuthErrorMessage(error)
    };
  }
}

export async function loginUser({ email, password }) {
  if (!isFirebaseConfigured()) return firebaseSetupError();

  try {
    const credential = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    const profile = await getUserProfile(credential.user.uid);

    return {
      ok: true,
      user: publicUser(credential.user, profile)
    };
  } catch (error) {
    return {
      ok: false,
      message: getAuthErrorMessage(error)
    };
  }
}

export async function logoutUser() {
  if (!isFirebaseConfigured()) return;
  await signOut(auth);
}

export async function getCompletedDays() {
  const localDays = safeJsonParse(localStorage.getItem(COMPLETED_KEY), []);
  const user = await getCurrentUser();
  if (!user) return localDays;

  const profile = await getUserProfile(user.id);
  return Array.isArray(profile?.completedDays) ? profile.completedDays : localDays;
}

export async function saveCompletedDays(days) {
  const uniqueDays = [...new Set(days.map(Number))].sort((a, b) => a - b);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(uniqueDays));

  const user = await getCurrentUser();
  if (user) {
    try {
      await setDoc(doc(db, "users", user.id), { completedDays: uniqueDays }, { merge: true });
    } catch (error) {
      console.warn("Unable to save completed days to Firestore.", error);
    }
  }
}

export async function isDayCompleted(day) {
  return (await getCompletedDays()).includes(Number(day));
}

export async function toggleCompletedDay(day, completed) {
  const numericDay = Number(day);
  const current = (await getCompletedDays()).filter((item) => item !== numericDay);

  if (completed) current.push(numericDay);
  await saveCompletedDays(current);
}

export function canAccessPaidStudies(user) {
  return Boolean(user?.accessPlan);
}

export function getAuthErrorMessage(error) {
  const code = error?.code || "";

  if (code.includes("email-already-in-use")) return "An account with this email already exists. Please login instead.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("weak-password")) return "Password is too weak. Use at least 6 characters.";
  if (code.includes("user-not-found") || code.includes("invalid-credential")) return "The email or password is incorrect.";
  if (code.includes("wrong-password")) return "The password is incorrect.";
  if (code.includes("network-request-failed")) return "Network error. Please check your connection and try again.";
  if (code.includes("operation-not-allowed")) return "Email/password login is not enabled in Firebase Authentication.";
  if (code.includes("unauthorized-domain")) return "This domain is not authorized in Firebase Authentication settings.";

  return "Authentication failed. Please try again.";
}

export function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
}

function renderThemeToggle(button) {
  const isDark = document.documentElement.dataset.theme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  button.innerHTML = isDark
    ? `
      <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
    `
    : `
      <svg class="theme-toggle-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M20.99 11.64A8.5 8.5 0 1 1 12.36 3a6.5 6.5 0 0 0 8.63 8.64Z"></path>
      </svg>
    `;
}

function renderThemeToggles() {
  document.querySelectorAll("[data-theme-toggle]").forEach(renderThemeToggle);
}

export function initThemeToggle() {
  applySavedTheme();
  renderThemeToggles();

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme === "dark";
      document.documentElement.dataset.theme = isDark ? "" : "dark";
      localStorage.setItem(THEME_KEY, isDark ? "light" : "dark");
      renderThemeToggles();
    });
  });
}

applySavedTheme();
