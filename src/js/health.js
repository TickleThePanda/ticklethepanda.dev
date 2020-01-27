import { HealthClient } from './health-client.js';
import { ChartClient } from './chart-client.js';
import { ChartSizeManager } from './chart-size-manager.js';

let healthClient = new HealthClient();
let chartClient = new ChartClient();
let chartSizeManager = new ChartSizeManager();

window.addEventListener('load', () => {

  let state = {
    facet: null
  };

  Promise.all([
      healthClient.fetchWeightHistoryWithPeriod(7),
      healthClient.fetchWeightHistoryWithPeriod(30),
      chartClient.fetchWeightChartSpec()
  ]).then(([weightResults7, weightResults30, chartSpec]) => {
    let weight7 = weightResults7.filter(d => d.date >= Date.parse('2014-01-01T00:00:00'));
    let weight30 = weightResults30.filter(d => d.date >= Date.parse('2014-01-01T00:00:00'));

    let minDate = new Date(weight7[0].date.getTime());
    minDate.setDate(minDate.getDate() - 1);

    let view = new vega.View(vega.parse(chartSpec, {
        axis: {
          labelFont: "Alegreya Sans SC",
          labelFontSize: 12,
          titleFont: "Alegreya Sans SC",
          titleFontSize: 16
        }
      }))
      .renderer('svg')
      .insert('source', weight30)
      .signal('minDate', minDate)
      .initialize('#weight-chart');

    function updateView() {

      let chartType = state.facet;

      let sixMonthsAgo = new Date();
      sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 30 * 6);

      let options = {
        "all": {
          date: minDate,
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

      let option = options[chartType];

      view.signal('minDate', option.date)
        .insert('source', option.data)
        .run();

      document.querySelectorAll('#weight-charts .facets button').forEach(button => {
        button.classList.remove('button--selected');
      });

      document.querySelector('#weight-chart-' + state.facet).classList.add('button--selected');

    }

    document.querySelectorAll("#weight-charts button")
      .forEach(el => {
        let facet = el.value;
        el.addEventListener('click', event => {
          state.facet = facet;

          updateView();

        });
      });

    let container = view.container();

    let w = container.offsetWidth;

    chartSizeManager.add(view);

  });

});
