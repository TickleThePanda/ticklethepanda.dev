module.exports = function (app) {
  app.get('/sw.js', function(req, res) {
    res.sendFile(__dirname + '/public/scripts/sw.js');
  });
}
