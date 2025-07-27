import { useState } from "react";
import axios from "axios";
import type { Inputs } from '../types';

interface UseFinanceModelResult {
    inputs: Inputs;
    setInputs: React.Dispatch<React.SetStateAction<Inputs>>;
    result: any;
    loading: boolean;
    error: string | null;
    runModel: () => Promise<void>;
}

export const useFinanceModel = (): UseFinanceModelResult => {
    const [inputs, setInputs] = useState<Inputs>({
        // Budget
        totalGrossBudget: 8892544,

        // Base Case Revenue
        baseCaseDomesticRevenue: 4500000,
        baseCaseForeignRevenue: 6875600,

        // Scenario Multipliers
        bestCaseMultiplier: 1.3,
        worstCaseMultiplier: 0.7,

        // Financing
        equityInvestment: 3974745,
        debtFinancing: 738200,
        gapFinancing: 1481276,

        // Investor Terms
        equityPremiumPercent: 20,
        netProfitSplitPercent: 50,

        // Fees
        camFeePercent: 0.75,
        distributionFeeDomesticPercent: 25,
        distributionFeeForeignPercent: 25,
        camSetupFee: 3000,

        // Deferrals
        talentDeferrals: 500000,
        otherDeferrals: 55250,

        // Timeline
        projectionYears: 4,
        taxCreditInflowYear: 1,

        saCommissionDomesticPercent: 7.5,
        saCommissionForeignPercent: 12.0,
        saCommissionForeignDeferralPercent: 30.0,
        gapFinancingPremiumPercent: 10,
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const runModel = async (inputs: Record<string, number>) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                title: "Demo Project",
                budget: {
                    total_gross_budget: inputs.totalGrossBudget,
                },
                financing: {
                    Equity_Investment: inputs.equityInvestment,
                    Debt_Financing: inputs.debtFinancing,
                    Gap_Financing: inputs.gapFinancing,
                },
                base_case_revenue: {
                    Domestic: inputs.baseCaseDomesticRevenue,
                    Foreign: inputs.baseCaseForeignRevenue,
                },
                scenario_multipliers: {
                    Best_Case: inputs.bestCaseMultiplier,
                    Worst_Case: inputs.worstCaseMultiplier,
                },
                waterfall_terms: {
                    Equity_Premium_Percent: inputs.equityPremiumPercent / 100,
                    Net_Profit_Split_To_Investors: inputs.netProfitSplitPercent / 100,
                    CAM_Setup_Fee: inputs.camSetupFee,
                    CAM_Fee_Percent: inputs.camFeePercent / 100,
                    Distribution_Fee_Domestic_Percent: inputs.distributionFeeDomesticPercent / 100,
                    Distribution_Fee_Foreign_Percent: inputs.distributionFeeForeignPercent / 100,
                    sa_commission_domestic_percent: inputs.saCommissionDomesticPercent / 100,
                    sa_commission_foreign_percent: inputs.saCommissionForeignPercent / 100,
                    sa_commission_foreign_deferral_percent: inputs.saCommissionForeignDeferralPercent / 100,
                    Gap_Financing_Premium_Percent: inputs.gapFinancingPremiumPercent / 100,
                    Talent_Deferrals: inputs.talentDeferrals,
                    Other_Deferrals: inputs.otherDeferrals,
                },
                timeline: {
                    projection_years: inputs.projectionYears,
                    revenue_recognition_schedule: [0.6, 0.3, 0.1], // keep hardcoded or make input if desired
                    tax_credit_inflow_year: inputs.taxCreditInflowYear,
                },
            };
            // console.log("Payload being sent to backend:", payload);
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

    return { inputs, setInputs, result, loading, error, runModel };
};