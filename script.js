import {
  db,
  storage, // firebase.js dosyamıza yeni eklediğimiz storage
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

/* ===========================================
   HTML ELEMENTLERİ (Yeni HTML ile %100 Uyumlu)
=========================================== */
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const photoGallery = document.getElementById("photoGallery");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const closeLightbox = document.getElementById("closeLightbox");

/* ===========================================
   DEĞİŞKENLER
=========================================== */
let galleryImages = [];
let currentIndex = 0;
let startX = 0;
let endX = 0;

/* ===========================================
   TETİKLEYİCİ: "FOTOĞRAF YÜKLE" BUTONU
=========================================== */
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

/* ===========================================
   FOTOĞRAFI FIREBASE STORAGE & FIRESTORE'A YÜKLEME
=========================================== */
fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  // Sadece görsel dosyalarını kabul et
  if (!file.type.startsWith("image/")) {
    uploadStatus.textContent = "❌ Lütfen sadece görsel dosyası seçin.";
    return;
  }

  uploadStatus.textContent = "⏳ Fotoğraf yükleniyor, lütfen bekleyin...";
  uploadBtn.disabled = true;

  try {
    // 1. Firebase Storage üzerinde benzersiz bir dosya adı oluşturuyoruz
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${file.name}`;
    const storageRef = ref(storage, `wedding_photos/${uniqueFileName}`);

    // 2. Dosyayı Firebase Storage'a yüklüyoruz
    const snapshot = await uploadBytes(storageRef, file);

    // 3. Yüklenen dosyanın internet linkini (URL) alıyoruz
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 4. Bu linki Firestore veritabanımıza kaydediyoruz
    await addDoc(collection(db, "photos"), {
      imageUrl: downloadURL,
      createdAt: serverTimestamp()
    });

    uploadStatus.textContent = "✅ Fotoğraf başarıyla yüklendi! Teşekkür ederiz ♥";
    
    // 3 saniye sonra durum yazısını temizle
    setTimeout(() => {
      uploadStatus.textContent = "";
    }, 4000);

  } catch (err) {
    uploadStatus.textContent = "❌ Yükleme başarısız oldu. Lütfen tekrar deneyin.";
    console.error("Yükleme Hatası: ", err);
  } finally {
    uploadBtn.disabled = false;
    fileInput.value = ""; // Seçiciyi temizle
  }
});

/* ===========================================
   VERİTABANINI ANLIK İZLEME VE GALERİYİ BESLEME
=========================================== */
const photoQuery = query(
  collection(db, "photos"),
  orderBy("createdAt", "desc")
);

onSnapshot(photoQuery, (snapshot) => {
  photoGallery.innerHTML = "";
  galleryImages = [];

  if (snapshot.empty) {
    photoGallery.innerHTML = `
      <div class="loading">
        Henüz fotoğraf yüklenmedi.<br>İlk fotoğrafı siz yükleyin!
      </div>
    `;
    return;
  }

  let index = 0;
  snapshot.forEach((photoDoc) => {
    const photo = photoDoc.data();
    if (!photo.imageUrl) return;

    galleryImages.push(photo.imageUrl);

    // Görseldeki şık 3'lü kare grid yapısı için wrapper (kapsayıcı) div oluşturuyoruz
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-image-wrapper";
    
    const img = document.createElement("img");
    img.src = photo.imageUrl;
    img.loading = "lazy";
    img.alt = "Buse & Samet Düğün Anısı";
    img.dataset.index = index;

    // Fotoğrafa tıklandığında Lightbox (Büyük Önizleme) açılsın
    const currentIndexVal = index; // Closure koruması için
    wrapper.onclick = () => {
      showImage(currentIndexVal);
    };

    wrapper.appendChild(img);
    photoGallery.appendChild(wrapper);
    
    index++;
  });
});

/* ===========================================
   LIGHTBOX (Büyük Fotoğraf Önizleme Ekranı)
=========================================== */
function showImage(index) {
  if (galleryImages.length === 0) return;

  currentIndex = index;

  // Sınır kontrolleri (Sonsuz döngü şeklinde çalışır)
  if (currentIndex < 0) {
    currentIndex = galleryImages.length - 1;
  }
  if (currentIndex >= galleryImages.length) {
    currentIndex = 0;
  }

  lightboxImage.src = galleryImages[currentIndex];
  lightbox.style.display = "flex";
}

function closeViewer() {
  lightbox.style.display = "none";
}

closeLightbox.addEventListener("click", closeViewer);

// Görsel dışındaki boş siyah alana tıklayınca kapansın
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeViewer();
  }
});

/* ===========================================
   MOBİL CİHAZLAR İÇİN KAYDIRMA (SWIPE) ÖZELLİĞİ
=========================================== */
lightbox.addEventListener("touchstart", (e) => {
  startX = e.changedTouches[0].clientX;
});

lightbox.addEventListener("touchend", (e) => {
  endX = e.changedTouches[0].clientX;
  
  // Sağa veya sola kaydırma hassasiyeti (50px)
  if (startX - endX > 50) {
    showImage(currentIndex + 1); // Sol kaydırma -> Sonraki fotoğraf
  }
  if (endX - startX > 50) {
    showImage(currentIndex - 1); // Sağ kaydırma -> Önceki fotoğraf
  }
});

/* ===========================================
   MASAÜSTÜ İÇİN KLAVYE YÖN TUŞLARI DESTEĞİ
=========================================== */
document.addEventListener("keydown", (e) => {
  if (lightbox.style.display !== "flex") return;

  switch (e.key) {
    case "ArrowRight":
      showImage(currentIndex + 1);
      break;
    case "ArrowLeft":
      showImage(currentIndex - 1);
      break;
    case "Escape":
      closeViewer();
      break;
  }
});
