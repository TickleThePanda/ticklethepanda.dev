const axios = require('axios');

module.exports = async function() {

  const galleries = await axios.get('https://galleries.ticklethepanda.co.uk/', {
    headers: {
      "Cache-Control": "no-store"
    }
  });

  console.log(JSON.stringify(galleries.data, null, 2));

  return galleries.data;
}
