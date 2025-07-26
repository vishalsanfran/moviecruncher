import { useState } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
    LineChart, Line, CartesianGrid
} from 'recharts';

interface ScenarioResult {
    scenario: string;
    label: string;
    roi: number;
    irr: number | null;
}

interface ChartData {
    scenarios: string[];
    scenario_labels: Record<string, string>;
    roi_percent: number[];
    irr_percent: (number | null)[];
    roi_series: ScenarioResult[];
    irr_series: ScenarioResult[];
    breakeven_receipts: number;
    cash_flows: {
        years: string[];
        annual: number[];
        cumulative: number[];
    };
    investor_composition: {
        [scenario: string]: {
            principal: number;
            profit: number;
        };
    };
}

interface Inputs {
    equityInvestment: number;
    debtFinancing: number;
    gapFinancing: number;
    equityPremiumPercent: number;
    netProfitSplitPercent: number;
    camFeePercent: number;
    distributionFeeDomesticPercent: number;
    distributionFeeForeignPercent: number;
}

export default function App() {
    const [inputs, setInputs] = useState<Inputs>({
        equityInvestment: 3974745,
        debtFinancing: 738200,
        gapFinancing: 1481276,
        equityPremiumPercent: 20,
        netProfitSplitPercent: 50,
        camFeePercent: 0.75,
        distributionFeeDomesticPercent: 25,
        distributionFeeForeignPercent: 25
    });

    const [result, setResult] = useState<ChartData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const runModel = async () => {
        setLoading(true);
        try {
            const payload = {
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
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/models`,
                payload,
                {
                    headers: {
                        "x-api-key": import.meta.env.VITE_API_KEY
                    }
                }
            );

            setResult(response.data);
        } catch (err) {
            console.error("Failed to fetch model output:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">🎬 Film Finance Simulator</h1>

            <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(inputs).map(([key, value]) => (
                    <label key={key} className="flex flex-col">
                        {key.replace(/([A-Z])/g, " $1")}:
                        <input
                            type="number"
                            name={key}
                            value={value}
                            onChange={handleChange}
                            className="border p-2 rounded mt-1"
                        />
                    </label>
                ))}
            </div>

            <button
                onClick={runModel}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                {loading ? "Running..." : "Run Model"}
            </button>

            {result && (
                <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-4">📊 ROI & IRR by Scenario</h2>
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

                    <h2 className="text-xl font-semibold mt-8 mb-2">Composition of Investor Returns</h2>
                    <BarChart width={600} height={300} data={
                        Object.entries(result.investor_composition).map(([scenario, values]) => ({
                            name: result.scenario_labels[scenario],
                            Principal: values.principal,
                            Profit: values.profit
                        }))
                    }>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Principal" stackId="a" fill="#3498db" />
                        <Bar dataKey="Profit" stackId="a" fill="#2ecc71" />
                    </BarChart>

                    <h2 className="text-xl font-semibold mt-10 mb-4">💰 Cash Flow (Base Case)</h2>
                    <LineChart width={600} height={300} data={result.cash_flows.years.map((y, i) => ({
                        year: y,
                        annual: result.cash_flows.annual[i],
                        cumulative: result.cash_flows.cumulative[i]
                    }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
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