// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAd8hvtMN9WuLiRW3rTNW4nKswVeEb-DKQ",
  authDomain: "lahjio-beta.firebaseapp.com",
  projectId: "lahjio-beta",
  storageBucket: "lahjio-beta.firebasestorage.app",
  messagingSenderId: "152428026353",
  appId: "1:152428026353:web:4cffca8eab6ba267774c50",
  measurementId: "G-VJJXEMD8LN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);