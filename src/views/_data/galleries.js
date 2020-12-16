const axios = require('axios');

module.exports = async function() {

  const galleries = await axios.get('https://galleries.ticklethepanda.co.uk/', {
    headers: {
      "Cache-Control": "no-store"
    }
  });

  printGalleryInfo(galleries.data);

  return galleries.data;
}

function printGalleryInfo(galleries) {
  console.log("Galleries fetched:")
  for (let gallery of galleries.galleries) {
    console.log(` - ${gallery.name} (${gallery.ref}) | ${gallery.images.map(i => i.name).join(', ')}`);
  }
}