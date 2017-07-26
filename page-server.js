module.exports = function (nav, pages) {
  
  var Page = require('./model/page.js')(nav);

  var modules = {};

  modules.serve = function serve(pageId) {
    console.info("loading page: " + pageId);
    let descriptor = pages[pageId];

    let page = new Page(
        descriptor.title,
        descriptor.location,
        descriptor.description,
        descriptor.status
    );

    return {
      to: function to(res) {
        console.info("serving page: " + pageId);
        page.render(res);
      }
    }
  };

  modules.has = function has(pageId) {
    return pages[pageId];
  };
  
  return modules;
}
