const uploadButton = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

uploadButton.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {

  const file = fileInput.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "buse_samet");

  fetch("https://api.cloudinary.com/v1_1/p0wgo1yp/image/upload", {
    method: "POST",
    body: formData
  })

  .then(response => response.json())
p
  .then(data => {
    alert("Fotoğraf başarıyla yüklendi ❤️");
    console.log(data);
  })

  .catch(error => {
    alert("Yükleme sırasında hata oluştu");
    console.log(error);
  });

});
