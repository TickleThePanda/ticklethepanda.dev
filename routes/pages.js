module.exports = function (app, server) {

  app.get('/:page(*)?', function(req, res) {
    var pageName = req.params.page || req.query.action || 'home';

    if(server.has(pageName)) {
      server.serve(pageName).to(res);
    } else {
      server.serve('not-found').to(res);
    }
  });

  app.get('/error/unavailable', function(req, res) {
    server.serve('unavailable').to(res);
  });

}
