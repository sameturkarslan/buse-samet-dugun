const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx7f4Q_m0zwaAhxDbH8LE8KmYx1X2LcgQs15AKJW7AJo37rT3iJjQwfq8bkQZUcsAtZ/exec";

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("hiddenFileInput");
const uploadStatus = document.getElementById("uploadStatus");
const galleryContainer = document.getElementById("photoGallery");
const lightbox = document.getElementById("lightbox");
const closeLightbox = document.getElementById("closeLightbox");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let allMedia = []; 
let currentMediaIndex = 0;

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
        
        if (file.type.startsWith("image/")) {
          if (uploadStatus) uploadStatus.innerText = `Fotoğraf optimize ediliyor...`;
          base64Data = await compressToDataURL(file);
        } else {
          if (uploadStatus) uploadStatus.innerText = `Video hazırlanıyor...`;
          base64Data = await readFileAsDataURL(file);
        }

        if (uploadStatus) uploadStatus.innerText = `Drive'a gönderiliyor...`;

        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors", // Kurumsal yetki aşımı için no-cors tetiklendi
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bytes: base64Data,
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
    
    setTimeout(() => {
      fetchGallery();
    }, 1500);

    setTimeout(() => {
      uploadBtn.innerHTML = `<svg class="camera-icon" viewBox="0 0 24 24" width="20" height="20" style="margin-right:10px;"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg> FOTOĞRAF / VİDEO YÜKLE`;
      uploadBtn.disabled = false;
      if (uploadStatus) uploadStatus.innerText = "";
    }, 2500);

    fileInput.value = ""; 
  });
}

async function fetchGallery() {
  if (!galleryContainer) return;
  
  try {
    const response = await fetch(APPS_SCRIPT_URL);
    const result = await response.json();
    
    if (result.status === "success") {
      allMedia = result.data;
      renderGallery();
    } else {
      showEmptyGallery();
    }
  } catch (error) {
    console.error("Galeri bağlantı hatası:", error);
    showEmptyGallery();
  }
}

function showEmptyGallery() {
  galleryContainer.innerHTML = `<div class="loading">Henüz anı yüklenmedi. İlk fotoğraf veya videoyu siz yükleyin! ♥</div>`;
}

function renderGallery() {
  galleryContainer.innerHTML = "";

  if (allMedia.length === 0) {
    showEmptyGallery();
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
    container.appendChild(videoElement);
  } else {
    const imgElement = document.createElement("img");
    imgElement.src = media.embedUrl;
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

function prevMedia() {
  if (allMedia.length === 0) return;
  currentMediaIndex = (currentMediaIndex - 1 + allMedia.length) % allMedia.length;
  openLightboxWithIndex(currentMediaIndex);
}

if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); prevMedia(); });
if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextMedia(); });

if (closeLightbox && lightbox) {
  const closeAll = () => { lightbox.style.display = "none"; document.getElementById("lightboxContent").innerHTML = ""; };
  closeLightbox.addEventListener("click", closeAll);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeAll(); });
}
