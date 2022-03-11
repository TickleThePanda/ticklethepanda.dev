async function handleResponse(response) {
  if (response.ok) {
    return await response.json();
  } else {
    throw Error("unable to load data: " + response.statusText);
  }
}

const assetsBaseUrl = document.documentElement.dataset.urlAssets;

export class ChartClient {
  async fetchWeightChartSpec() {
    const response = await fetch(assetsBaseUrl + "/vega/weight.vg.json");
    return await handleResponse(response);
  }

  async fetchDayActivityChartSpec() {
    const response = await fetch(
      assetsBaseUrl + "/vega/activity/average-day.vg.json"
    );
    return await handleResponse(response);
  }
}
