import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAzT59oA9Ztq53X-9_k9-g_L_Y2P8pW5vM",
    authDomain: "med-itrack199.firebaseapp.com",
    projectId: "med-itrack199",
    storageBucket: "med-itrack199.appspot.com",
    messagingSenderId: "922998764855",
    appId: "1:922998764855:web:e00583b4845014494c927f",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
