import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, CartesianGrid } from 'recharts';

interface ScenarioComposition {
    principal: number;
    profit: number;
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
}

export default function ChartsPanel({ data }: { data: ChartData }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pr-4 pb-8">
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
        </div>
    );
}