import { TokenStorage } from "./admin/token-storage.js";

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
  constructor(token) {
    this.token = token;
  }

  fetchHistory() {
    return fetch(apiBaseHealthUrl + "/weight/log")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw Error("unable to load data: " + response.statusText);
        }
      })
      .then((results) => {
        results.sort((b, a) => a.date.localeCompare(b.date));
        return results.filter((e) => e.weightAm || e.weightPm);
      });
  }

  updateDay(req) {
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

    let init = {
      credentials: "include",
      method: "PUT",
      headers: headers,
      mode: "cors",
      body: JSON.stringify(payload),
    };

    return fetch(url, init).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error("unable submit data: " + response.statusText);
      }
    });
  }
}

class WeightApp {
  constructor(token) {
    this.token = token;
    this.client = new WeightClient(token);
  }

  setupFormInputs() {
    var now = new Date();
    var middayToday = getMiddayOfDate(now);

    document.getElementById("entry-date").value = now
      .toISOString()
      .substring(0, 10);

    if (now < middayToday) {
      document.getElementById("entry-period").value = "AM";
    } else {
      document.getElementById("entry-period").value = "PM";
    }
    function getCookie(name) {
      match = document.cookie.match(new RegExp(name + "=([^;]+)"));
      if (match) return match[1];
    }
  }

  setupFormEvents() {
    let weightForm = document.getElementById("weight-form");

    weightForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let date = weightForm["entry-date"].value;
      let period = weightForm["entry-period"].value;
      let weight = weightForm["entry-value"].value;

      this.client
        .updateDay({
          date: date,
          period: period,
          weight: weight,
        })
        .then((result) => {
          document.getElementById("result-date").textContent = result.date;
          document.getElementById("result-period").textContent =
            result.meridiam;
          document.getElementById("result-value").textContent = result.weight;

          let resultsElement = document.getElementById("results");

          resultsElement.classList.remove("error");
          resultsElement.classList.add("success");
        })
        .catch((error) => {
          document.getElementById("result-error").textContent = error.message;

          let resultsElement = document.getElementById("results");

          resultsElement.classList.remove("success");
          resultsElement.classList.add("error");
        })
        .then(() => {
          this.loadWeightHistory();
        });
    });
  }

  loadWeightHistory() {
    document.getElementById("weight-history-table-body").innerHTML = "";

    this.client.fetchHistory().then((results) => {
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
    });
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
