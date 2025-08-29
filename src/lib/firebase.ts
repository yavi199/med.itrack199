import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBI96qh9EbuO0h8F1MBAYKwOloCrxaf6rk",
  authDomain: "med-itrack199.firebaseapp.com",
  projectId: "med-itrack199",
  storageBucket: "med-itrack199.appspot.com",
  messagingSenderId: "324429977043",
  appId: "1:324429977043:web:e3092fb39e1e04751bcb26",
  measurementId: "G-C37WHTVBJ7"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
