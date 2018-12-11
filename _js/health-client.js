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

function convertToBasicHistory(results) { 

  return results.map(r => ({
    'date': r.start,
    'weight': r.average,
    'count': r.count
  }));
  
}

class HealthClient {

  fetchActivitySum() {
    return fetch(ENV.apiBaseHealthUrl + '/health/activity?sum')
      .then(handleResponse);
  }

  fetchWeightPrediction(date) {
    return fetch(ENV.apiBaseHealthUrl + '/health/weight/prediction?since=' + date.toISOString().substring(0, 10))
      .then(handleResponse);
  }

  fetchWeightHistory() {
    return fetch(ENV.apiBaseHealthUrl + '/health/weight')  
      .then(handleResponse)
      .then(fixDates);
  }

  fetchWeightHistoryWithPeriod(period) {
    return fetch(ENV.apiBaseHealthUrl + '/health/weight?period=' + period)
      .then(handleResponse)
      .then(convertToBasicHistory)
      .then(fixDates);
  }

  fetchAverageDayActivity() {
    return fetch(ENV.apiBaseHealthUrl + '/health/activity?average&by=minute')
      .then(handleResponse)
      .then(fixTimes);
  }

}

