import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA8tWTVSAgNKTO0TfEngLX9cKeESU9nEkI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "belajarmengabdi.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "belajarmengabdi",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "belajarmengabdi.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "467579708782",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:467579708782:web:203e0fd161a69882fe0d7f",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MXPP2S78Q4"
};

let app;
let auth;
let db;
let googleProvider;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("Gagal menginisialisasi Firebase SDK:", error);
}

// Selalu true karena config sudah hardcoded
const isFirebaseConfigured = true;

export { app, auth, db, googleProvider, isFirebaseConfigured };
