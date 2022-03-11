import type { View } from "vega-typings/types";
import { TokenStorage } from "./lib/token-storage.js";

function handleResponse(response: Response) {
  if (response.ok) {
    return response.json();
  } else {
    throw Error("unable to load data: " + response.statusText);
  }
}

function convertDates(results: ThermometerEntry[]): ThermometerEntry[] {
  results.forEach((r) => {
    r.time = new Date(r.time);
  });
  return results;
}

interface ThermometerEntry {
  time: string | Date;
  room: string;
}

interface RoomData {
  room: string;
  data: ThermometerEntry[];
}

type ChartableThermometerEntries =
  | ThermometerApp
  | {
      room: string;
    };

const apiBaseUrl = document.documentElement.dataset.urlApiThermometer;
const assetsBaseUrl = document.documentElement.dataset.urlAssets;
const chartSpecUrl = assetsBaseUrl + "/vega/thermometer.vg.json";

const ROOMS = ["living-room", "office", "bedroom"];

class ChartingParams {
  rooms: string[];
  period: number;
  date: Date | undefined;
  dateMode: string;

  static fromUrl(): ChartingParams {
    const rooms = ROOMS;

    const params = new URLSearchParams(window.location.search);

    const periodParam = Number.parseFloat(params.get("period") ?? "");
    const dateParam = Date.parse(params.get("date") ?? "");
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

  constructor({
    rooms,
    period,
    date,
    dateMode,
  }: {
    rooms: Array<string>;
    period: number;
    date: Date | undefined;
    dateMode: string;
  }) {
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

  addDays(direction: number) {
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
  token: string;
  constructor(token: string) {
    this.token = token;
  }

  async fetchForDate(
    room: string,
    date: Date,
    period: number
  ): Promise<ThermometerEntry[]> {
    const authHeaderValue = "Bearer " + this.token;

    const dataUrl =
      apiBaseUrl +
      `/rooms/${room}/log/${date
        .toISOString()
        .substring(0, 10)}?period=${period}`;

    const opts = {
      headers: new Headers({
        Authorization: authHeaderValue,
      }),
    };

    const response = await fetch(dataUrl, opts);
    const data = await handleResponse(response);
    return convertDates(data);
  }

  async fetchLastDay(room: string, period: number) {
    const now = new Date();
    const yesterday = addDays(now, -1);

    const dates = [yesterday, now];
    const fetchPromises = dates.map((d) => this.fetchForDate(room, d, period));
    const allData = (await Promise.all(fetchPromises)).flat();

    return allData.filter((e) => yesterday < e.time && e.time < now);
  }
}

function resizeView(v: View, w: number) {
  v.width(w)
    .height(w / 1.61)
    .run();
}

function addDays(epochInMs: Date, n: number) {
  const newDate = new Date(epochInMs);
  newDate.setDate(newDate.getDate() + n);

  return newDate;
}

function calculateChartBounds(dateMode: string, date: Date | undefined) {
  if (dateMode === "LAST_24") {
    const now = new Date();

    const yesterday = addDays(now, -1);

    return {
      minDate: yesterday,
      maxDate: now,
    };
  } else if (date !== undefined) {
    return {
      minDate: date,
      maxDate: addDays(date, 1),
    };
  } else {
    throw Error("No date available");
  }
}

class ThermometerApp {
  static async create(token: string): Promise<ThermometerApp> {
    const chartParams = ChartingParams.fromUrl();
    const spec = JSON.parse(await vega.loader().load(chartSpecUrl));

    const chartBounds = calculateChartBounds(
      chartParams.dateMode,
      chartParams.date
    );

    const view = new vega.View(vega.parse(spec))
      .renderer("svg")
      .insert("source", data)
      .logLevel(vega.Warn)
      .signal("minDate", chartBounds.minDate)
      .signal("maxDate", chartBounds.maxDate)
      .initialize(`#thermometer-chart`);

    if (view === null) {
      throw new Error("Failed to initialise view");
    }

    const container = view.container();

    if (container === null) {
      throw new Error("Unable to find container");
    }

    const w = container.offsetWidth;

    resizeView(view, w);

    window.addEventListener("resize", () => {
      if (view) {
        const container = view.container();
        if (container === null) {
          throw new Error("Unable to find container");
        }
        const w = container.offsetWidth;
        resizeView(view, w);
      }
    });

    return new ThermometerApp({
      token,
      view,
      chartParams: ChartingParams.fromUrl(),
    });
  }

  token: string;
  client: ThermometerClient;
  view: View;
  chartParams: ChartingParams;
  constructor({
    token,
    view,
    chartParams,
  }: {
    token: string;
    view: View;
    chartParams: ChartingParams;
  }) {
    this.token = token;
    this.client = new ThermometerClient(token);
    this.view = view;
    this.chartParams = chartParams;
  }

  async run() {
    const rooms = this.chartParams.rooms;

    const roomData = await this.fetchRoomData(rooms);

    const combined = this.combineData(roomData);

    await this.generateChart(combined);

    this.markUpdatedTime();

    setInterval(() => this.updateChart(rooms, false), 60 * 1000);

    window.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.updateChart(rooms, false);
      }
    });

    this.updateControls();

    const prevButton = <HTMLElement>(
      document.querySelector(".js-thermometer-prev")
    );

    prevButton.addEventListener("click", async () => {
      this.chartParams.prevDay();
      this.updateControls();
      this.emptyChart();
      this.updateChart(rooms, true);
    });

    const nextButton = <HTMLElement>(
      document.querySelector(".js-thermometer-next")
    );

    nextButton.addEventListener("click", async () => {
      this.chartParams.nextDay();
      this.updateControls();
      this.emptyChart();
      this.updateChart(rooms, true);
    });
  }

  combineData(roomData: RoomData[]): ChartableThermometerEntries[] {
    const combined = [];
    for (const { room, data } of roomData) {
      for (const entry of data) {
        combined.push(Object.assign({ room }, entry));
      }
    }
    return combined;
  }

  async generateChart(data: ChartableThermometerEntries[]) {
    return {
      view: this.view,
      data,
    };
  }

  async updateChart(rooms: string[], forced: boolean) {
    if (this.view === null) {
      throw new Error("Unable to update chart as there was no view");
    }

    if (this.chartParams.dateMode === "LAST_24" || forced) {
      const data = await this.fetchRoomData(rooms);

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

  async fetchRoomData(rooms: string[]): Promise<RoomData[]> {
    const period = this.chartParams.period;
    const date = this.chartParams.date;
    const dateMode = this.chartParams.dateMode;

    return await Promise.all(
      rooms.map(async (room) => {
        let results: ThermometerEntry[];
        if (dateMode === "LAST_24") {
          results = await this.client.fetchLastDay(room, period);
        } else if (date !== undefined) {
          results = await this.client.fetchForDate(room, date, period);
        } else {
          throw new Error("No date specified");
        }

        return {
          room,
          data: results,
        };
      })
    );
  }

  updateControls() {
    (<HTMLInputElement>(
      document.querySelector(".js-thermometer-prev")
    )).disabled = false;

    const nextButton = <HTMLInputElement>(
      document.querySelector(".js-thermometer-next")
    );
    const currentDateElement = <HTMLElement>(
      document.querySelector(".js-thermometer-current-date")
    );

    if (this.chartParams.dateMode === "LAST_24") {
      nextButton.disabled = true;
      currentDateElement.innerHTML = "Last 24 hours";

      const url = new URL(window.location.href);
      url.searchParams.delete("date");
      history.replaceState(null, "", url);
    } else if (this.chartParams.date !== undefined) {
      nextButton.disabled = false;

      const url = new URL(window.location.href);
      url.searchParams.set(
        "date",
        this.chartParams.date.toISOString().slice(0, 10)
      );
      history.replaceState(null, "", url);

      currentDateElement.innerHTML = formatDate(this.chartParams.date);
    }
  }

  markUpdatedTime() {
    const lastUpdatedElement = <HTMLElement>(
      document.querySelector(".js-updated-time")
    );
    lastUpdatedElement.innerHTML = formatDateTime(new Date());
  }
}

function isToday(someDate: Date) {
  const today = new Date();
  return (
    someDate.getDate() == today.getDate() &&
    someDate.getMonth() == today.getMonth() &&
    someDate.getFullYear() == today.getFullYear()
  );
}

function formatDateTime(date: Date) {
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

function formatDate(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

window.addEventListener("load", async () => {
  const tokenStorage = new TokenStorage();
  const token = tokenStorage.load();
  if (token === null) {
    throw new Error("Unable to get token");
  }
  const thermometerApp = await ThermometerApp.create(token);

  thermometerApp.run();
});
