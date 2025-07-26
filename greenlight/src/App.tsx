import { useState } from 'react';
import axios from 'axios';
import ChartsPanel from './components/ChartsPanel';
import InputField from './components/InputField';
import { ChevronDown, ChevronRight } from "lucide-react";

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

    const inputMeta: Record<string, { label: string; placeholder?: string }> = {
        equityInvestment: { label: "Equity Investment ($)" },
        debtFinancing: { label: "Debt Financing ($)" },
        gapFinancing: { label: "Gap Financing ($)" },
        equityPremiumPercent: { label: "Equity Premium (%)" },
        netProfitSplitPercent: { label: "Net Profit Split to Investors (%)" },
        camFeePercent: { label: "CAM Fee (%)" },
        distributionFeeDomesticPercent: { label: "Domestic Distribution Fee (%)" },
        distributionFeeForeignPercent: { label: "Foreign Distribution Fee (%)" }
    };

    const inputGroups: Record<string, string[]> = {
        "Financing": ["equityInvestment", "debtFinancing", "gapFinancing"],
        "Investor Terms": ["equityPremiumPercent", "netProfitSplitPercent"],
        "Fees": ["camFeePercent", "distributionFeeDomesticPercent", "distributionFeeForeignPercent"]
    };

    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden">
            {/* Left Panel - Inputs */}
            <div
                className="md:w-1/3 lg:w-1/4 p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-300 bg-white resize-x"
                style={{ minWidth: '250px', maxWidth: '500px' }}
            >
                <h1 className="text-2xl font-bold mb-4">🎬 Film Finance Simulator</h1>

                <div className="space-y-6">
                    {Object.entries(inputGroups).map(([groupLabel, keys]) => {
                        const [isOpen, setIsOpen] = useState(true);
                        return (
                            <div key={groupLabel} className="border rounded shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="w-full flex items-center justify-between bg-gray-100 px-4 py-2 font-semibold text-left"
                                >
                                    {groupLabel}
                                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                </button>
                                {isOpen && (
                                    <div className="grid grid-cols-1 gap-4 px-4 py-3">
                                        {keys.map((key) => (
                                            <InputField
                                                key={key}
                                                name={key}
                                                value={inputs[key]}
                                                label={inputMeta[key]?.label || key}
                                                placeholder={inputMeta[key]?.placeholder}
                                                onChange={handleChange}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={runModel}
                    disabled={loading}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded w-full"
                >
                    {loading ? 'Running...' : 'Run Model'}
                </button>
            </div>

            {/* Right Panel - Charts */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {result && <ChartsPanel data={result} />}
            </div>
        </div>
    );
}