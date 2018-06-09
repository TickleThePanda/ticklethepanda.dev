import { Router } from './admin/router.js';
import { TokenClient } from './admin/token-client.js';
import { TokenStorage } from './admin/token-storage.js';
import { WeightApp } from './admin/weight-app.js';
import { ThermometerApp } from './admin/thermometer-app.js';

let tokenClient = new TokenClient();
let tokenStorage = new TokenStorage();
let router = new Router('/admin');

let contentElement = document.getElementsByClassName('admin-content')[0];

router.interceptor = (url) => {
  let token = tokenStorage.load();
  if(!token || !url) {
    return '/login';
  } else if (token && ['/login', '/'].includes(url)) {
    return '/home';
  } else {
    return url;
  }
};

router.renderer = {
  render: text => {
    contentElement.innerHTML = text;
  },
  clear: () => {
    contentElement.innerHTML = '';
  }
}

router.register('/home', {
  content: ENV.assetsBaseUrl + '/html-partials/home.html'
});

router.register('/login', {
  content: ENV.assetsBaseUrl + '/html-partials/login.html',
  logic: () => {
    let form = document.getElementById('login');
    form.addEventListener('submit', e => {
      e.preventDefault();

      let username = document.getElementById('username').value;
      let password = document.getElementById('password').value;

      tokenClient.fetchToken(username, password)
        .then(token => {
          tokenStorage.save(token);
        })
        .then(() => {
          router.redirect('/home');
        })
        .catch(e => {
          document.getElementById('login').reset();
          document.getElementById('error').textContent = e.message;
        });
    });
  }
});

router.register('/weight', {
  content: ENV.assetsBaseUrl + '/html-partials/weight.html',
  logic: () => {
    let weightApp = new WeightApp(tokenStorage.load());

    weightApp.run();

  }
});

router.register('/thermometer', {
  content: ENV.assetsBaseUrl + '/html-partials/thermometer.html',
  logic: () => {
    let thermometerApp = new ThermometerApp(tokenStorage.load());

    thermometerApp.run();
  }
});

window.addEventListener('load', () => {
  router.start();
});

