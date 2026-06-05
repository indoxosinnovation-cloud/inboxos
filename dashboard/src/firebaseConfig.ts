import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCavL_cwALnLsYKFAnKYskHIC5KSmMH7rE",
  authDomain: "inboxos-35192.firebaseapp.com",
  projectId: "inboxos-35192",
  storageBucket: "inboxos-35192.firebasestorage.app",
  messagingSenderId: "12121840134",
  appId: "1:12121840134:web:eade78675bac7ebfc18187"
};

const app = initializeApp(FIREBASE_CONFIG);
export const db = getFirestore(app);

