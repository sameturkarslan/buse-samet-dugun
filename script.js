/* =========================================================
   SCRIPT.JS (Doğrudan Drive'a Çoklu Fotoğraf & Video Yükleme)
========================================================= */

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxnYZ1X--qg83dUVd8Z53FOu72dBSg9_TmiNphrwE6LWzj4u1Tf65es5nFjUggMBjTMLw/exec";
const FIREBASE_PROJECT_ID = "buse-samet-dugun";

// HTML elementlerini doğru ID'ler ile eşleştiriyoruz
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("hiddenFileInput");
const uploadStatus = document.getElementById("uploadStatus");
const galleryContainer = document.getElementById("photoGallery");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");

// Butona tıklanınca gizli dosya seçiciyi tetikle
if (uploadBtn && fileInput) {
  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  // Dosya seçildiğinde yükleme işlemini başlat
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
    if (uploadStatus) uploadStatus.innerText = "Fotoğraflar başarıyla gönderildi, birazdan galeride belirecektir. ♥";
    
    setTimeout(() => {
      uploadBtn.innerHTML = `<svg class="camera-icon" viewBox="0 0 24 24" width="20" height="20" style="fill:var(--gold-dark); margin-right:10px;"><path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg> FOTOĞRAF YÜKLE`;
      uploadBtn.disabled = false;
      if (uploadStatus) uploadStatus.innerText = "";
    }, 3500);
    
    fileInput.value = ""; 
    setTimeout(loadPhotos, 2000); // 2 saniye sonra galeriyi otomatik yenile
  });
}

// Dosyayı Base64 formatına çeviren yardımcı fonksiyon
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Firebase Firestore'dan fotoğrafları çekip premium CSS grid yapısına göre listeleme
async function loadPhotos() {
  if (!galleryContainer) return;

  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/photos`);
    const data = await response.json();

    if (data.documents && data.documents.length > 0) {
      galleryContainer.innerHTML = ""; 
      
      data.documents.forEach(doc => {
        const fields = doc.fields;
        
        if (fields && fields.imageUrl && fields.imageUrl.stringValue) {
          const imgUrl = fields.imageUrl.stringValue;
          
          // CSS yapısına tam uyum için wrapper oluşturuluyor
          const wrapper = document.createElement("div");
          wrapper.className = "gallery-image-wrapper";
          
          const imgElement = document.createElement("img");
          imgElement.src = imgUrl;
          imgElement.alt = "Düğün Anısı";
          
          // Resme tıklanınca Lightbox (Büyük ekran) açma olayı
          wrapper.addEventListener("click", () => {
             if (lightbox && lightboxImage) {
                 lightboxImage.src = imgUrl;
                 lightbox.style.display = "flex";
             }
          });

          wrapper.appendChild(imgElement);
          galleryContainer.appendChild(wrapper);
        }
      });
    } else {
        galleryContainer.innerHTML = `<div class="loading">Henüz fotoğraf yüklenmedi. İlk fotoğrafı siz yükleyin! ♥</div>`;
    }
  } catch (error) {
    console.error("Fotoğraflar yüklenirken hata oluştu:", error);
    galleryContainer.innerHTML = `<div class="loading">Fotoğraflar şu an yüklenemedi.</div>`;
  }
}

// Lightbox Kapatma Olayları
if (closeLightbox && lightbox) {
    closeLightbox.addEventListener("click", () => {
        lightbox.style.display = "none";
    });
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) lightbox.style.display = "none";
    });
}

// Sayfa açıldığında fotoğrafları yükle
window.onload = loadPhotos;
