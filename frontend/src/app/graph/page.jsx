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

  useEffect(() => {
    // Initialize Cytoscape once when the component mounts
    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements: [],
      style: [
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
        name: "dagre", // Use the dagre hierarchical layout
        rankDir: "TB", // Top to Bottom hierarchical direction
        nodeSep: 50, // Vertical spacing between nodes
        edgeSep: 10, // Horizontal spacing between edges
        rankSep: 100, // Spacing between ranks (levels of the hierarchy)
        directed: true, // Directed edges
        animate: true, // Animate the layout
      },
    });

    // Fetch graph data from the backend
    const fetchGraphData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setData(data);

        // Add nodes and edges from the fetched data
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

        cy.add(newNodes);
        cy.add(newEdges);

        // Apply the hierarchical layout (dagre)
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

    // Clean up the Cytoscape instance on unmount
    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div>
      <>
        <h1>Hierarchical Directed Acyclic Graph (DAG) Visualization</h1>
        <button onClick={() => downloadJSON(data)}>Download Graph JSON</button>
        <div
          id="cy"
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid #ccc",
            marginTop: "20px",
          }}
        ></div>
      </>
      {data?<Home2 data={data}/>:<></>}
    </div>
  );
}

function Home2({data}) {

  console.log("DATA:",data)
  const versions = data.nodes.map((node) => node.id);
  const misinformationIndexes = data.nodes.map(
    (node) => node.articles[0].misInformationIndexArray.I0
  );

  const misinformationIndexes2 = data.nodes.map(
    (node) => node.articles[0].misInformationIndexArray.I1
  );

  const misinformationIndexes3 = data.nodes.map(
    (node) => node.articles[0].misInformationIndexArray.I2
  );

  const chartData = {
    labels: versions,
    datasets: [
      {
        label: "Misinformation Index",
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
        label: "Misinformation Index",
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
        label: "Misinformation Index",
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
      <div className="w-full max-w-2xl">
        <Line data={chartData} options={chartOptions} />
        <Line data={chartData2} options={chartOptions} />
        <Line data={chartData3} options={chartOptions} />

      </div>
    </>
  );
}
