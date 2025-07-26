# All Inputs Up Top: All the important numbers are located right at the top of the code, so you can easily change them for another project. This includes the movie's total budget, all its funding sources (like equity, debt, and tax credits), and the rules for how everyone gets paid back.
# Checks Three Scenarios: It instantly runs the numbers for three different outcomes: a Worst Case, a Base Case, and a Best Case. This gives you a quick, clear look at the potential financial risk and reward.
# Follows the Money Waterfall: The real magic is in how it handles the cash flow over time. It correctly follows the "waterfall" principle, which is crucial in film financing:
# First, it uses any incoming revenue to pay off all the outside debt. No one else gets a dime until the lenders are paid in full.
# Then, it uses the money to pay back the equity investors' initial investment.
#
# After that, it pays their equity premium.
# Only if there's cash left after all of that does it start splitting the actual profits.
# Calculates the Key Metrics: For each of the three scenarios, it crunches the numbers to give you the bottom line:
# ROI (Return on Investment): A simple percentage of how much profit you made on your initial investment.
# IRR (Internal Rate of Return): A more advanced metric that's more accurate because it understands that getting money back sooner is better than getting it back later.
# Breakeven Point: The exact amount of gross revenue the film needs to earn so you don't lose money.
# Spits Out a PDF Report: When it's done running, it bundles all of this analysis—the tables, the breakdowns, and the charts—into a clean, multi-page PDF report. Best of all, it automatically pops up on your screen so you can see the results right away.
# ==============================================================
#  Film Finance Model (v3)
#
# Features:
# - Versatile Input Section for any film project
# - Multiplier-based scenario generation (Best/Worst Case)
# - Year-by-year waterfall engine for accurate ROI & IRR
# - Breakeven analysis
#
# ==============================================================

import pandas as pd
import numpy as np
import numpy_financial as npf
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend before importing pyplot
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from fpdf import FPDF
import os
import webbrowser
import datetime

# ----------------------------------------------------------------------
# 1. INPUTS SECTION
# ----------------------------------------------------------------------

FILM_TITLE = "& Sons"
budget = {'total_gross_budget': 8_892_544}
financing = {
    'Equity_Investment': 3_974_745, 'Debt_Financing': 738_200, 'Gap_Financing': 1_481_276,
    'Tax_Credit_UK': 2_100_951, 'Tax_Credit_Canada': 341_685, 'Pre_Sale_Deposits': 205_685,
    'Rights_Advance': 738_200, 'Music_Rights_Deal': 50_000
}
base_case_revenue = {'Domestic': 4_500_000, 'Foreign': 6_875_600}
scenario_multipliers = {'Best_Case': 1.3, 'Worst_Case': 0.7}
waterfall_terms = {
    'Equity_Premium_Percent': 0.20, 'Net_Profit_Split_To_Investors': 0.50,
    'CAM_Setup_Fee': 3_000, 'CAM_Fee_Percent': 0.0075,
    'Distribution_Fee_Domestic_Percent': 0.25, 'Distribution_Fee_Foreign_Percent': 0.25,
    'sa_commission_domestic_percent': 0.075, 'sa_commission_foreign_percent': 0.12,
    'sa_commission_foreign_deferral_percent': 0.30, 'Gap_Financing_Premium_Percent': 0.10,
    'Talent_Deferrals': 500_000, 'Other_Deferrals': 55_250
}
timeline = {
    'projection_years': 4, 'revenue_recognition_schedule': (0.60, 0.30, 0.10),
    'tax_credit_inflow_year': 1
}

# ----------------------------------------------------------------------
# 2. FINANCIAL MODELING ENGINE
# ----------------------------------------------------------------------

class FilmFinanceModel:
    def __init__(self, title, inputs):
        self.title = title
        self.inputs = inputs
        self.results = {}
        self.image_files = []
        self._generate_scenarios()

    def _generate_scenarios(self):
        base_rev, mult = self.inputs['base_case_revenue'], self.inputs['scenario_multipliers']
        self.generated_scenarios = {
            'Worst Case': {k: v * mult['Worst_Case'] for k, v in base_rev.items()},
            'Base Case': base_rev,
            'Best Case': {k: v * mult['Best_Case'] for k, v in base_rev.items()}
        }

    def _calculate_time_series_waterfall(self, scenario_revenue):
        terms, fin, tl = self.inputs['waterfall_terms'], self.inputs['financing'], self.inputs['timeline']

        equity_principal = fin['Equity_Investment']
        equity_premium = equity_principal * terms['Equity_Premium_Percent']
        total_debt_outstanding = (fin['Gap_Financing'] * (1 + terms['Gap_Financing_Premium_Percent'])) + fin['Debt_Financing']
        foreign_comm_total = scenario_revenue['Foreign'] * terms['sa_commission_foreign_percent']
        foreign_comm_deferred = foreign_comm_total * terms['sa_commission_foreign_deferral_percent']
        total_deferrals_outstanding = terms['Talent_Deferrals'] + terms['Other_Deferrals'] + foreign_comm_deferred
        equity_principal_outstanding = equity_principal
        equity_premium_outstanding = equity_premium

        equity_investor_cf = [-equity_principal] + [0] * (tl['projection_years'] - 1)

        gross_receipts = sum(scenario_revenue.values())
        cam_fee = terms['CAM_Setup_Fee'] + (gross_receipts * terms['CAM_Fee_Percent'])
        dist_exp = (scenario_revenue['Domestic'] * terms['Distribution_Fee_Domestic_Percent'] +
                    scenario_revenue['Foreign'] * terms['Distribution_Fee_Foreign_Percent'])
        domestic_comm = scenario_revenue['Domestic'] * terms['sa_commission_domestic_percent']
        foreign_comm_upfront = foreign_comm_total - foreign_comm_deferred
        total_upfront_fees = cam_fee + dist_exp + domestic_comm + foreign_comm_upfront
        total_net_receipts = gross_receipts - total_upfront_fees

        annual_waterfall_df = pd.DataFrame(index=[
            'Net Receipts This Year', 'Less: Paid to Debt', 'Less: Paid to Equity Principal',
            'Less: Paid to Equity Premium', 'Less: Paid to Deferrals', 'Investor Profit Share',
            'Total Cash to Investor This Year'
        ], columns=[f'Year {i+1}' for i in range(len(tl['revenue_recognition_schedule']))], dtype=float).fillna(0)

        for i, p in enumerate(tl['revenue_recognition_schedule']):
            year_col = f'Year {i+1}'
            receipts_this_year = total_net_receipts * p
            annual_waterfall_df.loc['Net Receipts This Year', year_col] = receipts_this_year

            paid_to_debt = min(receipts_this_year, total_debt_outstanding)
            total_debt_outstanding -= paid_to_debt
            receipts_this_year -= paid_to_debt
            annual_waterfall_df.loc['Less: Paid to Debt', year_col] = -paid_to_debt

            paid_to_equity_principal = min(receipts_this_year, equity_principal_outstanding)
            equity_principal_outstanding -= paid_to_equity_principal
            receipts_this_year -= paid_to_equity_principal
            equity_investor_cf[i+1] += paid_to_equity_principal
            annual_waterfall_df.loc['Less: Paid to Equity Principal', year_col] = -paid_to_equity_principal

            paid_to_equity_premium = min(receipts_this_year, equity_premium_outstanding)
            equity_premium_outstanding -= paid_to_equity_premium
            receipts_this_year -= paid_to_equity_premium
            equity_investor_cf[i+1] += paid_to_equity_premium
            annual_waterfall_df.loc['Less: Paid to Equity Premium', year_col] = -paid_to_equity_premium

            paid_to_deferrals = min(receipts_this_year, total_deferrals_outstanding)
            total_deferrals_outstanding -= paid_to_deferrals
            receipts_this_year -= paid_to_deferrals
            annual_waterfall_df.loc['Less: Paid to Deferrals', year_col] = -paid_to_deferrals

            investor_profit_share = receipts_this_year * terms['Net_Profit_Split_To_Investors']
            equity_investor_cf[i+1] += investor_profit_share
            annual_waterfall_df.loc['Investor Profit Share', year_col] = investor_profit_share

            annual_waterfall_df.loc['Total Cash to Investor This Year', year_col] = equity_investor_cf[i+1]

        total_investor_return = sum(equity_investor_cf[1:])
        roi = (total_investor_return - equity_principal) / equity_principal if equity_principal > 0 else 0
        irr = npf.irr(equity_investor_cf) if total_investor_return > 0 else -1.0

        return {'roi': roi, 'irr': irr, 'cash_flow': equity_investor_cf,
                'total_return': total_investor_return, 'gross_receipts': gross_receipts,
                'annual_waterfall_df': annual_waterfall_df}

    def _calculate_breakeven(self):
        base_rev_total = sum(self.inputs['base_case_revenue'].values())
        proportions = {k: v / base_rev_total for k, v in self.inputs['base_case_revenue'].items()}
        low_guess, high_guess = 1_000_000, 25_000_000
        for _ in range(25):
            mid_guess = (low_guess + high_guess) / 2
            roi = self._calculate_time_series_waterfall({k: mid_guess * p for k, p in proportions.items()})['roi']
            if roi < 0: low_guess = mid_guess
            else: high_guess = mid_guess
        return high_guess

    def run_full_analysis(self):
        for name, revenue_data in self.generated_scenarios.items():
            self.results[name] = self._calculate_time_series_waterfall(revenue_data)

        self.breakeven_receipts = self._calculate_breakeven()
        self.base_case_cash_flow_df = pd.DataFrame(
            self.results['Base Case']['cash_flow'],
            index=[f'Year {i}' for i in range(self.inputs['timeline']['projection_years'])],
            columns=['Net Cash Flow to Equity']
        )
        self.base_case_cash_flow_df['Cumulative Cash Flow'] = self.base_case_cash_flow_df['Net Cash Flow to Equity'].cumsum()

    def generate_charts(self):
        """
        **RESTORED**
        Generates and saves all three analytical charts as image files.
        """
        plt.style.use('seaborn-v0_8-whitegrid')
        money_format = mticker.FuncFormatter(lambda x, p: f'${x/1e6:.1f}M')

        # Chart 1: ROI Chart
        fig1, ax1 = plt.subplots(figsize=(7, 5))
        roi_data = [self.results[s]['roi'] * 100 for s in self.results]
        colors = ['#d9534f', '#777777', '#5cb85c']
        ax1.bar(self.results.keys(), roi_data, color=colors)
        ax1.set_title(f'Investor ROI by Scenario for "{self.title}"', fontsize=14, pad=20)
        ax1.set_ylabel('Return on Investment (ROI %)')
        ax1.yaxis.set_major_formatter(mticker.PercentFormatter())
        fname1 = "chart_roi_scenario.png"
        plt.savefig(fname1, bbox_inches='tight')
        plt.close(fig1)
        self.image_files.append(fname1)

        # Chart 2: Return Composition Chart
        fig2, ax2 = plt.subplots(figsize=(8, 5))
        equity_principal = self.inputs['financing']['Equity_Investment']
        df = pd.DataFrame({
            'Principal Recouped': [min(equity_principal, r['total_return']) for r in self.results.values()],
            'Profit (Premium & Split)': [max(0, r['total_return'] - equity_principal) for r in self.results.values()],
        }, index=self.results.keys())
        df.plot(kind='bar', stacked=True, ax=ax2, color=['#3498db', '#2ecc71'])
        ax2.set_title('Composition of Investor Returns by Scenario', fontsize=14, pad=20)
        ax2.set_ylabel('Total Return (USD)')
        ax2.yaxis.set_major_formatter(money_format)
        ax2.tick_params(axis='x', rotation=0)
        fname2 = "chart_return_composition.png"
        plt.savefig(fname2, bbox_inches='tight')
        plt.close(fig2)
        self.image_files.append(fname2)

        # Chart 3: Cash Flow Chart
        fig3, ax3 = plt.subplots(figsize=(8, 5))
        cash_flow_to_plot = self.base_case_cash_flow_df['Cumulative Cash Flow']
        cash_flow_to_plot.plot(ax=ax3, marker='o', label='Cumulative Cash Flow')
        ax3.set_title('Base Case Cumulative Cash Flow to Equity', fontsize=14, pad=20)
        ax3.set_ylabel('Amount (USD)')
        ax3.set_xlabel('Year')
        ax3.axhline(0, color='grey', linestyle='--')
        ax3.yaxis.set_major_formatter(money_format)
        ax3.legend()
        fname3 = "chart_cash_flow.png"
        plt.savefig(fname3, bbox_inches='tight')
        plt.close(fig3)
        self.image_files.append(fname3)

    def generate_pdf_report(self):
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        def create_pdf_table(pdf_obj, df, title):
            pdf_obj.set_font("Arial", 'B', 12)
            pdf_obj.cell(0, 10, title, ln=True, align='L')
            pdf_obj.set_font("Arial", 'B', 9)

            col_widths = {'index': 70}
            other_cols_width = (pdf_obj.w - pdf_obj.l_margin - pdf_obj.r_margin - col_widths['index']) / len(df.columns)
            for col in df.columns: col_widths[col] = other_cols_width

            pdf_obj.cell(col_widths['index'], 8, df.index.name or '', border=1, align='C')
            for col in df.columns: pdf_obj.cell(col_widths[col], 8, str(col), border=1, align='C')
            pdf_obj.ln()

            for index, row in df.iterrows():
                font_style = 'B' if 'Total' in str(index) else ''
                pdf_obj.set_font("Arial", font_style, 9)
                pdf_obj.cell(col_widths['index'], 8, str(index), border=1, align='L')
                for col_name, item in row.items():
                    text = f"{item:,.0f}" if isinstance(item, (int, float, np.number)) else str(item)
                    if '%' not in text and 'N/A' not in text:
                        text = text.replace('$-', '-$')
                    pdf_obj.cell(col_widths[col_name], 8, text, border=1, align='R')
                pdf_obj.ln()
            pdf_obj.set_font("Arial", '', 9)
            pdf_obj.ln(8)

        # --- PDF Content Generation ---
        pdf.set_font("Arial", 'B', 18)
        pdf.cell(0, 10, f'Advanced Film Finance Analysis: "{self.title}"', ln=True, align='C')
        pdf.ln(5)

        # Page 1: KPIs, Breakeven
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "1. Key Performance Indicators (KPIs)", ln=True)
        kpi_df = pd.DataFrame({
            'Gross Receipts': [res['gross_receipts'] for res in self.results.values()],
            'Total Investor Return': [res['total_return'] for res in self.results.values()],
            'Investor ROI': [f"{res['roi']:.1%}" for res in self.results.values()],
            'Investor IRR': [f"{res['irr']:.1%}" if res['irr'] != -1.0 else "N/A" for res in self.results.values()]
        }, index=self.results.keys())
        create_pdf_table(pdf, kpi_df, "Scenario Summary")

        pdf.set_font("Arial", 'B', 12)
        pdf.cell(0, 10, "Breakeven Analysis", ln=True)
        pdf.set_font("Arial", '', 10)
        pdf.cell(0, 6, f"The film requires estimated Gross Receipts of ${self.breakeven_receipts:,.0f} to break even (0% ROI).", ln=True)
        pdf.ln(10)

        # Page 2: Annual Waterfall Tables
        pdf.add_page()
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "2. Detailed Annual Waterfall (Year-by-Year)", ln=True)
        for name, result in self.results.items():
            create_pdf_table(pdf, result['annual_waterfall_df'], f"Analysis for: {name}")

        # Page 3: Charts
        pdf.add_page()
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "3. Analytical Charts", ln=True)
        pdf.ln(5)
        for image in self.image_files:
            pdf.image(image, w=pdf.w - pdf.l_margin - pdf.r_margin)
            pdf.ln(5)

        # --- Finalize ---
        pdf_file = f"{self.title.replace(' ', '_')}_Advanced_Finance_Report.pdf"
        pdf.output(pdf_file)
        print(f"\n✅ PDF report saved as '{pdf_file}'.")
        webbrowser.open_new(f"file://{os.path.abspath(pdf_file)}")
        for img in self.image_files: os.remove(img)
        print(" Cleaned up temporary image files.")

if __name__ == "__main__":
    model = FilmFinanceModel(FILM_TITLE, {
        'budget': budget, 'financing': financing, 'base_case_revenue': base_case_revenue,
        'scenario_multipliers': scenario_multipliers, 'waterfall_terms': waterfall_terms, 'timeline': timeline
    })
    model.run_full_analysis()
    model.generate_charts()
    model.generate_pdf_report()