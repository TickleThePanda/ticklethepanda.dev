var express = require('express'),
    htmling = require('htmling'),
    request = require('request');

var app = express();

const nav = [
  {
    "name": "projects",
    "links": [
      { "text":"messages book",   "location":"/messages" },
      { "text":"location map",    "location":"/location" },
      { "text":"health tracking", "location":"/health" },
      { "text":"photography",     "location":"/photography" }
    ]
  }
];

class Page {
  constructor(title, location, type) {
    this.title = title;
    this.location = location;
    this.type = type;
  }

  render(res, vars) {
    vars = vars ? vars : {}
    var content = htmling.file(`views/${this.type}/${this.location}.html`).render(vars);
    res.render('page', {
      title: this.title,
      location: this.location,
      nav: nav,
      content: content
    });
  }
}

class ContentPage extends Page {
  constructor(title, location) {
    super(title, location, "content");
  }
}

class ErrorPage extends Page {
  constructor(title, location) {
    super(title, location, "error");
  }
}

class GalleryPage extends ContentPage {
  constructor(title, location) {
    super(title, location)
  }
  render(res) {
    request({url:'http://localhost:3000/gallery', json:true}, (error, response, body) => {
      if(!error && response.statusCode == 200) {
        super.render(res, body);
      } else {
        super.render(res, "could not retrieve any galleries at this time. please try again later.");
      }
    });
  }
}

class NotFoundPage extends ErrorPage {
  constructor() {
    super("not found", "404");
  }
}

var pages = {
  "home": new ContentPage("home", "home"),
  "photography": new GalleryPage("photography", "photography"),
  "health": new ContentPage("health tracking", "health"),
  "location": new ContentPage("location map", "location"),
  "messages": new ContentPage("messages book", "messages")
}

app.engine('html', htmling.express(__dirname + '/views/', {
  watch: true,
  minify: true
}));
app.set('view engine', 'html');

app.use('/static', express.static('public'));

app.get('/:page?', function(req, res) {
  var pageName = req.params.page || req.query.action || 'home';
  
  if(pages[pageName]) {
    pages[pageName].render(res);
  } else {
    new NotFoundPage().render(res);
  }
});

app.listen('3001', function() {
  console.log("Express server listening on port 3001");
});
