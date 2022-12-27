let lineChart;

(async () => {
  document.querySelector("#filter").addEventListener("click", filterHandler);

  let response = await Promise.allSettled([
    axios.get("https://api.covid19api.com/countries"),
    axios.get(
      `https://api.covid19api.com/country/Brazil?from=${new Date(
        2021,
        04,
        10,
        -3,
        0,
        0
      ).toISOString()}&to=${new Date(2021, 04, 25, -3, 0, 0).toISOString()}`
    ),
    axios.get(
      `https://api.covid19api.com/country/Brazil?from=${new Date(
        2021,
        04,
        09,
        -3,
        0,
        0
      ).toISOString()}&to=${new Date(2021, 04, 24, -3, 0, 0).toISOString()}`
    ),
  ]);

  if (response[0].status === "fulfilled") {
    loadComboCountries(_.orderBy(response[0].value.data, "Country", "asc"));
  }
  if (
    response[1].status === "fulfilled" &&
    response[2].status === "fulfilled"
  ) {
    loadKPI(response[1].value.data);
    loadLineChart(
      response[1].value.data,
      response[2].value.data,
      document.querySelector("#cmbData").value
    );
  }
})();

function loadComboCountries(json) {
  let comboCountries = document.querySelector("#cmbCountry");

  for (i in json) {
    comboCountries.options[comboCountries.options.length] = new Option(
      json[i].Country,
      json[i].Slug,
      json[i].Country === "Brazil",
      json[i].Country === "Brazil"
    );
  }
}

function loadKPI(json) {
  document.querySelector("#kpiconfirmed").textContent =
    _.last(json).Confirmed.toLocaleString("EN");
  document.querySelector("#kpideaths").textContent =
    _.last(json).Deaths.toLocaleString("EN");
  document.querySelector("#kpirecovered").textContent =
    _.last(json).Recovered.toLocaleString("EN");
}

async function filterHandler() {
  let country = document.querySelector("#cmbCountry").value;
  let startDate = new Date(document.querySelector("#date_start").value);
  let endDate = new Date(document.querySelector("#date_end").value);

  startDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate() + 1,
    -3,
    0,
    0
  );
  endDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate() + 1,
    -3,
    0,
    1
  );
  let startDeltaDate = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
    -3,
    0,
    0
  );
  let endDeltaDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
    -3,
    0,
    1
  );

  let response = await Promise.allSettled([
    axios.get(
      `https://api.covid19api.com/country/${country}?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
    ),
    axios.get(
      `https://api.covid19api.com/country/${country}?from=${startDeltaDate.toISOString()}&to=${endDeltaDate.toISOString()}`
    ),
  ]);

  if (
    response[0].status === "fulfilled" &&
    response[1].status === "fulfilled"
  ) {
    loadKPI(response[0].value.data);
    lineChart.destroy();
    loadLineChart(
      response[0].value.data,
      response[1].value.data,
      document.querySelector("#cmbData").value
    );
  }
}

function loadLineChart(json, jsonDelta, dataType) {
  let dates = _.map(json, "Date");
  let values = _.map(json, dataType);
  let valuesDelta = _.map(jsonDelta, dataType);

  values = _.forEach(values, (value, key) => {
    value[key] = values[key] - valuesDelta[key];
  });

  let avg = _.times(values.length, _.constant(_.mean(values)));

  lineChart = new Chart(document.querySelector("#line"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [
        {
          label: `Number of ${dataType}`,
          data: values,
          borderColor: "rgb(255, 140, 13)",
        },
        {
          label: `Average of ${dataType}`,
          data: avg,
          borderColor: "rgb(255, 0, 0)",
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
          text: "Covid 19 Daily Progress",
          font: {
            size: 20,
          },
        },
        layout: {
          padding: {
            left: 100,
            right: 100,
            top: 50,
            bottom: 10,
          },
        },
      },
    },
  });
}
