"use client";
import { useState, useEffect, useRef } from "react";
import {
  PlottingComponent,
  HeatmapWrapper,
  ScatterPlotWithRegression,
  RadarChart,
  BoxPlotComponent,
} from "../../../component/graph2";
import {
  PlotlyComponent,
  PlotlyHeatmapWrapper,
  PlotlyScatterPlotWithRegression,
  PlotlyRadarChart,
} from "../../../component/ploty";
import {
  VegaLiteComponent,
  VegaLiteHeatmapWrapper,
  VegaLiteScatterPlotWithRegression,
  RadarChartVegaLite,
} from "../../../component/vite-lite";

// Subcomponent that fetches the data and passes it to other components
const DataFetcher = () => {
  const [file1Data, setFile1Data] = useState(null);
  const [file2Data, setFile2Data] = useState(null);
  const [file3Data, setFile3Data] = useState(null);
  const [file4Data, setFile4Data] = useState(null);
  const [file5Data, setFile5Data] = useState(null);
  const [file6Data, setFile6Data] = useState(null);


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
        setFile4Data(data.file4Data);
        setFile5Data(data.file5Data);
        setFile6Data(data.file6Data);
        
        console.log(data);
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
      {/* <ChildComponent file1Data={file1Data} file2Data={file2Data} />  */}
      {/* <BoxPlotComponent file42ata={file2Data}/> */}

      {/*SAME AGENTS DATA GRAPH*/}
      <div>
        <div>
          {file1Data ? <PlottingComponent file1Data={file1Data} /> : null}
        </div>
        <div>
          {file1Data ? <PlotlyComponent file1Data={file1Data} /> : null}
        </div>
        <div>
          {file1Data ? <VegaLiteComponent file1Data={file1Data} /> : null}
        </div>

        <div>{file2Data ? <HeatmapWrapper file2Data={file2Data} /> : null}</div>
        <div>
          {file2Data ? <PlotlyHeatmapWrapper file2Data={file2Data} /> : null}
        </div>
        <div>
          {file2Data ? <VegaLiteHeatmapWrapper file2Data={file2Data} /> : null}
        </div>

        <div style={{ backgroundColor: "white" }}>
          {file3Data ? (
            <ScatterPlotWithRegression file3Data={file3Data} />
          ) : null}
        </div>
        <div>
          {file3Data ? (
            <PlotlyScatterPlotWithRegression file3Data={file3Data} />
          ) : null}
        </div>
        <div>
          {file3Data ? (
            <VegaLiteScatterPlotWithRegression file3Data={file3Data} />
          ) : null}
        </div>

        <div>
          {file2Data ? (
            <PlotlyRadarChart file2Data={file2Data["61-90"]} />
          ) : null}
        </div>
      </div>

      <div style={{height:'200px', fontSize:'100px'}}>
        CONTROLLED RANDOM
      </div>

      {/*CONTROLLED RANDOM DATA GRAPH*/}
      <div>
        
        <div>
          {file1Data ? <PlottingComponent file1Data={file4Data} /> : null}
        </div>
        <div>
          {file1Data ? <PlotlyComponent file1Data={file4Data} /> : null}
        </div>
        <div>
          {file1Data ? <VegaLiteComponent file1Data={file4Data} /> : null}
        </div>


        <div>{file2Data ? <HeatmapWrapper file2Data={file5Data} /> : null}</div>
        <div>
          {file2Data ? <PlotlyHeatmapWrapper file2Data={file5Data} /> : null}
        </div>
        <div>
          {file2Data ? <VegaLiteHeatmapWrapper file2Data={file5Data} /> : null}
        </div>



        <div style={{ backgroundColor: "white" }}>
          {file3Data ? (
            <ScatterPlotWithRegression file3Data={file6Data} />
          ) : null}
        </div>
        <div>
          {file3Data ? (
            <PlotlyScatterPlotWithRegression file3Data={file6Data} />
          ) : null}
        </div>
        <div>
          {file3Data ? (
            <VegaLiteScatterPlotWithRegression file3Data={file6Data} />
          ) : null}
        </div>


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

import { VegaLite } from "react-vega";

const HeatmapVegaLite = ({ file2data }) => {
  // Y-axis labels: Numbers from 1 to 30 (representing agents or rows)
  const yLabels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);

  // X-axis labels: Combine range and domain, excluding any domain that equals "prompt"
  const xLabels = Object.entries(file2data).flatMap(([range, domains]) =>
    Object.keys(domains)
      .filter((domain) => domain !== "prompt") // Filter out "prompt"
      .map((domain) => `${range} ${domain}`)
  );

  // Prepare the data in a flat format for Vega-Lite (we'll use I0 for now)
  const heatmapData = [];

  yLabels.forEach((yLabel, rowIndex) => {
    xLabels.forEach((xLabel) => {
      const [range, domain] = xLabel.split(" ");
      const domainData = file2data[range]?.[domain];
      if (domainData && domainData[rowIndex] && domainData[rowIndex].I0) {
        heatmapData.push({
          agent: yLabel, // Y-axis value (rows)
          interaction: xLabel, // X-axis value (columns)
          value: domainData[rowIndex].I2, // Heatmap value (I2 in this case)
        });
      } else {
        heatmapData.push({
          agent: yLabel,
          interaction: xLabel,
          value: 0, // Default value if no data
        });
      }
    });
  });

  // Vega-Lite spec for the heatmap
  const spec = {
    width: 800,
    height: 600,
    mark: "rect",
    encoding: {
      x: {
        field: "interaction",
        type: "ordinal",
        axis: { title: "Interactions (Ranges and Domains)" },
      },
      y: {
        field: "agent",
        type: "ordinal",
        axis: { title: "Agents" },
      },
      color: {
        field: "value",
        type: "quantitative",
        scale: { scheme: "blues" }, // Color scheme for the heatmap
        legend: { title: "Value (I2)" },
      },
    },
    data: { values: heatmapData }, // The data in the expected format for Vega-Lite
  };

  return <VegaLite spec={spec} />;
};
