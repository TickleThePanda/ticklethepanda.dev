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

const apiBaseUrl = document.documentElement.dataset.urlApiThermometer;
const assetsBaseUrl = document.documentElement.dataset.urlAssets;

class ThermometerClient {
  constructor(token) {
    this.token = token;
  }

  async fetchLastDay() {

    let now = new Date();

    let authHeaderValue = 'Bearer ' + this.token;

    let dataUrl = apiBaseUrl + '/rooms/living-room/log/'
          + `${now.toISOString().substring(0, 10)}`;

    let opts = {
      headers: new Headers({
        'Authorization': authHeaderValue
      })
    };

    const response = await fetch(dataUrl, opts);
    const data = await handleResponse(response);
    return convertDates(data)
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
