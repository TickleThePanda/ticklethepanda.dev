var path = require('path');

module.exports = function (app) {
  let baseDir = path.dirname(require.main.filename);

  app.get('/sw.js', function(req, res) {
    res.sendFile(baseDir + '/public/scripts/sw.js');
  });
}
