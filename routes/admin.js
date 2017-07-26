module.exports = function (app, server) {
  app.use(function checkAuth (req, res, next) {
    if (req.url.startsWith('/admin') && (!req.session || !req.session.authenticated)) {
      res.redirect('/login');
      return;
    }

    next();
  });

  app.post('/login', function (req, res) {
    if (req.body.username && req.body.username === 'panda'
          && req.body && req.body.password === 'password') {
      req.session.authenticated = true;
    }
    res.redirect('/admin');
  });
}
