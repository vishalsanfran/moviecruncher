import { useState } from "react";
import ChartsPanel from './components/ChartsPanel';
import InputPanel from './components/InputPanel';
import { useFinanceModel } from "./hooks/useFinanceModel";
import axios from "axios";

export default function App() {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: Number(value) }));
    };
    const { inputs, setInputs, result, loading, runModel } = useFinanceModel();
    const [queryInput, setQueryInput] = useState("");
    const [searchResponse, setSearchResponse] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);

    const toggleChat = () => setChatOpen(!chatOpen);
    const handleRunModel = () => {
        console.log("Inputs going to runModel:", inputs);
        runModel();
    };
    const handleQuerySubmit = async (query: string) => {
        setSearchLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/search`,
                { query },
                {
                    headers: {
                        "x-api-key": import.meta.env.VITE_API_KEY,
                        "Content-Type": "application/json"
                    }
                }
            );
            setSearchResponse(response.data);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSubmit = () => {
        if (queryInput.trim()) {
            handleQuerySubmit(queryInput);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleChat}
                    className="bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700"
                >
                    {chatOpen ? "❌" : "💬"}
                </button>
            </div>

            {/* Chat Input Box */}
            {chatOpen && (
                <div className="fixed bottom-24 right-4 z-50 w-[320px] bg-white border border-gray-300 rounded-lg shadow-xl p-4 max-h-[70vh] overflow-y-auto">
                    <textarea
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        placeholder="Provide a description for the movie (Feel free to add title, cast, director)"
                        className="w-full p-2 mb-2 border rounded resize-none overflow-hidden"
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto'; // Reset the height
                            target.style.height = `${target.scrollHeight}px`; // Set to scroll height
                        }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={searchLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        {searchLoading ? "Searching..." : "Search"}
                    </button>

                    {/* 👇 Show results */}
                    {searchResponse && (
                        <div className="mt-4">
                            {searchResponse.revenue_millions && (
                                <div className="mb-4 text-sm text-gray-800 bg-gray-100 p-3 rounded shadow">
                                    <div className="font-semibold mb-1">Estimated Revenue (in millions):</div>
                                    <div>Min: ${searchResponse.revenue_millions.min.toFixed(2)}M</div>
                                    <div>Max: ${searchResponse.revenue_millions.max.toFixed(2)}M</div>
                                    <div>Median: ${searchResponse.revenue_millions.median.toFixed(2)}M</div>
                                    <div>Mean: ${searchResponse.revenue_millions.mean.toFixed(2)}M</div>
                                </div>
                            )}

                            <h3 className="font-semibold mb-2">Top Matches</h3>
                            <ul className="space-y-2">
                                {searchResponse.top_results?.slice(0, 5).map((movie: any, idx: number) => (
                                    <li key={idx} className="text-sm border-b pb-2">
                                        <div className="font-medium">{movie.title}</div>
                                        <div className="text-gray-600">{movie.overview?.slice(0, 100)}...</div>
                                        <div className="text-xs text-gray-500">
                                            Revenue: ${Math.round(movie.revenue || 0).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Your existing layout */}
            <div className="flex h-screen overflow-hidden">
                <InputPanel
                    inputs={inputs}
                    handleChange={handleChange}
                    runModel={handleRunModel}
                    loading={loading}
                />
                {result && <ChartsPanel data={result} />}
            </div>
        </>
    );
}