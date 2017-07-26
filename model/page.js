var htmling = require('htmling');

module.exports = function (nav) {
  return class Page {
    constructor(title, location, description, status) {
      this.title = title;
      this.location = location;
      this.description = description;
      this.status = status;
    }

    render(res, vars) {
      vars = vars ? vars : {}
      var content = htmling.file(`views/${this.location}.html`).render(vars);
      if (this.status) {
        res.status(this.status);
      }
      res.render('page', {
        title: this.title,
        location: this.location,
        description: this.description,
        nav: nav,
        content: content
      });
    }
  }
}

