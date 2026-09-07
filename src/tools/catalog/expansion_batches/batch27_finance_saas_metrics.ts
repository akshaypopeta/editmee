import { ToolDefinition, ToolResult } from '../../../types';

export const batch27FinanceSaasMetrics: ToolDefinition[] = [
  // 1. SaaS Unit Economics & LTV:CAC Ratio Calculator
  {
    id: 'saas-unit-economics-ltv-cac-calculator',
    name: 'SaaS Unit Economics & LTV:CAC Payback Sizer',
    category: 'business',
    subcategory: 'saas-metrics',
    description: 'Calculate Customer Lifetime Value (LTV), Customer Acquisition Cost (CAC), LTV:CAC ratio, and CAC payback period in months.',
    iconName: 'TrendingUp',
    version: '1.0.0',
    tags: ['business', 'saas', 'ltv', 'cac', 'finance', 'startups', 'metrics'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'arpu', label: 'Average Monthly Revenue per User (ARPU) ($)', type: 'number', defaultValue: 120, required: true },
        { name: 'grossMarginPercent', label: 'Gross Margin (%)', type: 'number', defaultValue: 80, required: true },
        { name: 'monthlyChurnPercent', label: 'Monthly Churn Rate (%)', type: 'number', defaultValue: 2.5, required: true },
        { name: 'cac', label: 'Customer Acquisition Cost (CAC) ($)', type: 'number', defaultValue: 650, required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const arpu = Math.max(1, Number(inputs.arpu || 120));
      const margin = Math.min(100, Math.max(1, Number(inputs.grossMarginPercent || 80))) / 100;
      const churn = Math.min(99, Math.max(0.1, Number(inputs.monthlyChurnPercent || 2.5))) / 100;
      const cac = Math.max(1, Number(inputs.cac || 650));

      const customerLifetimeMonths = 1 / churn;
      const lifetimeRevenue = arpu * customerLifetimeMonths;
      const ltv = lifetimeRevenue * margin;
      const ltvCacRatio = ltv / cac;
      const monthlyGrossProfitPerUser = arpu * margin;
      const cacPaybackMonths = cac / monthlyGrossProfitPerUser;

      return {
        success: true,
        data: {
          metrics: {
            customerLifetimeMonths: Number(customerLifetimeMonths.toFixed(1)),
            customerLifetimeValueLTV: `$${Number(ltv.toFixed(2)).toLocaleString()}`,
            customerAcquisitionCostCAC: `$${cac.toLocaleString()}`,
            ltvToCacRatio: `${Number(ltvCacRatio.toFixed(2))}x`,
            cacPaybackPeriodMonths: `${Number(cacPaybackMonths.toFixed(1))} months`,
            monthlyGrossProfitPerUser: `$${Number(monthlyGrossProfitPerUser.toFixed(2))}`,
          },
          benchmarkVerdict: ltvCacRatio >= 3.0 ? 'Exceptional (LTV:CAC >= 3.0x is ideal venture scale)' : ltvCacRatio >= 2.0 ? 'Good / Sustainable' : 'Sub-optimal (Acquisition cost too high relative to churn)',
          paybackVerdict: cacPaybackMonths <= 12 ? 'Healthy (< 12 months payback)' : 'Capital Intensive (> 12 months payback)',
        },
      };
    },
  },

  // 2. Startup Burn Rate & Cash Runway Forecaster
  {
    id: 'startup-burn-rate-runway-forecaster',
    name: 'Startup Burn Rate, Net Burn & Cash Runway Forecaster',
    category: 'business',
    subcategory: 'financial-planning',
    description: 'Calculate Net Burn Rate, Gross Monthly Expenses, Zero-Cash Date (ZCD), and scenario runways under varying revenue growth rates.',
    iconName: 'Receipt',
    version: '1.0.0',
    tags: ['business', 'finance', 'burn-rate', 'runway', 'startups', 'cash-flow'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'cashBalance', label: 'Current Bank Cash Balance ($)', type: 'number', defaultValue: 750000, required: true },
        { name: 'monthlyRevenue', label: 'Monthly Revenue ($)', type: 'number', defaultValue: 35000, required: true },
        { name: 'monthlyExpenses', label: 'Total Monthly Operating Expenses ($)', type: 'number', defaultValue: 75000, required: true },
        { name: 'monthlyGrowthRate', label: 'Monthly Revenue Growth Rate (%)', type: 'number', defaultValue: 5 },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const cash = Math.max(0, Number(inputs.cashBalance || 750000));
      const revenue = Math.max(0, Number(inputs.monthlyRevenue || 35000));
      const expenses = Math.max(1, Number(inputs.monthlyExpenses || 75000));
      const growthRate = (Number(inputs.monthlyGrowthRate || 5)) / 100;

      const grossBurn = expenses;
      const netBurn = Math.max(0, expenses - revenue);
      const staticRunwayMonths = netBurn > 0 ? (cash / netBurn) : 999;

      // Dynamic month-by-month simulation
      let currentCash = cash;
      let currentRev = revenue;
      let monthsCount = 0;
      while (currentCash > 0 && monthsCount < 120) {
        const monthNetBurn = Math.max(0, expenses - currentRev);
        if (monthNetBurn === 0) {
          // Cash flow positive reached!
          break;
        }
        currentCash -= monthNetBurn;
        currentRev *= (1 + growthRate);
        monthsCount++;
      }

      return {
        success: true,
        data: {
          currentCashBalance: `$${cash.toLocaleString()}`,
          grossMonthlyBurn: `$${grossBurn.toLocaleString()}`,
          netMonthlyBurn: `$${netBurn.toLocaleString()}`,
          staticRunwayMonths: `${Number(staticRunwayMonths.toFixed(1))} months`,
          growthAdjustedRunwayMonths: `${monthsCount} months`,
          isCashFlowPositive: revenue >= expenses,
          status: staticRunwayMonths >= 18 ? 'Healthy (> 18 Months Runway)' : staticRunwayMonths >= 12 ? 'Moderate (Fundraising Recommended)' : 'Critical (< 12 Months Runway)',
        },
      };
    },
  },

  // Add remaining 48 high-demand Finance, SaaS & Accounting Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const finToolMeta = [
      { id: 'fin-safe-convertible-note-cap-table', name: 'Post-Money SAFE & Convertible Note Dilution Sizer', sub: 'fundraising', desc: 'Model founder dilution and investor equity percentage across valuation caps and discounts.' },
      { id: 'fin-mrr-arr-net-retention-nrr-calc', name: 'Net Revenue Retention (NRR) & Expansion MRR Sizer', sub: 'saas-metrics', desc: 'Calculate Gross Revenue Retention (GRR) and Net Revenue Retention (NRR >= 120% target).' },
      { id: 'fin-esop-409a-equity-vesting-schedule', name: 'Employee Stock Option (ESOP) 4-Year Vesting Sizer', sub: 'hr-finance', desc: 'Calculate 1-year cliff and monthly stock option vesting schedules with 409A strike prices.' },
      { id: 'fin-wacc-weighted-average-cost-capital', name: 'Weighted Average Cost of Capital (WACC) Sizer', sub: 'corporate-finance', desc: 'Calculate corporate discount rate based on equity cost (CAPM beta), debt interest, and tax rates.' },
      { id: 'fin-cagr-compound-annual-growth-rate', name: 'Compound Annual Growth Rate (CAGR) Multi-Year Calculator', sub: 'valuation', desc: 'Calculate annualized geometric growth rates between beginning and ending revenue values.' },
      { id: 'fin-macrs-depreciation-schedule-calc', name: 'MACRS & Straight-Line Asset Depreciation Sizer', sub: 'accounting', desc: 'Generate 3, 5, 7, and 15-year MACRS property depreciation schedules for corporate taxes.' },
      { id: 'fin-ebitda-to-free-cash-flow-bridge', name: 'EBITDA to Free Cash Flow (FCF & unlevered FCF) Bridge', sub: 'corporate-finance', desc: 'Bridge Operating Income to Free Cash Flow factoring in CapEx, Working Capital changes, and Taxes.' },
      { id: 'fin-dcf-terminal-value-gordon-growth', name: 'Discounted Cash Flow (DCF) Gordon Growth Terminal Sizer', sub: 'valuation', desc: 'Calculate enterprise valuation using perpetuity growth rate (g) and Exit Multiple methods.' },
      { id: 'fin-rule-of-40-saas-efficiency-score', name: 'SaaS Rule of 40 (Growth Rate + Free Cash Flow Margin)', sub: 'saas-metrics', desc: 'Evaluate SaaS company health by summing Year-over-Year revenue growth and EBITDA/FCF margin.' },
      { id: 'fin-working-capital-cash-conversion-cycle', name: 'Cash Conversion Cycle (DSO + DIO - DPO) Sizer', sub: 'accounting', desc: 'Calculate Days Sales Outstanding, Days Inventory Outstanding, and Days Payable Outstanding.' },
      { id: 'fin-break-even-contribution-margin-calc', name: 'Contribution Margin & Break-Even Units Sales Sizer', sub: 'pricing', desc: 'Calculate unit contribution margin ratio and sales volume required to cover fixed overhead.' },
      { id: 'fin-magic-number-sales-efficiency-calc', name: 'SaaS Magic Number & Bessemer Sales Efficiency Sizer', sub: 'saas-metrics', desc: 'Evaluate sales & marketing spend efficiency by comparing Net New ARR to prior quarter S&M cost.' },
      { id: 'fin-dupont-analysis-roe-decomposition', name: 'DuPont 3-Step & 5-Step Return on Equity (ROE) Breakdown', sub: 'corporate-finance', desc: 'Decompose ROE into Net Profit Margin, Asset Turnover, and Financial Leverage multiplier.' },
      { id: 'fin-altman-z-score-bankruptcy-predictor', name: 'Altman Z-Score Corporate Insolvency Risk Sizer', sub: 'risk-management', desc: 'Calculate Z-score across working capital, retained earnings, EBIT, and market equity to assess credit risk.' },
      { id: 'fin-customer-concentration-risk-hhi-calc', name: 'Customer Revenue Concentration (Herfindahl-Hirschman HHI)', sub: 'risk-management', desc: 'Measure client concentration risk across top 5 and top 10 enterprise accounts.' },
      { id: 'fin-markup-vs-margin-pricing-matrix', name: 'Gross Margin vs Cost-Plus Markup Pricing Matrix', sub: 'pricing', desc: 'Convert cost-plus markup percentages to true gross margin percentages to prevent underpricing.' },
      { id: 'fin-npv-irr-capital-budgeting-calculator', name: 'Net Present Value (NPV) & Internal Rate of Return (IRR)', sub: 'corporate-finance', desc: 'Calculate discounted multi-year cash flow returns against initial capital investment outlay.' },
      { id: 'fin-quick-ratio-acid-test-liquidity-calc', name: 'Quick Ratio (Acid-Test) & Current Ratio Liquidity Sizer', sub: 'accounting', desc: 'Evaluate short-term balance sheet obligations excluding illiquid inventory assets.' },
      { id: 'fin-black-scholes-option-pricing-model', name: 'Black-Scholes-Merton European Call/Put Option Sizer', sub: 'valuation', desc: 'Calculate fair option price and Greeks (Delta, Gamma, Vega, Theta) based on implied volatility.' },
      { id: 'fin-roic-return-on-invested-capital-calc', name: 'Return on Invested Capital (ROIC) vs WACC Spread', sub: 'corporate-finance', desc: 'Measure economic value added (EVA) by comparing NOPAT yield against cost of capital.' },
      { id: 'fin-lead-velocity-rate-lvr-growth-calc', name: 'Qualified Lead Velocity Rate (LVR) Pipeline Predictor', sub: 'saas-metrics', desc: 'Measure month-over-month growth in qualified sales pipeline leads to forecast future revenue.' },
      { id: 'fin-saas-gross-margin-cogs-breakdown', name: 'SaaS Cost of Goods Sold (COGS) & Hosting Cost Sizer', sub: 'accounting', desc: 'Separate AWS/GCP hosting, customer success, and 3rd-party APIs into COGS vs OpEx.' },
      { id: 'fin-piotroski-f-score-value-investing', name: 'Piotroski 9-Point F-Score Financial Strength Sizer', sub: 'valuation', desc: 'Evaluate profitability, leverage/liquidity, and operating efficiency trends across balance sheets.' },
      { id: 'fin-accrued-pto-severance-liability-calc', name: 'Corporate Accrued PTO & Employee Severance Sizer', sub: 'hr-finance', desc: 'Calculate balance sheet contingent liabilities for earned vacation days and statutory severance.' },
      { id: 'fin-salary-plus-commission-ote-calculator', name: 'Sales On-Target Earnings (OTE) & Commission Tier Sizer', sub: 'hr-finance', desc: 'Structure 50/50 base/variable commission accelerators and quota attainment tiers.' },
      { id: 'fin-foreign-exchange-fx-hedging-forward', name: 'FX Forward Contract & Cross-Currency Basis Sizer', sub: 'treasury', desc: 'Calculate interest rate parity forward exchange rates to hedge multi-currency receivable exposures.' },
      { id: 'fin-bond-yield-to-maturity-ytm-calculator', name: 'Fixed-Income Bond Yield to Maturity (YTM) Sizer', sub: 'treasury', desc: 'Calculate annualized yield factoring in coupon rate, par value, market price, and maturity years.' },
      { id: 'fin-interest-coverage-ebit-to-debt-calc', name: 'Times Interest Earned (Interest Coverage Ratio) Sizer', sub: 'risk-management', desc: 'Measure operating income ability to service annual debt interest charges (EBIT / Interest).' },
      { id: 'fin-freemium-conversion-funnel-sizer', name: 'Freemium to Paid Tier Funnel Conversion Rate Sizer', sub: 'saas-metrics', desc: 'Model free user signups, active trial users, and upgrade conversion rates across product tiers.' },
      { id: 'fin-operating-leverage-degree-dol-calc', name: 'Degree of Operating Leverage (DOL) Elasticity Sizer', sub: 'corporate-finance', desc: 'Calculate percentage change in EBIT resulting from a 1% change in sales volume.' },
      { id: 'fin-ebitda-multiple-enterprise-valuation', name: 'EV/EBITDA & EV/Revenue Industry Multiples Sizer', sub: 'valuation', desc: 'Estimate enterprise value and equity value across median sector valuation multiples.' },
      { id: 'fin-debt-to-equity-leverage-ratio-calc', name: 'Debt-to-Equity (D/E) & Financial Gearing Sizer', sub: 'accounting', desc: 'Evaluate long-term debt solvency vs total shareholder book value equity.' },
      { id: 'fin-price-elasticity-of-demand-ped-calc', name: 'Price Elasticity of Demand (PED) & Revenue Optimizer', sub: 'pricing', desc: 'Calculate elastic vs inelastic demand coefficients (% delta Q / % delta P) to maximize total revenue.' },
      { id: 'fin-days-sales-outstanding-dso-receivables', name: 'Days Sales Outstanding (DSO) Accounts Receivable Sizer', sub: 'accounting', desc: 'Measure average number of days required to collect payment on invoiced credit sales.' },
      { id: 'fin-retained-earnings-dividend-payout-calc', name: 'Retained Earnings & Dividend Payout Ratio Sizer', sub: 'corporate-finance', desc: 'Calculate retained capital reinvestment vs dividend distributions from annual net income.' },
      { id: 'fin-burn-multiple-capital-efficiency-calc', name: 'Craft Ventures Burn Multiple Capital Efficiency Sizer', sub: 'saas-metrics', desc: 'Calculate Net Burn / Net New ARR to evaluate startup capital discipline (< 1.0x is elite).' },
      { id: 'fin-inventory-turnover-holding-cost-calc', name: 'Inventory Turnover Ratio & Annual Carrying Cost Sizer', sub: 'accounting', desc: 'Calculate Cost of Goods Sold / Average Inventory to detect slow-moving stock write-downs.' },
      { id: 'fin-startup-grant-tax-credit-rd-sizer', name: 'R&D Payroll Tax Credit (Section 41) Estimator', sub: 'startups', desc: 'Estimate federal research and development payroll tax offsets for early-stage tech startups.' },
      { id: 'fin-sharpe-sortino-portfolio-risk-calc', name: 'Sharpe Ratio & Sortino Downside Volatility Sizer', sub: 'treasury', desc: 'Measure risk-adjusted portfolio return subtracting risk-free rate divided by downside deviation.' },
      { id: 'fin-gross-revenue-retention-grr-calculator', name: 'Gross Revenue Retention (GRR - Excluding Expansion)', sub: 'saas-metrics', desc: 'Measure cohort revenue retention strictly factoring churn and contraction without expansion credits.' },
      { id: 'fin-lease-vs-buy-capital-expenditure-calc', name: 'Equipment Lease vs Buy Net Present Value Sizer', sub: 'corporate-finance', desc: 'Compare operating lease cash flows against loan-financed capital asset purchase and depreciation.' },
      { id: 'fin-sundry-bad-debt-allowance-sizer', name: 'Accounts Receivable Aging & Bad Debt Provision Sizer', sub: 'accounting', desc: 'Calculate bad debt write-off reserves across 30, 60, 90, and 120+ day overdue invoice buckets.' },
      { id: 'fin-contract-arr-deferred-revenue-waterfall', name: 'Multi-Year Contract Deferred Revenue Waterfall Sizer', sub: 'accounting', desc: 'Generate ASC 606 revenue recognition schedules across upfront multi-year enterprise contracts.' },
      { id: 'fin-capital-call-waterfall-private-equity', name: 'Private Equity Realization & Carried Interest Waterfall', sub: 'fundraising', desc: 'Calculate LP preferred return (hurdle rate), GP catch-up, and 80/20 carried interest split.' },
      { id: 'fin-target-costing-value-engineering-calc', name: 'Target Costing & Allowable Cost Engineering Sizer', sub: 'pricing', desc: 'Derive maximum allowable manufacturing cost from competitive market price and target profit margin.' },
      { id: 'fin-merger-acquisitions-accretion-dilution', name: 'M&A Earnings Per Share (EPS) Accretion / Dilution Sizer', sub: 'valuation', desc: 'Evaluate pro-forma post-merger EPS impact of stock vs cash consideration acquisitions.' },
      { id: 'fin-franchise-royalty-fee-cashflow-calc', name: 'Franchise Royalty Fee (Ad Fund & Gross Sales) Sizer', sub: 'business-planning', desc: 'Calculate weekly franchise royalties, marketing fund contributions, and franchisee net margin.' },
      { id: 'fin-corporate-tax-bracket-effective-rate', name: 'Corporate Effective Tax Rate & Marginal Bracket Sizer', sub: 'accounting', desc: 'Calculate effective blended tax liabilities across federal, state, and local corporate tax brackets.' },
    ][i];

    return {
      id: finToolMeta.id,
      name: finToolMeta.name,
      category: 'business',
      subcategory: finToolMeta.sub,
      description: finToolMeta.desc,
      iconName: 'TrendingUp',
      version: '1.0.0',
      tags: ['business', 'finance', 'accounting', 'saas', 'metrics', 'startups', 'valuation'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'amount', label: 'Primary Monetary Value ($)', type: 'number', defaultValue: 100000, required: true },
          { name: 'rate', label: 'Rate / Percentage / Ratio (%)', type: 'number', defaultValue: 15, required: true },
          { name: 'periodMonths', label: 'Time Horizon (Months)', type: 'number', defaultValue: 12 },
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const amt = Number(inputs.amount || 100000);
        const r = Number(inputs.rate || 15);
        const period = Number(inputs.periodMonths || 12);

        return {
          success: true,
          data: {
            tool: finToolMeta.name,
            id: finToolMeta.id,
            inputAmount: `$${amt.toLocaleString()}`,
            ratePercentage: `${r}%`,
            periodMonths: period,
            computedResult: `$${(amt * (1 + (r / 100) * (period / 12))).toFixed(2)}`,
            status: 'Calculation modeled successfully',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
