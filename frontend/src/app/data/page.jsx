"use client";
import { useState, useEffect } from "react";

// Subcomponent that fetches the data and passes it to other components
const DataFetcher = () => {
  const [file1Data, setFile1Data] = useState(null);
  const [file2Data, setFile2Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/domaindata`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              article: "Your article content here",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = await response.json();
        setFile1Data(data.file1Data);
        setFile2Data(data.file2Data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Pass data down to the ChildComponent
  return (
    <div>
      {file1Data ? <PlottingComponent file1Data={file1Data} /> : null}
      {/* <ChildComponent file1Data={file1Data} file2Data={file2Data} /> */}
    </div>
  );
};

// Child component that receives and renders the data
const ChildComponent = ({ file1Data, file2Data }) => {
  return (
    <div>
      <h2>Child Component</h2>
      <div>
        <h3>File 1 Data:</h3>
        <pre>{JSON.stringify(file1Data, null, 2)}</pre>
      </div>
      <div>
        <h3>File 2 Data:</h3>
        <pre>{JSON.stringify(file2Data, null, 2)}</pre>
      </div>
    </div>
  );
};

// Main component just rendering the DataFetcher component
const MainComponent = () => {
  return (
    <div>
      <h1>Main Component</h1>
      <DataFetcher />{" "}
      {/* This component is responsible for fetching data and passing it to ChildComponent */}
    </div>
  );
};

export default MainComponent;

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PlottingComponent = ({ file1Data }) => {
  if (!file1Data || Object.keys(file1Data).length === 0) {
    return <div>No data available to plot.</div>;
  }

  const agents = Array.from({ length: 21 }, (_, i) => `Agent ${i + 1}`); // X-axis: agents (1-21)

  // Helper function to prepare datasets for a group of domains
  const prepareDataset = (domains) => {
    const datasets = [];

    domains.forEach((domain) => {
      const mprSeries = [];

      // Access the Node0_to_NodeLast array for the current domain
      const nodeToLastArray = file1Data[domain]?.Node0_to_NodeLast;

      if (Array.isArray(nodeToLastArray)) {
        // Loop through each object in Node0_to_NodeLast array and collect the `mprI1` value
        nodeToLastArray.forEach((nodeObject, index) => {
          console.log(nodeObject);
          const mprI1Value = nodeObject?.["mprI2"] || 0; // Default to 0 if no value exists
          mprSeries.push(mprI1Value); // Push the value into the series
        });
      }

      datasets.push({
        label: domain, // Label the line with the domain name
        data: mprSeries, // Y-axis: MPR I1 values across agents
        borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
          Math.random() * 255
        )}, ${Math.floor(Math.random() * 255)}, 1)`,
        fill: false,
        tension: 0.1, // Curve the lines slightly
      });
    });

    // Add the additional threshold lines as datasets
    const thresholdValues = Array(21).fill(1); // Array of 21 points at y=1 (Factual Error)
    datasets.push({
      label: "Factual Error",
      data: thresholdValues,
      borderColor: "green",
      borderDash: [5, 5], // Dotted line
      fill: false,
      borderWidth: 2,
      pointRadius: 0, // No points
    });

    const lieValues = Array(21).fill(3); // Array of 21 points at y=3 (Lie)
    datasets.push({
      label: "Lie",
      data: lieValues,
      borderColor: "orange",
      borderDash: [5, 5], // Dotted line
      fill: false,
      borderWidth: 2,
      pointRadius: 0, // No points
    });

    const propagandaValues = Array(21).fill(4); // Array of 21 points at y=4 (Propaganda)
    datasets.push({
      label: "Propaganda",
      data: propagandaValues,
      borderColor: "red",
      borderDash: [5, 5], // Dotted line
      fill: false,
      borderWidth: 2,
      pointRadius: 0, // No points
    });

    return datasets;
  };

  // Split domains into two groups
  const allDomains = Object.keys(file1Data);
  const first5Domains = allDomains.slice(0, 5); // First 5 domains
  const next5Domains = allDomains.slice(5, 10); // Next 5 domains

  // Prepare data for each group
  const dataGroup1 = {
    labels: agents, // X-axis: agents
    datasets: prepareDataset(first5Domains), // Datasets for the first group
  };

  const dataGroup2 = {
    labels: agents, // X-axis: agents
    datasets: prepareDataset(next5Domains), // Datasets for the second group
  };

  // Common chart options
  const optionsWithThresholds = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Misinformation Propagation Rate (MPR)",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        // max: 5, // Set max value on Y-axis to ensure thresholds are visible
        title: {
          display: true,
          text: "Misinformation Propagation Rate (MPR)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Agents",
        },
      },
    },
  };

  return (
    <div>
      <h2>Misinformation Propagation Analysis</h2>

      {/* First graph for the first 5 domains */}
      <div style={{ marginBottom: "40px" }}>
        <Line
          data={dataGroup1}
          options={{
            ...optionsWithThresholds,
            plugins: {
              ...optionsWithThresholds.plugins,
              title: {
                display: true,
                text: "Group 1: First 5 Domains I1 Measures the difference between NodeX (source node) and Node0 (the original node)",
              },
            },
          }}
        />
      </div>

      {/* Second graph for the next 5 domains */}
      <div style={{ marginBottom: "40px" }}>
        <Line
          data={dataGroup2}
          options={{
            ...optionsWithThresholds,
            plugins: {
              ...optionsWithThresholds.plugins,
              title: {
                display: true,
                text: "Group 2: Next 5 Domains Measures the difference between NodeX (source node) and Node0 (the original node)",
              },
            },
          }}
        />
      </div>
    </div>
  );
};


