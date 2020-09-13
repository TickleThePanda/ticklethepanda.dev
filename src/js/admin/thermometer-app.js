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

  async fetchForDate(room, date, period) {
    let authHeaderValue = 'Bearer ' + this.token;

    let dataUrl = apiBaseUrl + `/rooms/${room}/log/${date.toISOString().substring(0, 10)}?period=${period}`;

    let opts = {
      headers: new Headers({
        'Authorization': authHeaderValue
      })
    };

    const response = await fetch(dataUrl, opts);
    const data = await handleResponse(response);
    return convertDates(data);
  }

  async fetchLastDay(room, period) {

    const now = new Date();
    const yesterday = addDays(now, -1);

    const dates = [yesterday, now];
    const fetchPromises = dates.map(d => this.fetchForDate(room, d, period));
    const allData = (await Promise.all(fetchPromises)).flat();

    return allData.filter(e => (yesterday < e.time && e.time < now));
  }
}

function resizeView(v, w) {
  v.width(w)
    .height(w / 1.61)
    .run();
}

function addDays(date, n) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + n);

  return newDate;
}

function calculateChartBounds(dateMode, date) {
  if (dateMode === "LAST_24") {
    let now = Date.now();

    let yesterday = addDays(now, -1);

    return {
      minDate: yesterday,
      maxDate: now
    };

  } else {

    return {
      minDate: date,
      maxDate: addDays(date, 1)
    };

  }
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
    const dateParam = Date.parse(params.get('date'));
    const roomParam = params.get('room');

    const room = roomParam !== null ? roomParam : 'living-room';

    const period = !Number.isNaN(periodParam) ? periodParam : 1800;
    const date = !Number.isNaN(dateParam) ? new Date(dateParam) : undefined;

    const dateMode = !Number.isNaN(dateParam) ? "WHOLE_DAY" : "LAST_24";

    console.log(dateMode, dateParam);

    let results;
    if (dateMode === 'LAST_24') {
      results = await this.client.fetchLastDay(room, period);
    } else {
      results = await this.client.fetchForDate(room, date, period);
    }

    const specData = await (vega.loader().load(chartSpecUrl));

    const chartBounds = calculateChartBounds(dateMode, date)

    let spec = JSON.parse(specData);
    view = new vega.View(vega.parse(spec))
      .renderer('svg')
      .insert('source', results)
      .logLevel(vega.Warn)
      .signal('minDate', chartBounds.minDate)
      .signal('maxDate', chartBounds.maxDate)
      .initialize(chart.container);

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
