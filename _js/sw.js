let CACHE_NAME = 'ticklethepanda.co.uk-cache-v0.0.1';

var urlsToCache = [
  '/',
  '/error/unavailable',
  'https://s.ticklethepanda.co.uk/scripts/main.js',
  'https://s.ticklethepanda.co.uk/style/main.css'
];

var hosts = {
  cors: [
    's.ticklethepanda.co.uk',
    'api.ticklethepanda.co.uk'
  ],
  dynamic: ['api.ticklethepanda.co.uk'],
  fixed: ['s.ticklethepanda.co.uk'],
  page: ['ticklethepanda.co.uk']
}

var secure = {
  'ticklethepanda.co.uk': [
    "/admin.*",
    "/login",
    "/logout"
  ]
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

let resolver = {
  'fixed': event => {

    function resolve(request) {
      const cachePromise = caches.open(CACHE_NAME);
      const matchPromise = cachePromise.then(function(cache) {
        return cache.match(request);
      });
    
      return Promise.all([cachePromise, matchPromise]).then(function([cache, cacheResponse]) {
        let url = new URL(request.url);
        let options = null;
        
        if(request.mode !== "navigate" && hosts["cors"].includes(url.hostname)) {
          options = {
           'mode': 'cors',
           'credentials': 'omit'
          };
        }
        const fetchPromise = fetch(request, options).then(function(fetchResponse) {
          if (fetchResponse && fetchResponse.status === 200 && (fetchResponse.type === 'basic' || fetchResponse.type === 'cors')) {
            cache.put(request, fetchResponse.clone());
          }
          return fetchResponse;
        });
        return cacheResponse || fetchPromise;
      }).catch(function(error) {
        if (event.request.mode === 'navigate') {
          return caches.match('/error/unavailable');
        } else {
          throw error;
        }
      });
    }
    event.respondWith(resolve(event.request));
  },
  'dynamic': event => {
    if(event.request.method === 'GET') {
      event.respondWith(fetch(event.request)
          .then(function(response) {
            return caches.open(CACHE_NAME).then(function(cache) {
              cache.put(event.request, response.clone());
              return response;
            });
          })
          .catch(function(error) {
            return caches.match(event.request);
          })
      );
    } else {
      event.respondWith(fetch(event.request));
    }
  },
  'secure': event => {
    event.respondWith(fetch(event.request));
  }
};

function isSecure(url) {
  let secureUrls = secure[url.hostname];
  if(secureUrls) {
    return secureUrls.some(regex => new RegExp(regex).test(url.pathname));
  } else {
    return;
  }
}

self.addEventListener('fetch', function(event) {
  let url = new URL(event.request.url);
  let hostname = url.hostname;
  if (isSecure(url)) {
    resolver["secure"](event);
  } else if (hosts["page"].includes(hostname) || hosts["fixed"].includes(hostname)) {
    resolver["fixed"](event);
  } else if (hosts["dynamic"].includes(hostname)) {
    resolver["dynamic"](event);
  } else {
    event.respondWith(fetch(event.request));
  }
});

