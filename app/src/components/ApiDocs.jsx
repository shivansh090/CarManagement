import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeft, Book } from 'lucide-react';

function ApiDocs() {
    const [docs, setDocs] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/docs`);
                setDocs(response.data.apiDocs);
            } catch (error) {
                console.error('Failed to fetch API docs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocs();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition duration-300 ease-in-out">
                    <ArrowLeft className="mr-2" size={20} />
                    Back to Cars
                </Link>
                <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                    <Book className="mr-2" size={32} />
                    API Documentation
                </h1>
                {Object.entries(docs || {})?.map(([endpoint, details]) => (
                    <div key={`${endpoint}-${details.method}`} className="bg-white shadow-md rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{endpoint}</h2>
                        <p className="text-gray-600 mb-4">{details.description}</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Method</h3>
                                <p className="text-gray-600">{details.method}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">Authentication</h3>
                                <p className="text-gray-600">{details.authentication}</p>
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Parameters</h3>
                        <ul className="list-disc list-inside text-gray-600">
                            {details.parameters && Object.entries(details.parameters).map(([param, desc]) => (
                                <li key={param}><strong>{param}:</strong> {desc}</li>
                            ))}
                        </ul>
                        <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">Response</h3>
                        <p className="text-gray-600">{typeof details.response === 'string' ? details.response : JSON.stringify(details.response, null, 2)}</p>
                    </div>
                ))}

            </div>
        </div>
    );
}

export default ApiDocs;