// Google Apps Script Web Uygulaması URL'si
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7f4Q_m0zwaAhxDbH8LE8KmYx1X2LcgQs15AKJW7AJo37rT3iJjQwfq8bkQZUcsAtZ/exec";

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("hiddenFileInput");
const uploadStatus = document.getElementById("uploadStatus");
const galleryContainer = document.getElementById("photoGallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let allMedia = []; 
let currentMediaIndex = 0;

// Sayfa ilk açıldığında Drive'daki mevcut tüm medyaları getir
window.addEventListener("DOMContentLoaded", fetchGallery);

if (fileInput) {
  fileInput.setAttribute("accept", "image/*,video/*");
}

if (uploadBtn && fileInput) {
  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    uploadBtn.innerText = "YÜKLENİYOR...";
    uploadBtn.disabled = true;

    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      if (uploadStatus) uploadStatus.innerText = `İşleniyor (${i + 1}/${files.length})...`;

      try {
        let base64Data = "";
        
        // Resimleri sıkıştır, videoları doğrudan oku
        if (file.type.startsWith("image/")) {
          if (uploadStatus) uploadStatus.innerText = `Fotoğraf optimize ediliyor...`;
          base64Data = await compressToDataURL(file);
        } else {
          if (uploadStatus) uploadStatus.innerText = `Video hazırlanıyor...`;
          base64Data = await readFileAsDataURL(file);
        }

        if (uploadStatus) uploadStatus.innerText = `Drive'a gönderiliyor...`;

        // Apps Script'in çözebilmesi için ham Base64 string'i ayıklıyoruz
        const rawBase64 = base64Data.split(",")[1] || base64Data;

        // Apps Script'e POST isteği yolluyoruz
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors", 
          headers: {
            "Content-Type": "text/plain"
          },
          body: JSON.stringify({
            bytes: rawBase64,
            mimeType: file.type,
            filename: `${Date.now()}_${file.name}`
          })
        });

      } catch (error) {
        console.error("Yükleme hatası:", error);
      }
    }

    uploadBtn.innerText = "YÜKLEME TAMAMLANDI!";
    if (uploadStatus) uploadStatus.innerText = "Anınız başarıyla eklendi! ♥";
    
    // Yükleme bitince galeriyi yenilemek için kısa bir gecikme veriyoruz
    setTimeout(() => {
      fetchGallery();
      uploadBtn.innerHTML = `<svg class="camera-icon" viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold-dark); margin-right:10px;"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg> FOTOĞRAF / VİDEO YÜKLE`;
      uploadBtn.disabled = false;
      if (uploadStatus) uploadStatus.innerText = "";
    }, 3000);

    fileInput.value = ""; 
  });
}

// Drive'dan verileri çeken ana motor (CORS engelleri aşılmış tekil fonksiyon)
async function fetchGallery() {
  if (!galleryContainer) return;
  
  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "GET",
      redirect: "follow"
    });
    
    const result = await response.json();
    
    if (result.status === "success") {
      allMedia = result.data;
      renderGallery();
    }
  } catch (error) {
    console.error("Galeri yükleme hatası:", error);
    galleryContainer.innerHTML = `<div class="loading">Medyalar yüklenirken bir ağ veya izin kısıtlaması oluştu.</div>`;
  }
}

function renderGallery() {
  galleryContainer.innerHTML = "";

  if (allMedia.length === 0) {
    galleryContainer.innerHTML = `<div class="loading">Henüz fotoğraf veya video yüklenmedi. İlk siz yükleyin! ♥</div>`;
    return;
  }

  allMedia.forEach((media, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-image-wrapper";

    const isVideo = media.mimeType.startsWith("video/");

    if (isVideo) {
      wrapper.innerHTML = `
        <video src="${media.embedUrl}" muted playsinline style="width:100%; height:100%; object-fit:cover; pointer-events:none;"></video>
        <div style="position:absolute; inset:0; display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.15); color:#fff; font-size:24px;">▶</div>
      `;
    } else {
      const img = document.createElement("img");
      img.src = media.embedUrl;
      img.loading = "lazy";
      img.draggable = false;
      wrapper.appendChild(img);
    }

    wrapper.addEventListener("click", (e) => {
      e.stopPropagation();
      currentMediaIndex = index;
      openLightboxWithIndex(currentMediaIndex);
    });

    galleryContainer.appendChild(wrapper);
  });
}

function openLightboxWithIndex(index) {
  if (!lightbox || !allMedia[index]) return;
  const media = allMedia[index];
  const container = document.getElementById("lightboxContent");
  container.innerHTML = ""; 

  const isVideo = media.mimeType.startsWith("video/");

  if (isVideo) {
    const videoElement = document.createElement("video");
    videoElement.src = media.embedUrl;
    videoElement.controls = true;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.style.maxWidth = "100%";
    videoElement.style.maxHeight = "80vh";
    videoElement.style.borderRadius = "12px";
    container.appendChild(videoElement);
  } else {
    const imgElement = document.createElement("img");
    imgElement.src = media.embedUrl;
    imgElement.style.maxWidth = "100%";
    imgElement.style.maxHeight = "80vh";
    imgElement.style.borderRadius = "12px";
    container.appendChild(imgElement);
  }
  lightbox.style.display = "flex";
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

// Resim sıkıştırma fonksiyonu
function compressToDataURL(file) {
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
        const MAX = 1000;

        if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
        else if (height > width && height > MAX) { width *= MAX / height; height = MAX; }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
    };
  });
}

function nextMedia() {
  if (allMedia.length === 0) return;
  currentMediaIndex = (currentMediaIndex + 1) % allMedia.length;
  openLightboxWithIndex(currentMediaIndex);
}

// Geriye doğru medya değiştirme
function prevMedia() {
  if (allMedia.length === 0) return;
  currentMediaIndex = (currentMediaIndex - 1 + allMedia.length) % allMedia.length;
  openLightboxWithIndex(currentMediaIndex);
}

if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevMedia(); });
if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextMedia(); });

// Swipe Desteği
let touchStartX = 0; let touchEndX = 0;
if (lightbox) {
  lightbox.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener("touchend", (e) => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
}
function handleSwipe() {
  const threshold = 40;
  if (touchStartX - touchEndX > threshold) nextMedia(); 
  else if (touchEndX - touchStartX > threshold) prevMedia(); 
}

if (closeLightbox && lightbox) {
  const closeAll = () => { lightbox.style.display = "none"; document.getElementById("lightboxContent").innerHTML = ""; };
  closeLightbox.addEventListener("click", closeAll);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeAll(); });
}

document.addEventListener("keydown", (e) => {
  if (!lightbox || lightbox.style.display !== "flex") return;
  if (e.key === "ArrowRight") nextMedia();
  if (e.key === "ArrowLeft") prevMedia();
  if (e.key === "Escape") { lightbox.style.display = "none"; document.getElementById("lightboxContent").innerHTML = ""; }
});
