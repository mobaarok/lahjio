// Starts the LOCAL Firebase emulators (npm run emulators), using the Java and
// firebase-tools kept in tools/ so nothing has to be installed system-wide.
//
// tools/ is not in git. If it's missing, unpack a Java 21 runtime into
// tools/java and run "npm install firebase-tools" inside tools/firebase-tools.
// Android Studio's built-in Java is used as a backup.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const javaHomes = [
  path.join(root, "tools", "java"),
  "C:\\Program Files\\Android\\Android Studio\\jbr",
];
const firebaseCli = path.join(root, "tools", "firebase-tools", "node_modules", "firebase-tools", "lib", "bin", "firebase.js");

const javaHome = javaHomes.find((home) => existsSync(path.join(home, "bin")));
if (!javaHome) throw new Error("No Java 21 found. Put one in tools/java (see the top of this file).");
if (!existsSync(firebaseCli)) throw new Error("firebase-tools not found in tools/firebase-tools (see the top of this file).");

// Put Java first on the PATH, only for this command
const env = { ...process.env, JAVA_HOME: javaHome, PATH: path.join(javaHome, "bin") + path.delimiter + process.env.PATH };

console.log(`Using Java from ${javaHome}`);
spawn(process.execPath, [firebaseCli, "emulators:start", "--project", "demo-lahjio"], { cwd: root, env, stdio: "inherit" })
  .on("exit", (code) => process.exit(code ?? 0));
