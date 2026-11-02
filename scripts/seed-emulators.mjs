// Fills the LOCAL Firebase emulators with test data. Never touches the real project.
//
// 1. Start the emulators:  npx firebase emulators:start --project demo-lahjio
// 2. Run this script:      npm run seed:emulators
// 3. Start the app:        npm run dev:emulators
//
// It creates two test accounts that only exist inside the emulator:
//   admin@lahjio.test   / test-admin-pass    (can open /admin)
//   learner@lahjio.test / test-learner-pass  (a normal learner)
import { readFileSync } from "node:fs";
import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { connectFirestoreEmulator, doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";

const PROJECT_ID = "demo-lahjio";
const AUTH_URL = "http://127.0.0.1:9099";
const FIRESTORE_URL = "http://127.0.0.1:8080";

const accounts = {
  admin: { email: "admin@lahjio.test", password: "test-admin-pass", displayName: "Test Admin" },
  learner: { email: "learner@lahjio.test", password: "test-learner-pass", displayName: "Test Learner" },
};

// Creates an emulator account, or finds it if it already exists. Returns its uid.
async function createAccount({ email, password, displayName }) {
  const url = `${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-key`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, displayName, returnSecureToken: true }),
  });
  const data = await response.json();
  if (data.localId) return data.localId;

  // Already exists: sign in to get the uid
  const signIn = await fetch(`${AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  return (await signIn.json()).localId;
}

// The admins collection can't be written from the app (rules say no), so the
// script writes it directly with the emulator's "owner" access
async function makeAdmin(uid) {
  const url = `${FIRESTORE_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/admins/${uid}`;
  const response = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: "Bearer owner", "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { email: { stringValue: accounts.admin.email } } }),
  });
  if (!response.ok) throw new Error(`Couldn't create the admin: ${await response.text()}`);
}

const adminUid = await createAccount(accounts.admin);
await createAccount(accounts.learner);
await makeAdmin(adminUid);

// Everything else is written as the admin, so the security rules are tested too
const app = initializeApp({ apiKey: "fake-key", projectId: PROJECT_ID });
const auth = getAuth(app);
const db = getFirestore(app);
connectAuthEmulator(auth, AUTH_URL, { disableWarnings: true });
connectFirestoreEmulator(db, "127.0.0.1", 8080);
await signInWithEmailAndPassword(auth, accounts.admin.email, accounts.admin.password);

const { categories, items } = JSON.parse(readFileSync(new URL("./seed-data.json", import.meta.url), "utf8"));

for (const { id, ...category } of categories) {
  await setDoc(doc(db, "categories", id), category);
}
for (const { id, ...item } of items) {
  await setDoc(doc(db, "items", id), { ...item, created_at: serverTimestamp(), updated_at: serverTimestamp() });
}
await setDoc(doc(db, "meta", "content"), { version: Date.now(), updated_at: serverTimestamp() });

await signOut(auth);
console.log(`Seeded ${categories.length} categories and ${items.length} items.`);
console.log(`Test accounts: ${accounts.admin.email} (admin) and ${accounts.learner.email}`);
process.exit(0);
