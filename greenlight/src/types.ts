export interface Inputs {
    // Budget
    totalGrossBudget: number;

    // Base Case Revenue
    baseCaseDomesticRevenue: number;
    baseCaseForeignRevenue: number;

    // Scenario Multipliers
    bestCaseMultiplier: number;
    worstCaseMultiplier: number;

    // Financing
    equityInvestment: number;
    debtFinancing: number;
    gapFinancing: number;

    // Investor Terms
    equityPremiumPercent: number;
    netProfitSplitPercent: number;

    // Fees
    camFeePercent: number;
    distributionFeeDomesticPercent: number;
    distributionFeeForeignPercent: number;
    camSetupFee: number;

    // Deferrals
    talentDeferrals: number;
    otherDeferrals: number;

    // Timeline
    projectionYears: number;
    taxCreditInflowYear: number;

    gapFinancingPremiumPercent: number;
}