module.exports = function (config) {

  config.addLayoutAlias('page', 'layouts/page.html');

  return {
    dir: {
      input: 'src/eleventy',
      output: 'site'
    }
  }
}
