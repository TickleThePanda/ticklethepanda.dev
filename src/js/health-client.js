export { HealthClient };

const baseUrl = document.documentElement.dataset.urlApiHealth;

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

function convertToBasicHistory(results) { 

  return results.map(r => ({
    'date': r.start,
    'weight': r.average,
    'count': r.count
  }));
  
}

class HealthClient {

  fetchWeightHistory() {
    return fetch(baseUrl + '/weight')  
      .then(handleResponse)
      .then(fixDates);
  }

  fetchWeightHistoryWithPeriod(period) {
    return fetch(baseUrl + '/weight?period=' + period)
      .then(handleResponse)
      .then(convertToBasicHistory)
      .then(fixDates);
  }

}

