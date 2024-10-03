'use client'
import { useState, useEffect } from 'react';

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

// Main component just rendering the DataFetcher component
const MainComponent = () => {
    return (
        <div>
            <h1>Main Component</h1>
            <DataFetcher /> {/* This component is responsible for fetching data and passing it to ChildComponent */}
        </div>
    );
};

export default MainComponent;
