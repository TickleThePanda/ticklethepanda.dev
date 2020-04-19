const Random = require('seedrandom');

module.exports = function (config) {

  config.addLiquidFilter("hash", function(value, index) {
    const random = new Random(value + index);

    return random();
  });

  config.addLiquidFilter("where", function(array, p, v) {
    return array.filter(i => i[p] === v);
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
