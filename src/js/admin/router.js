export { Router };

async function handlePageChange(router) {
  let initialUrl = router.getCurrentUrl();
  let url = router.interceptor(initialUrl);
  if(initialUrl === url) {
    await router.handle(url);
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

  async handle(url) {
    this.renderer.clear();

    let action = this.routes[url];

    const response = await fetch(action.content, { mode: 'cors' });
    const text = await response.text();
    await this.renderer.render(text);
    
    if (action.logic) {
      await action.logic();
    }
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

