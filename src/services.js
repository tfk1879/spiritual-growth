import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { firebaseConfig } from "../firebase-config.js";

const COMPLETED_KEY = "spiritualGrowthCompleted";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function waitForAuthState() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

function publicUser(firebaseUser, profile = {}) {
  if (!firebaseUser) return null;
  const userProfile = profile ?? {};
  return {
    id: firebaseUser.uid,
    name: userProfile.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Student",
    email: firebaseUser.email,
    phone: userProfile.phone || "",
    decisionType: userProfile.decisionType || "",
    occupation: userProfile.occupation || "",
    officeAddress: userProfile.officeAddress || "",
    homeAddress: userProfile.homeAddress || "",
    nearestBusStop: userProfile.nearestBusStop || "",
    prayerRequest: userProfile.prayerRequest || "",
    joinedAt: userProfile.joinedAt || "",
    accessPlan: userProfile.accessPlan || "member",
    role: userProfile.role || "student",
    completedDays: Array.isArray(userProfile.completedDays) ? userProfile.completedDays : []
  };
}

function authErrorMessage(error) {
  const code = error?.code || "";
  if (code.includes("email-already-in-use")) return "An account with this email already exists. Please login instead.";
  if (code.includes("invalid-email")) return "Please enter a valid email address.";
  if (code.includes("weak-password")) return "Password is too weak. Use at least 6 characters.";
  if (code.includes("user-not-found") || code.includes("invalid-credential")) return "The email or password is incorrect.";
  if (code.includes("wrong-password")) return "The password is incorrect.";
  if (code.includes("operation-not-allowed")) return "Email/password login is not enabled in Firebase Authentication.";
  if (code.includes("unauthorized-domain")) return "This domain is not authorized in Firebase Authentication settings.";
  return "Authentication failed. Please try again.";
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
}

export async function getUserProfile(uid) {
  if (!uid) return null;
  try {
    const snapshot = await getDoc(doc(db, "users", uid));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.warn("Unable to read user profile from Firestore.", error);
    return null;
  }
}

export async function getCurrentUser() {
  const firebaseUser = await waitForAuthState();
  if (!firebaseUser) return null;
  return publicUser(firebaseUser, await getUserProfile(firebaseUser.uid));
}

export async function registerUser({
  name,
  email,
  password,
  phone = "",
  decisionType = "",
  occupation = "",
  officeAddress = "",
  homeAddress = "",
  nearestBusStop = "",
  prayerRequest = ""
}) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    const cleanName = String(name).trim();
    const joinedAt = new Date().toISOString();
    await updateProfile(credential.user, { displayName: cleanName });
    await setDoc(doc(db, "users", credential.user.uid), {
      name: cleanName,
      email: credential.user.email,
      phone: String(phone).trim(),
      decisionType: String(decisionType).trim(),
      occupation: String(occupation).trim(),
      officeAddress: String(officeAddress).trim(),
      homeAddress: String(homeAddress).trim(),
      nearestBusStop: String(nearestBusStop).trim(),
      prayerRequest: String(prayerRequest).trim(),
      discipleStatus: "new",
      followUpStatus: "needed",
      role: "student",
      accessPlan: "member",
      hardcopyInterest: false,
      completedDays: [],
      createdAt: serverTimestamp(),
      joinedAt
    });
    return { ok: true, user: publicUser(credential.user, { name: cleanName, accessPlan: "member", role: "student", joinedAt }) };
  } catch (error) {
    return { ok: false, message: authErrorMessage(error) };
  }
}

export async function loginUser({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    return { ok: true, user: publicUser(credential.user, await getUserProfile(credential.user.uid)) };
  } catch (error) {
    return { ok: false, message: authErrorMessage(error) };
  }
}

export async function logoutUser() {
  await signOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function canAccessPaidStudies(user) {
  return Boolean(user?.accessPlan);
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
  if (user) await setDoc(doc(db, "users", user.id), { completedDays: uniqueDays }, { merge: true });
}

export async function listUsersForAdmin() {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
}
