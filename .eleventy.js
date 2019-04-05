module.exports = function (config) {

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
