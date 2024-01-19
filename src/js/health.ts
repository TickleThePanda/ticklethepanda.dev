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

  const [weight1, weight7, weight30, chartSpec] = await Promise.all([
    healthClient.fetchWeightHistoryWithPeriod(1, 28),
    healthClient.fetchWeightHistoryWithPeriod(1, 30),
    healthClient.fetchWeightHistoryWithPeriod(1, 30 * 3),
    chartClient.fetchWeightChartSpec(),
  ]);

  console.log(weight1)

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
      date: new Date(2022, 5, 1),
      data: weight7,
    },
    recent: {
      date: sixMonthsAgo,
      data: weight1,
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
