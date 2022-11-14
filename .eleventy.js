const Random = require("seedrandom");
const { hyphenateHTML } = require("hyphen/en-gb");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

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
        (a, b) =>
          coerceToDate(b.data.updated || b.data.created) -
          coerceToDate(a.data.updated || a.data.created)
      );
  });

  config.addTransform("hyphenate", async function (content, _) {
    const dom = new JSDOM(content);
    const main = dom.window.document.querySelector("main");
    const mainHtml = main.innerHTML;
    const newMainHtml = await hyphenateHTML(mainHtml);
    main.innerHTML = newMainHtml;
    return dom.serialize();
  });

  config.addFilter("shuffle", async function (v, prop) {
    v.sort((a, b) => {
      return hash(a[prop]) - hash(b[prop]);
    });
    return v;
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

function hash(string) {
  let h = 0;

  if (string.length == 0) return h;

  for (i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    h = (h << 5) - h + char;
    h = h & h;
  }

  return h;
}
