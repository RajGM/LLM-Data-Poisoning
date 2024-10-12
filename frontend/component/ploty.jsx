import React from "react";
import Plot from "react-plotly.js";

export const PlotlyComponent = ({ file1Data }) => {
  if (!file1Data || Object.keys(file1Data).length === 0) {
    return <div>No data available to plot.</div>;
  }

  const agents = Array.from({ length: 21 }, (_, i) => `Agent ${i + 1}`); // X-axis: agents (1-21)

  // Helper function to prepare data for each group of domains
  const prepareData = (domains) => {
    return domains.map((domain) => {
      const mprSeries = [];

      // Access the Node0_to_NodeLast array for the current domain
      const nodeToLastArray = file1Data[domain]?.Node0_to_NodeLast;

      if (Array.isArray(nodeToLastArray)) {
        // Loop through each object in Node0_to_NodeLast array and collect the `mprI1` value
        nodeToLastArray.forEach((nodeObject) => {
          const mprI1Value = nodeObject?.["mprI2"] || 0; // Default to 0 if no value exists
          mprSeries.push(mprI1Value); // Push the value into the series
        });
      }

      return {
        x: agents, // X-axis: agents
        y: mprSeries, // Y-axis: MPR I1 values across agents
        mode: "lines",
        name: domain,
        line: {
          color: `rgba(${Math.floor(Math.random() * 155)}, ${Math.floor(
            Math.random() * 155
          )}, ${Math.floor(Math.random() * 155)}, 1)`,
          width: 2,
        },
      };
    });
  };

  // Threshold lines
  const thresholds = [
    {
      x: agents,
      y: Array(21).fill(1),
      mode: "lines",
      name: "Factual Error",
      line: { color: "green", dash: "dot", width: 2 },
    },
    {
      x: agents,
      y: Array(21).fill(3),
      mode: "lines",
      name: "Lie",
      line: { color: "orange", dash: "dot", width: 2 },
    },
    {
      x: agents,
      y: Array(21).fill(4),
      mode: "lines",
      name: "Propaganda",
      line: { color: "red", dash: "dot", width: 2 },
    },
  ];

  // Split domains into two groups
  const allDomains = Object.keys(file1Data);
  const first5Domains = allDomains.slice(0, 5); // First 5 domains
  const next5Domains = allDomains.slice(5, 10); // Next 5 domains

  // Data for both groups
  const dataGroup1 = [...prepareData(first5Domains), ...thresholds];
  const dataGroup2 = [...prepareData(next5Domains), ...thresholds];

  return (
    <div>
      <h2 style={{ fontFamily: "Arial", fontSize: "16px", fontWeight: "bold" }}>
        Misinformation Propagation Analysis
      </h2>

      {/* First graph for the first 5 domains */}
      <div style={{ marginBottom: "40px" }}>
        <Plot
          data={dataGroup1}
          layout={{
            title: {
              text: "Group 1: First 5 Domains - Misinformation Propagation",
              font: { size: 14, family: "Arial" },
            },
            xaxis: {
              title: "Agents",
              titlefont: { size: 12, family: "Arial" },
              tickangle: -45, // Rotate X-axis labels to prevent overlap
              automargin: true, // Auto margin for preventing truncation
              tickfont: { size: 10, family: "Arial" }, // Smaller font for agents
              gridcolor: "rgba(0,0,0,0.1)",
            },
            yaxis: {
              title: "Misinformation Propagation Rate (MPR)",
              titlefont: { size: 12, family: "Arial" },
              gridcolor: "rgba(0,0,0,0.1)",
            },
            margin: { t: 60, b: 80, l: 60, r: 30 }, // Add extra margins for better spacing
            plot_bgcolor: "white",
            showlegend: true,
          }}
          config={{ responsive: true }}
        />
      </div>

      {/* Second graph for the next 5 domains */}
      <div style={{ marginBottom: "40px" }}>
        <Plot
          data={dataGroup2}
          layout={{
            title: {
              text: "Group 2: Next 5 Domains - Misinformation Propagation",
              font: { size: 14, family: "Arial" },
            },
            xaxis: {
              title: "Agents",
              titlefont: { size: 12, family: "Arial" },
              tickangle: -45, // Rotate X-axis labels to prevent overlap
              automargin: true, // Auto margin for preventing truncation
              tickfont: { size: 10, family: "Arial" }, // Smaller font for agents
              gridcolor: "rgba(0,0,0,0.1)",
            },
            yaxis: {
              title: "Misinformation Propagation Rate (MPR)",
              titlefont: { size: 12, family: "Arial" },
              gridcolor: "rgba(0,0,0,0.1)",
            },
            margin: { t: 60, b: 80, l: 60, r: 30 }, // Add extra margins for better spacing
            plot_bgcolor: "white",
            showlegend: true,
          }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
};

//export default PlotlyComponent;

// Heatmap Component using Plotly
export const PlotlyHeatmap = ({ xLabels, yLabels, data }) => {
  return (
    <div style={{ width: "100%" }}>
      <h2>Agent Interaction Heatmap (Plotly)</h2>
      <Plot
        data={[
          {
            z: data,
            x: xLabels,
            y: yLabels,
            type: "heatmap",
            colorscale: "Blues", // You can adjust this for different color schemes
            showscale: true,
          },
        ]}
        layout={{
          title: "Agent Interaction Heatmap",
          xaxis: { title: "Range Domain", tickangle: -45 },
          yaxis: { title: "Agents" },
          paper_bgcolor: "white", // White background
          plot_bgcolor: "white", // White plot background
          margin: { t: 50, b: 150, l: 100, r: 50 },
          font: {
            family: "Arial, sans-serif", // Scientific paper style font
            size: 12,
            color: "#000",
          },
          height: 600, // Adjust height for better viewing
        }}
      />
    </div>
  );
};

// Wrapper Component to handle file2Data and render the Plotly heatmap
export const PlotlyHeatmapWrapper = ({ file2Data }) => {
  const yLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

  const xLabels = Object.entries(file2Data).flatMap(([range, domains]) =>
    Object.keys(domains)
      .filter((domain) => domain !== "prompt")
      .map((domain) => `${range} ${domain}`)
  );

  const data = yLabels.map((_, rowIndex) =>
    xLabels.map((label) => {
      const [range, domain] = label.split(" ");
      const domainData = file2Data[range]?.[domain];
      if (domainData && domainData[rowIndex] && domainData[rowIndex].I0) {
        return domainData[rowIndex].I0;
      }
      return 0;
    })
  );

  return <PlotlyHeatmap xLabels={xLabels} yLabels={yLabels} data={data} />;
};

// Scatter Plot with Regression Line using Plotly
export const PlotlyScatterPlotWithRegression = ({ file3Data }) => {
  const scatterPoints = Object.keys(file3Data).map((domain, index) => {
    const annovaData = file3Data[domain].Between_Range_ANOVA_Results?.anovaI0;
    return {
      x: index + 1, // Domain index
      y: annovaData?.overallMean, // Overall mean
      text: domain, // Domain label
    };
  });

  const globalAnnovaData =
    file3Data.Global.Between_Range_ANOVA_Results?.anovaI0;
  const globalOverallMean = globalAnnovaData?.overallMean;
  const lastDomainIndex = scatterPoints.length;

  return (
    <Plot
      data={[
        {
          x: scatterPoints.map((point) => point.x),
          y: scatterPoints.map((point) => point.y),
          mode: "markers",
          type: "scatter",
          name: "Scatter Plot (Overall Mean per Domain)",
          text: scatterPoints.map((point) => point.text),
          marker: { color: "green", size: 8 },
        },
        {
          x: [0, lastDomainIndex],
          y: [0, globalOverallMean],
          mode: "lines",
          name: "Global Overall Mean Line",
          line: { color: "black", width: 2 },
        },
      ]}
      layout={{
        title: "Scatter Plot with Regression Line",
        xaxis: {
          title: "Domain Index",
          showgrid: true,
          zeroline: true,
          showline: true,
          ticks: "outside",
          gridcolor: "rgba(0, 0, 0, 0.1)",
          titlefont: { size: 14, family: "Arial", color: "black" },
        },
        yaxis: {
          title: "Overall Mean",
          showgrid: true,
          zeroline: true,
          showline: true,
          gridcolor: "rgba(0, 0, 0, 0.1)",
          titlefont: { size: 14, family: "Arial", color: "black" },
        },
        plot_bgcolor: "white",
        paper_bgcolor: "white",
        font: { family: "Arial", size: 12, color: "black" },
      }}
      useResizeHandler
      style={{ width: "100%", height: "400px" }}
    />
  );
};

export const PlotlyRadarChart = ({ file2Data }) => {
  console.log(file2Data)
  // Extract domain names and filter out "prompt" and "namesInSequence"
  const domains = Object.keys(file2Data).filter(
    (domain) => domain !== 'prompt' && domain !== 'namesInSequence'
  );

  // Extract datasets for different agents dynamically
  const chartData = Object.entries(file2Data)
    .filter(([domain]) => domain !== 'prompt' && domain !== 'namesInSequence') // Filter out unwanted domains
    .map(([domain, data], index) => ({
      type: 'scatterpolar',
      r: Object.values(data).map((d) => d.I0), // Extract values dynamically
      theta: domains, // Use dynamic domain names
      fill: 'toself',
      name: `Agent ${index + 1}`,
      line: {
        color: `rgba(${index * 50}, 99, 132, 1)`,
      },
      fillcolor: `rgba(${index * 50}, 99, 132, 0.2)`,
      marker: {
        size: 6,
        color: `rgba(${index * 50}, 99, 132, 1)`,
      },
    }));

  const layout = {
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 10], // Scale from 0 to 10
        tickfont: {
          size: 12,
          family: 'Arial',
        },
        gridcolor: 'rgba(0, 0, 0, 0.1)',
      },
      angularaxis: {
        tickfont: {
          size: 14,
          family: 'Arial',
        },
        gridcolor: 'rgba(0, 0, 0, 0.1)',
      },
    },
    showlegend: true,
    legend: {
      font: {
        family: 'Arial',
        size: 12,
        color: '#000',
      },
    },
    paper_bgcolor: 'white',
    plot_bgcolor: 'white',
  };

  return <Plot data={chartData} layout={layout} useResizeHandler style={{ width: '100%', height: '500px' }} />;
};

