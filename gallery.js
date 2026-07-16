/* ===========================================
   GALLERY.JS
   Görsel deneyim ve galeri yardımcı işlemleri
   Yeni Premium Mobil Tasarımla %100 Uyumludur.
=========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.getElementById("photoGallery");
    if (!gallery) return;

    /* ===========================================
       YENİ EKLENEN FOTOĞRAFLARI İZLE (Yumuşak Belirme)
    =========================================== */
    const observer = new MutationObserver(() => {
        // Yeni yapımızdaki resimleri buluyoruz (wrapper içindeki img'ler)
        const images = gallery.querySelectorAll(".gallery-image-wrapper img");

        images.forEach((img) => {
            // Aynı fotoğrafı tekrar işlememesi için kontrol
            if (img.dataset.ready === "true") return;
            img.dataset.ready = "true";

            // Görsel koruma önlemleri
            img.draggable = false; // Sürüklemeyi engelle
            img.addEventListener("contextmenu", (e) => e.preventDefault()); // Sağ tıkı engelle

            // İlk başta görseli görünmez yap ve hafif aşağıda konumlandır
            img.style.opacity = "0";
            img.style.transform = "translateY(15px) scale(0.96)";
            img.style.transition = "opacity 0.6s ease, transform 0.6s ease";

            // Görsel tamamen yüklendiğinde yumuşakça göster
            if (img.complete) {
                revealImage(img);
            } else {
                img.onload = () => revealImage(img);
            }
        });
    });

    // Galeri içindeki değişimleri izlemeye başla
    observer.observe(gallery, {
        childList: true,
        subtree: true
    });
});

/* ===========================================
   GÖRSEL BELİRME ANİMASYONU
=========================================== */
function revealImage(img) {
    requestAnimationFrame(() => {
        img.style.opacity = "1";
        img.style.transform = "translateY(0) scale(1)";
    });
}
