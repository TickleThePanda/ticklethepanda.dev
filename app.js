var express = require('express'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    htmling = require('htmling'),
    request = require('request'),
    minifyHTML = require('express-minify-html'),
    dotenv = require('dotenv');

dotenv.config();

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

const pages = {
  "home": {
    title: "home",
    location: "content/home",
    description: "A showcase of TickleThePanda's (Thomas 'Panda' Attwood) projects."
  },
  "photography": {
    title: "photography",
    location: "content/photography",
		description: "A gallery of photography taken with both digital and film cameras."
  },
  "health": {
    title: "health tracking",
    location: "content/health",
		description: "An analysis of personal health data taken from my Fitbit and recorded data."
  },
  "location": {
    title: "location map",
    location: "content/location",
		description: "An analysis of my location history from Google Location History."
  },
  "messages": {
    title: "messages book",
    location: "content/messages",
    description: "A book created from the messaging history between my girlfriend and me."
  },
  "admin": {
    title: "admin",
    location: "content/admin",
    description: "Page for managing data"
  },
  "not-found": {
    title: "404 - not found",
    location: "error/404",
    description: "Page not found.",
    status: "404"
  },
  "unavailable" : {
    title: "unavailable",
    location: "error/unavailable",
    description: "Page unavailable."
  },
  "login" : {
    title: "login",
    location: "content/login",
    description: "Admin login page."
  }
}

var app = express();

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));

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

var server = require('./page-server.js')(nav, pages);

require('./routes/admin.js')(app, server);
require('./routes/service-worker.js')(app, server);
require('./routes/pages.js')(app, server);

app.listen('3001', function() {
  console.log("Express server listening on port 3001");
});

