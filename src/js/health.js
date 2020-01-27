import { HealthClient } from './health-client.js';
import { ChartClient } from './chart-client.js';
import { ChartSizeManager } from './chart-size-manager.js';

let healthClient = new HealthClient();
let chartClient = new ChartClient();
let chartSizeManager = new ChartSizeManager();

window.addEventListener('load', async () => {

  const state = {
    facet: document.querySelector('#weight-charts .facets .button--selected').value
  };

  const earliestDate = Date.parse('2014-01-01T00:00:00');

  const [weightResults7, weightResults30, chartSpec] = await Promise.all([
      healthClient.fetchWeightHistoryWithPeriod(7),
      healthClient.fetchWeightHistoryWithPeriod(30),
      chartClient.fetchWeightChartSpec()
  ]);

  const weight7 = weightResults7.filter(d => d.date >= earliestDate);
  const weight30 = weightResults30.filter(d => d.date >= earliestDate);

  const dataMinDate = new Date(weight7[0].date.getTime());
  dataMinDate.setDate(dataMinDate.getDate() - 1);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 30 * 6);

  const options = {
    "all": {
      date: dataMinDate,
      data: weight30
    },
    "trying-again": {
      date: new Date(2017, 0, 1),
      data: weight30
    },
    "recent": {
      date: sixMonthsAgo,
      data: weight7
    }
  }

  const view = new vega.View(vega.parse(chartSpec, {
      axis: {
        labelFont: "Alegreya Sans SC",
        labelFontSize: 12,
        titleFont: "Alegreya Sans SC",
        titleFontSize: 16
      }
    }))
    .renderer('svg')

  updateVegaChart(view, options[state.facet].date)
    .initialize('#weight-chart');

  document.querySelectorAll("#weight-charts button")
    .forEach(el => {
      let facet = el.value;
      el.addEventListener('click', event => {
        state.facet = facet;

        updateViewToState();

      });
    });

  chartSizeManager.add(view);

  function updateViewToState() {
    let chartType = state.facet;
    updateViewTo(chartType);

  }

  function updateViewTo(chartType) {
    let option = options[chartType];

    updateVegaChart(view, option.date, option.data)
      .run();

    document.querySelectorAll('#weight-charts .facets button').forEach(button => {
      button.classList.remove('button--selected');
    });

    document.querySelector('#weight-chart-' + state.facet).classList.add('button--selected');
  }

  function updateVegaChart(chart, date, data) {
    return chart.signal('minDate', date)
      .data('source', data);
  }


});
