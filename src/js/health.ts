import { BasicHistory, HealthClient } from "./lib/health-client.js";
import { ChartClient } from "./lib/chart-client.js";
import { ChartSizeManager } from "./lib/chart-size-manager.js";
import { TokenStorage } from "./lib/token-storage.js";
import type { View } from "vega-typings/types";

const tokenStorage = new TokenStorage();
const token = tokenStorage.load();

window.addEventListener("load", async () => {
  if (token === null) {
    console.log("Unable to get token");
    return;
  }

  const healthClient = new HealthClient(token);

  const chartClient = new ChartClient();
  const chartSizeManager = new ChartSizeManager();

  const state = {
    facet: (<HTMLInputElement>(
      document.querySelector("#weight-charts .facets .button--selected")
    )).value,
  };

  const [weightWeek, weightMonth, weightQuarterlyMa, weightYearly, chartSpec] = await Promise.all([
    healthClient.fetchWeightHistoryWithPeriod(4, 4),
    healthClient.fetchWeightHistoryWithPeriod(7, 4),
    healthClient.fetchWeightHistoryWithPeriod(7 * 2 /* 14 days */, 2 * 3 /* 3 months */),
    healthClient.fetchWeightHistoryWithPeriod(365, 1),
    chartClient.fetchWeightChartSpec(),
  ]);

  const dataMinDate = new Date(weightWeek[0].date.getTime());
  dataMinDate.setDate(dataMinDate.getDate() - 30);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 30 * 6);

  type WeightChartSettings = { minDate: Date; source: BasicHistory[], minY: number, maxY: number }

  const options: Record<string, WeightChartSettings> = {
    yearly: {
      minDate: dataMinDate,
      source: weightYearly,
      minY: 75,
      maxY: 125
    },
    all: {
      minDate: dataMinDate,
      source: weightQuarterlyMa,
      minY: 75,
      maxY: 125
    },
    "trying-again": {
      minDate: new Date(2022, 5, 1),
      source: weightMonth,
      minY: 75,
      maxY: 125
    },
    recent: {
      minDate: sixMonthsAgo,
      source: weightWeek,
      minY: weightWeek.filter((d) => d.date > sixMonthsAgo).reduce((prev, curr) => Math.min(prev, curr.weight), Number.MAX_VALUE) - 2,
      maxY: weightWeek.filter((d) => d.date > sixMonthsAgo).reduce((prev, curr) => Math.max(prev, curr.weight), Number.MIN_VALUE) + 2
    },
  };


  function getCurrentFont() {
    const chartElement = document.querySelector("#weight-chart");
    if (chartElement === null) {
      return undefined;
    } else {
      const fontFamily = window.getComputedStyle(chartElement, null).getPropertyValue("font-family");
      const firstFont = fontFamily.split(",")[0];
      return firstFont;
    }
  }

  const font = getCurrentFont();

  const view = new vega.View(
    vega.parse(chartSpec, {
      axis: {
        labelFont: font,
        labelFontSize: 18,
        titleFont: font,
        titleFontSize: 22,
      },
    })
  ).renderer("svg");

  updateVegaChart(
    view,
    options[state.facet]
  ).initialize("#weight-chart");

  chartSizeManager.add(view);

  view.run();

  const weightChartButtons = Array.from(
    document.querySelectorAll("#weight-charts button")
  ) as Array<HTMLButtonElement>;

  for (const el of weightChartButtons) {
    const facet = el.value;
    el.addEventListener("click", () => {
      state.facet = facet;

      updateViewToState();
    });
  }

  function updateViewToState() {
    const chartType = state.facet;
    updateViewTo(chartType);
  }

  function updateViewTo(chartType: string) {
    const option = options[chartType];

    updateVegaChart(view, option).run();

    document
      .querySelectorAll("#weight-charts .facets button")
      .forEach((button) => {
        button.classList.remove("button--selected");
      });

    const weightChartElement = <HTMLElement>(
      document.querySelector("#weight-chart-" + state.facet)
    );
    weightChartElement.classList.add("button--selected");
  }

  function updateVegaChart(chart: View, settings: WeightChartSettings) {
    console.log(settings);
    return chart
      .signal("minDate", settings.minDate)
      .data("source", settings.source)
      .signal("minY", settings.minY)
      .signal("maxY", settings.maxY);
  }
});
