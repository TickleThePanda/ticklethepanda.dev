const Random = require('seedrandom');

function coerceToDate(date) {
  return typeof date === "string" ? Date.parse(date) : date;
}

module.exports = function (config) {

  config.addLiquidFilter("hash", function(value, index) {
    const random = new Random(value + index);

    return random();
  });

  config.addLiquidFilter("where", function(array, p, v) {
    return array.filter(i => i[p] === v);
  });

  config.addLiquidFilter("sortByUpdated", function(array) {
    return array
      .slice()
      .sort((a, b) => coerceToDate(b.data.updated) - coerceToDate(a.data.updated));
  });

  config.addLayoutAlias('page', 'page.html');

  return {
    dir: {
      input: 'src/views',
      output: 'site',
      layouts: '_layouts',
      includes: '_includes'
    }
  }
}
