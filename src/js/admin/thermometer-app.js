export { ThermometerApp }

function handleResponse(response) {
  if(response.ok) {
    return response.json();
  } else {
    throw Error('unable to load data: ' + response.statusText);
  }
}

function convertDates(results) {
  results.forEach(r => {
    r.time = new Date(r.time);
  });
  return results;
}

const apiBaseUrl = document.documentElement.dataset.urlApi;

class ThermometerClient {
  constructor(token) {
    this.token = token;
  }

  fetchLastDay() {
    
    let authHeaderValue = 'Bearer ' + this.token;

    let now = new Date();

    let yesterday = new Date(now.getTime());
    yesterday.setDate(yesterday.getDate() - 1);

    let dataUrl = apiBaseUrl + '/thermometers/rooms/living-room/entries'
          + `?start=${yesterday.toISOString()}&end=${now.toISOString()}`;

    let opts = {
      headers: new Headers({
        'Authorization': authHeaderValue
      })
    };

    return fetch(dataUrl, opts)
      .then(handleResponse)
      .then(convertDates);
  }
}

function resizeView(v, w) {
  v.width(w)
    .height(w / 1.61)
    .run();
}

class ThermometerApp {
  constructor(token) {
    this.token = token;
    this.client = new ThermometerClient(token);
  }

  run() {

    let view;

    let chartSpecUrl = assetsBaseUrl + '/vega/thermometer.vg.json';

    let chart = {
      container: '#thermometer-chart'
    }

    this.client.fetchLastDay()
      .then(results => {
        vega.loader()
          .load(chartSpecUrl)
          .then(specData => {
              
            let spec = JSON.parse(specData);
            view = new vega.View(vega.parse(spec))
              .renderer('svg')
              .insert('source', results)
              .logLevel(vega.Warn)
              .initialize(chart.container)

            let container = view.container();

            let w = container.offsetWidth;

            resizeView(view, w);
          
        });

      });

      window.addEventListener('resize', function() {

        if(view) {
          let container = view.container();
          let w = container.offsetWidth;
          resizeView(view, w);
        }
      });
  }
}


