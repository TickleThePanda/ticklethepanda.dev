export { HealthClient };

const baseUrl = document.documentElement.dataset.urlApiHealth;

function handleResponse(response) {
  if (response.ok) {
    return response.json();
  } else {
    throw Error("unable to load data: " + response.statusText);
  }
}

function fixDates(results) {
  results.forEach((r) => {
    r.date = new Date(r.date);
  });
  return results;
}

function convertToBasicHistory(results) {
  const am = results.map((r) => ({
    date: r.start,
    weight: r.averageAm,
    period: "AM",
  }));

  const pm = results.map((r) => ({
    date: r.start,
    weight: r.averagePm,
    period: "PM",
  }));

  return am.concat(pm).filter((r) => r.weight !== null);
}

class HealthClient {
  async fetchWeightHistory() {
    const response = await fetch(baseUrl + "/weight");
    const data = await handleResponse(response);
    const history = await convertToBasicHistory(data);
    fixDates(history);
    history.sort((a, b) => a.date - b.date);
    return history;
  }

  async fetchWeightHistoryWithPeriod(period) {
    const response = await fetch(baseUrl + "/weight?period=" + period);
    const data = await handleResponse(response);
    const history = await convertToBasicHistory(data);
    fixDates(history);
    history.sort((a, b) => a.date - b.date);
    return history;
  }
}
