(async () => {
  let response = await axios.get("https://api.covid19api.com/summary");

  if (response.status === 200) {
    loadKPI(response.data);
    loadPieChart(response.data.Global);
    loadBarChart(response.data.Countries);
    console.log(response);
  }
})();

function loadKPI(json) {
  if (json.Message === "Caching in progress") {
    document.querySelector("#confirmed").textContent = "Updating data";
    document.querySelector("#death").textContent = "Updating data";
    document.querySelector("#recovered").textContent = "Updating data";
  } else {
    document.querySelector("#confirmed").textContent =
      json.Global.TotalConfirmed.toLocaleString("EN");
    document.querySelector("#death").textContent =
      json.Global.TotalDeaths.toLocaleString("EN");
    document.querySelector("#recovered").textContent =
      json.Global.TotalRecovered.toLocaleString("EN");
  }
}

function loadBarChart(json) {
  let countriesSorted = _.orderBy(
    json,
    ["TotalDeaths", "Country"],
    ["desc", "asc"]
  );
  let countriesSliced = _.slice(countriesSorted, 0, 10);
  let countriesMapped = _.map(countriesSliced, "Country");
  let TotalDeathsMapped = _.map(countriesSliced, "TotalDeaths");

  barChart = new Chart(document.querySelector("#bars"), {
    type: "bar",
    data: {
      labels: countriesMapped,
      datasets: [
        {
          label: "Total of Deaths",
          data: TotalDeathsMapped,
          backgroundColor: "rgba(153, 102, 255)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Total of deaths per country - Top 10",
          font: {
            size: 20,
          },
        },
      },
    },
  });
}

function loadPieChart(json) {
  let totalData = [json.NewConfirmed, json.NewDeaths, json.NewRecovered];

  pieChart = new Chart(document.querySelector("#pie"), {
    type: "pie",
    data: {
      labels: ["Confirmed", "Deaths", "Recovered"],
      datasets: [
        {
          data: totalData,
          backgroundColor: [
            "rgba(255, 99, 132)",
            "rgba(54, 162, 235)",
            "rgba(255, 205, 86)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: "New Cases Distribution",
          font: {
            size: 20,
          },
        },
      },
    },
  });
}
