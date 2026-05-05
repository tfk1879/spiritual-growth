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

  return {
    id: firebaseUser.uid,
    name: profile.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Student",
    email: firebaseUser.email,
    phone: profile.phone || "",
    joinedAt: profile.joinedAt || "",
    accessPlan: profile.accessPlan || "member"
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

  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function registerUser({ name, email, password, phone = "" }) {
  if (!isFirebaseConfigured()) return firebaseSetupError();

  try {
    const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    const user = credential.user;
    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();

    await updateProfile(user, { displayName: cleanName });
    await setDoc(doc(db, "users", user.uid), {
      name: cleanName,
      email: user.email,
      phone: cleanPhone,
      accessPlan: "member",
      hardcopyInterest: false,
      completedDays: [],
      createdAt: serverTimestamp(),
      joinedAt: new Date().toISOString()
    });

    return {
      ok: true,
      user: publicUser(user, {
        name: cleanName,
        phone: cleanPhone,
        accessPlan: "member",
        joinedAt: new Date().toISOString()
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
    await setDoc(doc(db, "users", user.id), { completedDays: uniqueDays }, { merge: true });
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

  return "Authentication failed. Please try again.";
}

export function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
}

export function initThemeToggle() {
  applySavedTheme();

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme === "dark";
      document.documentElement.dataset.theme = isDark ? "" : "dark";
      localStorage.setItem(THEME_KEY, isDark ? "light" : "dark");
    });
  });
}

applySavedTheme();
