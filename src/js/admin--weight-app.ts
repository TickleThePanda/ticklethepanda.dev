import { TokenStorage } from "./lib/token-storage";
import { HealthClient } from "./lib/health-client";
import { WeightChartManager } from "./health";
import { ChartClient } from "./lib/chart-client";

function getMiddayOfDate(date: Date) {
  const middayOnDate = new Date(date);
  middayOnDate.setHours(12);
  middayOnDate.setMinutes(0);
  middayOnDate.setSeconds(0);
  middayOnDate.setMilliseconds(0);

  return middayOnDate;
}

function cleanWeightResult(weight: number) {
  if (weight) {
    return weight.toFixed(1);
  } else {
    return "-";
  }
}


class WeightApp {
  client: HealthClient;
  chartManager: WeightChartManager;
  constructor(healthClient: HealthClient, chartManager: WeightChartManager) {
    this.client = healthClient;
    this.chartManager = chartManager;
  }

  setupFormInputs() {
    const now = new Date();
    const middayToday = getMiddayOfDate(now);

    (<HTMLInputElement>document.getElementById("entry-date")).value = now
      .toISOString()
      .substring(0, 10);

    if (now < middayToday) {
      (<HTMLInputElement>document.getElementById("entry-period")).value = "AM";
    } else {
      (<HTMLInputElement>document.getElementById("entry-period")).value = "PM";
    }
  }

  setupFormEvents() {
    const weightForm = <HTMLFormElement>document.getElementById("weight-form");

    weightForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const date = weightForm["entry-date"].value;
      const period = weightForm["entry-period"].value;
      const weight = weightForm["entry-value"].value;

      const resultsElement = <HTMLElement>document.getElementById("results");
      const resultsErrorElement = <HTMLElement>(
        document.getElementById("result-error")
      );

      try {
        const result = await this.client.updateDay({
          date: date,
          period: period,
          weight: weight,
        });

        (<HTMLInputElement>document.getElementById("result-date")).textContent =
          result.date;

        (<HTMLInputElement>(
          document.getElementById("result-period")
        )).textContent = result.meridiam;

        (<HTMLInputElement>(
          document.getElementById("result-value")
        )).textContent = result.weight;

        resultsElement.classList.remove("error");
        resultsElement.classList.add("success");

        await this.chartManager.reloadData();
      } catch (e) {
        if (e instanceof Error) {
          resultsErrorElement.textContent = e.message;
        } else {
          resultsErrorElement.textContent = "Unexpected error occurred";
        }
        resultsElement.classList.remove("success");
        resultsElement.classList.add("error");
      }

      await this.loadWeightHistory();
    });
  }

  async loadWeightHistory() {
    const weightBodyElement = <HTMLElement>(
      document.getElementById("weight-history-table-body")
    );
    weightBodyElement.innerHTML = "";

    const results = await this.client.fetchHistory();
    const resultsText = results.reduce((a, r) => {
      return (
        a +
        `
<tr>
<td>${r.date}</td>
<td>${cleanWeightResult(r.weightAm)}</td>
<td>${cleanWeightResult(r.weightPm)}</td>
</tr>
`
      );
    }, "");

    weightBodyElement.innerHTML = resultsText;
  }

  run() {
    this.setupFormInputs();
    this.setupFormEvents();
    this.loadWeightHistory();
  }
}

window.addEventListener("load", async () => {
  const tokenStorage = new TokenStorage();
  const token = tokenStorage.load();
  if (token === null) {
    throw new Error("Could not get token");
  }

  const state = {
    facet: (<HTMLInputElement>(
      document.querySelector("#weight-charts .facets .button--selected")
    )).value,
  };


  const healthClient = new HealthClient(token);
  const weightChartManager = new WeightChartManager(
    new HealthClient(token),
    new ChartClient(),
    state.facet,
    "#weight-chart"
  );
  const weightApp = new WeightApp(healthClient, weightChartManager);

  weightApp.run();

  await weightChartManager.load();

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
    weightChartManager.switchToChart(chartType);

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

});
