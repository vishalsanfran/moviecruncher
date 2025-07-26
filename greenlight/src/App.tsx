import { useState } from 'react';
import axios from 'axios';
import ChartsPanel from './components/ChartsPanel';
import InputPanel from './components/InputPanel';
import { useFinanceModel } from "./hooks/useFinanceModel";

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: Number(value) }));
    };

    const { result, loading, _, runModel } = useFinanceModel();

    const inputMeta: Record<string, { label: string; placeholder?: string }> = {
        equityInvestment: { label: "Equity Investment ($)" },
        debtFinancing: { label: "Debt Financing ($)" },
        gapFinancing: { label: "Gap Financing ($)" },
        equityPremiumPercent: { label: "Equity Premium (%)" },
        netProfitSplitPercent: { label: "Net Profit Investor Split (%)" },
        camFeePercent: { label: "CAM Fee (%)" },
        distributionFeeDomesticPercent: { label: "Domestic Distrib Fee (%)" },
        distributionFeeForeignPercent: { label: "Foreign Distrib Fee (%)" }
    };

    const inputGroups: Record<string, string[]> = {
        "Financing": ["equityInvestment", "debtFinancing", "gapFinancing"],
        "Investor Terms": ["equityPremiumPercent", "netProfitSplitPercent"],
        "Fees": ["camFeePercent", "distributionFeeDomesticPercent", "distributionFeeForeignPercent"]
    };

    const handleRunModel = () => {
        console.log("Inputs going to runModel:", inputs);
        runModel(inputs);
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <InputPanel
                inputs={inputs}
                inputGroups={inputGroups}
                inputMeta={inputMeta}
                handleChange={handleChange}
                runModel={handleRunModel}
                loading={loading}
            />
            {result && <ChartsPanel data={result} />}
        </div>
    );
}