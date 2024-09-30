

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