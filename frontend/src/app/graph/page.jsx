'use client';
import { useEffect, useState, useMemo } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre'; // Import the dagre layout
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import { useTable } from 'react-table';
import { XYPlot, VerticalBarSeries, XAxis, YAxis } from 'react-vis';

// Register dagre layout with cytoscape
cytoscape.use(dagre);

// Utility function to download JSON data
const downloadJSON = (data) => {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'graph.json';
  link.click();
};

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Initialize Cytoscape once when the component mounts
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: [],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#66CCFF',
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            width: '50px',
            height: '50px',
            'font-size': '12px',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 3,
            'line-color': '#666',
            'target-arrow-color': '#666',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': '10px',
            'text-rotation': 'autorotate',
          },
        },
      ],
      layout: {
        name: 'dagre', // Use the dagre hierarchical layout
        rankDir: 'TB', // Top to Bottom hierarchical direction
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
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
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
          name: 'dagre',
          rankDir: 'TB',
          nodeSep: 50,
          edgeSep: 10,
          rankSep: 100,
          directed: true,
          animate: true,
        }).run();
      } catch (error) {
        console.error('Error fetching graph data:', error);
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
      <h1>Hierarchical Directed Acyclic Graph (DAG) Visualization</h1>
      <button onClick={() => downloadJSON(data)}>Download Graph JSON</button>
      <div
        id="cy"
        style={{ width: '100%', height: '600px', border: '1px solid #ccc', marginTop: '20px' }}
      ></div>
      {data ? <NodeDetails data={data} /> : <></>}
    </div>
  );
}

// Graph Component
const Graph = ({ nodes, edges }) => {
  return (
    <div style={{ height: 500, width: '100%' }}>
      <ReactFlow elements={[...nodes, ...edges]}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

// Table Component
const ArticleTable = ({ articles }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'infoId',
      },
      {
        Header: 'Content',
        accessor: 'content',
      },
      {
        Header: 'Questions',
        accessor: 'questions',
        Cell: ({ value }) => value.join(', '),
      },
      {
        Header: 'Misinformation Index',
        accessor: 'misInformationIndexArray',
        Cell: ({ value }) =>
          `I0: ${value.I0}, I1: ${value.I1}, I2: ${value.I2}`,
      },
    ],
    []
  );

  const data = useMemo(() => articles, [articles]);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <table {...getTableProps()} style={{ width: '100%', border: '1px solid black' }}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

// Chart Component
const Chart = ({ nodeXAnswers }) => {
  const data = nodeXAnswers.map((answer, index) => ({
    x: `Q${index + 1}`,
    y: answer,
  }));

  return (
    <XYPlot height={300} width={300} xType="ordinal">
      <VerticalBarSeries data={data} />
      <XAxis />
      <YAxis />
    </XYPlot>
  );
};

// Node Details Component
const NodeDetails = ({ data }) => {
  return (
    <div>
      {data.nodes.map((node, index) => (
        <div key={index}>
          <h2>Node {node.id} Article Data</h2>
          <ArticleTable articles={node.articles} />
          <h2>Node {node.id} Article Answers Chart</h2>
          <Chart nodeXAnswers={node.articles[0].nodeXAnswers} />
        </div>
      ))}
    </div>
  );
};
