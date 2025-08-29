import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD9IOKISuv0-j3HKtQl-bfFYycAQLm50xk",
    authDomain: "med-itrack-470514.firebaseapp.com",
    projectId: "med-itrack-470514",
    storageBucket: "med-itrack-470514.appspot.com",
    messagingSenderId: "922998764855",
    appId: "1:922998764855:web:bafbfb2535c62af23b96b2",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
