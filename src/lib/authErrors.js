// Turns a Firebase error code into a message key for useLocale().t().
// The messages themselves live in i18n/messages/bn.js and en.js.

const keys = {
  "auth/email-already-in-use": "auth.emailInUse",
  "auth/invalid-email": "auth.invalidEmail",
  "auth/missing-email": "auth.missingEmail",
  "auth/weak-password": "auth.weakPassword",
  "auth/invalid-credential": "auth.wrongLogin",
  "auth/user-not-found": "auth.wrongLogin",
  "auth/wrong-password": "auth.wrongLogin",
  "auth/user-disabled": "auth.disabled",
  "auth/too-many-requests": "auth.tooMany",
  "auth/network-request-failed": "auth.network",
  "auth/popup-closed-by-user": "auth.popupClosed",
  "auth/cancelled-popup-request": "auth.popupClosed",
  "auth/popup-blocked": "auth.popupBlocked",
  "auth/requires-recent-login": "auth.recentLogin",
};

export function authErrorKey(code) {
  return keys[code] ?? "auth.unknown";
}
