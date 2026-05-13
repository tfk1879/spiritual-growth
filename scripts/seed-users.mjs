import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { firebaseConfig } from "../firebase-config.js";

const seededUsers = [
  {
    name: "Admin User",
    email: "admin@spiritualgrowth.local",
    password: "Admin@12345",
    phone: "",
    decisionType: "accepted-christ",
    occupation: "Administrator",
    officeAddress: "",
    homeAddress: "",
    nearestBusStop: "",
    prayerRequest: "",
    role: "admin",
    accessPlan: "member"
  },
  {
    name: "Student User",
    email: "student@spiritualgrowth.local",
    password: "Student@12345",
    phone: "",
    decisionType: "accepted-christ",
    occupation: "Student",
    officeAddress: "",
    homeAddress: "",
    nearestBusStop: "",
    prayerRequest: "Help me grow steadily after salvation.",
    role: "student",
    accessPlan: "member"
  }
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function withTimeout(label, promise, timeoutMs = 30000) {
  let timeout;
  const timer = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs / 1000}s`)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timer]);
  } finally {
    clearTimeout(timeout);
  }
}

async function ensureUser(seedUser) {
  let credential;
  let created = false;

  try {
    console.log(`Creating ${seedUser.role}: ${seedUser.email}`);
    credential = await withTimeout(
      `Create ${seedUser.email}`,
      createUserWithEmailAndPassword(auth, seedUser.email, seedUser.password)
    );
    created = true;
  } catch (error) {
    if (error?.code !== "auth/email-already-in-use") throw error;
    console.log(`Signing in existing ${seedUser.role}: ${seedUser.email}`);
    credential = await withTimeout(
      `Sign in ${seedUser.email}`,
      signInWithEmailAndPassword(auth, seedUser.email, seedUser.password)
    );
  }

  console.log(`Saving auth profile: ${seedUser.email}`);
  await withTimeout(`Update profile ${seedUser.email}`, updateProfile(credential.user, { displayName: seedUser.name }));

  const joinedAt = new Date().toISOString();
  console.log(`Saving Firestore profile: ${seedUser.email}`);
  await withTimeout(
    `Save Firestore profile ${seedUser.email}`,
    setDoc(
      doc(db, "users", credential.user.uid),
      {
        name: seedUser.name,
        email: credential.user.email,
        phone: seedUser.phone,
        decisionType: seedUser.decisionType,
        occupation: seedUser.occupation,
        officeAddress: seedUser.officeAddress,
        homeAddress: seedUser.homeAddress,
        nearestBusStop: seedUser.nearestBusStop,
        prayerRequest: seedUser.prayerRequest,
        discipleStatus: seedUser.role === "admin" ? "mentor" : "new",
        followUpStatus: seedUser.role === "admin" ? "none" : "needed",
        role: seedUser.role,
        accessPlan: seedUser.accessPlan,
        hardcopyInterest: false,
        completedDays: [],
        joinedAt,
        updatedAt: serverTimestamp(),
        ...(created ? { createdAt: serverTimestamp() } : {})
      },
      { merge: true }
    )
  );

  return { ...seedUser, id: credential.user.uid, created };
}

try {
  console.log("Seeding Firebase Auth users and Firestore profiles...");

  for (const seedUser of seededUsers) {
    const result = await ensureUser(seedUser);
    console.log(`${result.created ? "Created" : "Updated"} ${result.role}: ${result.email} (${result.id})`);
  }

  console.log("\nSeed login details:");
  for (const seedUser of seededUsers) {
    console.log(`${seedUser.role}: ${seedUser.email} / ${seedUser.password}`);
  }

  process.exit(0);
} catch (error) {
  console.error("\nSeed failed.");
  console.error(error);
  process.exit(1);
}
