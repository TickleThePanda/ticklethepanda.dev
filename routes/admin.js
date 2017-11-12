var jwt = require('jsonwebtoken');
var fs = require('fs');
var bcrypt = require('bcrypt');

module.exports = function(app, server) {

  const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000;

  const SECRET_KEY = process.env.JWT_SECRET_KEY;

  const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  app.use(function setPrivateCache(req, res, next) {
    if (req.url.startsWith('/admin')
          || req.url === '/login'
          || req.url === '/logout') {
      res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }

    next();
  });

  app.use(function checkAuth(req, res, next) {

    jwt.verify(req.cookies.authToken, SECRET_KEY, (err, decoded) => {
      let authed = decoded && decoded.roles && decoded.roles.indexOf('admin') > -1;

      if(!authed && req.url.startsWith('/admin')) {
        res.redirect('/login');
        return;
      }

      if (authed && req.url === '/login') {
        res.redirect('/admin');
        return;
      }

      next();
      
    });

  });

  app.post('/login', function(req, res) {

    let username = req.body.username;
    let password = req.body.password;

    bcrypt.compare(password, ADMIN_PASSWORD_HASH)
        .then(success => {
          if (username === ADMIN_USERNAME && success) {
            jwt.sign({ roles: ['admin'] }, SECRET_KEY, (err, token) => {
              res.cookie("authToken", token, { httpOnly: false, maxAge: COOKIE_MAX_AGE });
              res.redirect('/admin');
            });
          } else {
            res.redirect('/login');
          }
        });

  });

  app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
  });
}
