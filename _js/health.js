
window.addEventListener('load', () => {

  fetch("https://api.ticklethepanda.co.uk/health/activity?sum")
    .then(handleResponse)
    .then(results => {
      var totalStepsElement = document.getElementById("total-steps");
      totalStepsElement.textContent = Number.parseFloat(results.sum).toLocaleString() + " steps since " + results.since;
    });


  fetch("https://api.ticklethepanda.co.uk/health/weight/prediction?since=2017-01-01")
    .then(handleResponse)
    .then(result => {
      let toText = t => `predicted ${t.days.toFixed(0)} days to ${t.target} kg`;
      
      var intermediateTargetWeightElement = document.getElementById("intermediate-target-weight");
      intermediateTargetWeightElement.textContent = toText(result.intermediateTarget);

      var targetWeightElement = document.getElementById("target-weight");
      targetWeightElement.textContent = toText(result.target);

    });

  let aMonthAgo = new Date();
  aMonthAgo.setDate(aMonthAgo.getDate() - 30);

  let url = 'https://s.ticklethepanda.co.uk/vega/weight.vg.json';

  let charts = [
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

  let vegaViews = [];

  fetch("https://api.ticklethepanda.co.uk/health/weight")
    .then(handleResponse)
    .then(convertDates)
    .then(results => {
     
      vega.loader()
        .load(url)
        .then(specData => {

          charts.forEach(chart => {

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

            vegaViews.push(view);
          });
        
      });

    });

  function handleResponse(response) {
    if(response.ok) {
      return response.json();
    } else {
      throw Error("unable to load data: " + response.statusText);
    }
  }

  function convertDates(results) {

    results.forEach(r => {
      r.date = new Date(r.date);
    });
    return results;
  }

  window.addEventListener('resize', function() {
    vegaViews.forEach(v => {
      let container = v.container();
      let w = container.offsetWidth;
      resizeView(v, w);
    });
  });

  function resizeView(v, w) {
    v.width(w)
      .height(w / 1.61)
      .run();
  }
});

