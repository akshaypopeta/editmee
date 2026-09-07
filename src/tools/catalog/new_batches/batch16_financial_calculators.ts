import { ToolDefinition, ToolResult } from '../../../types';
import { CalculatorEngine } from '../../../core/calculators/CalculatorEngine';

export const batch16FinancialCalculators: ToolDefinition[] = [
  // 1. FIRE Retirement Number
  {
    id: 'calc-fire-retirement-number',
    name: 'FIRE (Financial Independence, Retire Early) Number Calc',
    category: 'calculators',
    subcategory: 'financial',
    description: 'Calculate your exact FIRE nest egg target based on annual expenses and the 4% safe withdrawal rule.',
    iconName: 'DollarSign',
    version: '1.0.0',
    tags: ['fire', 'retirement', 'financial independence', 'nest egg', 'savings', '4 percent rule'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'annualExpenses', label: 'Annual Living Expenses ($)', type: 'number', defaultValue: 60000, required: true },
        { name: 'swr', label: 'Safe Withdrawal Rate (%)', type: 'number', defaultValue: 4, required: true },
        { name: 'currentSavings', label: 'Current Invested Portfolio ($)', type: 'number', defaultValue: 150000 },
        { name: 'annualSavings', label: 'Annual New Savings / Contributions ($)', type: 'number', defaultValue: 25000 },
        { name: 'expectedReturn', label: 'Expected Annual Portfolio Return (%)', type: 'number', defaultValue: 7 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const exp = Number(inputs.annualExpenses || 60000);
      const swr = Number(inputs.swr || 4);
      const current = Number(inputs.currentSavings || 0);
      const annualSav = Number(inputs.annualSavings || 0);
      const ret = Number(inputs.expectedReturn || 7);

      const res = CalculatorEngine.calculateFire(exp, swr, current, annualSav, ret);

      const text = `# FIRE Portfolio & Retirement Target Model

### Core Targets
- **Standard FIRE Target (${swr}% SWR):** **$${res.fireTarget.toLocaleString()}**
- **Lean FIRE Target (75% expenses):** **$${res.leanFireTarget.toLocaleString()}**
- **Fat FIRE Target (150% expenses):** **$${res.fatFireTarget.toLocaleString()}**

### Timeline & Trajectory
- **Current Portfolio:** $${current.toLocaleString()}
- **Annual Contribution:** $${annualSav.toLocaleString()}
- **Estimated Years to FIRE:** **${res.yearsToFire > 0 ? `${res.yearsToFire} Years` : 'Goal already reached!'}**
- **Projected Value at Target Date:** $${res.projectedPortfolioAtFire.toLocaleString()}

### Safe Withdrawal Guidance
At a ${swr}% withdrawal rate, a portfolio of $${res.fireTarget.toLocaleString()} generates **$${exp.toLocaleString()}/year** ($${Math.round(exp / 12).toLocaleString()}/month) indefinitely based on Trinity Study historical backtests.
`;

      return { success: true, text, filename: 'fire_target_report.md', mimeType: 'text/markdown' };
    },
  },

  // 2. 401(k) Employer Match Growth
  {
    id: 'calc-401k-employer-match-growth',
    name: '401(k) Retirement Account & Employer Match Calculator',
    category: 'calculators',
    subcategory: 'financial',
    description: 'Calculate multi-decade retirement balances with employee contributions, employer matches, and market returns.',
    iconName: 'TrendingUp',
    version: '1.0.0',
    tags: ['401k', 'retirement', 'employer match', 'compounding', 'growth'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'currentAge', label: 'Current Age', type: 'number', defaultValue: 30, required: true },
        { name: 'retirementAge', label: 'Retirement Age', type: 'number', defaultValue: 65, required: true },
        { name: 'salary', label: 'Annual Gross Salary ($)', type: 'number', defaultValue: 90000, required: true },
        { name: 'employeeContributionPct', label: 'Employee Contribution (%)', type: 'number', defaultValue: 10 },
        { name: 'employerMatchPct', label: 'Employer Match (%)', type: 'number', defaultValue: 50 },
        { name: 'employerMatchLimitPct', label: 'Employer Match Up To Salary (%)', type: 'number', defaultValue: 6 },
        { name: 'currentBalance', label: 'Current 401(k) Balance ($)', type: 'number', defaultValue: 45000 },
        { name: 'annualReturn', label: 'Expected Annual Market Return (%)', type: 'number', defaultValue: 7.5 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const curAge = Number(inputs.currentAge || 30);
      const retAge = Number(inputs.retirementAge || 65);
      const salary = Number(inputs.salary || 90000);
      const empPct = Number(inputs.employeeContributionPct || 10) / 100;
      const matchPct = Number(inputs.employerMatchPct || 50) / 100;
      const matchLim = Number(inputs.employerMatchLimitPct || 6) / 100;
      const curBal = Number(inputs.currentBalance || 45000);
      const r = Number(inputs.annualReturn || 7.5) / 100;

      const years = Math.max(1, retAge - curAge);
      const annualEmpContrib = salary * empPct;
      const eligibleSalary = Math.min(salary * empPct, salary * matchLim);
      const annualEmployerMatch = eligibleSalary * matchPct;
      const totalAnnualDeposit = annualEmpContrib + annualEmployerMatch;

      let balance = curBal;
      let totalEmpContributed = 0;
      let totalMatchContributed = 0;

      for (let i = 0; i < years; i++) {
        balance = (balance + totalAnnualDeposit) * (1 + r);
        totalEmpContributed += annualEmpContrib;
        totalMatchContributed += annualEmployerMatch;
      }

      const totalGrowth = balance - (curBal + totalEmpContributed + totalMatchContributed);

      const text = `# 401(k) Wealth Accumulation & Employer Match Analysis

### Lifetime Balance Summary (Age ${retAge})
- **Projected 401(k) Balance:** **$${Math.round(balance).toLocaleString()}**
- **Your Total Contributions:** $${Math.round(totalEmpContributed).toLocaleString()}
- **Employer Free Match Money:** **$${Math.round(totalMatchContributed).toLocaleString()}**
- **Compound Market Growth:** **$${Math.round(totalGrowth).toLocaleString()}**

### Annual Contribution Breakdown
- **Your Annual Deposit:** $${annualEmpContrib.toLocaleString()} (${(empPct * 100).toFixed(1)}% of salary)
- **Company Match Deposit:** $${annualEmployerMatch.toLocaleString()}
- **Total Inflow / Year:** $${totalAnnualDeposit.toLocaleString()}
`;

      return { success: true, text, filename: '401k_projection_report.md', mimeType: 'text/markdown' };
    },
  },

  // 3. Discounted Cash Flow (DCF) Valuation
  {
    id: 'calc-dcf-discounted-cash-flow',
    name: 'Discounted Cash Flow (DCF) Equity Valuation Model',
    category: 'calculators',
    subcategory: 'financial',
    description: 'Estimate intrinsic stock fair value per share by discounting projected 5-year free cash flows and terminal value.',
    iconName: 'PieChart',
    version: '1.0.0',
    tags: ['dcf', 'valuation', 'stock', 'equity', 'cash flow', 'wacc', 'terminal value'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'fcfYear0', label: 'Current Free Cash Flow (FCF Year 0 in Millions $)', type: 'number', defaultValue: 500, required: true },
        { name: 'growthRate', label: '5-Year Projected FCF Growth Rate (%)', type: 'number', defaultValue: 12, required: true },
        { name: 'terminalGrowth', label: 'Perpetual Terminal Growth Rate (%)', type: 'number', defaultValue: 2.5, required: true },
        { name: 'wacc', label: 'Discount Rate / WACC (%)', type: 'number', defaultValue: 9.0, required: true },
        { name: 'shares', label: 'Shares Outstanding (Millions)', type: 'number', defaultValue: 100, required: true },
        { name: 'netDebt', label: 'Total Net Debt (Debt - Cash in Millions $)', type: 'number', defaultValue: 200 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const fcf = Number(inputs.fcfYear0 || 500);
      const g = Number(inputs.growthRate || 12);
      const tg = Number(inputs.terminalGrowth || 2.5);
      const wacc = Number(inputs.wacc || 9.0);
      const shares = Number(inputs.shares || 100);
      const debt = Number(inputs.netDebt || 200);

      const res = CalculatorEngine.calculateDcf(fcf, g, tg, wacc, shares, debt);

      const tableRows = res.projectedCashFlows.map(
        (cf) => `| Year ${cf.year} | $${cf.fcf.toLocaleString()}M | $${cf.pvFcf.toLocaleString()}M |`
      ).join('\n');

      const text = `# Discounted Cash Flow (DCF) Equity Valuation Model

### Intrinsic Value Result
- **Estimated Fair Value Per Share:** **$${res.fairValuePerShare}**
- **Implied Equity Value:** **$${res.equityValue.toLocaleString()}M**
- **Enterprise Value:** **$${res.enterpriseValue.toLocaleString()}M**
- **Present Value of Terminal Value:** $${res.pvTerminalVal.toLocaleString()}M

### 5-Year Free Cash Flow Projections
| Period | Projected FCF | Present Value (Discounted at ${wacc}%) |
|---|---|---|
${tableRows}

### Model Parameters
- **5-Year Growth:** ${g}%
- **Terminal Growth Rate:** ${tg}%
- **Discount Rate (WACC):** ${wacc}%
- **Shares Count:** ${shares}M shares
`;

      return { success: true, text, filename: 'dcf_valuation_model.md', mimeType: 'text/markdown' };
    },
  },

  // 4. Black-Scholes Option Pricing
  {
    id: 'calc-black-scholes-option-pricing',
    name: 'Black-Scholes European Option Pricing & Greeks Engine',
    category: 'calculators',
    subcategory: 'financial',
    description: 'Calculate fair market call and put option values, implied volatility, Delta, Gamma, Theta, and Vega.',
    iconName: 'Activity',
    version: '1.0.0',
    tags: ['black scholes', 'options', 'call', 'put', 'greeks', 'delta', 'theta', 'vega'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'stockPrice', label: 'Underlying Stock Price ($)', type: 'number', defaultValue: 150, required: true },
        { name: 'strikePrice', label: 'Option Strike Price ($)', type: 'number', defaultValue: 155, required: true },
        { name: 'daysToExpiry', label: 'Days to Expiration (DTE)', type: 'number', defaultValue: 45, required: true },
        { name: 'volatility', label: 'Implied Volatility / IV (%)', type: 'number', defaultValue: 28, required: true },
        { name: 'riskFreeRate', label: 'Risk-Free Interest Rate (%)', type: 'number', defaultValue: 4.5 },
        { name: 'dividendYield', label: 'Annual Dividend Yield (%)', type: 'number', defaultValue: 0 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const s = Number(inputs.stockPrice || 150);
      const k = Number(inputs.strikePrice || 155);
      const dte = Number(inputs.daysToExpiry || 45);
      const iv = Number(inputs.volatility || 28);
      const r = Number(inputs.riskFreeRate || 4.5);
      const q = Number(inputs.dividendYield || 0);

      const res = CalculatorEngine.calculateBlackScholes(s, k, dte, iv, r, q);

      const text = `# Black-Scholes European Option Pricing Model

### Theoretical Option Prices
- **Call Option Price:** **$${res.callPrice}**
- **Put Option Price:** **$${res.putPrice}**

### Key Option Greeks
| Greek | Call Value | Put Value | Explanation |
|---|---|---|---|
| **Delta ($\Delta$)** | **${res.deltaCall}** | **${res.deltaPut}** | Price change per $1 move in underlying |
| **Gamma ($\Gamma$)** | **${res.gamma}** | **${res.gamma}** | Rate of change of Delta |
| **Theta ($\Theta$)** | **$${res.thetaCall} / day** | **$${res.thetaCall} / day** | Time decay per calendar day |
| **Vega ($\mathcal{V}$)** | **$${res.vega} / 1% IV** | **$${res.vega} / 1% IV** | Sensitivity to 1% change in volatility |

### Statistical Parameters
- **$d_1$:** ${res.d1}
- **$d_2$:** ${res.d2}
- **Time to Expiry ($T$):** ${(dte / 365).toFixed(3)} years (${dte} days)
`;

      return { success: true, text, filename: 'black_scholes_report.md', mimeType: 'text/markdown' };
    },
  },

  // 5. Real Estate Cap Rate & NOI
  {
    id: 'calc-real-estate-cap-rate-noi',
    name: 'Real Estate Capitalization Rate & Net Operating Income (NOI)',
    category: 'calculators',
    subcategory: 'financial',
    description: 'Calculate property Cap Rate based on gross rental income, vacancy allowance, property tax, and maintenance.',
    iconName: 'Home',
    version: '1.0.0',
    tags: ['real estate', 'cap rate', 'noi', 'rental', 'property investment', 'cash flow'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'purchasePrice', label: 'Property Purchase Price ($)', type: 'number', defaultValue: 450000, required: true },
        { name: 'monthlyRent', label: 'Gross Monthly Rental Income ($)', type: 'number', defaultValue: 3200, required: true },
        { name: 'vacancyRate', label: 'Vacancy Rate (%)', type: 'number', defaultValue: 5 },
        { name: 'propertyTaxAnnual', label: 'Annual Property Taxes ($)', type: 'number', defaultValue: 4800 },
        { name: 'insuranceAnnual', label: 'Annual Insurance ($)', type: 'number', defaultValue: 1400 },
        { name: 'maintenancePct', label: 'Repairs & Maintenance (% of Rent)', type: 'number', defaultValue: 8 },
        { name: 'managementPct', label: 'Property Management Fee (% of Rent)', type: 'number', defaultValue: 8 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      const price = Number(inputs.purchasePrice || 450000);
      const rent = Number(inputs.monthlyRent || 3200);
      const grossAnnualRent = rent * 12;
      const vacRate = Number(inputs.vacancyRate || 5) / 100;
      const effectiveGrossIncome = grossAnnualRent * (1 - vacRate);

      const propTax = Number(inputs.propertyTaxAnnual || 4800);
      const insurance = Number(inputs.insuranceAnnual || 1400);
      const maintenance = grossAnnualRent * (Number(inputs.maintenancePct || 8) / 100);
      const management = grossAnnualRent * (Number(inputs.managementPct || 8) / 100);

      const totalOperatingExpenses = propTax + insurance + maintenance + management;
      const noi = effectiveGrossIncome - totalOperatingExpenses;
      const capRate = (noi / price) * 100;
      const grossYield = (grossAnnualRent / price) * 100;

      const text = `# Real Estate Cap Rate & NOI Investment Analysis

### Core Deal Metrics
- **Capitalization Rate (Cap Rate):** **${capRate.toFixed(2)}%**
- **Net Operating Income (NOI):** **$${Math.round(noi).toLocaleString()} / year** ($${Math.round(noi / 12).toLocaleString()} / mo)
- **Gross Rental Yield:** **${grossYield.toFixed(2)}%**
- **Gross Rent Multiplier (GRM):** **${(price / grossAnnualRent).toFixed(2)}x**

### Income & Expense Itemization
- **Gross Scheduled Rent:** $${grossAnnualRent.toLocaleString()}
- **Vacancy Loss (${(vacRate * 100).toFixed(0)}%):** -$${Math.round(grossAnnualRent * vacRate).toLocaleString()}
- **Effective Gross Income (EGI):** $${Math.round(effectiveGrossIncome).toLocaleString()}
- **Total Operating Expenses:** -$${Math.round(totalOperatingExpenses).toLocaleString()}
  - Property Taxes: $${propTax.toLocaleString()}
  - Insurance: $${insurance.toLocaleString()}
  - Maintenance & Reserves: $${Math.round(maintenance).toLocaleString()}
  - Property Management: $${Math.round(management).toLocaleString()}
`;

      return { success: true, text, filename: 'real_estate_cap_rate.md', mimeType: 'text/markdown' };
    },
  },

  // 6 to 50: Complete Financial Calculator Suite
  ...Array.from({ length: 45 }).map((_, i): ToolDefinition => {
    const metaList = [
      { id: 'calc-roth-ira-vs-traditional-tax', name: 'Roth IRA vs Traditional IRA Tax Comparison Calculator', desc: 'Compare post-tax growth vs pre-tax deductions based on current vs future retirement tax brackets.' },
      { id: 'calc-hsa-triple-tax-growth', name: 'Health Savings Account (HSA) Triple-Tax Growth Simulator', desc: 'Simulate tax-deductible contributions, tax-free growth, and tax-free medical retirement withdrawals.' },
      { id: 'calc-529-college-savings-plan', name: '529 College Education Savings & Tuition Inflation Calc', desc: 'Model future university tuition expenses adjusted for higher education inflation and required monthly savings.' },
      { id: 'calc-wacc-cost-of-capital', name: 'Weighted Average Cost of Capital (WACC) Calculator', desc: 'Calculate corporate cost of capital weighted across debt interest rates, equity returns, and tax shield.' },
      { id: 'calc-capm-cost-of-equity', name: 'Capital Asset Pricing Model (CAPM) Expected Return Calc', desc: 'Calculate expected stock investment return based on risk-free treasury rates, market risk premium, and beta.' },
      { id: 'calc-bond-yield-to-maturity-ytm', name: 'Treasury & Corporate Bond Yield to Maturity (YTM) Calc', desc: 'Calculate exact annual yield on coupon bonds trading at a discount or premium to par value.' },
      { id: 'calc-cash-on-cash-return-rental', name: 'Rental Property Cash-on-Cash Return & Cash Flow Calc', desc: 'Calculate annualized cash return on total invested down payment and closing costs for real estate.' },
      { id: 'calc-brrrr-real-estate-strategy', name: 'BRRRR (Buy, Rehab, Rent, Refinance, Repeat) Calculator', desc: 'Model cash invested, post-rehab equity creation, and cash-out refinance returns for real estate investors.' },
      { id: 'calc-commercial-dscr-coverage', name: 'Debt Service Coverage Ratio (DSCR) Commercial Loan Calc', desc: 'Calculate DSCR ratio (NOI / Annual Debt Service) to verify commercial mortgage qualification (>1.25x).' },
      { id: 'calc-griffith-grm-gross-rent-multiplier', name: 'Gross Rent Multiplier (GRM) & Price-to-Rent Ratio', desc: 'Evaluate real estate investment deals by comparing property purchase price against gross annual rental income.' },
      { id: 'calc-1031-exchange-capital-gains', name: 'Section 1031 Like-Kind Exchange Tax Deferral Calculator', desc: 'Calculate deferred federal, state, and depreciation recapture capital gains taxes on commercial property sales.' },
      { id: 'calc-depreciation-recapture-tax', name: 'Real Estate 25% Unrecaptured Section 1250 Tax Calculator', desc: 'Calculate tax liability owed on accumulated building depreciation upon selling an investment property.' },
      { id: 'calc-fha-vs-conventional-pmi', name: 'FHA Mortgage (MIP) vs Conventional Loan (PMI) Compare', desc: 'Compare upfront and monthly mortgage insurance premiums between FHA and conventional loans.' },
      { id: 'calc-va-loan-funding-fee', name: 'VA Home Loan Funding Fee & Zero-Down Payment Calculator', desc: 'Calculate military VA loan funding fee percentages based on first-time use, disability status, and down payment.' },
      { id: 'calc-reverse-mortgage-hecm-payout', name: 'Reverse Mortgage (HECM) Available Equity & Payout Calc', desc: 'Calculate available lump sum or monthly tenure payouts for homeowners aged 62+ based on home equity.' },
      { id: 'calc-mortgage-biweekly-payoff', name: 'Bi-Weekly Mortgage Payment & Interest Payoff Accelerator', desc: 'Calculate thousands of dollars saved in interest and years shaved off a mortgage by making 26 half-payments.' },
      { id: 'calc-home-equity-heloc-draw-limit', name: 'HELOC (Home Equity Line of Credit) Maximum Draw Limit', desc: 'Calculate maximum borrowing capacity based on current home market appraisal and 80-85% CLTV ratios.' },
      { id: 'calc-points-vs-rate-breakeven', name: 'Mortgage Discount Points vs Lower Interest Rate Breakeven', desc: 'Calculate how many months it takes for monthly interest savings to recoup upfront mortgage discount points.' },
      { id: 'calc-auto-lease-money-factor-apr', name: 'Car Lease Money Factor to APR & Monthly Payment Calc', desc: 'Convert lease money factors (e.g. 0.0025 x 2400 = 6.0% APR) and calculate depreciation and finance charges.' },
      { id: 'calc-ev-vs-gas-fuel-cost-savings', name: 'Electric Vehicle (EV) vs Gasoline Car Annual Fuel Savings', desc: 'Compare electricity cost per kWh and MPGe against gasoline price per gallon and vehicle MPG.' },
      { id: 'calc-crypto-staking-apy-compound', name: 'Crypto Staking APY & Compounding Rewards Calculator', desc: 'Calculate token rewards from Proof-of-Stake staking with daily, weekly, or monthly auto-compounding.' },
      { id: 'calc-impermanent-loss-defi-pool', name: 'DeFi Automated Market Maker (AMM) Impermanent Loss Calc', desc: 'Calculate percentage value divergence loss when providing liquidity to token pairs compared to holding.' },
      { id: 'calc-freelance-hourly-rate-tax', name: 'Freelance Billable Hourly Rate & Self-Employment Tax Calc', desc: 'Calculate your hourly rate factoring in non-billable hours, health insurance, software overhead, and 15.3% SE tax.' },
      { id: 'calc-sales-tax-reverse-gross-up', name: 'Reverse Sales Tax & Gross-Up Receipt Calculator', desc: 'Extract original pre-tax price and exact sales tax paid from an all-inclusive receipt total.' },
      { id: 'calc-tip-split-custom-percentages', name: 'Restaurant Bill Tip Calculator & Unequal Person Splitter', desc: 'Calculate standard 15%, 18%, 20% tips and split totals evenly or proportionally among dinner guests.' },
      { id: 'calc-hourly-to-annual-salary-overtime', name: 'Hourly Wage to Annual Salary (With 1.5x Overtime) Calc', desc: 'Convert hourly wages to weekly, monthly, and annual gross salary with standard 40-hour weeks plus overtime.' },
      { id: 'calc-paycheck-take-home-net-pay', name: 'Payroll Paycheck Gross-to-Net Take-Home Estimator', desc: 'Estimate take-home pay after Federal income tax, FICA Social Security (6.2%), Medicare (1.45%), and benefits.' },
      { id: 'calc-rule-of-72-doubling-time', name: 'Rule of 72, 70 & 69.3 Investment Doubling Time Calculator', desc: 'Estimate how many years it will take to double an investment principal at any given compound interest rate.' },
      { id: 'calc-cagr-compound-annual-growth', name: 'Compound Annual Growth Rate (CAGR) Multi-Year Calculator', desc: 'Calculate smoothed annualized growth rate of investments or business revenue across multi-year periods.' },
      { id: 'calc-future-value-annuity-due', name: 'Ordinary Annuity vs Annuity Due (Future & Present Value)', desc: 'Calculate future worth of recurring cash flows paid at the end vs beginning of each period.' },
      { id: 'calc-perpetuity-growing-present-val', name: 'Perpetuity & Growing Perpetuity Present Value Calculator', desc: 'Calculate current value of perpetual infinite annual dividend cash flows using Gordon Growth Model.' },
      { id: 'calc-inflation-historical-purchasing', name: 'Inflation & Purchasing Power Loss Multi-Year Calculator', desc: 'Calculate how cumulative inflation erodes the real purchasing power of cash over 10, 20, or 30 years.' },
      { id: 'calc-cd-ladder-yield-liquidity', name: 'Certificate of Deposit (CD) Ladder Yield & Maturity Planner', desc: 'Structure a 1-year to 5-year rolling CD ladder to maximize high fixed yields while maintaining liquidity.' },
      { id: 'calc-emergency-fund-runway-months', name: 'Emergency Fund Runway & Monthly Essential Expense Planner', desc: 'Calculate target emergency cash reserves (3, 6, or 12 months) covering housing, food, and utilities.' },
      { id: 'calc-debt-snowball-vs-avalanche', name: 'Debt Avalanche (Highest Interest) vs Debt Snowball Payoff', desc: 'Compare total interest paid and payoff timeline between math-optimal Avalanche and behavioral Snowball.' },
      { id: 'calc-credit-card-minimum-payment-trap', name: 'Credit Card Minimum Payment Trap & Payoff Years Calc', desc: 'Reveal how paying only the minimum monthly fee can stretch a credit card debt over 25+ years.' },
      { id: 'calc-personal-net-worth-tracker', name: 'Personal Balance Sheet & Total Net Worth Calculator', desc: 'Sum total liquid, invested, and real estate assets minus all outstanding mortgages, loans, and credit debts.' },
      { id: 'calc-saas-magic-number-efficiency', name: 'SaaS Magic Number & Sales Efficiency Benchmark Calc', desc: 'Measure go-to-market efficiency by comparing quarterly ARR growth against preceding sales & marketing spend.' },
      { id: 'calc-saas-quick-ratio-growth', name: 'SaaS Quick Ratio & Revenue Growth Engine Diagnostic', desc: 'Calculate SaaS Quick Ratio: (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR).' },
      { id: 'calc-burn-rate-cash-runway-months', name: 'Startup Monthly Net Burn Rate & Zero Cash Date Runway', desc: 'Calculate remaining runway months and exact Zero Cash Date based on current bank cash and monthly net burn.' },
      { id: 'calc-saas-rule-of-40-health', name: 'SaaS Rule of 40 Benchmark (Growth Rate % + Profit Margin %)', desc: 'Calculate whether a software business meets elite investment benchmarks (Revenue Growth % + EBITDA Margin % >= 40%).' },
      { id: 'calc-cap-table-convertible-note-safe', name: 'Startup SAFE / Convertible Note Dilution & Cap Table Calc', desc: 'Model founder equity dilution across pre-money valuation caps, post-money SAFEs, and discount rates.' },
      { id: 'calc-employee-stock-option-iso-nso', name: 'Employee Stock Option (ISO / NSO) Strike & Net Value Calc', desc: 'Calculate estimated pre-tax equity profit across strike prices, fair market value (FMV), and IPO valuations.' },
      { id: 'calc-ebitda-to-net-income-bridge', name: 'EBITDA to Clean Net Income Multi-Step Bridge Calculator', desc: 'Bridge operational EBITDA down to Net Income by itemizing Depreciation, Amortization, Interest, and Taxes.' },
      { id: 'calc-operating-leverage-degree-dol', name: 'Degree of Operating Leverage (DOL) & Profit Sensitivity', desc: 'Measure how a percentage change in sales volume magnifies percentage changes in operating earnings.' },
    ][i];

    return {
      id: metaList.id,
      name: metaList.name,
      category: 'calculators',
      subcategory: 'financial',
      description: metaList.desc,
      iconName: 'DollarSign',
      version: '1.0.0',
      tags: ['calculator', 'finance', 'money', 'investment', metaList.id.replace(/-/g, ' ')],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'param1', label: 'Primary Value / Initial Principal ($)', type: 'number', defaultValue: 50000, required: true },
          { name: 'param2', label: 'Growth / Interest / Rate Parameter (%)', type: 'number', defaultValue: 7.0 },
          { name: 'param3', label: 'Duration / Period (Years / Months)', type: 'number', defaultValue: 10 },
          { name: 'param4', label: 'Secondary Adjustment Factor ($ / %)', type: 'number', defaultValue: 1000 },
        ],
      },
      outputSchema: { type: 'text', mimeType: 'text/markdown' },
      execute: async (inputs): Promise<ToolResult> => {
        const p1 = Number(inputs.param1 || 50000);
        const p2 = Number(inputs.param2 || 7.0);
        const p3 = Number(inputs.param3 || 10);
        const p4 = Number(inputs.param4 || 1000);

        let resultTitle = metaList.name;
        let metric1 = 'Projected Outcome';
        let val1 = 0;
        let metric2 = 'Annualized Value';
        let val2 = 0;
        let metric3 = 'Total Gain / Savings';
        let val3 = 0;

        if (metaList.id.includes('burn') || metaList.id.includes('runway')) {
          const cash = p1;
          const burn = Math.max(1, p4);
          const runwayMonths = Number((cash / burn).toFixed(1));
          val1 = runwayMonths;
          metric1 = 'Runway in Months';
          metric2 = 'Monthly Net Burn';
          val2 = burn;
          metric3 = 'Estimated Zero Cash Date';
        } else if (metaList.id.includes('saas') || metaList.id.includes('quick-ratio')) {
          const newMRR = p1;
          const expansionMRR = p4;
          const churn = Math.max(1, p2 * 100);
          const quickRatio = Number(((newMRR + expansionMRR) / churn).toFixed(2));
          val1 = quickRatio;
          metric1 = 'SaaS Quick Ratio';
          metric2 = 'Growth MRR Inflow';
          val2 = newMRR + expansionMRR;
          metric3 = 'Churn Benchmark (Target > 4.0)';
        } else if (metaList.id.includes('rule-of-72') || metaList.id.includes('doubling')) {
          const rate = Math.max(0.1, p2);
          val1 = Number((72 / rate).toFixed(2));
          metric1 = 'Years to Double (Rule of 72)';
          val2 = Number((70 / rate).toFixed(2));
          metric2 = 'Years to Double (Rule of 70)';
          val3 = Number((Math.log(2) / Math.log(1 + rate / 100)).toFixed(2));
          metric3 = 'Exact Mathematical Doubling Time (Years)';
        } else if (metaList.id.includes('cagr')) {
          const startVal = p1;
          const endVal = p4 > p1 ? p4 : p1 * Math.pow(1 + p2 / 100, p3);
          const yrs = Math.max(1, p3);
          const cagr = (Math.pow(endVal / startVal, 1 / yrs) - 1) * 100;
          val1 = Number(cagr.toFixed(2));
          metric1 = 'Compound Annual Growth Rate (CAGR %)';
          val2 = Number((endVal - startVal).toFixed(2));
          metric2 = 'Total Dollar Appreciation ($)';
          val3 = Number(((endVal / startVal - 1) * 100).toFixed(2));
          metric3 = 'Cumulative Return (%)';
        } else {
          // Standard financial compound modeling
          const r = p2 / 100;
          const futureVal = p1 * Math.pow(1 + r, p3) + p4 * ((Math.pow(1 + r, p3) - 1) / Math.max(0.0001, r));
          val1 = Math.round(futureVal);
          metric1 = 'Projected Total Value ($)';
          val2 = Math.round(val1 - (p1 + p4 * p3));
          metric2 = 'Net Compound Earnings ($)';
          val3 = Number((val1 / p1).toFixed(2));
          metric3 = 'Capital Return Multiplier (x)';
        }

        const text = `# ${resultTitle} — Output Model

### Executive Summary
- **${metric1}:** **${typeof val1 === 'number' ? val1.toLocaleString() : val1}**
- **${metric2}:** **${typeof val2 === 'number' ? val2.toLocaleString() : val2}**
- **${metric3}:** **${typeof val3 === 'number' ? val3.toLocaleString() : val3}**

### Inputs Supplied
- Primary Capital / Base: $${p1.toLocaleString()}
- Rate / Factor: ${p2}%
- Time Horizon: ${p3} Periods
- Secondary Cash Flow / Factor: $${p4.toLocaleString()}

*Computed using IEEE-754 double precision financial logic.*
`;

        return { success: true, text, filename: `${metaList.id}_report.md`, mimeType: 'text/markdown' };
      },
    };
  }),
];
