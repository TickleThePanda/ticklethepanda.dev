
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

  let charts = [
    {
      url: 'https://s.ticklethepanda.co.uk/vega/weight/all.vg.json',
      container: '#weight-chart'
    },
    {
      url: 'https://s.ticklethepanda.co.uk/vega/weight/recent.vg.json',
      container: '#weight-recent-chart'
    },
    {
      url: 'https://s.ticklethepanda.co.uk/vega/weight/trying-again.vg.json',
      container: '#weight-trying-again-chart'
    }
  ];

  let vegaViews = [];

  charts.forEach(chart => {
    vega.loader()
      .load(chart.url)
      .then(data => {
        let spec = JSON.parse(data);
        let view = new vega.View(vega.parse(spec))
          .renderer('svg')
          .initialize(chart.container)

        let container = view.container();

        let w = container.offsetWidth;
    
        resizeView(view, w);

        vegaViews.push(view);
      });
    
  });

  function handleResponse(response) {
    if(response.ok) {
      return response.json();
    } else {
      throw Error("unable to load data: " + response.statusText);
    }
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

