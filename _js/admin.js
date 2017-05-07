$(document).ready(function() {
  function loadWeightHistory() {
    $("#weight-history").empty();
    fetch("https://api.ticklethepanda.co.uk/health/weight")
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw Error("unable to load data: " + response.statusText);
        }
      })
      .then(results => {

        function cleanWeightResult(weight) {
          if(weight) {
            return weight.toFixed(1);
          } else {
            return "-";
          }
        }

        var $table = $("<table>").append(
          $("<thead>")
            .append(
              $("<tr>")
                .append($("<th>date</th>"))
                .append($("<th>am</th>"))
                .append($("<th>pm</th>"))
          )
        );

        var $tableBody = $("<tbody>")
        $table.append($tableBody);
        results.sort((a,b) => a.date.localeCompare(b.date));
        results = results.filter(e => e.weightAm || e.weightPm);
        results.reverse();
      
        results.forEach(result => {
          var $row = $("<tr>");

          $row.append($(`<td>${result.date}</td>`));
          $row.append($(`<td>${cleanWeightResult(result.weightAm)}</td>`));
          $row.append($(`<td>${cleanWeightResult(result.weightPm)}</td>`));

          $tableBody.append($row);
        });
        $("#weight-history").append($table);
      });
  }

  loadWeightHistory();

  $("#weight-form").submit(function(e) {
    e.preventDefault();
    var form = $(this).serializeArray();

    var values = form.reduce((a, b) => {
      a[b.name] = b.value
      return a;
    }, {});
    
    var url = `https://api.ticklethepanda.co.uk/health/weight/${values["entry-date"]}/${values["entry-period"]}`;
    var payload = { weight: values["entry-value"] };
    
    var headers = new Headers({
      "Authorization": "Basic " + btoa(values["username"] + ":" + values["password"]),
      "Content-Type": "application/json"
    });

    var init = { method: 'PUT',
       headers: headers,
       mode: 'cors',
       body: JSON.stringify(payload)
    }
    
    fetch(url, init)
      .then(response => {
        if(response.ok) {
          return response.json();
        } else {
          throw Error("unable submit data: " + response.statusText);
        }
      })
      .then(result => {
        $("#result-date").text(result.localDate);
        $("#result-period").text(result.entryPeriod);
        $("#result-value").text(result.weight);

        $("#results").removeClass("error");
        $("#results").addClass("success");
      })
      .catch(error => {
        $("#result-error").text(error.message);

        $("#results").removeClass("success");
        $("#results").addClass("error");
      })
      .then(loadWeightHistory);

  });
});
