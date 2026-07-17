/* =========================================================
   SCRIPT.JS (Çoklu Fotoğraf & Video Yükleme ve Gelişmiş Galeri)
========================================================= */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxnYZ1X--qg83dUVd8Z53FOu72dBSg9_TmiNphrwE6LWzj4u1Tf65es5nFjUggMBjTMLw/exec";
const FIREBASE_PROJECT_ID = "buse-samet-dugun";

// HTML Elementleri
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("hiddenFileInput");
const uploadStatus = document.getElementById("uploadStatus");
const galleryContainer = document.getElementById("photoGallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");

// Galeri Gezinme ve Dosya Tipi Hafızası
let allMedia = []; 
let currentMediaIndex = 0;

if (fileInput) {
  fileInput.setAttribute("accept", "image/*,video/*");
}

if (uploadBtn && fileInput) {
  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    uploadBtn.innerText = "YÜKLENİYOR...";
    uploadBtn.disabled = true;
    if (uploadStatus) uploadStatus.innerText = `${files.length} dosya hazırlanıyor...`;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        if (uploadStatus) uploadStatus.innerText = `Yükleniyor (${i + 1}/${files.length}): ${file.name}`;
        
        const base64Data = await toBase64(file);
        const cleanBase64 = base64Data.split(",")[1];

        const payload = {
          fileName: file.name,
          mimeType: file.type,
          base64: cleanBase64
        };

        await fetch(WEB_APP_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

      } catch (error) {
        console.error("Yükleme hatası:", error);
      }
    }

    uploadBtn.innerText = "YÜKLEME TAMAMLANDI!";
    if (uploadStatus) uploadStatus.innerText = "Dosyalarınız başarıyla eklendi! ♥";
    
    setTimeout(() => {
      uploadBtn.innerHTML = `<svg class="camera-icon" viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold-dark); margin-right:10px;"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg> FOTOĞRAF YÜKLE`;
      uploadBtn.disabled = false;
      if (uploadStatus) uploadStatus.innerText = "";
    }, 3000);
    
    fileInput.value = ""; 
    setTimeout(loadPhotos, 2500);
  });
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Güvenli video kontrolü
function isVideoUrl(url) {
  if (!url) return false;
  return url.toLowerCase().includes(".mp4") || 
         url.toLowerCase().includes(".mov") || 
         url.toLowerCase().includes(".avi") || 
         url.toLowerCase().includes(".webm") || 
         url.toLowerCase().includes("drive.google.com/file/d/");
}

// Medyaları Çekme ve Ekrana Basma
async function loadPhotos() {
  if (!galleryContainer) return;

  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/photos`);
    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      galleryContainer.innerHTML = ""; 
      allMedia = []; 
      
      // Senkronizasyon hatasını önlemek için medyaları önce hafızaya alıyoruz
      data.documents.forEach((doc) => {
        const fields = doc.fields;
        if (fields && fields.imageUrl && fields.imageUrl.stringValue) {
          let mediaUrl = fields.imageUrl.stringValue;
          
          // Google Drive linki önizleme modundaysa doğrudan oynatılabilir video linkine çeviriyoruz
          if (mediaUrl.includes("drive.google.com/file/d/")) {
            mediaUrl = mediaUrl.replace("/view?usp=drivesdk", "").replace("/view", "") + "/preview";
          }
          
          const isVideo = isVideoUrl(mediaUrl);
          allMedia.push({ url: mediaUrl, type: isVideo ? "video" : "image" });
        }
      });

      // Hafızadaki medyaları ekrana basıyoruz
      allMedia.forEach((media, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = "gallery-image-wrapper";
        
        if (media.type === "video") {
          wrapper.innerHTML = `
            <iframe src="${media.url}" style="width:100%; height:100%; border:none; pointer-events:none;"></iframe>
            <div style="position:absolute; inset:0; display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.1); color:#fff; font-size:24px;">▶</div>
          `;
        } else {
          const imgElement = document.createElement("img");
          imgElement.src = media.url;
          imgElement.alt = "Düğün Anısı";
          wrapper.appendChild(imgElement);
        }
        
        wrapper.addEventListener("click", (e) => {
           e.stopPropagation();
           currentMediaIndex = index;
           openLightboxWithIndex(currentMediaIndex);
        });

        galleryContainer.appendChild(wrapper);
      });
    } else {
        galleryContainer.innerHTML = `<div class="loading">Henüz medya yüklenmedi. İlk paylaşımı siz yapın! ♥</div>`;
    }
  } catch (error) {
    console.error("Medya yüklenirken hata oluştu:", error);
  }
}

// Gelişmiş Büyük Ekran Önizleme Sistemi
function openLightboxWithIndex(index) {
  if (!lightbox || !lightboxImage || !allMedia[index]) return;
  
  const media = allMedia[index];
  
  // Önceki video, iframe ve oynatıcıları temizle
  const existingVideo = lightbox.querySelector("video, iframe");
  if (existingVideo) existingVideo.remove();
  lightboxImage.style.display = "none";

  if (media.type === "video") {
    // Google Drive videoları tarayıcıda doğrudan oynatılamayacağı için güvenli iframe yapısı kuruyoruz
    const iframeElement = document.createElement("iframe");
    iframeElement.src = media.url + (media.url.includes("?") ? "&autoplay=1" : "?autoplay=1");
    iframeElement.style.width = "90%";
    iframeElement.style.height = "70vh";
    iframeElement.style.borderRadius = "12px";
    iframeElement.style.border = "2px solid var(--gold-light)";
    iframeElement.setAttribute("allow", "autoplay");
    
    lightbox.appendChild(iframeElement);
  } else {
    lightboxImage.src = media.url;
    lightboxImage.style.display = "block";
  }
  
  lightbox.style.display = "flex";
}

// Gezinme Fonksiyonları (Kaydırma Tetikleyicileri)
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

// =========================================================
// %100 KARARLI SWIPE (SAĞA-SOLA KAYDIRMA) SİSTEMİ
// =========================================================
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
  if (touchStartX - touchEndX > swipeThreshold) {
    nextMedia(); 
  } else if (touchEndX - touchStartX > swipeThreshold) {
    prevMedia(); 
  }
}

// Kapatma İşlemleri
if (closeLightbox && lightbox) {
    closeLightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
        const v = lightbox.querySelector("video, iframe"); if(v) v.remove();
    });
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
          lightbox.style.display = "none";
          const v = lightbox.querySelector("video, iframe"); if(v) v.remove();
        }
    });
}

document.addEventListener("keydown", (e) => {
  if (!lightbox || lightbox.style.display !== "flex") return;
  if (e.key === "ArrowRight") nextMedia();
  if (e.key === "ArrowLeft") prevMedia();
  if (e.key === "Escape") {
    lightbox.style.display = "none";
    const v = lightbox.querySelector("video, iframe"); if(v) v.remove();
  }
});

window.onload = loadPhotos;
