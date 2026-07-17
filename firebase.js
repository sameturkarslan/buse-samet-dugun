// Firebase SDK modüllerini tarayıcı uyumlu en kararlı sürümleriyle import ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Senin Firebase projenin gerçek config bilgileri kanka
const firebaseConfig = {
  apiKey: "AIzaSyDuNX14Q-a1Xgh-pNgyFd1OIInRI0Tnxi8",
  authDomain: "buse-samet-dugun.firebaseapp.com",
  projectId: "buse-samet-dugun",
  storageBucket: "buse-samet-dugun.firebasestorage.app",
  messagingSenderId: "516688924747",
  appId: "1:516688924747:web:a46db54ad2f4333c95bdce",
  measurementId: "G-CSDCLWE3ML"
};

// Servisleri başlatıyoruz
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// script.js dosyasının her şeyi hatasız okuması için dışa aktarıyoruz
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
