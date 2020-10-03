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
const chartSpecUrl = assetsBaseUrl + '/vega/thermometer.vg.json';

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
    this.view = null;
  }

  async run() {
    const chartParams = this.getChartingParams();

    const rooms = chartParams.rooms;

    const roomData = await this.fetchRoomData(rooms, chartParams);

    const combined = this.combineData(roomData);

    await this.generateChart(combined, chartParams);

    document.querySelector('.js-updated-time').innerHTML = new Date().toLocaleString();

    setInterval(
      () => this.updateChart(rooms, chartParams),
      60 * 1000
    );

    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateChart(rooms, chartParams);
      }
    });

  }

  combineData(roomData) {
    let combined = [];
    for (let { room, data } of roomData)  {
      for (let entry of data) {
        combined.push(Object.assign({ room }, entry));
      }
    }
    return combined;
  }

  getChartingParams() {
    const rooms = ['living-room', 'office'];

    const params = new URLSearchParams(window.location.search)
    const periodParam = Number.parseFloat(params.get('period'));
    const dateParam = Date.parse(params.get('date'));
    const roomParam = params.get('room');

    if (roomParam !== null) {
      rooms.push(roomParam);
    }

    const period = !Number.isNaN(periodParam) ? periodParam : 1800;
    const date = !Number.isNaN(dateParam) ? new Date(dateParam) : undefined;

    const dateMode = !Number.isNaN(dateParam) ? "WHOLE_DAY" : "LAST_24";

    return {
      rooms, period, date, dateMode
    }

  }

  async generateChart(data, {date, dateMode}) {

    const spec = JSON.parse(await (vega.loader().load(chartSpecUrl)));

    const chartBounds = calculateChartBounds(dateMode, date);

    this.view = new vega.View(vega.parse(spec))
        .renderer('svg')
        .insert('source', data)
        .logLevel(vega.Warn)
        .signal('minDate', chartBounds.minDate)
        .signal('maxDate', chartBounds.maxDate)
        .initialize(`#thermometer-chart`);

    let container = this.view.container();

    let w = container.offsetWidth;

    resizeView(this.view, w);

    window.addEventListener('resize', () => {

      if(this.view) {
        let container = this.view.container();
        let w = container.offsetWidth;
        resizeView(this.view, w);
      }
    });

    return {
      view: this.view,
      data
    };

  }

  async updateChart(rooms, chartParams) {
    if (chartParams.dateMode === 'LAST_24') {
      const data = await this.fetchRoomData(rooms, chartParams);

      const chartBounds = calculateChartBounds(
        chartParams.dateMode,
        chartParams.date
      );

      const combined = this.combineData(data);

      this.view.data('source', combined)
        .signal('minDate', chartBounds.minDate)
        .signal('maxDate', chartBounds.maxDate)
        .run();

      document.querySelector('.js-updated-time').innerHTML = new Date().toLocaleString();
    }
  }

  async fetchRoomData(rooms, {period, date, dateMode}) {

    return await Promise.all(rooms.map(async (room) => {
      let results;
      if (dateMode === 'LAST_24') {
        results = await this.client.fetchLastDay(room, period);
      } else {
        results = await this.client.fetchForDate(room, date, period);
      }

      return {
        room,
        data: results
      };

    }));

  }

}
