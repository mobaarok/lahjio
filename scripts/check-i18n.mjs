// Checks that every text key used in the code exists in every language file,
// and that the language files have the same keys. Run: npm run check:i18n
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import bn from "../src/i18n/messages/bn.js";
import en from "../src/i18n/messages/en.js";
import hi from "../src/i18n/messages/hi.js";
import ur from "../src/i18n/messages/ur.js";

const languages = { bn, en, hi, ur };

// Keys built from variables in the code, e.g. t(`level.${course.level}`)
const dynamicKeys = [
  "meta.title",
  ...["ar-bn", "bn-ar", "listen"].map((k) => `quiz.prompt.${k}`),
  ...["all", "word", "phrase"].map((k) => `type.${k}`),
  ...["beginner", "intermediate", "advanced"].map((k) => `level.${k}`),
  ...["word", "phrase", "topic", "mixed"].map((k) => `courseType.${k}`),
  ...["due", "new", "hard", "all"].flatMap((k) => [`practice.mode.${k}`, `practice.mode.${k}Text`]),
  ...["free", "minutes", "audio"].map((k) => `landing.trust.${k}`),
  ...["shop", "taxi", "work", "friends"].flatMap((k) => [`landing.situations.${k}`, `landing.situations.${k}Meaning`]),
  ...["learn", "practice", "remember"].flatMap((k) => [`landing.how.${k}`, `landing.how.${k}Text`]),
  ...["words", "audio", "review", "habit"].flatMap((k) => [`landing.features.${k}`, `landing.features.${k}Text`]),
  ...["free", "letters", "dialect", "phone", "time"].flatMap((k) => [`landing.faq.${k}Q`, `landing.faq.${k}A`]),
  ...["collect", "why", "where", "never", "contact"].flatMap((k) => [`privacy.${k}`, `privacy.${k}Text`]),
  ...["use", "content", "account", "free", "changes", "contact"].flatMap((k) => [`terms.${k}`, `terms.${k}Text`]),
];

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === "admin" || name === "i18n" ? [] : sourceFiles(path);
    return /\.jsx?$/.test(name) ? [path] : [];
  });
}

// Static keys: t("x.y"), key: "nav.home", and "auth.*" / "error.*" strings
const usedKeys = new Set(dynamicKeys);
for (const file of sourceFiles("src")) {
  const text = readFileSync(file, "utf8");
  for (const pattern of [/\bt\(\s*"([\w.-]+)"/g, /key:\s*"((?:nav|footer)\.[\w.]+)"/g, /"((?:auth|error)\.\w+)"/g]) {
    for (const match of text.matchAll(pattern)) usedKeys.add(match[1]);
  }
}

let problems = 0;
for (const [code, messages] of Object.entries(languages)) {
  const missing = [...usedKeys].filter((key) => !(key in messages));
  if (missing.length) {
    problems += missing.length;
    console.log(`${code}: missing ${missing.length} keys:\n  ${missing.join("\n  ")}`);
  }
}
// Every language must have exactly the same keys as English
const onlyIn = (a, b) => Object.keys(a).filter((key) => !(key in b));
for (const [code, messages] of Object.entries(languages)) {
  if (code === "en") continue;
  for (const [name, keys] of [[`${code} only`, onlyIn(messages, en)], [`missing in ${code}`, onlyIn(en, messages)]]) {
    if (keys.length) {
      problems += keys.length;
      console.log(`${name}: ${keys.join(", ")}`);
    }
  }
}

console.log(problems ? `${problems} problems found.` : `All ${usedKeys.size} keys are translated in ${Object.keys(languages).join(", ")}.`);
process.exit(problems ? 1 : 0);
