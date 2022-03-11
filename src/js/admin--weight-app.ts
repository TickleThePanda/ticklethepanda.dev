import { TokenStorage } from "./lib/token-storage.js";

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

const apiBaseHealthUrl = document.documentElement.dataset.urlApiHealth;

class WeightClient {
  token: string;
  constructor(token: string) {
    this.token = token;
  }

  async fetchHistory() {
    const response = await fetch(apiBaseHealthUrl + "/weight/log");

    const results = <DayEntry[]>await response.json();

    results.sort((b, a) => a.date.localeCompare(b.date));
    return results.filter((e) => e.weightAm || e.weightPm);
  }

  async updateDay(req: UpdateEntryRequest): Promise<UpdateEntryResult> {
    const date = req.date;
    const period = req.period;
    const weight = req.weight;

    const url = `${apiBaseHealthUrl}/weight/log/${date}/${period}`;
    const payload = { weight: weight };

    const authHeaderValue = "Bearer " + this.token;

    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: authHeaderValue,
    });

    const init: RequestInit = {
      credentials: "include",
      method: "PUT",
      headers: headers,
      mode: "cors",
      body: JSON.stringify(payload),
    };

    const response = await fetch(url, init);
    if (response.ok) {
      return await response.json();
    } else {
      throw Error("unable submit data: " + response.statusText);
    }
  }
}

interface UpdateEntryRequest {
  date: string;
  period: string;
  weight: string;
}

interface UpdateEntryResult {
  date: string;
  meridiam: string;
  weight: string;
}

interface DayEntry {
  date: string;
  weightAm: number;
  weightPm: number;
}

class WeightApp {
  token: string;
  client: WeightClient;
  constructor(token: string) {
    this.token = token;
    this.client = new WeightClient(token);
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
