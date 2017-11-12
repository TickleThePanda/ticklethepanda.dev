window.addEventListener('load', () => {
  function getCookie(name) {
    match = document.cookie.match(new RegExp(name + '=([^;]+)'));
    if (match) return match[1];
  };

  let authHeaderValue = "Bearer " + getCookie("authToken");

  let now = new Date();

  let yesterday = new Date(now.getTime());
  yesterday.setDate(yesterday.getDate() - 1);

  let chartSpecUrl = 'https://s.ticklethepanda.co.uk/vega/thermometer.vg.json';

  let chart = {
    container: '#thermometer-chart'
  }

  let dataUrl = "https://api.ticklethepanda.co.uk/thermometers/rooms/living-room/entries"
        + `?start=${yesterday.toISOString()}&end=${now.toISOString()}`;

  let opts = {
    headers: new Headers({
      'Authorization': authHeaderValue
    })
  };

  let vegaView = null;

  fetch(dataUrl, opts)
    .then(handleResponse)
    .then(convertDates)
    .then(results => {
     
      vega.loader()
        .load(chartSpecUrl)
        .then(specData => {
            
          let spec = JSON.parse(specData);
          let view = new vega.View(vega.parse(spec))
            .renderer('svg')
            .insert('source', results)
            .logLevel(vega.Warn)
            .initialize(chart.container)

          let container = view.container();

          let w = container.offsetWidth;
      
          resizeView(view, w);
        
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
      r.time = new Date(r.time);
    });
    return results;
  }

  window.addEventListener('resize', function() {

    if(vegaView) {
      let container = vegaView.container();
      let w = container.offsetWidth;
      resizeView(vegaView, w);
    }
  });

  function resizeView(v, w) {
    v.width(w)
      .height(w / 1.61)
      .run();
  }

});

