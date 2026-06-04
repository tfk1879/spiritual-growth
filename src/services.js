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
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { firebaseConfig } from "../firebase-config.js";
import { defaultOndoProvinces } from "./provinces.js";

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
    accountStatus: userProfile.accountStatus || "active",
    provinceId: userProfile.provinceId || "",
    provinceName: userProfile.provinceName || "",
    completedDays: Array.isArray(userProfile.completedDays) ? userProfile.completedDays : []
  };
}

export function isSuperAdmin(user) {
  return ["admin", "super-admin", "super_admin"].includes(user?.role);
}

export function isProvinceAdmin(user) {
  return user?.role === "province-admin";
}

export function isProvinceStaff(user) {
  return ["province-admin", "assistant-admin", "follow-up-officer", "data-entry-officer"].includes(user?.role);
}

export function canUseAdminTools(user) {
  return ["approved", "active"].includes(user?.accountStatus) && (isSuperAdmin(user) || isProvinceStaff(user));
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
  invitationToken = "",
  accountType = "member",
  username = "",
  phone = "",
  decisionType = "",
  gender = "",
  state = "",
  provinceId = "",
  parish = "",
  conversionDate = "",
  invitedBy = "",
  baptismStatus = "",
  workerAssigned = "",
  requestedRole = "",
  ministryPosition = "",
  yearsOfService = "",
  idCardFileName = "",
  passportPhotoFileName = "",
  recommendationLetterFileName = "",
  occupation = "",
  officeAddress = "",
  homeAddress = "",
  nearestBusStop = "",
  prayerRequest = ""
}) {
  try {
    const inviteToken = String(invitationToken).trim();
    const invitation = inviteToken ? await getAdminInvitation(inviteToken) : null;
    const normalizedEmail = normalizeEmail(email);
    const isAdminRequest = false;

    if (invitation && (invitation.status !== "pending" || normalizeEmail(invitation.email) !== normalizedEmail)) {
      return { ok: false, message: "This invitation is invalid, expired, or assigned to another email." };
    }

    const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    const cleanName = String(name).trim();
    const joinedAt = new Date().toISOString();
    const role = invitation?.roleType || (isAdminRequest ? accountType : "student");
    const assignedProvinceId = invitation?.provinceId || String(provinceId).trim();
    const accountStatus = invitation?.accountStatus === "suspended" ? "suspended" : isAdminRequest ? "pending" : "active";
    await updateProfile(credential.user, { displayName: cleanName });
    await setDoc(doc(db, "users", credential.user.uid), {
      name: cleanName,
      email: credential.user.email,
      phone: String(phone).trim(),
      username: String(username || invitation?.username || "").trim(),
      accountType: String(accountType).trim(),
      decisionType: String(decisionType).trim(),
      gender: String(gender).trim(),
      state: String(state).trim(),
      provinceId: assignedProvinceId,
      parish: String(parish).trim(),
      conversionDate: String(conversionDate).trim(),
      invitedBy: String(invitedBy).trim(),
      baptismStatus: String(baptismStatus).trim() || "not-recorded",
      workerAssigned: String(workerAssigned).trim(),
      requestedRole: String(requestedRole || role).trim(),
      ministryPosition: String(ministryPosition).trim(),
      yearsOfService: String(yearsOfService).trim(),
      idCardFileName: String(idCardFileName).trim(),
      passportPhotoFileName: String(passportPhotoFileName).trim(),
      recommendationLetterFileName: String(recommendationLetterFileName).trim(),
      occupation: String(occupation).trim(),
      officeAddress: String(officeAddress).trim(),
      homeAddress: String(homeAddress).trim(),
      nearestBusStop: String(nearestBusStop).trim(),
      prayerRequest: String(prayerRequest).trim(),
      discipleStatus: "new",
      followUpStatus: "needed",
      role,
      adminRole: invitation?.roleType || "",
      accessLevel: invitation?.accessLevel || "standard",
      accountStatus,
      invitationId: inviteToken,
      accessPlan: "member",
      hardcopyInterest: false,
      completedDays: [],
      createdAt: serverTimestamp(),
      joinedAt
    });

    if (isAdminRequest && !invitation) {
      await setDoc(doc(db, "adminRequests", credential.user.uid), {
        fullName: cleanName,
        email: credential.user.email,
        phone: String(phone).trim(),
        gender: String(gender).trim(),
        username: String(username).trim(),
        provinceId: assignedProvinceId,
        provinceCode: String(state).trim(),
        provinceLocation: String(parish).trim(),
        requestedRole: String(requestedRole || role).trim(),
        ministryPosition: String(ministryPosition).trim(),
        parish: String(officeAddress || parish).trim(),
        yearsOfService: String(yearsOfService).trim(),
        idCardFileName: String(idCardFileName).trim(),
        passportPhotoFileName: String(passportPhotoFileName).trim(),
        recommendationLetterFileName: String(recommendationLetterFileName).trim(),
        status: "pending",
        submittedAt: serverTimestamp(),
        approvedBy: "",
        approvedAt: ""
      });
      await setDoc(doc(db, "admins", credential.user.uid), {
        fullName: cleanName,
        email: credential.user.email,
        phone: String(phone).trim(),
        username: String(username).trim(),
        gender: String(gender).trim(),
        role,
        provinceId: assignedProvinceId,
        accessLevel: "pending",
        status: "pending",
        lastLogin: "",
        createdAt: serverTimestamp()
      });
      await addActivityLog({
        adminId: credential.user.uid,
        activity: `Submitted ${role} approval request`,
        provinceId: assignedProvinceId
      });
    }

    if (invitation) {
      await setDoc(doc(db, "admins", credential.user.uid), {
        fullName: cleanName,
        email: credential.user.email,
        phone: String(phone || invitation.phone || "").trim(),
        username: String(username || invitation.username || "").trim(),
        gender: String(gender || invitation.gender || "").trim(),
        role,
        provinceId: assignedProvinceId,
        accessLevel: invitation.accessLevel || "standard",
        status: accountStatus,
        invitationId: inviteToken,
        lastLogin: "",
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "adminInvitations", inviteToken), {
        status: "accepted",
        activatedUserId: credential.user.uid,
        activatedAt: serverTimestamp()
      });
      await addActivityLog({
        adminId: credential.user.uid,
        activity: `Activated ${role} account for ${cleanName}`,
        provinceId: assignedProvinceId
      });
    }

    return { ok: true, user: publicUser(credential.user, { name: cleanName, accessPlan: "member", role, provinceId: assignedProvinceId, accountStatus, joinedAt }) };
  } catch (error) {
    return { ok: false, message: authErrorMessage(error) };
  }
}

export async function loginUser({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    const profile = await getUserProfile(credential.user.uid);
    if (isProvinceStaff(profile) || isSuperAdmin(profile)) {
      updateDoc(doc(db, "admins", credential.user.uid), { lastLogin: serverTimestamp() }).catch(() => {});
      addActivityLog({
        adminId: credential.user.uid,
        activity: `Logged in as ${profile.role}`,
        provinceId: profile.provinceId || ""
      }).catch(() => {});
    }
    return { ok: true, user: publicUser(credential.user, profile) };
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

export async function listUsersForAdmin(adminUser) {
  const usersRef = collection(db, "users");
  const usersQuery = isProvinceStaff(adminUser)
    ? query(usersRef, where("provinceId", "==", adminUser.provinceId || ""))
    : usersRef;
  const snapshot = await getDocs(usersQuery);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

function createToken(prefix = "invite") {
  const random = crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${random}`;
}

export function generateTemporaryPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$";
  const values = crypto.getRandomValues(new Uint32Array(14));
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
}

export async function addActivityLog({ adminId, activity, provinceId = "" }) {
  await addDoc(collection(db, "activityLogs"), {
    adminId,
    activity,
    provinceId,
    ipAddress: "",
    createdAt: serverTimestamp()
  });
}

export async function createAdminInvitation(data, currentUser) {
  const token = createToken("admin");
  const provinceId = String(data.provinceId || "").trim();
  const payload = {
    fullName: String(data.fullName || "").trim(),
    email: normalizeEmail(data.email || ""),
    phone: String(data.phone || "").trim(),
    gender: String(data.gender || "").trim(),
    username: String(data.username || "").trim(),
    roleType: String(data.roleType || "province-admin").trim(),
    provinceId,
    accessLevel: String(data.accessLevel || "standard").trim(),
    status: "pending",
    accountStatus: String(data.accountStatus || "pending-verification").trim(),
    profilePhotoUrl: String(data.profilePhotoUrl || "").trim(),
    hasTemporaryPassword: Boolean(data.temporaryPassword),
    createdBy: currentUser?.id || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(doc(db, "adminInvitations", token), payload);
  await addDoc(collection(db, "admins"), {
    ...payload,
    invitationId: token,
    status: payload.status === "active" ? "pending-activation" : payload.status,
    lastLogin: "",
    createdAt: serverTimestamp()
  });
  await addActivityLog({
    adminId: currentUser?.id || "",
    activity: `Created invitation for ${payload.fullName} as ${payload.roleType}`,
    provinceId
  });
  return { id: token, ...payload };
}

export async function listAdminInvitations() {
  const snapshot = await getDocs(collection(db, "adminInvitations"));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(a.fullName || a.email).localeCompare(String(b.fullName || b.email)));
}

export async function listAdminRequests() {
  const snapshot = await getDocs(collection(db, "adminRequests"));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(a.fullName || a.email).localeCompare(String(b.fullName || b.email)));
}

export async function decideAdminRequest(request, decision, currentUser) {
  const status = decision === "approved" ? "approved" : "rejected";
  const accountStatus = decision === "approved" ? "approved" : "rejected";
  const userId = request.id;
  const update = {
    status,
    approvedBy: currentUser?.id || "",
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await updateDoc(doc(db, "adminRequests", userId), update);
  await updateDoc(doc(db, "users", userId), {
    role: request.requestedRole || "province-admin",
    provinceId: request.provinceId || "",
    accountStatus,
    accessLevel: decision === "approved" ? "standard" : "none",
    updatedAt: serverTimestamp()
  });
  await setDoc(doc(db, "admins", userId), {
    fullName: request.fullName || "",
    email: request.email || "",
    phone: request.phone || "",
    username: request.username || "",
    gender: request.gender || "",
    role: request.requestedRole || "province-admin",
    provinceId: request.provinceId || "",
    accessLevel: decision === "approved" ? "standard" : "none",
    status: accountStatus,
    lastLogin: "",
    updatedAt: serverTimestamp()
  }, { merge: true });
  await addActivityLog({
    adminId: currentUser?.id || "",
    activity: `${status === "approved" ? "Approved" : "Rejected"} admin request for ${request.fullName || request.email}`,
    provinceId: request.provinceId || ""
  });
}

export async function getAdminInvitation(token) {
  if (!token) return null;
  const snapshot = await getDoc(doc(db, "adminInvitations", token));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function listProvinces({ activeOnly = false, includeDefaults = true } = {}) {
  const provinceRef = collection(db, "provinces");
  const snapshot = await getDocs(provinceRef);
  const provinces = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => !activeOnly || item.status === "active");
  const existingIds = new Set(provinces.map((province) => province.id));
  const fallbackOndo = includeDefaults ? defaultOndoProvinces.filter((province) => !existingIds.has(province.id)) : [];

  return [...provinces, ...fallbackOndo]
    .filter((item) => !activeOnly || item.status === "active")
    .sort((a, b) => String(a.provinceName || "").localeCompare(String(b.provinceName || "")));
}

export async function ensureDefaultOndoProvinces(currentUser = null) {
  const superAdminId = currentUser?.id || "";
  const superAdminEmail = currentUser?.email || "";
  const activatedAt = serverTimestamp();

  await Promise.all(defaultOndoProvinces.map((province) => setDoc(doc(db, "provinces", province.id), {
    ...province,
    status: "active",
    activationStatus: "active",
    onboardedBy: superAdminId,
    onboardedByEmail: superAdminEmail,
    onboardedUnder: "super-admin",
    supervisionLevel: "super-admin",
    activatedBy: superAdminId,
    activatedByEmail: superAdminEmail,
    activatedAt,
    createdAt: activatedAt,
    updatedAt: activatedAt
  }, { merge: true })));
  if (superAdminId) {
    await setDoc(doc(db, "superAdminReports", `province-onboarding-${superAdminId}`), {
      reportType: "province-onboarding",
      title: "Province Onboarding Activation Report",
      provinceCount: defaultOndoProvinces.length,
      provinceIds: defaultOndoProvinces.map((province) => province.id),
      provinceNames: defaultOndoProvinces.map((province) => province.provinceName),
      status: "completed",
      submittedTo: superAdminId,
      submittedToEmail: superAdminEmail,
      createdBy: superAdminId,
      createdAt: activatedAt,
      updatedAt: activatedAt
    }, { merge: true });
    await addActivityLog({
      adminId: superAdminId,
      activity: `Activated and reported ${defaultOndoProvinces.length} onboarded provinces to super admin`,
      provinceId: ""
    });
  }
  return listProvinces();
}

export async function createProvince(data, currentUser = null) {
  const provinceName = String(data.provinceName || "").trim();
  const provinceCode = String(data.provinceCode || "").trim().toUpperCase();
  const superAdminId = currentUser?.id || "";
  const payload = {
    provinceName,
    provinceCode,
    address: String(data.address || "").trim(),
    stateRegion: String(data.stateRegion || "").trim(),
    provinceEmail: String(data.provinceEmail || "").trim(),
    provincePhone: String(data.provincePhone || "").trim(),
    provinceLeader: String(data.provinceLeader || "").trim(),
    contactInfo: String(data.contactInfo || "").trim(),
    status: data.status || "active",
    onboardedBy: superAdminId,
    onboardedByEmail: currentUser?.email || "",
    onboardedUnder: superAdminId ? "super-admin" : "",
    supervisionLevel: superAdminId ? "super-admin" : "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  const reference = await addDoc(collection(db, "provinces"), payload);
  if (superAdminId) {
    await addActivityLog({
      adminId: superAdminId,
      activity: `Created province ${provinceName} under super admin`,
      provinceId: reference.id
    });
  }
  return { id: reference.id, ...payload };
}

export async function updateProvince(provinceId, data) {
  await updateDoc(doc(db, "provinces", provinceId), {
    provinceName: String(data.provinceName || "").trim(),
    provinceCode: String(data.provinceCode || "").trim().toUpperCase(),
    address: String(data.address || "").trim(),
    stateRegion: String(data.stateRegion || "").trim(),
    provinceEmail: String(data.provinceEmail || "").trim(),
    provincePhone: String(data.provincePhone || "").trim(),
    provinceLeader: String(data.provinceLeader || "").trim(),
    contactInfo: String(data.contactInfo || "").trim(),
    status: data.status || "active",
    updatedAt: serverTimestamp()
  });
}

export async function deleteProvince(provinceId) {
  await deleteDoc(doc(db, "provinces", provinceId));
}

export async function saveSuperAdminEndpointReport(report, currentUser = null) {
  const reportId = `province-endpoint-${new Date().toISOString().slice(0, 10)}`;
  await setDoc(doc(db, "superAdminReports", reportId), {
    ...report,
    reportType: "province-endpoint",
    title: "Province Endpoint Report",
    submittedTo: currentUser?.id || "",
    submittedToEmail: currentUser?.email || "",
    createdBy: currentUser?.id || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  await addActivityLog({
    adminId: currentUser?.id || "",
    activity: `Generated endpoint report for ${report.provinceCount || 0} provinces`,
    provinceId: ""
  });
  return { id: reportId, ...report };
}

export async function submitProvinceReportToSuperAdmin(report, currentUser = null) {
  const provinceId = report.provinceId || currentUser?.provinceId || "unassigned";
  const reportId = `province-report-${provinceId}-${new Date().toISOString().slice(0, 10)}`;
  await setDoc(doc(db, "superAdminReports", reportId), {
    reportType: "province-report",
    title: `${report.provinceName || "Province"} Report`,
    provinceId,
    provinceName: report.provinceName || "",
    submittedBy: currentUser?.id || "",
    submittedByEmail: currentUser?.email || "",
    submittedTo: "super-admin",
    report,
    status: "submitted",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });
  await addActivityLog({
    adminId: currentUser?.id || "",
    activity: `Submitted report for ${report.provinceName || provinceId} to super admin`,
    provinceId
  });
  return { id: reportId, report };
}
