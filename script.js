/* =========================================================
   SCRIPT.JS (Firebase SDK Tabanlı Ultra Hızlı Medya Motoru)
========================================================= */

// firebase.js dosyasından ihtiyacımız olan fonksiyonları ve başlatılan servisleri çekiyoruz
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

// Input ayarları (Fotoğraf ve Video)
if (fileInput) {
  fileInput.setAttribute("accept", "image/*,video/*");
}

// Buton Tetikleyici
if (uploadBtn && fileInput) {
  uploadBtn.addEventListener("click", () => fileInput.click());

  // DOSYA YÜKLEME MOTORU (Firebase Storage - Ultra Hızlı)
  fileInput.addEventListener("change", async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    uploadBtn.innerText = "YÜKLENİYOR...";
    uploadBtn.disabled = true;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (uploadStatus) uploadStatus.innerText = `Yükleniyor (${i + 1}/${files.length}): ${file.name}`;

      try {
        // 1. Benzersiz bir dosya adı oluşturup Firebase Storage referansı alıyoruz
        const uniqueFileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `dugun_medya/${uniqueFileName}`);

        // 2. Dosyayı doğrudan binary olarak yüklüyoruz (Base64 yok, zaman aşımı yok!)
        const snapshot = await uploadBytes(storageRef, file);

        // 3. Yüklenen dosyanın doğrudan oynatılabilir/indirilebilir linkini alıyoruz
        const downloadUrl = await getDownloadURL(snapshot.ref);

        // 4. Bu linki anlık olarak Firestore veritabanına kaydediyoruz
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
    if (uploadStatus) uploadStatus.innerText = "Tüm medyalar başarıyla eklendi! ♥";
    
    setTimeout(() => {
      uploadBtn.innerHTML = `<svg class="camera-icon" viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold-dark); margin-right:10px;"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg> FOTOĞRAF YÜKLE`;
      uploadBtn.disabled = false;
      if (uploadStatus) uploadStatus.innerText = "";
    }, 3000);

    fileInput.value = ""; 
  });
}

// =========================================================
// REALTIME GALERİ MOTORU (onSnapshot ile Canlı Listeleme)
// =========================================================
const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  if (!galleryContainer) return;
  galleryContainer.innerHTML = "";
  allMedia = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.imageUrl) {
      // MimeType kontrolü veya link uzantısına göre tipi belirliyoruz
      const isVideo = data.mimeType ? data.mimeType.startsWith("video/") : data.imageUrl.includes(".mp4");
      allMedia.push({ url: data.imageUrl, type: isVideo ? "video" : "image" });
    }
  });

  if (allMedia.length === 0) {
    galleryContainer.innerHTML = `<div class="loading">Henüz fotoğraf veya video yüklenmedi. İlk siz yükleyin! ♥</div>`;
    return;
  }

  // Medyaları ekrana basıyoruz
  allMedia.forEach((media, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-image-wrapper";

    if (media.type === "video") {
      wrapper.innerHTML = `
        <video src="${media.url}" muted style="width:100%; height:100%; object-fit:cover;"></video>
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
// GELİŞMİŞ LIGHTBOX & KAYDIRMA (SWIPE) MOTORU
// =========================================================
function openLightboxWithIndex(index) {
  if (!lightbox || !lightboxImage || !allMedia[index]) return;
  
  const media = allMedia[index];
  
  // Önceki video/oynatıcıları temizle
  const existingVideo = lightbox.querySelector("video");
  if (existingVideo) existingVideo.remove();
  lightboxImage.style.display = "none";

  if (media.type === "video") {
    const videoElement = document.createElement("video");
    videoElement.src = media.url;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.style.maxWidth = "90%";
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

// %100 Kararlı Swipe (Sağa-Sola Kaydırma)
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

// Kapatma Aksiyonları
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

// Klavye Kontrolleri
document.addEventListener("keydown", (e) => {
  if (!lightbox || lightbox.style.display !== "flex") return;
  if (e.key === "ArrowRight") nextMedia();
  if (e.key === "ArrowLeft") prevMedia();
  if (e.key === "Escape") {
    lightbox.style.display = "none";
    const v = lightbox.querySelector("video"); if (v) v.remove();
  }
});
