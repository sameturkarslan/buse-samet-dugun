/* =========================================================
   SCRIPT.JS (Doğrudan Drive'a Çoklu Fotoğraf & Video Yükleme)
========================================================= */

// Aldığın Web Uygulaması URL'sini buraya tanımladık
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyBLUwfuhmCD5ZnVDtGYBN0aJ2xeumIKs4ah5ZxjS6syEmyRrIjWSZJeWNUH2QMkwyN/exec";

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
