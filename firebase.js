// Firebase App (Temel SDK)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// Firestore SDK (Fotoğraf bilgilerini ve linklerini tutacak veritabanı)
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Storage SDK (Asıl fotoğraf dosyalarını yükleyeceğimiz alan - ChatGPT'nin unuttuğu kısım)
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

/* ===========================================
   FIREBASE CONFIG (Senin Bilgilerin)
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
   FIREBASE BAŞLATMA
=========================================== */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Storage başlatıldı

/* ===========================================
   EXPORT (Diğer JS dosyalarında kullanabilmek için dışa aktarma)
=========================================== */
export {
  db,
  storage,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL
};
