import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

interface ScenarioComposition {
    principal: number;
    profit: number;
}

interface ScenarioKPI {
    gross_receipts: number;
    total_return: number;
    roi: number;
    irr: number | null;
}

interface AnnualWaterfalls {
    [scenario: string]: {
        [lineItem: string]: {
            [year: string]: number;
        };
    };
}

interface ChartData {
    scenarios: string[];
    scenario_labels: Record<string, string>;
    roi_percent: number[];
    irr_percent: (number | null)[];
    roi_series: any[];
    irr_series: any[];
    breakeven_receipts: number;
    investor_composition: Record<string, ScenarioComposition>;
    cash_flows: {
        years: string[];
        annual: number[];
        cumulative: number[];
    };
    scenario_summary: Record<string, ScenarioKPI>;
    annual_waterfalls: AnnualWaterfalls;
}

export default function ChartsPanel({ data }: { data: ChartData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pr-4 pb-8">
            {/* KPIs */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">📌 Key Performance Indicators</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2 text-left">Scenario</th>
                            <th className="border px-3 py-2 text-right">Gross Receipts</th>
                            <th className="border px-3 py-2 text-right">Total Return</th>
                            <th className="border px-3 py-2 text-right">Investor ROI</th>
                            <th className="border px-3 py-2 text-right">Investor IRR</th> {/* ✅ updated label */}
                        </tr>
                        </thead>
                        <tbody>
                        {Object.entries(data.scenario_summary).map(([key, kpi]) => (
                            <tr key={key}>
                                <td className="border px-3 py-2">{data.scenario_labels[key]}</td>
                                <td className="border px-3 py-2 text-right">${kpi.gross_receipts.toLocaleString()}</td>
                                <td className="border px-3 py-2 text-right">${kpi.total_return.toLocaleString()}</td>
                                <td className="border px-3 py-2 text-right">{(kpi.roi * 100).toFixed(1)}%</td>
                                <td className="border px-3 py-2 text-right">
                                    {kpi.irr !== null ? `${(kpi.irr * 100).toFixed(1)}%` : 'N/A'}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-1">📉 Breakeven Analysis</h3>
                <p className="text-sm text-gray-700">
                    The film requires estimated gross receipts of{" "}
                    <span className="font-semibold text-black">
                        ${data.breakeven_receipts.toLocaleString()}
                      </span>{" "}
                    to achieve a breakeven ROI (0%).
                </p>
            </div>

            {/* Chart 1: ROI & IRR */}
            <div>
                <h2 className="text-xl font-semibold mb-2">📊 ROI & IRR by Scenario</h2>
                <BarChart width={500} height={300} data={data.scenarios.map((label, i) => ({
                    name: label,
                    ROI: data.roi_percent[i],
                    IRR: data.irr_percent[i] ?? 0
                }))}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `${val}%`} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="ROI" fill="#8884d8" />
                    <Bar dataKey="IRR" fill="#82ca9d" />
                </BarChart>
            </div>

            {/* Chart 2: Composition of Investor Returns */}
            <div>
                <h2 className="text-xl font-semibold mb-2">💼 Composition of Investor Returns</h2>
                <BarChart width={500} height={300} data={
                    Object.entries(data.investor_composition).map(([scenario, values]) => ({
                        name: data.scenario_labels[scenario],
                        Principal: values.principal,
                        Profit: values.profit
                    }))
                }>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `${(val / 1_000_000).toFixed(1)}M$`} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Principal" stackId="a" fill="#3498db" />
                    <Bar dataKey="Profit" stackId="a" fill="#2ecc71" />
                </BarChart>
            </div>

            {/* Chart 3: Cash Flow */}
            <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-2">💰 Cash Flow (Base Case)</h2>
                <LineChart width={1000} height={300} data={data.cash_flows.years.map((y, i) => ({
                    year: y,
                    annual: data.cash_flows.annual[i],
                    cumulative: data.cash_flows.cumulative[i]
                }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(val) => `${(val / 1_000_000).toFixed(1)}M$`} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="annual" stroke="#8884d8" />
                    <Line type="monotone" dataKey="cumulative" stroke="#82ca9d" />
                </LineChart>
            </div>

            {data.annual_waterfalls && (
                <div className="mt-10">
                    <h2 className="text-xl font-semibold mb-4">🧾 Detailed Annual Waterfall (Year-by-Year)</h2>
                    {Object.entries(data.annual_waterfalls).map(([scenarioKey, yearData]) => (
                        <div key={scenarioKey} className="mb-8 overflow-auto">
                            <h3 className="text-lg font-semibold mb-2">
                                {data.scenario_labels[scenarioKey] || scenarioKey}
                            </h3>
                            <table className="min-w-max table-auto border border-gray-300">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-4 py-2 text-left">Line Item</th>
                                    {Object.keys(yearData).map((year) => (
                                        <th key={year} className="border px-4 py-2 text-left">{year}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {Array.from(
                                    new Set(
                                        Object.values(yearData).flatMap((yearObj) => Object.keys(yearObj))
                                    )
                                ).map((lineItem) => (
                                    <tr key={lineItem}>
                                        <td className="border px-4 py-2">{lineItem}</td>
                                        {Object.keys(yearData).map((year) => (
                                            <td key={year + lineItem} className="border px-4 py-2">
                                                {yearData[year][lineItem]?.toLocaleString() ?? "-"}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}