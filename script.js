/* =========================================================
   SCRIPT.JS (Doğrudan Drive'a Çoklu Fotoğraf & Video Yükleme)
========================================================= */

// Güncel Web Uygulaması URL'sini buraya tam olarak tanımladık
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxnYZ1X--qg83dUVd8Z53FOu72dBSg9_TmiNphrwE6LWzj4u1Tf65es5nFjUggMBjTMLw/exec";

// HTML'e gizli bir dosya seçici (input) ekliyoruz
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.multiple = true; // Çoklu seçime izin verir
fileInput.accept = "image/*,video/*"; // Sadece fotoğraf ve video seçtirir
fileInput.style.display = "none";
document.body.appendChild(fileInput);

const uploadBtn = document.getElementById("uploadBtn");

// Yükleme butonuna basınca telefonun galerisini açar
uploadBtn.addEventListener("click", () => {
  fileInput.click();
});

// Dosyalar seçildiğinde arka planda Drive'a yükleme işlemini başlatır
fileInput.addEventListener("change", async (event) => {
  const files = event.target.files;
  if (files.length === 0) return;

  uploadBtn.innerText = "Yükleniyor...";
  uploadBtn.disabled = true;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const base64Data = await toBase64(file);
      const cleanBase64 = base64Data.split(",")[1];

      const payload = {
        fileName: file.name,
        mimeType: file.type,
        base64: cleanBase64
      };

      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors", // Tarayıcı güvenlik engellerini aşmak için
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

    } catch (error) {
      console.error("Yükleme hatası:", error);
    }
  }

  uploadBtn.innerText = "Yükleme Tamamlandı!";
  setTimeout(() => {
    uploadBtn.innerText = "Fotoğraf/Video Gönder";
    uploadBtn.disabled = false;
  }, 3000);
  
  fileInput.value = ""; // Seçiciyi sıfırla
});

// Dosyayı kodun okuyabileceği formata çeviren yardımcı fonksiyon
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// =========================================================
// FOTOĞRAFLARI FİREBASE'DEN ÇEKİP EKRANDA GÖSTERME KISMI
// =========================================================

const FIREBASE_PROJECT_ID = "buse-samet-dugun";

// HTML'de fotoğrafların listeleneceği alanın id'sini buraya yazmalısın. 
const galleryContainer = document.getElementById("gallery"); 

async function loadPhotos() {
  if (!galleryContainer) return; // Eğer o sayfada galeri alanı yoksa hata vermemesi için

  try {
    // Firebase Firestore'dan verileri çekiyoruz
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/photos`);
    const data = await response.json();

    if (data.documents) {
      galleryContainer.innerHTML = ""; // Yeni yüklemede önceki fotoğrafların üstüne eklememesi için temizliyoruz
      
      // Veritabanındaki her bir kayıt için döngü oluşturuyoruz
      data.documents.forEach(doc => {
        const fields = doc.fields;
        
        // Eğer kayıt İngilizce 'imageUrl' içeriyorsa ekrana bas (Eski Türkçe kayıtları es geçer)
        if (fields && fields.imageUrl && fields.imageUrl.stringValue) {
          const imgUrl = fields.imageUrl.stringValue;
          
          // Ekrana basılacak resmi (img) oluşturuyoruz
          const imgElement = document.createElement("img");
          imgElement.src = imgUrl;
          
          // Resmin stili
          imgElement.style.width = "300px"; 
          imgElement.style.margin = "10px";
          imgElement.style.borderRadius = "10px";
          imgElement.style.objectFit = "cover";
          
          // Resmi HTML'deki galeri alanına ekliyoruz
          galleryContainer.appendChild(imgElement);
        }
      });
    }
  } catch (error) {
    console.error("Fotoğraflar yüklenirken hata oluştu:", error);
  }
}

// Web sitesi açıldığında fotoğrafları otomatik olarak yükle
window.onload = loadPhotos;
