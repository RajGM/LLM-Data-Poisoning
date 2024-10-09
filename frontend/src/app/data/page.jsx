"use client";
import { useState, useEffect, useRef  } from "react";

// Subcomponent that fetches the data and passes it to other components
const DataFetcher = () => {
  const [file1Data, setFile1Data] = useState(null);
  const [file2Data, setFile2Data] = useState(null);
  const [file3Data, setFile3Data] = useState(null);
  
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
        setFile3Data(data.file3Data);
        console.log(data)
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
      <HeatmapWrapper file2data={file2Data} />
      {/* <ChildComponent file1Data={file1Data} file2Data={file2Data} />  */}
      <ScatterPlotWithRegression file3Data={file3Data}/>
      
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

// const MisInformationIndexComponent = ({ data }) => {
//   // Convert the received data into an array of keys for iteration
//   const entries = Object.entries(data);

//   return (
//     <div>
//       <h2>Misinformation Index Data</h2>
//       {entries.map(([key, value]) => (
//         <div
//           key={key}
//           style={{
//             marginBottom: "20px",
//             border: "1px solid #ccc",
//             padding: "10px",
//           }}
//         >
//           <h3>{key}</h3>
//           <p>
//             <strong>Prompt:</strong> {value.prompt}
//           </p>

//           {/* Extract and render the misinformation index for each crime */}
//           {Object.keys(value)
//             .filter((k) => k !== "prompt")
//             .map((crimeKey) => (
//               <div key={crimeKey}>
//                 <h4>{crimeKey}</h4>
//                 <table style={{ width: "100%", borderCollapse: "collapse" }}>
//                   <thead>
//                     <tr>
//                       <th style={{ border: "1px solid #ccc", padding: "8px" }}>
//                         Index Type
//                       </th>
//                       <th style={{ border: "1px solid #ccc", padding: "8px" }}>
//                         Value
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {Object.entries(value[crimeKey]).map(
//                       ([indexType, indexValue]) => (
//                         <tr key={indexType}>
//                           <td
//                             style={{ border: "1px solid #ccc", padding: "8px" }}
//                           >
//                             {indexType}
//                           </td>
//                           <td
//                             style={{ border: "1px solid #ccc", padding: "8px" }}
//                           >
//                             {indexValue.I0}
//                           </td>
//                         </tr>
//                       )
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             ))}
//         </div>
//       ))}
//     </div>
//   );
// };

import React from "react";
import HeatMap from "react-heatmap-grid";

// Heatmap Component using react-heatmap-grid
const HeatmapGrid = ({ xLabels, yLabels, data }) => {
  return (
    <div style={{ width: "100%" }}>
      <h2>Agent Interaction Heatmap (Grid)</h2>
      <HeatMap
        xLabels={xLabels}
        yLabels={yLabels}
        data={data}
        xLabelsLocation={"bottom"}
        xLabelsVisibility={xLabels.map(() => true)}
        squares
        height={45}
        cellStyle={(background, value, min, max) => ({
          background: `rgb(66, 86, 244, ${1 - (max - value) / (max - min)})`,
          fontSize: "11px",
        })}
        cellRender={(value) => value && `${value}`}
      />
    </div>
  );
};

// Wrapper Component to handle file2data and render the heatmap grid
const HeatmapWrapper = ({ file2data }) => {
  // Y-axis labels: Numbers from 1 to 30 (representing agents or rows)
  const yLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

  // X-axis labels: Combine range and domain, excluding any domain that equals "prompt"
  const xLabels = Object.entries(file2data).flatMap(([range, domains]) =>
    Object.keys(domains)
      .filter((domain) => domain !== "prompt") // Filter out "prompt"
      .map((domain) => `${range} ${domain}`)
  );

  // Prepare data for heatmap-grid (only I0 values)
  const data = yLabels.map((_, rowIndex) =>
    xLabels.map((label) => {
      // Extract range and domain from the label
      const [range, domain] = label.split(" ");
      const domainData = file2data[range]?.[domain]; // Get domain data
      if (domainData && domainData[rowIndex] && domainData[rowIndex].I0) {
        console.log( domainData[rowIndex].I2)
        return domainData[rowIndex].I2; // Get I0 value
      }
      return 0; // Default if no data
    })
  );

  return <HeatmapGrid xLabels={xLabels} yLabels={yLabels} data={data} />;
};

import { Chart, registerables } from "chart.js"; // Corrected import
import "chartjs-plugin-regression"; // Regression plugin

const ScatterPlotWithRegression = ({ file3Data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null); // To store the chart instance

  useEffect(() => {
    // Register Chart.js components
    Chart.register(...registerables);

    const ctx = chartRef.current.getContext("2d");

    // Extract scatter points from domainnews
    const scatterPoints = Object.keys(file3Data).map((domain, index) => {
      const annovaData = file3Data[domain].Between_range_ANOVA_Results?.annovaI0;
      return {
        x: index + 1, // X-axis as the index of domains or incrementally generated value
        y: annovaData?.overallMean || 0, // Y-axis is the overallMean
        label: domain, // Label for the domain
      };
    });

    // Extract the overallMean for the line from Global annovaI0
    const globalAnnovaData = file3Data.Global.Between_range_ANNOVA_Results?.annovaI0;
    console.log(globalAnnovaData)
    const globalOverallMean = globalAnnovaData?.overallMean;

    // The line starts from x = 0, y = 0 and goes to x = 1, y = globalOverallMean
    const data = {
      datasets: [
        {
          label: "Scatter Plot (Overall Mean per Domain)",
          data: scatterPoints,
          backgroundColor: "rgba(75, 192, 192, 1)",
          borderColor: "rgba(75, 192, 192, 0.6)",
          pointRadius: 5,
          pointHoverRadius: 7,
          showLine: false, // No line between points
        },
        {
          label: "Global Overall Mean Line",
          data: [
            { x: 0, y: 0 }, // Line starts at (0, 0)
            { x: 1, y: globalOverallMean }, // Line goes to (1, overallMean)
          ],
          type: "line",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
          showLine: true, // Show the line
        },
      ],
    };

    const options = {
      scales: {
        xAxes: [
          {
            type: "linear",
            position: "bottom",
            scaleLabel: {
              display: true,
              labelString: "Domain Index",
            },
            ticks: {
              beginAtZero: true,
              stepSize: 1, // Increment by 1 for each domain
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Overall Mean",
            },
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    };

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Create Chart with regression line
    chartInstanceRef.current = new Chart(ctx, {
      type: "scatter",
      data: data,
      options: options,
    });

    // Cleanup the chart instance on unmount
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [file3Data]);

  return <canvas ref={chartRef} width="400" height="400"></canvas>;
};
