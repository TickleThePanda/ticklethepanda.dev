const axios = require("axios");

module.exports = async function () {
  const galleriesResponse = await axios.get(
    "https://galleries.ticklethepanda.co.uk/",
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );

  const galleriesData = galleriesResponse.data;

  galleriesData.favourites = {
    images: galleriesData.galleries
      .flatMap((g) => g.images)
      .filter((i) => i.favourite)
      .reverse(),
  };

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
