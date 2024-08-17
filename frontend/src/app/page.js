'use client'

import { useEffect, useState } from "react";
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

export default function Home() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(processMisinformationIndexes(jsonData));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const processMisinformationIndexes = (jsonData) => {
    let previousIndex = 0; // Start with 0 for version 1
    jsonData.versions = jsonData.versions.map(version => {
      if (
        version.misinformationIndex === null ||
        version.misinformationIndex === undefined ||
        isNaN(version.misinformationIndex)
      ) {
        version.misinformationIndex = previousIndex;
      } else {
        previousIndex = version.misinformationIndex;
      }
      return version;
    });
    return jsonData;
  };

  if (!data) {
    return <p>Loading...</p>;
  }

  const versions = data.versions.map(version => version.versionNumber);
  const misinformationIndexes = data.versions.map(version => version.misinformationIndex);

  const chartData = {
    labels: versions,
    datasets: [
      {
        label: 'Misinformation Index',
        data: misinformationIndexes,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Misinformation Index vs Version Number',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-2xl">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-8 w-full max-w-4xl">
        <table className="table-auto w-full border-collapse border border-gray-400">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Question</th>
              {data.versions.map((version, index) => (
                <th key={index} className="border border-gray-300 px-4 py-2">Version {version.versionNumber}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.questions.map((question, qIndex) => (
              <tr key={qIndex}>
                <td className="border border-gray-300 px-4 py-2">{question}</td>
                {data.versions.map((version, vIndex) => (
                  <td key={vIndex} className="border border-gray-300 px-4 py-2">
                    {version.answers[qIndex] === 1 ? 'T' : 'F'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        {data.versions.map((version, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-300 rounded">
            <h3 className="font-bold">Version {version.versionNumber}</h3>
            <p>Misinformation Index: {version.misinformationIndex}</p>
            <p>{version.text}</p>
          </div>
        ))}
      </div>

    </main>
  );
}
