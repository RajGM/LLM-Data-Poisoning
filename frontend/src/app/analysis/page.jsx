"use client";
import { useState, useEffect } from "react";
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

// Register the necessary components for ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Subcomponent that fetches the data and passes it to other components
const DataFetcher = () => {
  const [file1Data, setFile1Data] = useState(null);
  const [file2Data, setFile2Data] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            article: "Your article content here", // Adjust the body as needed
          }),
        });

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

  return (
    <div>
      <h1>Data Fetcher Component</h1>
      {/* Pass both file data to the ChildComponent */}
      <ChildComponent file1Data={file1Data} file2Data={file2Data} />
    </div>
  );
};

// Child component that receives and renders the data with chart
const ChildComponent = ({ file1Data, file2Data }) => {
  console.log(file2Data);
  return (
    <div>
      <h2>Child Component</h2>
      <RangeContainer data={file1Data} title="File 1 Data" />
      <File2AnovaAnalysis file2Data={file2Data} />
      {/* <RangeAnalysis rangeData={file2Data} rangeTitle="File 2 Analysis" /> */}
    </div>
  );
};

// Subcomponent to visualize ANOVA results for each domain
const DomainAnovaAnalysis = ({ domainData, domainTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  console.log(domainData)
  // Ensure the data exists
  if (!domainData || !domainData["Between_Range_ANOVA_Results"]) {
    return <div>No data available for {domainTitle}</div>;
  }

  const anovaResults = domainData["Between_Range_ANOVA_Results"];

  // Extracting data for anovaI0, anovaI1, and anovaI2
  const anovaI0 = anovaResults.anovaI0 || {};
  const anovaI1 = anovaResults.anovaI1 || {};
  const anovaI2 = anovaResults.anovaI2 || {};

  // Prepare labels for the x-axis
  const labels = ["Group 1", "Group 2"]; // Adjust if you have more groups

  const data = {
    labels: labels, // Groups on x-axis
    datasets: [
      {
        label: "Group Means for anovaI0",
        data: anovaI0.groupMeans || [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Group Means for anovaI1",
        data: anovaI1.groupMeans || [],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 2,
        fill: false,
      },
      {
        label: "Group Means for anovaI2",
        data: anovaI2.groupMeans || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        fill: false,
      },
      {
        // Plot the overall mean for anovaI0
        label: "Overall Mean for anovaI0",
        data: new Array(labels.length).fill(anovaI0.overallMean || 0),
        borderColor: "rgba(255, 99, 132, 0.5)",
        borderWidth: 1,
        borderDash: [10, 5], // Dashed line for overall mean
        fill: false,
      },
      {
        // Plot the overall mean for anovaI1
        label: "Overall Mean for anovaI1",
        data: new Array(labels.length).fill(anovaI1.overallMean || 0),
        borderColor: "rgba(54, 162, 235, 0.5)",
        borderWidth: 1,
        borderDash: [10, 5],
        fill: false,
      },
      {
        // Plot the overall mean for anovaI2
        label: "Overall Mean for anovaI2",
        data: new Array(labels.length).fill(anovaI2.overallMean || 0),
        borderColor: "rgba(75, 192, 192, 0.5)",
        borderWidth: 1,
        borderDash: [10, 5],
        fill: false,
      },
    ],
  };

  // Variance details for tooltip
  const varianceInfo = `
      anovaI0: Within-Group Variance = ${anovaI0.withinGroupVariance}, Between-Group Variance = ${anovaI0.betweenGroupVariance}
      anovaI1: Within-Group Variance = ${anovaI1.withinGroupVariance}, Between-Group Variance = ${anovaI1.betweenGroupVariance}
      anovaI2: Within-Group Variance = ${anovaI2.withinGroupVariance}, Between-Group Variance = ${anovaI2.betweenGroupVariance}
    `;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `ANOVA Analysis for ${domainTitle}`,
      },
      tooltip: {
        callbacks: {
          afterBody: () => varianceInfo, // Show variance info in the tooltip
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <button
        onClick={toggleOpen}
        style={{ margin: "10px", padding: "10px", background: "#ccc" }}
      >
        {isOpen ? "Hide" : "Show"} {domainTitle}
      </button>
      {isOpen && (
        <div>
          <Line data={data} options={options} />
        </div>
      )}
    </div>
  );
};

// Component that renders multiple DomainAnovaAnalysis for different domains in file2Data
const File2AnovaAnalysis = ({ file2Data }) => {
  if (!file2Data) {
    return <div>No data available for file2 analysis.</div>;
  }

  return (
    <div>
      {Object.keys(file2Data).map((domainKey, index) => (
        <DomainAnovaAnalysis
          key={index}
          domainData={file2Data[domainKey]}
          domainTitle={domainKey}
        />
      ))}
    </div>
  );
};

// New Component: RangeContainer that iterates over file1Data and creates multiple RangeAnalysis components
const RangeContainer = ({ data, title }) => {
  if (!data) {
    return <div>No data available for {title}</div>;
  }

  // Create multiple RangeAnalysis components for each range in the data
  console.log(data);
  return (
    <div>
      <h3>{title}</h3>
      {Object.keys(data).map((rangeKey, index) => (
        <RangeAnalysis
          key={index}
          rangeData={data[rangeKey]}
          rangeTitle={rangeKey}
        />
      ))}
    </div>
  );
};

// Chart rendering for each range
const RangeAnalysis = ({ rangeData, rangeTitle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Ensure that rangeData and calculations exist
  if (!rangeData || !rangeData.calculations) {
    return <div>No data available for {rangeTitle}</div>;
  }

  // Extract and map the MPR data for different comparisons
  const labels = Object.keys(rangeData.calculations); // This will be the news file names (e.g., 'crime-0')

  // Extracting MPR values for the chart
  const mprNode0ToFirst = labels.map(
    (label) =>
      rangeData.calculations[label]?.Node0_to_NodeFirst?.[
        "Misinformation Propagation Rate"
      ]?.mprI0 || 0
  );
  const mprNode0ToLast = labels.map(
    (label) =>
      rangeData.calculations[label]?.Node0_to_NodeLast?.[
        "Misinformation Propagation Rate"
      ]?.mprI0 || 0
  );
  const mprNodeFirstToLast = labels.map(
    (label) =>
      rangeData.calculations[label]?.NodeFirst_to_NodeLast?.[
        "Misinformation Propagation Rate"
      ]?.mprI0 || 0
  );

  const data = {
    labels: labels, // X-axis: news domains (e.g., 'crime-0', 'education-0')
    datasets: [
      {
        label: "Node0 to NodeFirst MPR",
        data: mprNode0ToFirst,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Node0 to NodeLast MPR",
        data: mprNode0ToLast,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: "NodeFirst to NodeLast MPR",
        data: mprNodeFirstToLast,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Misinformation Propagation Rate - ${rangeTitle}`,
      },
    },
  };

  return (
    <div>
      <button
        onClick={toggleOpen}
        style={{ margin: "10px", padding: "10px", background: "#ccc" }}
      >
        {isOpen ? "Hide" : "Show"} {rangeTitle}
      </button>
      {isOpen && (
        <div>
          <h3>Prompt: {rangeData.prompt}</h3>
          <Line data={data} options={options} />
        </div>
      )}
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
