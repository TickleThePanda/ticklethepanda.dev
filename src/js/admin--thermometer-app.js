import { TokenStorage } from "./admin/token-storage.js";

function handleResponse(response) {
  if (response.ok) {
    return response.json();
  } else {
    throw Error("unable to load data: " + response.statusText);
  }
}

function convertDates(results) {
  results.forEach((r) => {
    r.time = new Date(r.time);
  });
  return results;
}

const apiBaseUrl = document.documentElement.dataset.urlApiThermometer;
const assetsBaseUrl = document.documentElement.dataset.urlAssets;
const chartSpecUrl = assetsBaseUrl + "/vega/thermometer.vg.json";

const ROOMS = ["living-room", "office", "bedroom"];

class ChartingParams {
  static fromUrl() {
    const rooms = ROOMS;

    const params = new URLSearchParams(window.location.search);
    const periodParam = Number.parseFloat(params.get("period"));
    const dateParam = Date.parse(params.get("date"));
    const roomParam = params.get("room");

    if (roomParam !== null) {
      rooms.push(roomParam);
    }

    const period = !Number.isNaN(periodParam) ? periodParam : 1799;
    const date = !Number.isNaN(dateParam) ? new Date(dateParam) : undefined;

    const dateMode = !Number.isNaN(dateParam) ? "WHOLE_DAY" : "LAST_24";

    return new ChartingParams({
      rooms,
      period,
      date,
      dateMode,
    });
  }

  constructor({ rooms, period, date, dateMode }) {
    this.rooms = rooms;
    this.period = period;
    this.date = date;
    this.dateMode = dateMode;
  }

  nextDay() {
    this.addDays(1);
  }

  prevDay() {
    this.addDays(-1);
  }

  addDays(direction) {
    this.dateMode = "WHOLE_DAY";
    if (this.date === undefined) {
      this.date = new Date();

      this.date.setUTCHours(0, 0, 0, 0);
    }
    this.date.setDate(this.date.getDate() + direction);

    if (isToday(this.date)) {
      this.dateMode = "LAST_24";
      this.date = undefined;
    }
  }
}

class ThermometerClient {
  constructor(token) {
    this.token = token;
  }

  async fetchForDate(room, date, period) {
    let authHeaderValue = "Bearer " + this.token;

    let dataUrl =
      apiBaseUrl +
      `/rooms/${room}/log/${date
        .toISOString()
        .substring(0, 10)}?period=${period}`;

    let opts = {
      headers: new Headers({
        Authorization: authHeaderValue,
      }),
    };

    const response = await fetch(dataUrl, opts);
    const data = await handleResponse(response);
    return convertDates(data);
  }

  async fetchLastDay(room, period) {
    const now = new Date();
    const yesterday = addDays(now, -1);

    const dates = [yesterday, now];
    const fetchPromises = dates.map((d) => this.fetchForDate(room, d, period));
    const allData = (await Promise.all(fetchPromises)).flat();

    return allData.filter((e) => yesterday < e.time && e.time < now);
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
      maxDate: now,
    };
  } else {
    return {
      minDate: date,
      maxDate: addDays(date, 1),
    };
  }
}

class ThermometerApp {
  constructor(token) {
    this.token = token;
    this.client = new ThermometerClient(token);
    this.view = null;
    this.chartParams = null;
  }

  async run() {
    this.chartParams = ChartingParams.fromUrl();

    const rooms = this.chartParams.rooms;

    const roomData = await this.fetchRoomData(rooms);

    const combined = this.combineData(roomData);

    await this.generateChart(combined);

    this.markUpdatedTime();

    setInterval(() => this.updateChart(rooms), 60 * 1000);

    window.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.updateChart(rooms);
      }
    });

    this.updateControls();

    document
      .querySelector(".js-thermometer-prev")
      .addEventListener("click", async () => {
        this.chartParams.prevDay();
        this.updateControls();
        this.emptyChart();
        this.updateChart(rooms, true);
      });

    document
      .querySelector(".js-thermometer-next")
      .addEventListener("click", async () => {
        this.chartParams.nextDay();
        this.updateControls();
        this.emptyChart();
        this.updateChart(rooms, true);
      });
  }

  combineData(roomData) {
    let combined = [];
    for (let { room, data } of roomData) {
      for (let entry of data) {
        combined.push(Object.assign({ room }, entry));
      }
    }
    return combined;
  }

  async generateChart(data) {
    const spec = JSON.parse(await vega.loader().load(chartSpecUrl));

    const chartBounds = calculateChartBounds(
      this.chartParams.dateMode,
      this.chartParams.date
    );

    this.view = new vega.View(vega.parse(spec))
      .renderer("svg")
      .insert("source", data)
      .logLevel(vega.Warn)
      .signal("minDate", chartBounds.minDate)
      .signal("maxDate", chartBounds.maxDate)
      .initialize(`#thermometer-chart`);

    let container = this.view.container();

    let w = container.offsetWidth;

    resizeView(this.view, w);

    window.addEventListener("resize", () => {
      if (this.view) {
        let container = this.view.container();
        let w = container.offsetWidth;
        resizeView(this.view, w);
      }
    });

    return {
      view: this.view,
      data,
    };
  }

  async updateChart(rooms, forced) {
    if (this.chartParams.dateMode === "LAST_24" || forced) {
      const data = await this.fetchRoomData(rooms, this.chartParams);

      const chartBounds = calculateChartBounds(
        this.chartParams.dateMode,
        this.chartParams.date
      );

      const combined = this.combineData(data);

      this.view
        .data("source", combined)
        .signal("minDate", chartBounds.minDate)
        .signal("maxDate", chartBounds.maxDate)
        .run();

      this.markUpdatedTime();
    }
  }

  async emptyChart() {
    this.view.data("source", null).run();
  }

  async fetchRoomData(rooms) {
    const period = this.chartParams.period;
    const date = this.chartParams.date;
    const dateMode = this.chartParams.dateMode;

    return await Promise.all(
      rooms.map(async (room) => {
        let results;
        if (dateMode === "LAST_24") {
          results = await this.client.fetchLastDay(room, period);
        } else {
          results = await this.client.fetchForDate(room, date, period);
        }

        return {
          room,
          data: results,
        };
      })
    );
  }

  updateControls() {
    document.querySelector(".js-thermometer-prev").disabled = false;
    if (this.chartParams.dateMode === "LAST_24") {
      document.querySelector(".js-thermometer-next").disabled = true;
      document.querySelector(".js-thermometer-current-date").innerHTML =
        "Last 24 hours";

      const url = new URL(window.location.href);
      url.searchParams.delete("date");
      history.replaceState(null, null, url);
    } else {
      document.querySelector(".js-thermometer-next").disabled = false;

      const url = new URL(window.location.href);
      url.searchParams.set(
        "date",
        this.chartParams.date.toISOString().slice(0, 10)
      );
      history.replaceState(null, null, url);

      document.querySelector(".js-thermometer-current-date").innerHTML =
        formatDate(this.chartParams.date);
    }
  }

  markUpdatedTime() {
    document.querySelector(".js-updated-time").innerHTML = formatDateTime(
      new Date()
    );
  }
}

function isToday(someDate) {
  const today = new Date();
  return (
    someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
  );
}

function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
}

function formatDate(date) {
  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

window.addEventListener("load", () => {
  const tokenStorage = new TokenStorage();
  const thermometerApp = new ThermometerApp(tokenStorage.load());

  thermometerApp.run();
});
