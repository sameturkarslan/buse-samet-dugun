import {
  db,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "./firebase.js";

// ==============================
// Cloudinary Ayarları
// ==============================

const CLOUD_NAME = "p0wgo1yp";
const UPLOAD_PRESET = "buse_samet";

// ==============================
// HTML Elemanları
// ==============================

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const photoGallery = document.getElementById("photoGallery");

// ==============================
// Fotoğraf Seç
// ==============================

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

    console.log(data);
    alert(JSON.stringify(data));

    if (!data.secure_url) {
      throw new Error("Cloudinary yükleme hatası.");
    }

    await addDoc(collection(db, "photos"), {
      imageUrl: data.secure_url,
      publicId: data.public_id,
      createdAt: serverTimestamp()
    });

    uploadStatus.textContent = "✅ Fotoğraf başarıyla yüklendi.";

  } catch (err) {

    console.error(err);
    console.error(err.message);

    uploadStatus.textContent = "❌ " + (err.message || "Yükleme başarısız.");

  }

  uploadBtn.disabled = false;
  fileInput.value = "";

});

// ==============================
// Canlı Galeri
// ==============================

const photoQuery = query(
  collection(db, "photos"),
  orderBy("createdAt", "desc")
);

onSnapshot(photoQuery, (snapshot) => {

  photoGallery.innerHTML = "";

  if (snapshot.empty) {

    photoGallery.innerHTML =
      "<div class='loading'>Henüz fotoğraf yüklenmedi.</div>";

    return;
  }

  snapshot.forEach((doc) => {

    const photo = doc.data();

    const img = document.createElement("img");

    img.src = photo.imageUrl;
    img.loading = "lazy";
    img.className = "gallery-image";

    photoGallery.appendChild(img);

  });

});
