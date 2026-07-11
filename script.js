import {
  db,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "./firebase.js";

/* ===========================================
   CLOUDINARY
=========================================== */

const CLOUD_NAME = "p0wgo1yp";
const UPLOAD_PRESET = "buse_samet";

/* ===========================================
   HTML ELEMENTLERİ
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
   FOTOĞRAF YÜKLE
=========================================== */

uploadBtn.addEventListener("click", () => {

    fileInput.click();

});

fileInput.addEventListener("change", async () => {

    const file = fileInput.files[0];

    if (!file) return;

    uploadStatus.textContent = "Fotoğraf yükleniyor...";

    uploadBtn.disabled = true;

    try {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,

            {
                method: "POST",
                body: formData
            }

        );

        const data = await response.json();

        if (!data.secure_url) {

            throw new Error("Cloudinary yükleme hatası");

        }

        await addDoc(

            collection(db, "photos"),

            {
                imageUrl: data.secure_url,
                publicId: data.public_id,
                createdAt: serverTimestamp()
            }

        );

        uploadStatus.textContent = "✅ Fotoğraf başarıyla yüklendi.";

    }

    catch (err) {

        uploadStatus.textContent = "❌ Fotoğraf yüklenemedi.";

        console.error(err);

    }

    finally {

        uploadBtn.disabled = false;
        fileInput.value = "";

    }

});

/* ===========================================
   GALERİ
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
                Henüz fotoğraf yüklenmedi.
            </div>
        `;

        return;

    }

    snapshot.forEach((photoDoc, index) => {

        const photo = photoDoc.data();

        galleryImages.push(photo.imageUrl);

        const img = document.createElement("img");

        img.src = photo.imageUrl;
        img.loading = "lazy";
        img.alt = "Düğün Fotoğrafı";

        img.className = "gallery-image";

        img.dataset.index = index;

        photoGallery.appendChild(img);

    });

    addGalleryEvents();

});

/* ===========================================
   GALERİ OLAYLARI
=========================================== */

function addGalleryEvents(){

    const images = document.querySelectorAll(".gallery-image");

    images.forEach((img,index)=>{

        img.onclick = ()=>{

            showImage(index);

        };

    });

}

/* ===========================================
   LIGHTBOX
=========================================== */

function showImage(index){

    if(galleryImages.length===0) return;

    currentIndex = index;

    if(currentIndex<0){

        currentIndex = galleryImages.length-1;

    }

    if(currentIndex>=galleryImages.length){

        currentIndex = 0;

    }

    lightboxImage.src = galleryImages[currentIndex];

    lightbox.style.display="flex";

}

function closeViewer(){

    lightbox.style.display="none";

}

closeLightbox.addEventListener("click",closeViewer);

lightbox.addEventListener("click",(e)=>{

    if(e.target===lightbox){

        closeViewer();

    }

});

/* ===========================================
   MOBİL KAYDIRMA
=========================================== */

lightbox.addEventListener("touchstart",(e)=>{

    startX = e.changedTouches[0].clientX;

});

lightbox.addEventListener("touchend",(e)=>{

    endX = e.changedTouches[0].clientX;

    if(startX-endX>50){

        showImage(currentIndex+1);

    }

    if(endX-startX>50){

        showImage(currentIndex-1);

    }

});

/* ===========================================
   KLAVYE
=========================================== */

document.addEventListener("keydown",(e)=>{

    if(lightbox.style.display!=="flex") return;

    switch(e.key){

        case "ArrowRight":
            showImage(currentIndex+1);
            break;

        case "ArrowLeft":
            showImage(currentIndex-1);
            break;

        case "Escape":
            closeViewer();
            break;

    }

});
