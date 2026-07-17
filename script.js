/* =========================================================
   SCRIPT.JS (Hatasız - Sıkıştırmalı Ultra Hızlı Medya Motoru)
========================================================= */

import { 
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
} from "./firebase.js";

// HTML Elementleri
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("hiddenFileInput");
const uploadStatus = document.getElementById("uploadStatus");
const galleryContainer = document.getElementById("photoGallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");

// Galeri Hafızası
let allMedia = []; 
let currentMediaIndex = 0;

if (fileInput) {
  fileInput.setAttribute("accept", "image/*,video/*");
}

// =========================================================
// ULTRA HIZLI FIREBASE STORAGE YÜKLEME MOTORU
// =========================================================
if (uploadBtn && fileInput) {
  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    uploadBtn.innerText = "YÜKLENİYOR...";
    uploadBtn.disabled = true;

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if (uploadStatus) uploadStatus.innerText = `İşleniyor (${i + 1}/${files.length}): ${file.name}`;

      try {
        // 1. ADIM: EĞER FOTOĞRAFSA ARKA PLANDA JET HIZIYLA SIKIŞTIR
        if (file.type.startsWith("image/")) {
          if (uploadStatus) uploadStatus.innerText = `Fotoğraf sıkıştırılıyor...`;
          file = await compressImage(file);
        }

        // 2. ADIM: FIREBASE STORAGE'A YÜKLE
        if (uploadStatus) uploadStatus.innerText = `Yükleniyor (${i + 1}/${files.length})...`;
        
        const uniqueFileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `dugun_medya/${uniqueFileName}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // 3. ADIM: FIRESTORE'A KAYDET
        await addDoc(collection(db, "photos"), {
          imageUrl: downloadUrl,
          mimeType: file.type,
          createdAt: serverTimestamp()
        });

      } catch (error) {
        console.error("Yükleme hatası:", error);
        if (uploadStatus) uploadStatus.innerText = "Bir dosya yüklenirken hata oluştu!";
      }
    }

    uploadBtn.innerText = "YÜKLEME TAMAMLANDI!";
    if (uploadStatus) uploadStatus.innerText = "Tüm anılarınız başarıyla eklendi! ♥";
    
    setTimeout(() => {
      uploadBtn.innerHTML = `<svg class="camera-icon" viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold-dark); margin-right:10px;"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg> FOTOĞRAF / VİDEO YÜKLE`;
      uploadBtn.disabled = false;
      if (uploadStatus) uploadStatus.innerText = "";
    }, 3000);

    fileInput.value = ""; 
  });
}

// =========================================================
// GÖRSEL SIKIŞTIRMA MOTORU (Hatasız & Kararlı)
// =========================================================
function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        ctx.canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, "image/jpeg", 0.75);
      };
    };
  });
}

// =========================================================
// REALTIME CANLI GALERİ SİSTEMİ
// =========================================================
const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  if (!galleryContainer) return;
  galleryContainer.innerHTML = "";
  allMedia = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.imageUrl) {
      const isVideo = data.mimeType ? data.mimeType.startsWith("video/") : data.imageUrl.toLowerCase().includes(".mp4");
      allMedia.push({ url: data.imageUrl, type: isVideo ? "video" : "image" });
    }
  });

  if (allMedia.length === 0) {
    galleryContainer.innerHTML = `<div class="loading">Henüz fotoğraf veya video yüklenmedi. İlk siz yükleyin! ♥</div>`;
    return;
  }

  allMedia.forEach((media, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-image-wrapper";

    if (media.type === "video") {
      wrapper.innerHTML = `
        <video src="${media.url}" muted style="width:100%; height:100%; object-fit:cover; pointer-events:none;"></video>
        <div style="position:absolute; inset:0; display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.15); color:#fff; font-size:24px;">▶</div>
      `;
    } else {
      const img = document.createElement("img");
      img.src = media.url;
      img.loading = "lazy";
      wrapper.appendChild(img);
    }

    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      currentMediaIndex = index;
      openLightboxWithIndex(currentMediaIndex);
    });

    galleryContainer.appendChild(wrapper);
  });
});

// =========================================================
// PREMIUM LIGHTBOX & SAĞA-SOLA KAYDIRMA (SWIPE) SİSTEMİ
// =========================================================
function openLightboxWithIndex(index) {
  if (!lightbox || !lightboxImage || !allMedia[index]) return;
  
  const media = allMedia[index];
  const existingVideo = lightbox.querySelector("video");
  if (existingVideo) existingVideo.remove();
  lightboxImage.style.display = "none";

  if (media.type === "video") {
    const videoElement = document.createElement("video");
    videoElement.src = media.url;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.style.maxWidth = "90%" ;
    videoElement.style.maxHeight = "80vh";
    videoElement.style.borderRadius = "12px";
    videoElement.style.border = "2px solid var(--gold-light)";
    lightbox.appendChild(videoElement);
  } else {
    lightboxImage.src = media.url;
    lightboxImage.style.display = "block";
  }
  
  lightbox.style.display = "flex";
}

function nextMedia() {
  if (allMedia.length === 0) return;
  currentMediaIndex = (currentMediaIndex + 1) % allMedia.length;
  openLightboxWithIndex(currentMediaIndex);
}

function prevMedia() {
  if (allMedia.length === 0) return;
  currentMediaIndex = (currentMediaIndex - 1 + allMedia.length) % allMedia.length;
  openLightboxWithIndex(currentMediaIndex);
}

// Mobil Kaydırma Algılayıcı
let touchStartX = 0;
let touchEndX = 0;

if (lightbox) {
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
}

function handleSwipe() {
  const swipeThreshold = 40;
  if (touchStartX - touchEndX > swipeThreshold) nextMedia(); 
  else if (touchEndX - touchStartX > swipeThreshold) prevMedia(); 
}

// Kapatma
if (closeLightbox && lightbox) {
  const closeAll = () => {
    lightbox.style.display = "none";
    const v = lightbox.querySelector("video"); if (v) v.remove();
  };
  closeLightbox.addEventListener("click", closeAll);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeAll();
  });
}

document.addEventListener("keydown", (e) => {
  if (!lightbox || lightbox.style.display !== "flex") return;
  if (e.key === "ArrowRight") nextMedia();
  if (e.key === "ArrowLeft") prevMedia();
  if (e.key === "Escape") {
    lightbox.style.display = "none";
    const v = lightbox.querySelector("video"); if (v) v.remove();
  }
});
