// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/* ===========================================
   FIREBASE CONFIG
=========================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDuNX14Q-a1Xgh-pNgyFd1OIInRI0Tnxi8",
  authDomain: "buse-samet-dugun.firebaseapp.com",
  projectId: "buse-samet-dugun",
  storageBucket: "buse-samet-dugun.firebasestorage.app",
  messagingSenderId: "516688924747",
  appId: "1:516688924747:web:9597a254d4de392f95bdce"
};

/* ===========================================
   FIREBASE BAŞLAT
=========================================== */

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===========================================
   EXPORT
=========================================== */

export {
  db,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
};
