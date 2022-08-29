import { TokenStorage } from "./lib/token-storage.js";
import { HealthClient } from "./lib/health-client.js";

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
  token: string;
  client: HealthClient;
  constructor(token: string) {
    this.token = token;
    this.client = new HealthClient(token);
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

window.addEventListener("load", () => {
  const tokenStorage = new TokenStorage();
  const token = tokenStorage.load();
  if (token === null) {
    throw new Error("Could not get token");
  }
  const thermometerApp = new WeightApp(token);

  thermometerApp.run();
});
