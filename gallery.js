/* ===========================================
   GALLERY.JS
   Görsel deneyim ve galeri yardımcı işlemleri
   script.js ile tamamen uyumludur.
=========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const gallery = document.getElementById("photoGallery");

    if (!gallery) return;

    /* ===========================================
       YENİ FOTOĞRAFLARI İZLE
    =========================================== */

    const observer = new MutationObserver(() => {

        const images = gallery.querySelectorAll(".gallery-image");

        images.forEach((img) => {

            /* Aynı fotoğrafı tekrar işlememesi için */
            if (img.dataset.ready === "true") return;

            img.dataset.ready = "true";

            /* Resim sürüklemeyi kapat */
            img.draggable = false;

            /* Sağ tık menüsünü kapat */
            img.addEventListener("contextmenu", (e) => {

                e.preventDefault();

            });

            /* Yüklenmeden önce gizle */
            img.style.opacity = "0";
            img.style.transform = "translateY(18px) scale(.98)";

            /* Yüklendiğinde animasyon */
            if (img.complete) {

                reveal(img);

            } else {

                img.onload = () => reveal(img);

            }

        });

    });

    observer.observe(gallery, {

        childList: true,
        subtree: true

    });

});

/* ===========================================
   GÖRSEL ANİMASYONU
=========================================== */

function reveal(img) {

    requestAnimationFrame(() => {

        img.style.transition =
            "opacity .45s ease, transform .45s ease";

        img.style.opacity = "1";
        img.style.transform = "translateY(0) scale(1)";

    });

}
