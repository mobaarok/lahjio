// Downloads EVERYTHING from a Firebase project to this computer (npm run backup):
//   firestore.json       every document, including subcollections (users/x/progress/...)
//   auth-users.json      every login account (email, Google sign-in, password hash)
//   firestore.rules      the security rules that are published right now
//   SCHEMA.md            collections and fields, worked out from the real data
//   summary.json         counts, and whether the published rules match firestore.rules
//
// Files go to backups/<project>-<date>/. backups/ is not in git: it holds
// learners' emails and password hashes, so never commit or share it.
//
// Real project: needs a service account key (Firebase Console > Project settings >
// Service accounts > Generate new private key), saved as tools/service-account.json.
// Emulators: run with FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST set
// (npm run backup:emulators); no key is needed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp, GeoPoint, DocumentReference } from "firebase-admin/firestore";
import { getSecurityRules } from "firebase-admin/security-rules";

const root = path.resolve(import.meta.dirname, "..");
const useEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? path.join(root, "tools", "service-account.json");

// --- Connect -----------------------------------------------------------------
let projectId;
if (useEmulators) {
  projectId = "demo-lahjio";
  initializeApp({ projectId });
} else {
  if (!existsSync(keyFile)) {
    console.error(`No service account key at ${keyFile}.`);
    console.error("Download it from Firebase Console > Project settings > Service accounts.");
    process.exit(1);
  }
  const key = JSON.parse(readFileSync(keyFile, "utf8"));
  projectId = key.project_id;
  initializeApp({ credential: cert(key), projectId });
}

const db = getFirestore();
const day = new Date().toLocaleDateString("en-CA"); // "2026-11-09" in this computer's time zone
const outDir = path.join(root, "backups", `${projectId}-${day}`);
mkdirSync(outDir, { recursive: true });
console.log(`Backing up ${projectId}${useEmulators ? " (emulators)" : ""} to ${outDir}`);

// --- Firestore values -> JSON ---------------------------------------------------
// Special Firestore types are tagged, so a restore script can rebuild them exactly.
function toJson(value) {
  if (value instanceof Timestamp) return { __type: "timestamp", value: value.toDate().toISOString() };
  if (value instanceof GeoPoint) return { __type: "geopoint", latitude: value.latitude, longitude: value.longitude };
  if (value instanceof DocumentReference) return { __type: "reference", path: value.path };
  if (Buffer.isBuffer(value)) return { __type: "bytes", base64: value.toString("base64") };
  if (Array.isArray(value)) return value.map(toJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toJson(v)]));
  }
  return value;
}

// --- Firestore: walk every collection and subcollection -------------------------
// Result: { "items/abc": {...}, "users/u1/progress/42": {...}, ... }
const documents = {};

async function backupCollection(collectionRef) {
  // listDocuments() also finds "empty" parents that only hold subcollections
  const refs = await collectionRef.listDocuments();
  for (let start = 0; start < refs.length; start += 300) {
    const snapshots = await db.getAll(...refs.slice(start, start + 300));
    for (const snapshot of snapshots) {
      if (snapshot.exists) documents[snapshot.ref.path] = toJson(snapshot.data());
    }
  }
  for (const ref of refs) {
    for (const sub of await ref.listCollections()) await backupCollection(sub);
  }
}

for (const collection of await db.listCollections()) {
  process.stdout.write(`  ${collection.id}... `);
  const before = Object.keys(documents).length;
  await backupCollection(collection);
  console.log(`${Object.keys(documents).length - before} documents (with subcollections)`);
}
writeFileSync(path.join(outDir, "firestore.json"), JSON.stringify(documents, null, 2));

// --- Auth: every account ---------------------------------------------------------
const users = [];
let pageToken;
do {
  const page = await getAuth().listUsers(1000, pageToken);
  for (const u of page.users) {
    users.push({
      uid: u.uid,
      email: u.email ?? null,
      emailVerified: u.emailVerified,
      displayName: u.displayName ?? null,
      photoURL: u.photoURL ?? null,
      disabled: u.disabled,
      createdAt: u.metadata.creationTime,
      lastSignInAt: u.metadata.lastSignInTime,
      providers: u.providerData.map((p) => ({ providerId: p.providerId, uid: p.uid, email: p.email ?? null })),
      // Needed to move email/password accounts to another project without a reset.
      // The hash settings are in Firebase Console > Authentication > Users > ⋮ > Password hash parameters.
      passwordHash: u.passwordHash ?? null,
      passwordSalt: u.passwordSalt ?? null,
      customClaims: u.customClaims ?? null,
    });
  }
  pageToken = page.pageToken;
} while (pageToken);
writeFileSync(path.join(outDir, "auth-users.json"), JSON.stringify(users, null, 2));
console.log(`  auth: ${users.length} accounts`);

// --- Published security rules -------------------------------------------------------
let rulesStatus = "skipped (the emulators have no published rules)";
if (!useEmulators) {
  const ruleset = await getSecurityRules().getFirestoreRuleset();
  const published = ruleset.source.map((file) => file.content).join("\n");
  writeFileSync(path.join(outDir, "firestore.rules"), published);
  const local = readFileSync(path.join(root, "firestore.rules"), "utf8");
  const same = published.replace(/\r\n/g, "\n").trim() === local.replace(/\r\n/g, "\n").trim();
  rulesStatus = same
    ? "published rules are the same as firestore.rules"
    : "published rules are DIFFERENT from firestore.rules";
  console.log(`  rules: ${rulesStatus} (published ${ruleset.createTime})`);
}

// --- Schema: collections and fields, from the data ------------------------------------
// "users/abc/progress/42" -> "users/{id}/progress/{id}"
const pattern = (docPath) => docPath.split("/").map((part, i) => (i % 2 ? "{id}" : part)).join("/");
function typeOf(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (value?.__type) return value.__type;
  return typeof value === "object" ? "map" : typeof value;
}

const schema = {};
for (const [docPath, data] of Object.entries(documents)) {
  const entry = (schema[pattern(docPath)] ??= { count: 0, fields: {} });
  entry.count++;
  for (const [field, value] of Object.entries(data)) {
    const info = (entry.fields[field] ??= { types: new Set(), count: 0 });
    info.types.add(typeOf(value));
    info.count++;
  }
}

const lines = [
  `# Firestore schema: ${projectId}`,
  "",
  `Worked out from the data on ${day}. "in N of M" shows how many documents have the field.`,
  "",
];
for (const name of Object.keys(schema).sort()) {
  const { count, fields } = schema[name];
  lines.push(`## ${name}`, "", `${count} documents`, "", "| Field | Type | In |", "|---|---|---|");
  for (const field of Object.keys(fields).sort()) {
    const info = fields[field];
    lines.push(`| ${field} | ${[...info.types].join(" or ")} | ${info.count} of ${count} |`);
  }
  lines.push("");
}
writeFileSync(path.join(outDir, "SCHEMA.md"), lines.join("\n"));

// --- Summary --------------------------------------------------------------------------------
const counts = Object.fromEntries(Object.keys(schema).sort().map((name) => [name, schema[name].count]));
const summary = { projectId, emulators: useEmulators, date: new Date().toISOString(), authUsers: users.length, rules: rulesStatus, counts };
writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
console.log(`Done: ${Object.keys(documents).length} documents, ${users.length} accounts.`);
process.exit(0);
