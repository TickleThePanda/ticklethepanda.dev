function handleResponse(response) {
  if(response.ok) {
    return response.json();
  } else {
    throw Error('unable to load data: ' + response.statusText);
  }
}

const assetsBaseUrl = document.documentElement.urlAssets;

export class ChartClient {
  fetchWeightChartSpec() {
    return fetch(assetsBaseUrl + '/vega/weight.vg.json')
      .then(handleResponse);
  }

  fetchDayActivityChartSpec() {
    return fetch(assetsBaseUrl + '/vega/activity/average-day.vg.json')
      .then(handleResponse);
  }
}
