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

  async fetchForDate(date, period) {
    let authHeaderValue = 'Bearer ' + this.token;

    let dataUrl = apiBaseUrl + '/rooms/living-room/log/'
          + `${date.toISOString().substring(0, 10)}?period=${period}`;

    let opts = {
      headers: new Headers({
        'Authorization': authHeaderValue
      })
    };

    const response = await fetch(dataUrl, opts);
    const data = await handleResponse(response);
    return convertDates(data);
  }

  async fetchLastDay(period) {

    const now = new Date();
    const yesterday = new Date(now.getTime());
    yesterday.setDate(yesterday.getDate() - 1);

    const dates = [yesterday, now];
    const fetchPromises = dates.map(d => this.fetchForDate(d, period));
    const allData = (await Promise.all(fetchPromises)).flat();

    return allData.filter(e => (yesterday < e.time && e.time < now));
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

  async run() {

    let view;

    let chartSpecUrl = assetsBaseUrl + '/vega/thermometer.vg.json';

    let chart = {
      container: '#thermometer-chart'
    }

    const params = new URLSearchParams(window.location.search)
    const periodParam = Number.parseFloat(params.get('period'));

    const period = !Number.isNaN(periodParam) ? periodParam : 1800;

    const results = await this.client.fetchLastDay(period)

    const specData = await (vega.loader().load(chartSpecUrl));
    
    let spec = JSON.parse(specData);
    view = new vega.View(vega.parse(spec))
      .renderer('svg')
      .insert('source', results)
      .logLevel(vega.Warn)
      .initialize(chart.container)

    let container = view.container();

    let w = container.offsetWidth;

    resizeView(view, w);

    window.addEventListener('resize', function() {

      if(view) {
        let container = view.container();
        let w = container.offsetWidth;
        resizeView(view, w);
      }
    });
  }
}
