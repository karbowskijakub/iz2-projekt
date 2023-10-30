import React, { useState, useEffect } from "react";
import { Scatter } from "react-chartjs-2";
import "chart.js/auto";
import * as XLSX from "xlsx";

const Chart = () => {
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [uploadedData, setUploadedData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const fileData = event.target.result;
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const uploadedData = Array.from({ length: 1440 }, () => 0);

        parsedData.forEach(([index, value]) => {
          if (index >= 1 && index <= 1440) {
            uploadedData[index - 1] = value;
          }
        });

        setUploadedData(uploadedData);
      };

      reader.readAsBinaryString(file);
    }
  };

  useEffect(() => {
    if (data.length > 0) {
      const maxAvgData = calculateMaxAvgData(data);

      const chartData = {
        labels: Array.from({ length: data.length }, (_, i) => i + 1),
        datasets: [
          {
            label: "Natężenie ruchu",
            data: data.map((value, index) => ({ x: index, y: value })),

            backgroundColor: "rgba(75, 192, 192, 0.2)",
            showLine: false,
            pointRadius: 2,
          },
          {
            label: "Najwyższa średnia ruchu",
            data: maxAvgData,
            borderColor: "rgba(237, 28, 36, 1)",
            backgroundColor: "#ED1C24",
            showLine: false,
            pointRadius: 2,
          },
        ],
      };

      setChartData(chartData);
    }
  }, [data]);

  const chartOptions = {
    scales: {
      x: {
        type: "linear",
        min: 0,
        max: 1440,
      },
      y: {
        type: "linear",
        min: 0,
        max: 0.005,
      },
    },
  };

  const calculateMaxAvgData = (data) => {
    let maxAvg = -1;
    let startIndex = 0;

    for (let i = 0; i < 24; i++) {
      const startIndexGroup = i * 60;
      const avgGroup =
        data
          .slice(startIndexGroup, startIndexGroup + 60)
          .reduce((acc, val) => acc + val, 0) / 60;
      if (avgGroup > maxAvg) {
        maxAvg = avgGroup;
        startIndex = startIndexGroup;
      }
    }

    return data.slice(startIndex, startIndex + 60).map((value, index) => ({
      x: startIndex + index,
      y: value,
    }));
  };

  const updateChartWithUploadedData = () => {
    if (uploadedData.length > 0) {
      const updatedData = [...data, ...uploadedData];
      setData(updatedData);
    }
  };

  return (
    <div>
      <div className="mb-10 font-bold text-lg">
        <p>Natężenie ruchu w skali od 0 do 0.005 w ciągu doby w minutach:</p>
      </div>
      {chartData && (
        <div style={{ minWidth: "800px", margin: "0 auto" }}>
          <Scatter data={chartData} options={chartOptions} />
          <div className="my-10 font-bold text-lg">
            {`${chartData.datasets[1].label}: ${
              chartData.datasets[1].data[0].x + 1
            } - ${chartData.datasets[1].data[59].x + 1}`}
          </div>
        </div>
      )}
      <div>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        <button onClick={updateChartWithUploadedData} className="btn-primary">
          Dodaj dane do wykresu
        </button>
        {/* <h2>Pobrane dane:</h2>
        <pre>{JSON.stringify(uploadedData, null, 2)}</pre> */}
      </div>
    </div>
  );
};

export default Chart;