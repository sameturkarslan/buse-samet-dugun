const uploadButton = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

uploadButton.addEventListener("click", function () {
  fileInput.click();
});

fileInput.addEventListener("change", async function () {

  const file = fileInput.files[0];

  if (!file) {
    return;
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "buse_samet");
  formData.append("tags", "buse_samet");

  try {

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/p0wgo1yp/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.secure_url) {
      alert("Fotoğraf başarıyla yüklendi ❤️");
    } else {
      alert("Hata: " + JSON.stringify(data));
    }

  } catch (error) {

    alert("Bağlantı hatası oluştu");
    console.log(error);

  }

});


