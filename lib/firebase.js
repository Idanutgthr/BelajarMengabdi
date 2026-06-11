import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA8tWTVSAgNKTO0TfEngLX9cKeESU9nEkI",
  authDomain: "belajarmengabdi.firebaseapp.com",
  projectId: "belajarmengabdi",
  storageBucket: "belajarmengabdi.firebasestorage.app",
  messagingSenderId: "467579708782",
  appId: "1:467579708782:web:203e0fd161a69882fe0d7f",
  measurementId: "G-MXPP2S78Q4"
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

const isFirebaseConfigured = true;

export { app, auth, db, googleProvider, isFirebaseConfigured };
