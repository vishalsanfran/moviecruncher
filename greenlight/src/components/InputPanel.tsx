import { useState } from 'react';
import InputField from './InputField';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
    inputs: Record<string, number>;
    inputGroups: Record<string, string[]>;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    runModel: () => void;
    loading: boolean;
}

const inputMeta: Record<string, { label: string; placeholder?: string }> = {
    // Budget
    totalGrossBudget: { label: "Total Gross Budget" },

    // Base Case Revenue
    baseCaseDomesticRevenue: { label: "Domestic" },
    baseCaseForeignRevenue: { label: "Foreign" },

    // Scenario Multipliers
    bestCaseMultiplier: { label: "Best Case (x)" },
    worstCaseMultiplier: { label: "Worst Case (x)" },

    // Waterfall Terms (existing + new)
    equityInvestment: { label: "Equity Investment ($)" },
    debtFinancing: { label: "Debt Financing ($)" },
    gapFinancing: { label: "Gap Financing ($)" },
    equityPremiumPercent: { label: "Equity Premium (%)" },
    netProfitSplitPercent: { label: "Net Profit Investor Split (%)" },
    camFeePercent: { label: "CAM Fee (%)" },
    distributionFeeDomesticPercent: { label: "Domestic Distrib Fee (%)" },
    distributionFeeForeignPercent: { label: "Foreign Distrib Fee (%)" },
    camSetupFee: { label: "CAM Setup Fee ($)" },
    talentDeferrals: { label: "Talent Deferrals ($)" },
    otherDeferrals: { label: "Other Deferrals ($)" },

    // Timeline
    projectionYears: { label: "Projection Years" },
    taxCreditInflowYear: { label: "Tax Credit Inflow Year" },
    gapFinancingPremiumPercent: { label: "Gap Financing Premium (%)" },
};

const inputGroups: Record<string, string[]> = {
    "Base Case Revenue ($)": ["totalGrossBudget", "baseCaseDomesticRevenue", "baseCaseForeignRevenue"],

    "Scenario Multipliers": ["bestCaseMultiplier", "worstCaseMultiplier"],

    "Financing Structure": [
        "equityInvestment",
        "debtFinancing",
        "gapFinancing"
    ],

    "Investor Terms": [
        "equityPremiumPercent",
        "netProfitSplitPercent"
    ],

    "Distribution & CAM Fees": [
        "camFeePercent",
        "distributionFeeDomesticPercent",
        "distributionFeeForeignPercent",
        "camSetupFee"
    ],

    "Deferrals": [
        "talentDeferrals",
        "otherDeferrals"
    ],

    "Timeline": [
        "projectionYears",
        "taxCreditInflowYear"
    ],
    "Fees": [
        "gapFinancingPremiumPercent",
    ],
};

export default function InputPanel({
                                       inputs,
                                       handleChange,
                                       runModel,
                                       loading,
                                   }: Props) {
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
        const entries = Object.entries(inputGroups);
        return Object.fromEntries(entries.map(([groupLabel], idx) => [groupLabel, idx === 0]));
    });

    const toggleGroup = (groupLabel: string) => {
        setOpenGroups((prev) => ({ ...prev, [groupLabel]: !prev[groupLabel] }));
    };

    return (
        <div
            className="md:w-1/3 lg:w-1/4 p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-300 bg-white resize-x"
            style={{ minWidth: '250px', maxWidth: '500px' }}
        >
            <h1 className="text-2xl font-bold mb-4">🎬 Film Finance Simulator</h1>

            <div className="space-y-6">
                {Object.entries(inputGroups).map(([groupLabel, keys]) => (
                    <div key={groupLabel} className="border rounded shadow-sm">
                        <button
                            type="button"
                            onClick={() => toggleGroup(groupLabel)}
                            className="w-full flex items-center justify-between bg-gray-100 px-4 py-2 font-semibold text-left"
                        >
                            {groupLabel}
                            {openGroups[groupLabel] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </button>
                        {openGroups[groupLabel] && (
                            <div className="flex flex-wrap gap-4 px-4 py-3">
                                {keys.map((key) => (
                                    <InputField
                                        key={key}
                                        name={key}
                                        value={inputs[key]}
                                        label={inputMeta[key]?.label || key}
                                        placeholder={inputMeta[key]?.placeholder}
                                        onChange={handleChange}
                                        width="w-32"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={runModel}
                disabled={loading}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded w-full"
            >
                {loading ? 'Running...' : 'Run Model'}
            </button>
        </div>
    );
}