// Turns Firebase error codes into friendly Bangla messages

const messages = {
  "auth/email-already-in-use": "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে। লগইন করো।",
  "auth/invalid-email": "সঠিক ইমেইল ঠিকানা লেখো।",
  "auth/missing-email": "ইমেইল ঠিকানা লেখো।",
  "auth/weak-password": "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",
  "auth/invalid-credential": "ইমেইল বা পাসওয়ার্ড ভুল।",
  "auth/user-not-found": "ইমেইল বা পাসওয়ার্ড ভুল।",
  "auth/wrong-password": "ইমেইল বা পাসওয়ার্ড ভুল।",
  "auth/user-disabled": "এই অ্যাকাউন্টটি বন্ধ করা হয়েছে।",
  "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে। একটু পরে আবার চেষ্টা করো।",
  "auth/network-request-failed": "ইন্টারনেট সংযোগ নেই। সংযোগ দেখে আবার চেষ্টা করো।",
  "auth/popup-closed-by-user": "Google লগইন বাতিল হয়েছে।",
  "auth/cancelled-popup-request": "Google লগইন বাতিল হয়েছে।",
  "auth/popup-blocked": "ব্রাউজার পপআপ আটকে দিয়েছে। পপআপ চালু করে আবার চেষ্টা করো।",
  "auth/requires-recent-login": "নিরাপত্তার জন্য আবার লগইন করে তারপর চেষ্টা করো।",
};

export function getAuthErrorMessage(code) {
  return messages[code] ?? "কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করো।";
}
