const axios = require("axios");

module.exports = async function () {
  const galleriesResponse = await axios.get(
    "https://galleries.ticklethepanda.dev/",
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  const galleriesData = galleriesResponse.data;

  const favouriteGalleryToImages = galleriesData.galleries
    .flatMap((g) => g.images)
    .filter((i) => i.favourite)
    .reduce((p, i) => {
      if (p[i.favouriteGallery] === undefined) {
        p[i.favouriteGallery] = [];
      }
      p[i.favouriteGallery].push(i);
      return p;
    }, {});
  
  const favouriteGalleries = Object.entries(favouriteGalleryToImages)
    .map(([ gallery, images ]) => ({
      name: gallery,
      images: images.reverse()
    }));
  
  const order = [
    "Architecture",
    "Infrastructure",
    "Nature",
    "People"
  ]

  favouriteGalleries.sort((a, b) => {
    const ai = order.includes(a.name) ? order.indexOf(a.name) : order.length;
    const bi = order.includes(b.name) ? order.indexOf(b.name) : order.length;
    return ai - bi;
  })
  
  galleriesData.favourites = favouriteGalleries

  printGalleryInfo(galleriesData);

  return galleriesData;
};

function printGalleryInfo(galleries) {
  console.log("Galleries fetched:");
  for (let gallery of galleries.galleries) {
    console.log(
      ` - ${gallery.name} (${gallery.ref}) | ${gallery.images
        .map((i) => i.name)
        .join(", ")}`
    );
  }
}
