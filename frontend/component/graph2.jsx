import { useState, useEffect, useRef } from "react";

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

export const PlottingComponent = ({ file1Data }) => {
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
    <div style={{ backgroundColor: "white", padding: "20px" }}>
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

import React from "react";
import HeatMap from "react-heatmap-grid";

// Heatmap Component using react-heatmap-grid
export const HeatmapGrid = ({ xLabels, yLabels, data }) => {
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

// Wrapper Component to handle file2Data and render the heatmap grid
export const HeatmapWrapper = ({ file2Data }) => {
  // Y-axis labels: Numbers from 1 to 30 (representing agents or rows)
  const yLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

  // X-axis labels: Combine range and domain, excluding any domain that equals "prompt"
  const xLabels = Object.entries(file2Data).flatMap(([range, domains]) =>
    Object.keys(domains)
      .filter((domain) => domain !== "prompt") // Filter out "prompt"
      .map((domain) => `${range} ${domain}`)
  );

  // Prepare data for heatmap-grid (only I0 values)
  const data = yLabels.map((_, rowIndex) =>
    xLabels.map((label) => {
      // Extract range and domain from the label
      const [range, domain] = label.split(" ");
      const domainData = file2Data[range]?.[domain]; // Get domain data
      if (domainData && domainData[rowIndex] && domainData[rowIndex].I0) {
        return domainData[rowIndex].I2; // Get I0 value
      }
      return 0; // Default if no data
    })
  );

  return <HeatmapGrid xLabels={xLabels} yLabels={yLabels} data={data} />;
};

import { Chart, registerables } from "chart.js"; // Corrected import
import "chartjs-plugin-regression"; // Regression plugin

export const ScatterPlotWithRegression = ({ file3Data }) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);
  
    useEffect(() => {
      // Register Chart.js components
      Chart.register(...registerables);
  
      const ctx = chartRef.current.getContext("2d");
  
      // Extract scatter points from domainnews
      const scatterPoints = Object.keys(file3Data).map((domain, index) => {
        const annovaData = file3Data[domain].Between_Range_ANOVA_Results?.anovaI0;
        return {
          x: index + 1, // X-axis as the index of domains or incrementally generated value
          y: annovaData?.overallMean, // Y-axis is the overallMean
          label: domain, // Label for the domain
        };
      });
  
      // Extract the overallMean for the line from Global annovaI0
      const globalAnnovaData = file3Data.Global.Between_Range_ANOVA_Results?.anovaI0;
      const globalOverallMean = globalAnnovaData?.overallMean;
      const lastDomainIndex = scatterPoints.length; // X-axis value for the last domain
  
      const data = {
        datasets: [
          {
            label: "Scatter Plot (Overall Mean per Domain)",
            data: scatterPoints,
            backgroundColor: "rgba(34, 139, 34, 1)", // More neutral tone for scientific style
            borderColor: "rgba(34, 139, 34, 0.6)",
            pointRadius: 5,
            pointHoverRadius: 7,
            showLine: false,
          },
          {
            label: "Global Overall Mean Line",
            data: [
              { x: 0, y: 0 }, // Line starts from global mean, not (0,0)
              { x: lastDomainIndex, y: globalOverallMean }, // Line goes to (lastDomainIndex, overallMean)
            ],
            type: "line",
            borderColor: "rgba(0, 0, 0, 0.8)", // Black line for mean to stand out
            borderWidth: 2,
            fill: false,
            showLine: true,
            pointRadius: 0, // No points on the line
          },
        ],
      };
  
      const options = {
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            title: {
              display: true,
              text: "Domain Index",
              font: {
                size: 14,
                family: "Arial",
                weight: "bold",
              },
            },
            ticks: {
              beginAtZero: true,
              stepSize: 1,
              font: {
                size: 12,
                family: "Arial",
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)", // Light gridlines
            },
          },
          y: {
            title: {
              display: true,
              text: "Overall Mean",
              font: {
                size: 14,
                family: "Arial",
                weight: "bold",
              },
            },
            ticks: {
              beginAtZero: true,
              font: {
                size: 12,
                family: "Arial",
              },
            },
            grid: {
              color: "rgba(0, 0, 0, 0.1)", // Light gridlines
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                size: 12,
                family: "Arial",
              },
            },
          },
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
  
      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, [file3Data]);
  
    return <canvas ref={chartRef} width="600" height="400"></canvas>; // Increase canvas size for clarity
  };
  

import { Radar } from "react-chartjs-2";
import { RadialLinearScale, Filler } from "chart.js";

// Registering the required components for Radar chart
ChartJS.register(
  RadialLinearScale, // Radar chart scale
  PointElement, // Point elements for radar
  LineElement, // Line elements
  Filler, // For filling the radar chart areas
  Tooltip, // Tooltip for hover effects
  Legend // Legend for chart labels
);

export const RadarChart = ({ file2Data }) => {
    // Extract domain names (keys) dynamically from file2Data
    const domains = Object.keys(file2Data); 
  
    // Extract datasets for different agents dynamically
    const datasets = Object.entries(file2Data).map(([domain, data], index) => ({
      label: `Agent ${index + 1}`,
      data: Object.values(data).map((d) => d.I0), // Extract values dynamically
      borderColor: `rgba(${index * 50}, 99, 132, 1)`, // Use dynamic colors
      backgroundColor: `rgba(${index * 50}, 99, 132, 0.2)`,
      pointBackgroundColor: `rgba(${index * 50}, 99, 132, 1)`,
      pointRadius: 4,
    }));
  
    const options = {
      scale: {
        ticks: {
          beginAtZero: true,
          max: 10,
          stepSize: 1,
          font: {
            size: 12,
            family: "Arial",
          },
          color: "#000",
        },
        pointLabels: {
          font: {
            size: 14,
            family: "Arial",
          },
          color: "#000",
        },
        gridLines: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      plugins: {
        legend: {
          labels: {
            font: {
              size: 12,
              family: "Arial",
            },
            color: "#000",
          },
        },
      },
    };
  
    const chartData = {
      labels: domains, // Use dynamically extracted domain names
      datasets, // Use dynamically created datasets
    };
  
    return <Radar data={chartData} options={options} />;
  };
  

import Plot from "react-plotly.js";

export const BoxPlotComponent = ({ file4data }) => {
  // Dynamically extract categories for each range
  const categories = Object.keys(file4data).flatMap((range) => {
    return Object.keys(file4data[range]).filter((key) => key !== "prompt");
  });

  // Remove duplicates from categories (since categories may repeat across ranges)
  const uniqueCategories = [...new Set(categories)];

  // Prepare data for each category and each metric (I0, I1, I2)
  const boxData = uniqueCategories.flatMap((category) => {
    const metrics = ["I0", "I1", "I2"];
    return metrics.map((metric) => {
      return {
        type: "box",
        y: Object.keys(file4data).flatMap((range) => {
          // Extract data for this category and metric
          const rangeData = file4data[range][category] || [];
          return rangeData.map((agent) => agent[metric]);
        }),
        name: `${category} - ${metric}`,
      };
    });
  });

  return (
    <Plot
      data={boxData}
      layout={{
        title: "Box Plot",
        yaxis: { title: "Values" },
        xaxis: { title: "Agents" },
      }}
    />
  );
};