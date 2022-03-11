import { BasicHistory, HealthClient } from "./lib/health-client.js";
import { ChartClient } from "./lib/chart-client.js";
import { ChartSizeManager } from "./lib/chart-size-manager.js";
import type { View } from "vega-typings/types";

const healthClient = new HealthClient();
const chartClient = new ChartClient();
const chartSizeManager = new ChartSizeManager();

window.addEventListener("load", async () => {
  const state = {
    facet: (<HTMLInputElement>(
      document.querySelector("#weight-charts .facets .button--selected")
    )).value,
  };

  const [weightResults7, weightResults30, chartSpec] = await Promise.all([
    healthClient.fetchWeightHistoryWithPeriod(7),
    healthClient.fetchWeightHistoryWithPeriod(30),
    chartClient.fetchWeightChartSpec(),
  ]);

  const weight7 = weightResults7;
  const weight30 = weightResults30;

  const dataMinDate = new Date(weight7[0].date.getTime());
  dataMinDate.setDate(dataMinDate.getDate() - 30);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 30 * 6);

  const options: Record<string, { date: Date; data: BasicHistory[] }> = {
    all: {
      date: dataMinDate,
      data: weight30,
    },
    "trying-again": {
      date: new Date(2020, 0, 1),
      data: weight7,
    },
    recent: {
      date: sixMonthsAgo,
      data: weight7,
    },
  };

  const view = new vega.View(
    vega.parse(chartSpec, {
      axis: {
        labelFont: "Alegreya Sans SC",
        labelFontSize: 12,
        titleFont: "Alegreya Sans SC",
        titleFontSize: 16,
      },
    })
  ).renderer("svg");

  updateVegaChart(
    view,
    options[state.facet].date,
    options[state.facet].data
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

    updateVegaChart(view, option.date, option.data).run();

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

  function updateVegaChart(chart: View, date: Date, data: BasicHistory[]) {
    return chart.signal("minDate", date).data("source", data);
  }
});
