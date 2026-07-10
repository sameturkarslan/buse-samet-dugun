const gallery = document.getElementById("photoGallery");

const cloudName = "p0wgo1yp";
const tag = "buse_samet";

fetch(`https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`)
  .then(response => response.json())
  .then(data => {

    gallery.innerHTML = "";

    data.resources.forEach(photo => {

      const img = document.createElement("img");

      img.src = `https://res.cloudinary.com/${cloudName}/image/upload/${photo.public_id}.${photo.format}`;

      gallery.appendChild(img);

    });

  })
  .catch(error => {

    gallery.innerHTML = "Fotoğraflar yüklenemedi.";

    console.log(error);

  });
