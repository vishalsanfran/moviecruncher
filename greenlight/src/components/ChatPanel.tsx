// components/ChatPanel.tsx
import { useState } from "react";

interface ChatPanelProps {
    onQuerySubmit: (query: string) => void;
    loading: boolean;
    response: any;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onQuerySubmit, loading, response }) => {
    const [query, setQuery] = useState("");

    const handleSubmit = () => {
        if (query.trim()) {
            onQuerySubmit(query);
        }
    };

    return (
        <div className="w-full p-4 border-b border-gray-300 bg-white">
            <div className="mb-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about a movie (e.g. cast, title, director)..."
                    className="w-full p-2 border rounded"
                />
                <button
                    onClick={handleSubmit}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                    disabled={loading}
                >
                    {loading ? "Searching..." : "Ask"}
                </button>
            </div>

            {response && (
                <div className="bg-gray-50 p-3 mt-4 rounded">
                    <p className="font-semibold mb-2">Estimated Revenue Range:</p>
                    <ul>
                        <li>Min: ${(response.min / 1e6).toFixed(2)}M</li>
                        <li>Max: ${(response.max / 1e6).toFixed(2)}M</li>
                        <li>Median: ${(response.median / 1e6).toFixed(2)}M</li>
                        <li>Mean: ${(response.mean / 1e6).toFixed(2)}M</li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-600">Based on most similar past movies.</p>
                </div>
            )}
        </div>
    );
};