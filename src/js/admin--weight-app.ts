import { TokenStorage } from "./lib/token-storage.js";

function getMiddayOfDate(date) {
  var middayOnDate = new Date(date);
  middayOnDate.setHours(12);
  middayOnDate.setMinutes(0);
  middayOnDate.setSeconds(0);
  middayOnDate.setMilliseconds(0);

  return middayOnDate;
}

function cleanWeightResult(weight) {
  if (weight) {
    return weight.toFixed(1);
  } else {
    return "-";
  }
}

const apiBaseHealthUrl = document.documentElement.dataset.urlApiHealth;

class WeightClient {
  token: any;
  constructor(token) {
    this.token = token;
  }

  async fetchHistory() {
    const response = await fetch(apiBaseHealthUrl + "/weight/log");

    const results = await response.json();

    results.sort((b, a) => a.date.localeCompare(b.date));
    return results.filter((e) => e.weightAm || e.weightPm);
  }

  async updateDay(req): Promise<DayResult> {
    let date = req.date;
    let period = req.period;
    let weight = req.weight;

    let url = `${apiBaseHealthUrl}/weight/log/${date}/${period}`;
    let payload = { weight: weight };

    let authHeaderValue = "Bearer " + this.token;

    let headers = new Headers({
      "Content-Type": "application/json",
      Authorization: authHeaderValue,
    });

    let init: RequestInit = {
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

interface DayResult {
  date: string;
  meridiam: string;
  weight: string;
}

class WeightApp {
  token: any;
  client: WeightClient;
  constructor(token) {
    this.token = token;
    this.client = new WeightClient(token);
  }

  setupFormInputs() {
    var now = new Date();
    var middayToday = getMiddayOfDate(now);

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
    let weightForm = document.getElementById("weight-form");

    weightForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      let date = weightForm["entry-date"].value;
      let period = weightForm["entry-period"].value;
      let weight = weightForm["entry-value"].value;

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

        let resultsElement = document.getElementById("results");

        resultsElement.classList.remove("error");
        resultsElement.classList.add("success");
      } catch (e: any) {
        document.getElementById("result-error").textContent = e.message;

        let resultsElement = document.getElementById("results");

        resultsElement.classList.remove("success");
        resultsElement.classList.add("error");
      }

      await this.loadWeightHistory();
    });
  }

  async loadWeightHistory() {
    document.getElementById("weight-history-table-body").innerHTML = "";

    const results = await this.client.fetchHistory();
    let resultsText = results.reduce((a, r) => {
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

    document.getElementById("weight-history-table-body").innerHTML =
      resultsText;
  }

  run() {
    this.setupFormInputs();
    this.setupFormEvents();
    this.loadWeightHistory();
  }
}

window.addEventListener("load", () => {
  const tokenStorage = new TokenStorage();
  const thermometerApp = new WeightApp(tokenStorage.load());

  thermometerApp.run();
});
