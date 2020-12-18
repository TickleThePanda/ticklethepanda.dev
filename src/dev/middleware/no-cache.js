module.exports = function (req, res, next) {
  res.setHeader("Cache-Control", "no-store");
  next();
}