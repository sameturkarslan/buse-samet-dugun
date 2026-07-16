/* ===========================================
   SCRIPT.JS (Fotoğraf & Sınırsız Video Sürümü)
=========================================== */
const uploadBtn = document.getElementById("uploadBtn");

// Senin hazırladığın Google Form bağlantısı
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeDGFF-gEvvEiFHj0iApHJezQqxmFaNMj3_ZM1SKB-VfQAijA/viewform";

// Butona tıklandığında davetliyi doğrudan forma yönlendirir
uploadBtn.addEventListener("click", () => {
  window.open(GOOGLE_FORM_URL, "_blank");
});
