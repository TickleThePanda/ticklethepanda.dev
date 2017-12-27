export { Router };

function getUrl() {
  let hash = window.location.hash;
  if (hash === null) {
    return null;
  } else {
    return window.location.hash.substring(1);
  }
}

function handlePageChange(router) {
  let initialUrl = getUrl();
  let url = router.interceptor(initialUrl);
  if(initialUrl === url) {
    router.handle(url);
  } else {
    router.redirect(url);
  }
}

class Router {

  constructor() {
    this.routes = {};
    this.interceptor = null;
    this.renderer = null;
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
    window.addEventListener('hashchange', () => {
      handlePageChange(this)
    });
  }

  redirect(url) {
    window.location = '#' + url;
    handlePageChange(this);
  }
}

