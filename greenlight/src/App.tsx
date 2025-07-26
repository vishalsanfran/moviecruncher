import { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

export default function App() {
    const [inputs, setInputs] = useState({
        equityInvestment: 3974745,
        debtFinancing: 738200,
        gapFinancing: 1481276,
        equityPremiumPercent: 20,
        netProfitSplitPercent: 50,
        distributionFeeDomesticPercent: 25,
        distributionFeeForeignPercent: 25,
        camFeePercent: 0.75
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const runModel = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/models", {
                title: "Demo Project",
                budget: { total_gross_budget: 8892544 },
                financing: {
                    Equity_Investment: inputs.equityInvestment,
                    Debt_Financing: inputs.debtFinancing,
                    Gap_Financing: inputs.gapFinancing
                },
                base_case_revenue: {
                    Domestic: 4500000,
                    Foreign: 6875600
                },
                scenario_multipliers: {
                    Best_Case: 1.3,
                    Worst_Case: 0.7
                },
                waterfall_terms: {
                    Equity_Premium_Percent: inputs.equityPremiumPercent / 100,
                    Net_Profit_Split_To_Investors: inputs.netProfitSplitPercent / 100,
                    CAM_Setup_Fee: 3000,
                    CAM_Fee_Percent: inputs.camFeePercent / 100,
                    Distribution_Fee_Domestic_Percent: inputs.distributionFeeDomesticPercent / 100,
                    Distribution_Fee_Foreign_Percent: inputs.distributionFeeForeignPercent / 100,
                    sa_commission_domestic_percent: 0.075,
                    sa_commission_foreign_percent: 0.12,
                    sa_commission_foreign_deferral_percent: 0.3,
                    Gap_Financing_Premium_Percent: 0.1,
                    Talent_Deferrals: 500000,
                    Other_Deferrals: 55250
                },
                timeline: {
                    projection_years: 4,
                    revenue_recognition_schedule: [0.6, 0.3, 0.1],
                    tax_credit_inflow_year: 1
                }
            });
            setResult(response.data);
        } catch (err) {
            console.error('Failed to fetch model output:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Film Finance Simulator</h1>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <label>
                    Equity Investment ($):
                    <input type="number" name="equityInvestment" value={inputs.equityInvestment} onChange={handleChange} className="ml-2 border p-1" />
                </label>
                <label>
                    Debt Financing ($):
                    <input type="number" name="debtFinancing" value={inputs.debtFinancing} onChange={handleChange} className="ml-2 border p-1" />
                </label>
                <label>
                    Gap Financing ($):
                    <input type="number" name="gapFinancing" value={inputs.gapFinancing} onChange={handleChange} className="ml-2 border p-1" />
                </label>
                <label>
                    Equity Premium (%):
                    <input type="number" name="equityPremiumPercent" value={inputs.equityPremiumPercent} onChange={handleChange} className="ml-2 border p-1" />
                </label>
                <label>
                    Net Profit Split to Investors (%):
                    <input type="number" name="netProfitSplitPercent" value={inputs.netProfitSplitPercent} onChange={handleChange} className="ml-2 border p-1" />
                </label>
                <label>
                    Distribution Fee (Domestic %) :
                    <input type="number" name="distributionFeeDomesticPercent" value={inputs.distributionFeeDomesticPercent} onChange={handleChange} className="ml-2 border p-1" />
                </label>
                <label>
                    Distribution Fee (Foreign %) :
                    <input type="number" name="distributionFeeForeignPercent" value={inputs.distributionFeeForeignPercent} onChange={handleChange} className="ml-2 border p-1" />
                </label>
                <label>
                    CAM Fee (% of receipts):
                    <input type="number" step="0.01" name="camFeePercent" value={inputs.camFeePercent} onChange={handleChange} className="ml-2 border p-1" />
                </label>
            </div>

            <button onClick={runModel} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                {loading ? 'Running...' : 'Run Model'}
            </button>

            {result && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-2">ROI by Scenario</h2>
                    <BarChart width={600} height={300} data={result.scenarios.map((label, i) => ({
                        name: label,
                        ROI: result.roi_percent[i],
                        IRR: result.irr_percent[i] ?? 0
                    }))}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="ROI" fill="#8884d8" />
                        <Bar dataKey="IRR" fill="#82ca9d" />
                    </BarChart>

                    <h2 className="text-xl font-semibold mt-8 mb-2">Cash Flow (Base Case)</h2>
                    <LineChart width={600} height={300} data={result.cash_flows.years.map((y, i) => ({
                        year: y,
                        annual: result.cash_flows.annual[i],
                        cumulative: result.cash_flows.cumulative[i]
                    }))}>
                        <XAxis dataKey="year" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="annual" stroke="#8884d8" />
                        <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" />
                    </LineChart>
                </div>
            )}
        </div>
    );
}
