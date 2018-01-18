import { HealthClient } from './health-client.js';
import { ChartClient } from './chart-client.js';
import { ChartSizeManager } from './chart-size-manager.js';

let healthClient = new HealthClient();
let chartClient = new ChartClient();
let chartSizeManager = new ChartSizeManager();

window.addEventListener('load', () => {

  healthClient.fetchActivitySum()
    .then(results => {
      var totalStepsElement = document.getElementById('total-steps');
      totalStepsElement.innerHTML = `<strong>${Number.parseFloat(results.sum).toLocaleString()} steps</strong> recorded since ${new Date(results.since).toLocaleDateString()}`;
    });

  healthClient.fetchWeightPrediction(new Date(2017, 0, 1))
    .then(result => {
      let inter = result.intermediateTarget;
      let total = result.target;

      let html = `predicted <strong>${inter.days.toFixed(0)} days to ${inter.target} kg</strong> and <strong>${total.days.toFixed(0)} days to ${total.target} kg</strong>`;

      var targetWeightElement = document.getElementById('target-weight');
      targetWeightElement.innerHTML = html;

      let heaviestDay = result.heaviest;
      let latestDay = result.latest;

      let average = (a, b) => (a && b) ? ((a + b) / 2) : (a ? a : b);

      let heaviestWeight = average(heaviestDay.weightAm, heaviestDay.weightPm);
      let latestWeight = average(latestDay.weightAm, latestDay.weightAm);
      let lostWeight = heaviestWeight - latestWeight;

      let lostWeightElement = document.getElementById('lost-weight');
      lostWeightElement.innerHTML = `<strong>current weight is ${latestWeight.toLocaleString()}</strong> - <strong>lost ${lostWeight.toLocaleString()} kg from ${heaviestWeight.toLocaleString()} kg</strong> since ${new Date(heaviestDay.date).toLocaleDateString()}`

    });

  Promise.all([
      healthClient.fetchWeightHistoryWithPeriod(7),
      chartClient.fetchWeightChartSpec()
  ]).then(r => {
    let weightResults = r[0].filter(w => w.count > 1);
    let chartSpec = r[1];

    let minDate = new Date(weightResults[0].date.getTime());
    minDate.setDate(minDate.getDate() - 1);

    let view = new vega.View(vega.parse(chartSpec))
      .renderer('svg')
      .insert('source', weightResults)
      .signal('minDate', minDate)
      .initialize('#weight-chart');

    function updateChart() {
      let chartType = document.forms['weight-chart-selector']['weight-chart'].value;

      let sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 30 * 6);

      let options = {
        "all": minDate,
        "trying again": new Date(2017, 0, 1),
        "recent": sixMonthsAgo
      }

      let option = options[chartType];

      view.signal('minDate', option)
        .run();

    }

    document.querySelectorAll("#weight-chart-selector input")
      .forEach(el => el.addEventListener('change', updateChart));

    let container = view.container();

    let w = container.offsetWidth;

    chartSizeManager.add(view);

  });

  Promise.all([
    healthClient.fetchAverageDayActivity(),
    chartClient.fetchDayActivityChartSpec()
  ]).then(r => {
    let activityResults = r[0];
    let chartSpec = r[1];

    let granuality = 10; // in mins

    let nBins = 24 * (60 / granuality);
    let itemsPerBin = activityResults.length / nBins;

    let aggregatedResults = [];

    for (let i = 0; i < nBins; i++) {
      let minute = activityResults[i * itemsPerBin].time;
      let sum = 0;
      for (let j = 0; j < itemsPerBin; j++) {
        let index = i * itemsPerBin + j;
        sum += activityResults[index].steps;
      }
      let avg = sum / itemsPerBin;
      aggregatedResults.push({
        time: minute,
        steps: avg
      });
    }

    console.log(aggregatedResults);
    
    let view = new vega.View(vega.parse(chartSpec))
      .renderer('svg')
      .insert('source', aggregatedResults)
      .logLevel(vega.Warn)
      .initialize('#average-day-activity-chart');

    let container = view.container();

    let w = container.offsetWidth;

    chartSizeManager.add(view);

  });
});


