const gallery = document.getElementById("photoGallery");

const cloudName = "p0wgo1yp";

fetch(`https://res.cloudinary.com/${cloudName}/image/list/buse_samet.json`)
  .then(response => response.json())
  .then(data => {

    gallery.innerHTML = "";

    data.resources.forEach(photo => {

      const img = document.createElement("img");

      img.src = `https://res.cloudinary.com/${cloudName}/image/upload/${photo.public_id}.${photo.format}`;

      img.style.width = "100%";
      img.style.borderRadius = "15px";
      img.style.marginBottom = "15px";

      gallery.appendChild(img);

    });

  })
  .catch(error => {

    gallery.innerHTML = "Fotoğraflar yüklenemedi.";

    console.log(error);

  });
