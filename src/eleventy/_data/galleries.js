const axios = require('axios');

module.exports = async function() {

  const galleries = await axios.get('https://galleries.ticklethepanda.co.uk/');
  
  return galleries.data;
}
