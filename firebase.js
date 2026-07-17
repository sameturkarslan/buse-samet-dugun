// Firebase SDK modüllerini tarayıcı uyumlu en kararlı sürümleriyle import ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Kendi Firebase projenin SDK Config bilgileri kanka (Firebase Console'dan alıp burayı doldur)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Servisleri başlatıyoruz
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// script.js dosyasının tüm bu yetenekleri hatasız okuması için eksiksiz dışa aktarıyoruz
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
  getDownloadURL,
  uploadString
};
