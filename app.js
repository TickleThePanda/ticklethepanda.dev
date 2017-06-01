var express = require('express'),
    htmling = require('htmling'),
    request = require('request'),
    minifyHTML = require('express-minify-html');

var app = express();

const nav = [
  {
    "name": "about",
    "links": [ { "text":  "meet panda", "location":"/home" } ]
  },
  {
    "name": "projects",
    "links": [
      { "text":"location map",    "location":"/location" },
      { "text":"health tracking", "location":"/health" },
      { "text":"photography",     "location":"/photography" },
      { "text":"messages book",   "location":"/messages" }
    ]
  }
];

class Page {
  constructor(title, location, type, description) {
    this.title = title;
    this.location = location;
    this.type = type;
    this.description = description;
  }

  render(res, vars) {
    vars = vars ? vars : {}
    var content = htmling.file(`views/${this.type}/${this.location}.html`).render(vars);
    res.render('page', {
      title: this.title,
      location: this.location,
      description: this.description,
      nav: nav,
      content: content
    });
  }
}

class ContentPage extends Page {
  constructor(title, location, description) {
    super(title, location, "content", description);
  }
}

class ErrorPage extends Page {
  constructor(title, location, description, code) {
    super(title, location, "error", description);
    this.code = code;
  }
  render(res) {
    res.status(this.code);
    super.render(res);
  }
}

class NotFoundPage extends ErrorPage {
  constructor() {
    super("not found", "404", "The page you were looking for could not be found.", 404);
  }
}

class UnavailablePage extends ErrorPage {
  constructor() {
    super("service unavailable", "unavailable", "The service is unavailble.", 200);
  }
}

var pages = {
  "home": new ContentPage("meet panda", "home",
		"A showcase of TickleThePanda's (Thomas 'Panda' Attwood) projects."),
  "photography": new ContentPage("photography", "photography",
		"A gallery of photography taken with both digital and film cameras."),
  "health": new ContentPage("health tracking", "health",
		"An analysis of personal health data taken from my Fitbit and recorded data."),
  "location": new ContentPage("location map", "location",
		"An analysis of my location history from Google Location History."),
  "messages": new ContentPage("messages book", "messages",
		"A book created from the messaging history between my girlfriend and me."),
  "admin": new ContentPage("admin", "admin", "Page for managing data")
}

app.engine('html', htmling.express(__dirname + '/views/', {}));

app.use(minifyHTML({
    override:      true,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

app.set('view engine', 'html');

app.use('/static', express.static('public'));

app.get('/static', function(req, res) {
  res.status(404);
  res.send('Not Found');
});

app.get('/sw.js', function(req, res) {
  res.sendFile(__dirname + '/public/scripts/sw.js');
});

app.get('/:page?', function(req, res) {
  var pageName = req.params.page || req.query.action || 'home';
  
  if(pages[pageName]) {
    pages[pageName].render(res);
  } else {
    new NotFoundPage().render(res);
  }
});

app.get('/error/unavailable', function(req, res) {
  new UnavailablePage().render(res);
});

app.listen('3001', function() {
  console.log("Express server listening on port 3001");
});
