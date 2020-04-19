const Random = require('seedrandom');

module.exports = function (config) {

  config.addLiquidFilter("hash", function(value) {

    const random = new Random(value);

    return random();
  });

  config.addLayoutAlias('page', 'page.html');

  return {
    dir: {
      input: 'src/eleventy',
      output: 'site',
      layouts: '_layouts',
      includes: '_includes'
    }
  }
}
