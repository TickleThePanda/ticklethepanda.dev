
window.addEventListener('load', () => {

  fetch("https://api.ticklethepanda.co.uk/health/activity?sum")
    .then(response => {
      if(response.ok) {
        return response.json();
      } else {
        throw Error("unable to load data: " + response.statusText);
      }
    })
    .then(results => {
      var totalStepsElement = document.getElementById("total-steps");
      totalStepsElement.textContent = Number.parseFloat(results.sum).toLocaleString() + " steps since " + results.since;
    });


  fetch("https://api.ticklethepanda.co.uk/health/weight/prediction?since=2017-01-01")
    .then(response => {
      if(response.ok) {
         return response.json();
      } else {
        throw Error("unable to load data: " + response.statusText);
      }
    })
    .then(result => {
      let toText = t => `predicted ${t.days.toFixed(0)} days to ${t.target} kg`;
      
      var intermediateTargetWeightElement = document.getElementById("intermediate-target-weight");
      intermediateTargetWeightElement.textContent = toText(result.intermediateTarget);

      var targetWeightElement = document.getElementById("target-weight");
      targetWeightElement.textContent = toText(result.target);

    });


});

$(document).ready(function() {
});

