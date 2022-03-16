const Random = require("seedrandom");
const { hyphenateHTML } = require("hyphen/en-gb");

function coerceToDate(date) {
  return typeof date === "string" ? Date.parse(date) : date;
}

module.exports = function (config) {
  config.setLiquidOptions({
    dynamicPartials: true,
    strictFilters: true,
  });

  config.addLiquidFilter("hash", function (value, index) {
    const random = new Random(value + index);

    return random();
  });

  config.addLiquidFilter("where", function (array, p, v) {
    return array.filter((i) => i[p] === v);
  });

  config.addLiquidFilter("whereData", function (array, p, v, t) {
    if (t === "!") {
      return array.filter((i) => i.data[p] !== v);
    } else {
      return array.filter((i) => i.data[p] === v);
    }
  });

  config.addLiquidFilter("sortByUpdated", function (array) {
    return array
      .slice()
      .sort(
        (a, b) => coerceToDate(b.data.updated) - coerceToDate(a.data.updated)
      );
  });

  config.addTransform("hyphenate", async function (content, _) {
    return await hyphenateHTML(content);
  });

  return {
    dir: {
      input: "src/views",
      output: "site",
      layouts: "_layouts",
      includes: "_includes",
    },
  };
};
