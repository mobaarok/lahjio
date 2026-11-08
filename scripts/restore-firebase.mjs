// Loads a backup (from npm run backup) into a NEW, empty Firebase project:
//   npm run restore -- backups/lahjio-beta-2026-11-09
//
// It copies every Firestore document (same paths, same ids) and imports every
// login account with the SAME user id, so learners keep their progress.
//
// Real project: needs a service account key of the NEW project in
// tools/service-account.json. Email/password accounts keep their password only
// if tools/password-hash.json holds the OLD project's "Password hash parameters"
// (Firebase Console > Authentication > Users > ⋮), like this:
//   { "base64_signer_key": "...", "base64_salt_separator": "...", "rounds": 8, "mem_cost": 14 }
// Without it they are imported without a password and must use "Forgot password".
//
// Safety: it stops if the target project already has items, and it never
// writes to the old project (lahjio-beta).
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp, GeoPoint } from "firebase-admin/firestore";

const OLD_PROJECT = "lahjio-beta";
const root = path.resolve(import.meta.dirname, "..");
const backupDir = process.argv[2] && path.resolve(root, process.argv[2]);
if (!backupDir || !existsSync(path.join(backupDir, "firestore.json"))) {
  console.error("Usage: npm run restore -- backups/<folder>   (the folder needs firestore.json)");
  process.exit(1);
}

// --- Connect to the target project ---------------------------------------------
const useEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
let projectId;
if (useEmulators) {
  projectId = "demo-lahjio";
  initializeApp({ projectId });
} else {
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? path.join(root, "tools", "service-account.json");
  if (!existsSync(keyFile)) {
    console.error(`No service account key at ${keyFile}. Download one from the NEW project.`);
    process.exit(1);
  }
  const key = JSON.parse(readFileSync(keyFile, "utf8"));
  projectId = key.project_id;
  if (projectId === OLD_PROJECT) {
    console.error(`The key is for the old project (${OLD_PROJECT}). Use a key from the new project.`);
    process.exit(1);
  }
  initializeApp({ credential: cert(key), projectId });
}
const db = getFirestore();
console.log(`Restoring ${path.basename(backupDir)} into ${projectId}${useEmulators ? " (emulators)" : ""}`);

// Never pour a backup on top of real content
const existing = await db.collection("items").limit(1).get();
if (!existing.empty) {
  console.error(`${projectId} already has items. Restore only into an empty project.`);
  process.exit(1);
}

// --- JSON -> Firestore values (the opposite of toJson in backup-firebase.mjs) -----
function fromJson(value) {
  if (Array.isArray(value)) return value.map(fromJson);
  if (value && typeof value === "object") {
    if (value.__type === "timestamp") return Timestamp.fromDate(new Date(value.value));
    if (value.__type === "geopoint") return new GeoPoint(value.latitude, value.longitude);
    if (value.__type === "reference") return db.doc(value.path);
    if (value.__type === "bytes") return Buffer.from(value.base64, "base64");
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fromJson(v)]));
  }
  return value;
}

// --- Firestore -------------------------------------------------------------------------
const documents = JSON.parse(readFileSync(path.join(backupDir, "firestore.json"), "utf8"));
const writer = db.bulkWriter();
for (const [docPath, data] of Object.entries(documents)) {
  writer.set(db.doc(docPath), fromJson(data));
}
await writer.close();
console.log(`  firestore: ${Object.keys(documents).length} documents`);

// --- Auth ------------------------------------------------------------------------------
// Accepts both formats: "firebase auth:export" ({ users: [...] }) and backup-firebase.mjs ([...])
const authFile = path.join(backupDir, "auth-users.json");
const raw = existsSync(authFile) ? JSON.parse(readFileSync(authFile, "utf8")) : [];
const accounts = Array.isArray(raw) ? raw : raw.users;

const hashFile = path.join(root, "tools", "password-hash.json");
const hashFromFile = existsSync(hashFile) ? JSON.parse(readFileSync(hashFile, "utf8")) : null;
// The template still says PASTE_HERE until the real values are filled in
const hashParams = hashFromFile && !hashFromFile.base64_signer_key.startsWith("PASTE") ? hashFromFile : null;

const toDate = (value) => (value ? new Date(/^\d+$/.test(value) ? Number(value) : value).toUTCString() : undefined);

const records = accounts.map((a) => {
  const providers = a.providerUserInfo ?? a.providers ?? [];
  const record = {
    uid: a.localId ?? a.uid,
    email: a.email ?? undefined,
    emailVerified: Boolean(a.emailVerified),
    displayName: a.displayName ?? undefined,
    photoURL: a.photoUrl ?? a.photoURL ?? undefined,
    disabled: Boolean(a.disabled),
    metadata: { creationTime: toDate(a.createdAt), lastSignInTime: toDate(a.lastSignedInAt ?? a.lastSignInAt) },
    // Google and other sign-in methods; "password" comes from the hash below
    providerData: providers
      .filter((p) => p.providerId !== "password")
      .map((p) => ({
        uid: p.rawId ?? p.uid,
        providerId: p.providerId,
        email: p.email ?? undefined,
        displayName: p.displayName ?? undefined,
        photoURL: p.photoUrl ?? undefined,
      })),
  };
  const hash = a.passwordHash;
  if (hash && hashParams) {
    record.passwordHash = Buffer.from(hash, "base64");
    record.passwordSalt = Buffer.from(a.salt ?? a.passwordSalt, "base64");
  }
  return record;
});

if (records.length > 0) {
  const options = hashParams
    ? {
        hash: {
          algorithm: "SCRYPT",
          key: Buffer.from(hashParams.base64_signer_key, "base64"),
          saltSeparator: Buffer.from(hashParams.base64_salt_separator, "base64"),
          rounds: hashParams.rounds,
          memoryCost: hashParams.mem_cost,
        },
      }
    : undefined;
  const result = await getAuth().importUsers(records, options);
  console.log(`  auth: ${result.successCount} accounts imported, ${result.failureCount} failed`);
  for (const e of result.errors) console.log(`    account ${e.index}: ${e.error.message}`);
  const noPassword = accounts.filter((a) => a.passwordHash).length;
  if (noPassword && !hashParams) {
    console.log(`  ${noPassword} email/password account(s) have no password now (no tools/password-hash.json).`);
  }
}

console.log("Done. Next: publish firestore.rules in the new project.");
process.exit(0);
