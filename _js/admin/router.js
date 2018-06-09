export { Router };

function handlePageChange(router) {
  let initialUrl = router.getCurrentUrl();
  let url = router.interceptor(initialUrl);
  console.log(`${initialUrl} => ${url}`);
  if(initialUrl === url) {
    router.handle(url);
  } else {
    router.redirect(url);
  }
}

class Router {

  constructor(baseUrl = '/') {
    this.routes = {};
    this.interceptor = null;
    this.renderer = null;
    this.baseUrl = baseUrl;
  }

  getCurrentUrl() {
    let url = window.location.pathname;
    if (url.startsWith(this.baseUrl)) {
      return url.substr(this.baseUrl.length);
    } else {
      return null;
    }
  }

  register(url, cb) {
    this.routes[url] = cb;
  }

  handle(url) {
    this.renderer.clear();

    let action = this.routes[url];

    fetch(action.content, { mode: 'cors' })
      .then(response => response.text())
      .then(this.renderer.render)
      .then(() => { 
        if (action.logic) {
          action.logic();
        }
      });
  }
  
  start() {
    handlePageChange(this);
    document.querySelectorAll('a').forEach((anchor) => {
      anchor.addEventListener('click', event => {
        handlePageChange(anchor.getAttribute("href"));
      });
    });
  }

  redirect(url) {
    window.history.pushState({}, '', this.baseUrl + url);
    handlePageChange(this);
  }
}

