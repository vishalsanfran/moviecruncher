import { useState } from "react";
import axios from "axios";

interface UseFinanceModelResult {
    result: any;
    loading: boolean;
    error: string | null;
    runModel: (inputs: Record<string, number>) => Promise<void>;
}

export const useFinanceModel = (): UseFinanceModelResult => {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runModel = async (inputs: Record<string, number>) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                title: "Demo Project",
                budget: { total_gross_budget: 8892544 },
                financing: {
                    Equity_Investment: inputs.equityInvestment,
                    Debt_Financing: inputs.debtFinancing,
                    Gap_Financing: inputs.gapFinancing,
                },
                base_case_revenue: {
                    Domestic: 4500000,
                    Foreign: 6875600,
                },
                scenario_multipliers: {
                    Best_Case: 1.3,
                    Worst_Case: 0.7,
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
                    Other_Deferrals: 55250,
                },
                timeline: {
                    projection_years: 4,
                    revenue_recognition_schedule: [0.6, 0.3, 0.1],
                    tax_credit_inflow_year: 1,
                },
            };
            console.log("Payload being sent to backend:", payload);
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/models`,
                payload,
                {
                    headers: {
                        "x-api-key": import.meta.env.VITE_API_KEY,
                    },
                }
            );

            setResult(response.data);
        } catch (err: any) {
            console.error("Model run failed:", err);
            setError("Failed to run model");
        } finally {
            setLoading(false);
        }
    };

    return { result, loading, error, runModel };
};