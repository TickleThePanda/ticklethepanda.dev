let CACHE_NAME = 'ticklethepanda.co.uk-cache-v0.0.1';

var urlsToCache = [
  '/',
  '/error/unavailable',
  'https://s.ticklethepanda.co.uk/scripts/main.js',
  'https://s.ticklethepanda.co.uk/style/main.css'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

let resolveStatic = function(event) {
  function resolve(request) {
    const cachePromise = caches.open(CACHE_NAME);
    const matchPromise = cachePromise.then(function(cache) {
      return cache.match(request);
    });
  
    return Promise.all([cachePromise, matchPromise]).then(function([cache, cacheResponse]) {
      // Kick off the update request
      const fetchPromise = fetch(request).then(function(fetchResponse) {
        // Cache the updated file and then return the response
        cache.put(request, fetchResponse.clone());
        return fetchResponse;
      });
      // return the cached response if we have it, otherwise the result of the fetch.
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
};

let resolveDynamic = function(event) {
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
};

self.addEventListener('fetch', function(event) {
  let url = new URL(event.request.url);
  let hostname = url.hostname;
  if(hostname.endsWith("ticklethepanda.co.uk") && !hostname.endsWith('api.ticklethepanda.co.uk')) {
    resolveStatic(event);
  } else if (hostname.endsWith('api.ticklethepanda.co.uk')) {
    resolveDynamic(event);
  } else {
    event.respondWith(fetch(event.request));
  }
});

