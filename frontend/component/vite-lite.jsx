import React from "react";
import { VegaLite } from "react-vega";

export const VegaLiteComponent = ({ file1Data }) => {
  if (!file1Data || Object.keys(file1Data).length === 0) {
    return <div>No data available to plot.</div>;
  }

  const agents = Array.from({ length: 21 }, (_, i) => `Agent ${i + 1}`); // X-axis: agents (1-21)

  // Helper function to prepare data for Vega-Lite
  const prepareData = (domains) => {
    const data = [];

    domains.forEach((domain) => {
      const nodeToLastArray = file1Data[domain]?.Node0_to_NodeLast;

      if (Array.isArray(nodeToLastArray)) {
        nodeToLastArray.forEach((nodeObject, index) => {
          data.push({
            agent: agents[index], // X-axis value
            domain,
            mprI2: nodeObject?.["mprI2"] || 0, // Y-axis value
          });
        });
      }
    });

    return data;
  };

  // Split domains into two groups
  const allDomains = Object.keys(file1Data);
  const first5Domains = allDomains.slice(0, 5); // First 5 domains
  const next5Domains = allDomains.slice(5, 10); // Next 5 domains

  // Prepare data for each group
  const dataGroup1 = prepareData(first5Domains);
  const dataGroup2 = prepareData(next5Domains);

  // Vega-Lite spec for the chart
  const spec = (data) => ({
    width: 700,
    height: 400,
    mark: "line",
    encoding: {
      x: {
        field: "agent",
        type: "ordinal",
        axis: { title: "Agents", labelFont: "Arial", titleFont: "Arial" },
      },
      y: {
        field: "mprI2",
        type: "quantitative",
        axis: {
          title: "Misinformation Propagation Rate (MPR)",
          labelFont: "Arial",
          titleFont: "Arial",
        },
      },
      color: {
        field: "domain",
        type: "nominal",
        legend: { title: "Domain", labelFont: "Arial", titleFont: "Arial" },
      },
    },
    data: { values: data },
  });

  return (
    <div>
      <h2 style={{ fontFamily: "Arial", fontSize: "16px", fontWeight: "bold" }}>
        Misinformation Propagation Analysis
      </h2>

      {/* First graph for the first 5 domains */}
      <div style={{ marginBottom: "40px" }}>
        <VegaLite spec={spec(dataGroup1)} />
      </div>

      {/* Second graph for the next 5 domains */}
      <div style={{ marginBottom: "40px" }}>
        <VegaLite spec={spec(dataGroup2)} />
      </div>
    </div>
  );
};

//export default VegaLiteComponent;

// Heatmap Component using Vega-Lite
export const VegaLiteHeatmap = ({ xLabels, yLabels, data }) => {
  const finalSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Agent Interaction Heatmap",
    width: 800, // Explicit width
    height: 600, // Explicit height
    background: "white", // White background for scientific paper style
    config: {
      axis: {
        labelFont: "Arial",
        labelFontSize: 12,
        titleFont: "Arial",
        titleFontSize: 14,
      },
    },
    data: {
      values: data.flatMap((row, rowIndex) =>
        row.map((value, colIndex) => ({
          y: yLabels[rowIndex],
          x: xLabels[colIndex],
          value: value !== null && value !== undefined ? value : 0, // Handle missing values
        }))
      ),
    },
    mark: "rect", // Keep the mark as "rect" or switch to "heatmap" or "square"
    encoding: {
      x: {
        field: "x",
        type: "nominal",
        axis: {
          labelAngle: -45,
          title: "Range Domain",
        },
      },
      y: {
        field: "y",
        type: "nominal",
        title: "Agents",
      },
      color: {
        field: "value",
        type: "quantitative",
        scale: { scheme: "blues" }, // Use color scale "blues"
        legend: { title: "Value" },
      },
    },
  };

  return (
    <div style={{ width: "500px" }}>
      <h2>Agent Interaction Heatmap (Vega-Lite)</h2>
      <VegaLite spec={finalSpec} />
    </div>
  );
};

// Wrapper Component to handle file2Data and render the Vega-Lite heatmap
export const VegaLiteHeatmapWrapper = ({ file2Data }) => {
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

  return (
    <div style={{ width: "500px" }}>
      <VegaLiteHeatmap xLabels={xLabels} yLabels={yLabels} data={data} />
    </div>
  );
};

export const VegaLiteScatterPlotWithRegression = ({ file3Data }) => {
  // Extract scatter points from the data
  const scatterPoints = Object.keys(file3Data).map((domain, index) => {
    const annovaData = file3Data[domain].Between_Range_ANOVA_Results?.anovaI0;
    return {
      domainIndex: index + 1, // X-axis as domain index
      overallMean: annovaData?.overallMean, // Y-axis as overall mean
      domain, // Domain label
    };
  });

  // Extract the global overall mean for regression line
  const globalAnnovaData =
    file3Data.Global.Between_Range_ANOVA_Results?.anovaI0;
  const globalOverallMean = globalAnnovaData?.overallMean;
  const lastDomainIndex = scatterPoints.length; // X-axis value for the last domain

  // Prepare data for the global overall mean line
  const lineData = [
    { domainIndex: 0, overallMean: 0 }, // Start from (0, 0)
    { domainIndex: lastDomainIndex, overallMean: globalOverallMean }, // End at (lastDomainIndex, globalOverallMean)
  ];

  // Vega-Lite specification for scatter plot with regression line
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Scatter Plot with Regression Line",
    width: 800,
    height: 400,
    background: "white",
    config: {
      axis: {
        labelFont: "Arial", // Scientific style fonts
        labelFontSize: 12,
        titleFont: "Arial",
        titleFontSize: 14,
      },
    },
    layer: [
      {
        // Scatter plot points
        mark: {
          type: "point",
          filled: true,
          size: 80,
          color: "green",
        },
        encoding: {
          x: {
            field: "domainIndex",
            type: "quantitative",
            title: "Domain Index",
            axis: {
              grid: true,
              gridColor: "rgba(0, 0, 0, 0.1)", // Light grid lines
              tickMinStep: 1,
            },
          },
          y: {
            field: "overallMean",
            type: "quantitative",
            title: "Overall Mean",
            axis: {
              grid: true,
              gridColor: "rgba(0, 0, 0, 0.1)", // Light grid lines
            },
          },
          tooltip: [
            { field: "domain", title: "Domain" },
            { field: "overallMean", title: "Overall Mean" },
          ],
        },
        data: {
          values: scatterPoints,
        },
      },
      {
        // Regression line (from 0,0 to lastDomainIndex, globalOverallMean)
        mark: {
          type: "line",
          color: "black",
          strokeWidth: 2,
        },
        encoding: {
          x: { field: "domainIndex", type: "quantitative" },
          y: { field: "overallMean", type: "quantitative" },
        },
        data: {
          values: lineData, // The line goes from (0, 0) to (lastDomainIndex, globalOverallMean)
        },
      },
    ],
  };

  return (
    <div>
      <h2>Scatter Plot with Regression Line (Vega-Lite)</h2>
      <VegaLite spec={spec} />
    </div>
  );
};

// Radar chart using polar coordinates in Vega-Lite
export const RadarChartVegaLite = ({ file2Data }) => {
  // Extract domains dynamically
  const domains = Object.keys(file2Data);

  // Prepare the datasets dynamically for agents
  const datasets = Object.entries(file2Data).flatMap(([domain, data]) =>
    Object.entries(data).map(([agent, values], index) => ({
      domain, // Domain (angular axis)
      I0: values.I0, // Radial value (I0 for example)
      agent, // Agent label for color encoding
    }))
  );

  // Vega-Lite specification for radar-like chart using polar coordinates
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Radar Chart (Polar Scatter Plot)",
    width: 400,
    height: 400,
    background: "white",
    config: {
      axis: {
        labelFont: "Arial", // Professional fonts
        labelFontSize: 12,
        titleFont: "Arial",
        titleFontSize: 14,
      },
    },
    data: {
      values: datasets,
    },
    encoding: {
      theta: {
        field: "domain", // Angular axis (domains like Politics, Crime, etc.)
        type: "nominal",
        title: "Domain",
      },
      radius: {
        field: "I0", // Radial axis (I0 values)
        type: "quantitative",
        scale: { domain: [0, 10] }, // Scale from 0 to 10
        title: "I0 Value",
      },
      color: {
        field: "agent", // Color by agent
        type: "nominal",
        legend: { title: "Agent" },
      },
    },
    mark: {
      type: "point",
      filled: true,
      size: 100, // Increase point size for visibility
    },
  };

  return (
    <div>
      <h2>Radar Chart with Vega-Lite</h2>
      <VegaLite spec={spec} />
    </div>
  );
};
