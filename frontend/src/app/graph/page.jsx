"use client";
import { useEffect, useState } from "react";
import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre"; // Import the dagre layout

//--------------------------------------------

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

//--------------------------------------------
// Register dagre layout with cytoscape
cytoscape.use(dagre);

// Utility function to download JSON data
const downloadJSON = (data) => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "graph.json";
  link.click();
};

export default function Home() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("same_agents"); // Default to "Same Agents"
  const [activeSubTab, setActiveSubTab] = useState("crime-0.json"); // Default dataset

  // Tab and Subtab data
  const tabs = {
    same_agents: [
      "crime-0.json",
      "education-0.json",
      "education-1.json",
      "education-2.json",
      "helthcare-0.json",
      "marketing-0.json",
      "politics-0.json",
      "politics-1.json",
      "sports-0.json",
      "technology-0.json",
    ],
    controlled_random: [
      "crime-0.json",
      "education-0.json",
      "education-1.json",
      "education-2.json",
      "helthcare-0.json",
      "marketing-0.json",
      "politics-0.json",
      "politics-1.json",
      "sports-0.json",
      "technology-0.json",
    ],
  };

  useEffect(() => {
    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements: [],
      style: [
        // Define styles for the graph
        {
          selector: "node",
          style: {
            "background-color": "#66CCFF",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            width: "50px",
            height: "50px",
            "font-size": "12px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#666",
            "target-arrow-color": "#666",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": "10px",
            "text-rotation": "autorotate",
          },
        },
      ],
      layout: {
        name: "dagre",
        rankDir: "TB",
        nodeSep: 50,
        edgeSep: 10,
        rankSep: 100,
        directed: true,
        animate: true,
      },
    });

    const fetchGraphData = async () => {
      console.log(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/${activeTab}/${activeSubTab}`
      );
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/${activeTab}/${activeSubTab}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        setData(data);
        console.log("DATA:", data);

        const newNodes = data.nodes.map((node) => ({
          data: { id: `${node.id}`, label: `Node ${node.id}` },
        }));

        const newEdges = data.edges.map((edge) => ({
          data: {
            source: `${edge.source}`,
            target: `${edge.target}`,
            label: `Edge ${edge.source} to ${edge.target}`,
          },
        }));

        cy.batch(() => {
          cy.add(newNodes);
          cy.add(newEdges);
        });

        cy.layout({
          name: "dagre",
          rankDir: "TB",
          nodeSep: 50,
          edgeSep: 10,
          rankSep: 100,
          directed: true,
          animate: true,
        }).run();
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };

    fetchGraphData();

    return () => {
      cy.destroy();
    };
  }, [activeTab, activeSubTab]); // Refetch data when tab or subtab changes

  // Handlers for tab and subtab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveSubTab(tabs[tab][0]); // Reset subtab to the first one
  };

  const handleSubTabChange = (subTab) => {
    setActiveSubTab(subTab);
  };

  // return(
  //   <DataFetcher />
  // )

  return (
    <div>
      {/* <DataFetcher /> */}
      <h1>Hierarchical Directed Acyclic Graph (DAG) Visualization</h1>

      <div className="flex space-x-4 mt-4">
        {/* Tab Selector */}
        <button
          onClick={() => handleTabChange("same_agents")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "sameAgents"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          } hover:bg-blue-600`}
        >
          Same Agents
        </button>
        <button
          onClick={() => handleTabChange("controlled_random")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "controlledRandom"
              ? "bg-blue-500 text-white"
              : "bg-gray-700 text-gray-300"
          } hover:bg-blue-600`}
        >
          Controlled Random
        </button>
      </div>

      <div className="flex space-x-2 mt-4">
        {/* Subtab Selector */}
        {tabs[activeTab].map((subTab) => (
          <button
            key={subTab}
            onClick={() => handleSubTabChange(subTab)}
            className={`px-3 py-1 rounded-md ${
              activeSubTab === subTab
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-300"
            } hover:bg-green-600`}
          >
            {subTab}
          </button>
        ))}
      </div>

      <button onClick={() => downloadJSON(data)}>Download Graph JSON</button>

      {/* Graph Container */}
      <div
        id="cy"
        style={{
          width: "100%",
          height: "600px",
          border: "1px solid #ccc",
          marginTop: "20px",
        }}
      ></div>

      {/* {data && <FullAnalysis data={data}/>} */}

      {data && <NodeLineCharts data={data}/>}

      {/* Expandable sections for neighbor ranges */}
      {data &&
        data.neighborRanges?.map((range, index) => (
          <ExpandableSection key={index} range={range} data={data} />
        ))}

    </div>
  );
}

function ExpandableSection({ range, data }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter nodes within the range
  const filteredData = {
    ...data,
    nodes: data.nodes.filter(
      (node) => node.id >= range[0] && node.id <= range[1]
    ),
  };

  return (
    <div>
      <h2
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: "pointer" }}
      >
        {`Nodes ${range[0]} to ${range[1]} ${isExpanded ? "-" : "+"}`}
      </h2>
      {isExpanded && <Home2 data={filteredData} />}
    </div>
  );
}

function Home2({ data }) {
  const versions = data.nodes.map((node) => node.id);
  const misinformationIndexes = data.nodes?.map(
    (node) => node?.articles[0]?.misInformationIndexArray?.I0
  );

  const misinformationIndexes2 = data.nodes?.map(
    (node) => node?.articles[0]?.misInformationIndexArray?.I1
  );

  const misinformationIndexes3 = data.nodes?.map(
    (node) => node?.articles[0]?.misInformationIndexArray?.I2
  );

  const chartData = {
    labels: versions,
    datasets: [
      {
        label: "Misinformation Index NodeX - Node0",
        data: misinformationIndexes,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const chartData2 = {
    labels: versions,
    datasets: [
      {
        label: "Misinformation Index Node0 - Auditor",
        data: misinformationIndexes2,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const chartData3 = {
    labels: versions,
    datasets: [
      {
        label: "Misinformation Index NodeX - Auditor",
        data: misinformationIndexes3,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Misinformation Index vs Version Number",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      {data ? <NodeExplanation node0={data.nodes[0]} /> : <></>}
      <div className="flex flex-wrap justify-around space-x-4 my-8">
        <div className="w-full lg:w-1/3 mb-8">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="w-full lg:w-1/3 mb-8">
          <Line data={chartData2} options={chartOptions} />
        </div>
        <div className="w-full lg:w-1/3 mb-8">
          <Line data={chartData3} options={chartOptions} />
        </div>
      </div>
      {data ? <NodeTable data={data} /> : <></>}
    </>
  );
}

// Single Table for All Nodes
function NodeTable({ data }) {
  const node0 = data.nodes[0]; // Node0 for questions and reference
  const questions = node0.articles[0].questions; // Questions are constant
  const numberOfQuestions = questions.length;

  return (
    <div className="overflow-x-auto mt-8">
      <table className="min-w-full text-center table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-4 py-2">Node/Questions</th>
            {/* Display Question Headers */}
            {questions.map((question, qIdx) => (
              <th key={qIdx} className="border border-gray-300 px-4 py-2">
                {`Q${qIdx + 1}`}
              </th>
            ))}
            {/* Display Misinformation Index Headers */}
            <th className="border border-gray-300 px-4 py-2">
              Misinformation Index I0
            </th>
            <th className="border border-gray-300 px-4 py-2">
              Misinformation Index I1
            </th>
            <th className="border border-gray-300 px-4 py-2">
              Misinformation Index I2
            </th>
          </tr>
        </thead>
        <tbody>
          {/* Display Answers for Each Node */}
          {data.nodes.map((node, nodeIdx) => (
            <tr key={node.id}>
              {/* Node ID */}
              <td className="border border-gray-300 px-4 py-2">
                Node {node.id}
              </td>

              {/* Answers for Each Question */}
              {questions.map((question, qIdx) => (
                <td key={qIdx} className="border border-gray-300 px-4 py-2">
                  {node?.articles[0]?.nodeXAnswers[qIdx]}
                </td>
              ))}

              {/* Misinformation Index for the Node */}
              <td className="border border-gray-300 px-4 py-2">
                {node?.articles[0]?.misInformationIndexArray.I0}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {node?.articles[0]?.misInformationIndexArray.I1}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {node?.articles[0]?.misInformationIndexArray.I2}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Component to display Node0 content, questions, and explanation of the Misinformation Index
function NodeExplanation({ node0 }) {
  const questions = node0.articles[0].questions; // Get questions from Node0

  return (
    <div className="mb-6">
      {/* Display Content */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Content:</h2>
        <p>{node0.articles[0].content}</p>
      </div>

      {/* Display Questions with Nomenclature */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Questions:</h2>
        {questions.map((question, index) => (
          <p key={index} className="ml-4">
            <strong>{`Q${index + 1}:`}</strong> {question}
          </p>
        ))}
      </div>

      {/* Explanation of Misinformation Index */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          Misinformation Index Explanation:
        </h2>
        <p className="ml-4">
          <strong>I0: </strong> NodeX vs Node0 (
          <code>calculateMisinformationIndex(nodeXAnswers, node0Answers)</code>)
        </p>
        <p className="ml-4">
          <strong>I1: </strong> Node0 vs Auditor (
          <code>
            calculateMisinformationIndex(node0Answers, auditorAnswers)
          </code>
          )
        </p>
        <p className="ml-4">
          <strong>I2: </strong> NodeX vs Auditor (
          <code>
            calculateMisinformationIndex(nodeXAnswers, auditorAnswers)
          </code>
          )
        </p>
      </div>
    </div>
  );
}

const NodeLineCharts = ({ data }) => {
  // Map node IDs for chart labels
  const nodeIds = data.nodes.map((node) => node.id);

  // Extract Misinformation Index values for each node
  const misinformationIndexesI0 = data.nodes.map(
    (node) => node.articles[0]?.misInformationIndexArray?.I0
  );
  const misinformationIndexesI1 = data.nodes.map(
    (node) => node.articles[0]?.misInformationIndexArray?.I1
  );
  const misinformationIndexesI2 = data.nodes.map(
    (node) => node.articles[0]?.misInformationIndexArray?.I2
  );

  // Chart data for I0 (NodeX - Node0)
  const chartDataI0 = {
    labels: nodeIds,
    datasets: [
      {
        label: "Misinformation Index I0 (NodeX - Node0)",
        data: misinformationIndexesI0,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  // Chart data for I1 (Node0 - Auditor)
  const chartDataI1 = {
    labels: nodeIds,
    datasets: [
      {
        label: "Misinformation Index I1 (Node0 - Auditor)",
        data: misinformationIndexesI1,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
      },
    ],
  };

  // Chart data for I2 (NodeX - Auditor)
  const chartDataI2 = {
    labels: nodeIds,
    datasets: [
      {
        label: "Misinformation Index I2 (NodeX - Auditor)",
        data: misinformationIndexesI2,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

   // Chart options
   const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // To allow custom height
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Misinformation Index vs Node ID",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex flex-col space-y-8 my-8">
      {/* Chart for I0 */}
      <div className="w-full h-96"> {/* Increase height */}
        <Line data={chartDataI0} options={chartOptions} />
      </div>

      {/* Chart for I1 */}
      <div className="w-full h-96"> {/* Increase height */}
        <Line data={chartDataI1} options={chartOptions} />
      </div>

      {/* Chart for I2 */}
      <div className="w-full h-96"> {/* Increase height */}
        <Line data={chartDataI2} options={chartOptions} />
      </div>
    </div>
  );


};

function FullAnalysis({ data }) {
  // Utility functions for DMI, MPR, etc.

  // Step 1: Dynamic Misinformation Index (DMI) Calculation
  const calculateDMI = (article) => {
    const nodeXAnswers = article.nodeXAnswers;
    const auditorAnswers = article.auditorAnswers;
    const totalQuestions = nodeXAnswers.length;

    let misinformationScore = 0;
    for (let i = 0; i < totalQuestions; i++) {
      misinformationScore += Math.abs(nodeXAnswers[i] - auditorAnswers[i]);
    }
    const DMI = misinformationScore / totalQuestions;
    return DMI;
  };

  // Step 2: Misinformation Propagation Rate (MPR)
  const calculateMPR = (sourceDMI, neighborDMI, numEdges) => {
    return (neighborDMI - sourceDMI) / numEdges;
  };

  // Perform Full Calculations for all nodes
  const performFullAnalysis = () => {
    const DMIResults = data.nodes.map((node) =>
      node.articles.map((article) => calculateDMI(article))
    );

    const MPRResults = data.edges.map((edge) => {
      const sourceNode = data.nodes.find((node) => node.id === edge.source);
      const targetNode = data.nodes.find((node) => node.id === edge.target);
      const sourceDMI = calculateDMI(sourceNode.articles[0]);
      const targetDMI = calculateDMI(targetNode.articles[0]);
      return calculateMPR(sourceDMI, targetDMI, 1);
    });

    const taxonomyResults = DMIResults.map((dmi) => {
      if (dmi === 1) return "Factual Error";
      else if (dmi > 1 && dmi <= 4) return "Lie";
      else if (dmi > 4) return "Propaganda";
      return "Accurate";
    });

    return { DMIResults, MPRResults, taxonomyResults };
  };

  // Perform Analysis and get results
  const { DMIResults, MPRResults, taxonomyResults } = performFullAnalysis();

  // Step 3: Chart Configurations
  const nodeIds = data.nodes.map((node) => node.id);
  const chartDataDMI = {
    labels: nodeIds,
    datasets: [
      {
        label: "Dynamic Misinformation Index (DMI)",
        data: DMIResults,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  const chartDataMPR = {
    labels: data.edges.map((edge) => `Edge ${edge.source}-${edge.target}`),
    datasets: [
      {
        label: "Misinformation Propagation Rate (MPR)",
        data: MPRResults,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Misinformation Metrics",
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
      <h2 className="text-2xl font-bold">Full Misinformation Analysis</h2>

      <div className="my-8">
        <h3 className="text-lg font-semibold">Dynamic Misinformation Index (DMI)</h3>
        <div className="w-full h-96">
          <Line data={chartDataDMI} options={chartOptions} />
        </div>
      </div>

      <div className="my-8">
        <h3 className="text-lg font-semibold">Misinformation Propagation Rate (MPR)</h3>
        <div className="w-full h-96">
          <Line data={chartDataMPR} options={chartOptions} />
        </div>
      </div>

      <div className="my-8">
        <h3 className="text-lg font-semibold">Taxonomy Analysis</h3>
        <ul>
          {taxonomyResults.map((result, index) => (
            <li key={index}>{`Node ${data.nodes[index].id}: ${result}`}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

//----------------------------------------------------------------------------------

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
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    article: 'Your article content here',
                }),
              });

              if (!response.ok) {
                  throw new Error('Failed to fetch files');
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
          <ChildComponent file1Data={file1Data} file2Data={file2Data} />
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