function handleResponse(response) {
  if(response.ok) {
    return response.json();
  } else {
    throw Error('unable to load data: ' + response.statusText);
  }
}

export class ChartClient {
  fetchWeightChartSpec() {
    return fetch(ENV.assetsBaseUrl + '/vega/weight.vg.json')
      .then(handleResponse);
  }

  fetchDayActivityChartSpec() {
    return fetch(ENV.assetsBaseUrl + '/vega/activity/average-day.vg.json')
      .then(handleResponse);
  }
}
