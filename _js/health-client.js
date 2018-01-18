export { HealthClient };

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

class HealthClient {

  fetchActivitySum() {
    return fetch(ENV.apiBaseUrl + '/health/activity?sum')
      .then(handleResponse);
  }

  fetchWeightPrediction(date) {
    return fetch(ENV.apiBaseUrl + '/health/weight/prediction?since=' + date.toISOString().substring(0, 10))
      .then(handleResponse);
  }

  fetchWeightHistory() {
    return fetch(ENV.apiBaseUrl + '/health/weight')
      .then(handleResponse)
      .then(fixDates);
  }

  fetchAverageDayActivity() {
    return fetch(ENV.apiBaseUrl + '/health/activity?average&by=minute')
      .then(handleResponse)
      .then(fixTimes);
  }

}

