window.addEventListener('load', () => {

  fetch(ENV.apiBaseUrl + '/health/activity?sum')
    .then(handleResponse)
    .then(results => {
      var totalStepsElement = document.getElementById('total-steps');
      totalStepsElement.textContent = Number.parseFloat(results.sum).toLocaleString() + ' steps since ' + results.since;
    });


  fetch(ENV.apiBaseUrl + '/health/weight/prediction?since=2017-01-01')
    .then(handleResponse)
    .then(result => {
      let toText = t => `predicted ${t.days.toFixed(0)} days to ${t.target} kg`;
      
      var intermediateTargetWeightElement = document.getElementById('intermediate-target-weight');
      intermediateTargetWeightElement.textContent = toText(result.intermediateTarget);

      var targetWeightElement = document.getElementById('target-weight');
      targetWeightElement.textContent = toText(result.target);

    });

  let aMonthAgo = new Date();
  aMonthAgo.setDate(aMonthAgo.getDate() - 30);

  let url = ENV.assetsBaseUrl +  '/vega/weight.vg.json';

  let weightCharts = [
    {
      container: '#weight-chart'
    },
    {
      container: '#weight-recent-chart',
      filter: (r => r.date >= aMonthAgo)
    },
    {
      container: '#weight-trying-again-chart',
      filter: (r => r.date >= Date.parse('2017-01-01'))
    }
  ];

  fetch(ENV.apiBaseUrl + '/health/weight')
    .then(handleResponse)
    .then(fixDates)
    .then(results => {
     
      vega.loader()
        .load(url)
        .then(specData => {

          weightCharts.forEach(chart => {

            let filteredResults = chart.filter ? results.filter(chart.filter) : results;
            
            let spec = JSON.parse(specData);
            let view = new vega.View(vega.parse(spec))
              .renderer('svg')
              .insert('source', filteredResults)
              .logLevel(vega.Warn)
              .initialize(chart.container)

            let container = view.container();

            let w = container.offsetWidth;
        
            resizeView(view, w);
          });
        
      });

    });

  fetch(ENV.apiBaseUrl + '/health/activity?average&by=minute')
    .then(handleResponse)
    .then(fixTimes)
    .then(results => {
      vega.loader()
        .load(ENV.assetsBaseUrl + '/vega/activity/average-day.vg.json')
        .then((specData) => {

            let spec = JSON.parse(specData);
            let view = new vega.View(vega.parse(spec))
              .renderer('svg')
              .insert('source', results)
              .logLevel(vega.Warn)
              .initialize('#average-day-activity-chart');

            let container = view.container();

            let w = container.offsetWidth;
        
            resizeView(view, w);

        });
    });


  function handleResponse(response) {
    if(response.ok) {
      return response.json();
    } else {
      throw Error('unable to load data: ' + response.statusText);
    }
  }

  function fixDates(results) {
    results.forEach(r => {
      r.date = new Date(r.date);
    });
    return results;
  }

  function fixTimes(results) {
    results.forEach(r => {
      r.time = new Date("1970-01-01T" + r.time + "Z");
    });
    return results;
  }

  window.addEventListener('resize', function() {
    for (let container of document.querySelectorAll('.chart-container')) {
      let w = container.offsetWidth;
      resizeView(v, w);
    }
  });

  function resizeView(v, w) {
    v.width(w)
      .height(w / 1.61)
      .run();
  }
});

