import { CalculatorDefinition, CalculatorResult } from '../types';

export const financeCalculators: CalculatorDefinition[] = [
  // 1. Mortgage Calculator
  {
    id: 'mortgage-calculator',
    name: 'Mortgage Payment Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate monthly mortgage payments including principal, interest, property taxes, and home insurance.',
    iconName: 'Home',
    tags: ['mortgage', 'home loan', 'amortization', 'finance', 'real estate', 'interest'],
    inputs: [
      { id: 'homePrice', label: 'Home Purchase Price', type: 'number', defaultValue: 400000, min: 1000, step: 1000, prefix: '$' },
      { id: 'downPayment', label: 'Down Payment Amount', type: 'number', defaultValue: 80000, min: 0, step: 1000, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'number', defaultValue: 6.5, min: 0.01, max: 25, step: 0.1, suffix: '%' },
      { id: 'loanTermYears', label: 'Loan Term', type: 'select', defaultValue: 30, options: [{ label: '15 Years', value: 15 }, { label: '20 Years', value: 20 }, { label: '30 Years', value: 30 }] },
      { id: 'annualPropertyTax', label: 'Annual Property Tax', type: 'number', defaultValue: 4800, min: 0, step: 100, prefix: '$' },
      { id: 'annualHomeInsurance', label: 'Annual Homeowners Insurance', type: 'number', defaultValue: 1500, min: 0, step: 50, prefix: '$' },
    ],
    calculate: (inputs): CalculatorResult => {
      const homePrice = Number(inputs.homePrice) || 400000;
      const downPayment = Number(inputs.downPayment) || 0;
      const principal = Math.max(0, homePrice - downPayment);
      const annualRate = (Number(inputs.interestRate) || 6.5) / 100;
      const termYears = Number(inputs.loanTermYears) || 30;
      const monthlyRate = annualRate / 12;
      const totalMonths = termYears * 12;
      const monthlyTax = (Number(inputs.annualPropertyTax) || 0) / 12;
      const monthlyInsurance = (Number(inputs.annualHomeInsurance) || 0) / 12;

      let monthlyPI = 0;
      if (monthlyRate === 0) {
        monthlyPI = principal / totalMonths;
      } else {
        monthlyPI = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      }

      const totalMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance;
      const totalInterest = monthlyPI * totalMonths - principal;
      const totalLoanCost = principal + totalInterest + (monthlyTax + monthlyInsurance) * totalMonths;

      return {
        success: true,
        primary: { label: 'Total Monthly Payment', value: `$${totalMonthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, unit: '/month' },
        metrics: [
          { label: 'Principal & Interest', value: `$${monthlyPI.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, subtext: `${termYears}-year fixed` },
          { label: 'Total Interest Paid', value: `$${Math.round(totalInterest).toLocaleString('en-US')}`, subtext: 'Over life of loan', isHighlight: true },
          { label: 'Loan Principal', value: `$${principal.toLocaleString('en-US')}`, subtext: `${((downPayment / homePrice) * 100).toFixed(1)}% down` },
          { label: 'Total Overall Cost', value: `$${Math.round(totalLoanCost).toLocaleString('en-US')}`, subtext: 'Includes taxes & insurance' },
        ],
        breakdownTitle: 'Monthly Payment Allocation',
        breakdownRows: [
          { label: 'Principal & Interest', value: `$${monthlyPI.toFixed(2)}`, percentage: Math.round((monthlyPI / totalMonthlyPayment) * 100) },
          { label: 'Property Taxes', value: `$${monthlyTax.toFixed(2)}`, percentage: Math.round((monthlyTax / totalMonthlyPayment) * 100) },
          { label: 'Home Insurance', value: `$${monthlyInsurance.toFixed(2)}`, percentage: Math.round((monthlyInsurance / totalMonthlyPayment) * 100) },
        ],
        interpretation: `A $${homePrice.toLocaleString()} home with $${downPayment.toLocaleString()} down leaves a $${principal.toLocaleString()} mortgage. At ${Number(inputs.interestRate)}% over ${termYears} years, your pure debt service is $${monthlyPI.toFixed(2)}/mo.`,
        formulaExplanation: 'M = P · [r(1 + r)^n] / [(1 + r)^n - 1] where P is principal, r is monthly rate, and n is total months.',
        exampleCalculation: '$320,000 borrowed at 6.5% for 30 years yields $2,022.62 monthly P&I, plus taxes ($400) and insurance ($125) = $2,547.62/month.',
      };
    },
    seo: {
      title: 'Mortgage Payment Calculator - P&I, Taxes, Insurance',
      metaDescription: 'Free online mortgage payment calculator. Accurate estimates for monthly P&I, property taxes, homeowners insurance, and total interest.',
      keywords: ['mortgage calculator', 'monthly mortgage payment', 'home loan calculator', 'amortization'],
    },
    howTo: [
      { step: 1, title: 'Enter Home Price', description: 'Input total target purchase price of the property.' },
      { step: 2, title: 'Add Down Payment', description: 'Specify how much cash down payment you will provide.' },
      { step: 3, title: 'Choose Loan Term & Rate', description: 'Select 15, 20, or 30-year fixed term and current market interest rate.' },
      { step: 4, title: 'Include Escrow', description: 'Optionally include annual property tax and insurance for a complete monthly payment estimate.' },
    ],
  },

  // 2. Compound Interest Calculator
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate investment growth over time with compound interest and recurring monthly contributions.',
    iconName: 'TrendingUp',
    tags: ['compound interest', 'investing', 'savings', 'wealth', 'future value'],
    inputs: [
      { id: 'initialPrincipal', label: 'Initial Deposit', type: 'number', defaultValue: 10000, min: 0, step: 500, prefix: '$' },
      { id: 'monthlyDeposit', label: 'Monthly Contribution', type: 'number', defaultValue: 500, min: 0, step: 50, prefix: '$' },
      { id: 'annualRate', label: 'Estimated Annual Interest Rate', type: 'number', defaultValue: 8, min: 0.1, max: 50, step: 0.1, suffix: '%' },
      { id: 'years', label: 'Investment Timeframe', type: 'number', defaultValue: 20, min: 1, max: 60, step: 1, suffix: 'Years' },
      { id: 'compoundFreq', label: 'Compound Frequency', type: 'select', defaultValue: 12, options: [{ label: 'Annually', value: 1 }, { label: 'Quarterly', value: 4 }, { label: 'Monthly', value: 12 }, { label: 'Daily', value: 365 }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const P = Number(inputs.initialPrincipal) || 0;
      const PMT = Number(inputs.monthlyDeposit) || 0;
      const r = (Number(inputs.annualRate) || 8) / 100;
      const t = Number(inputs.years) || 20;
      const n = Number(inputs.compoundFreq) || 12;

      // Future value of initial lump sum
      const fvPrincipal = P * Math.pow(1 + r / n, n * t);

      // Future value of monthly contributions (annualized compounding adjustment)
      const monthlyRate = r / 12;
      const totalMonths = t * 12;
      let fvContributions = 0;
      if (monthlyRate > 0) {
        fvContributions = PMT * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
      } else {
        fvContributions = PMT * totalMonths;
      }

      const totalBalance = fvPrincipal + fvContributions;
      const totalContributed = P + PMT * totalMonths;
      const totalInterest = Math.max(0, totalBalance - totalContributed);

      return {
        success: true,
        primary: { label: 'Total Future Balance', value: `$${Math.round(totalBalance).toLocaleString('en-US')}` },
        metrics: [
          { label: 'Total Principal Invested', value: `$${Math.round(totalContributed).toLocaleString('en-US')}`, subtext: 'Your contributions' },
          { label: 'Total Interest Earned', value: `$${Math.round(totalInterest).toLocaleString('en-US')}`, subtext: `${Math.round((totalInterest / totalBalance) * 100)}% of total balance`, isHighlight: true },
          { label: 'Growth Multiplier', value: `${(totalBalance / Math.max(1, totalContributed)).toFixed(2)}x`, subtext: 'Return on invested capital' },
          { label: 'Years of Growth', value: `${t} Years`, subtext: `${n}x compounding/yr` },
        ],
        breakdownTitle: 'Capital vs Interest Breakdown',
        breakdownRows: [
          { label: 'Principal Invested', value: `$${Math.round(totalContributed).toLocaleString()}`, percentage: Math.round((totalContributed / totalBalance) * 100) },
          { label: 'Compound Growth Earned', value: `$${Math.round(totalInterest).toLocaleString()}`, percentage: Math.round((totalInterest / totalBalance) * 100) },
        ],
        interpretation: `By investing $${PMT}/month starting with $${P.toLocaleString()} at ${Number(inputs.annualRate)}% interest, your money compounds to $${Math.round(totalBalance).toLocaleString()} in ${t} years.`,
        formulaExplanation: 'A = P(1 + r/n)^(nt) + PMT × [((1 + r/12)^(12t) - 1) / (r/12)]',
        exampleCalculation: '$10,000 initial + $500/mo at 8% for 20 years yields $345,694 total value ($215,694 in pure compound growth).',
      };
    },
    seo: {
      title: 'Compound Interest Calculator - Future Investment Value',
      metaDescription: 'Calculate compound interest and future investment growth with custom contributions and compounding frequency.',
      keywords: ['compound interest calculator', 'investment calculator', 'future value', 'savings growth'],
    },
    howTo: [
      { step: 1, title: 'Enter Initial Deposit', description: 'Input your initial investment or current portfolio value.' },
      { step: 2, title: 'Set Monthly Contribution', description: 'Enter how much you plan to deposit every month.' },
      { step: 3, title: 'Set Expected Return', description: 'Enter an estimated annual interest or index fund return rate.' },
      { step: 4, title: 'Select Horizon', description: 'Choose the number of years you plan to keep compounding.' },
    ],
  },

  // 3. Auto Loan Calculator
  {
    id: 'auto-loan-calculator',
    name: 'Auto Loan & Car Payment Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate monthly auto loan payments factoring in vehicle purchase price, down payment, trade-in value, and sales tax.',
    iconName: 'Car',
    tags: ['auto loan', 'car payment', 'vehicle financing', 'trade-in', 'car loan'],
    inputs: [
      { id: 'vehiclePrice', label: 'Vehicle Purchase Price', type: 'number', defaultValue: 35000, min: 1000, step: 500, prefix: '$' },
      { id: 'downPayment', label: 'Cash Down Payment', type: 'number', defaultValue: 5000, min: 0, step: 500, prefix: '$' },
      { id: 'tradeInValue', label: 'Trade-in Allowance', type: 'number', defaultValue: 2000, min: 0, step: 250, prefix: '$' },
      { id: 'salesTaxRate', label: 'Sales Tax Rate', type: 'number', defaultValue: 6.5, min: 0, max: 20, step: 0.1, suffix: '%' },
      { id: 'interestRate', label: 'Interest Rate (APR)', type: 'number', defaultValue: 5.9, min: 0.1, max: 30, step: 0.1, suffix: '%' },
      { id: 'loanTermMonths', label: 'Loan Term', type: 'select', defaultValue: 60, options: [{ label: '36 Months (3 Years)', value: 36 }, { label: '48 Months (4 Years)', value: 48 }, { label: '60 Months (5 Years)', value: 60 }, { label: '72 Months (6 Years)', value: 72 }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const price = Number(inputs.vehiclePrice) || 35000;
      const down = Number(inputs.downPayment) || 0;
      const trade = Number(inputs.tradeInValue) || 0;
      const taxRate = (Number(inputs.salesTaxRate) || 0) / 100;
      const apr = (Number(inputs.interestRate) || 5.9) / 100;
      const termMonths = Number(inputs.loanTermMonths) || 60;

      const taxableAmount = Math.max(0, price - trade);
      const salesTax = taxableAmount * taxRate;
      const loanAmount = Math.max(0, price + salesTax - down - trade);
      const monthlyRate = apr / 12;

      let monthlyPayment = 0;
      if (monthlyRate === 0) {
        monthlyPayment = loanAmount / termMonths;
      } else {
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
      }

      const totalPayments = monthlyPayment * termMonths;
      const totalInterest = Math.max(0, totalPayments - loanAmount);
      const totalCostOfVehicle = down + trade + totalPayments;

      return {
        success: true,
        primary: { label: 'Monthly Car Payment', value: `$${monthlyPayment.toFixed(2)}`, unit: '/mo' },
        metrics: [
          { label: 'Amount Financed', value: `$${Math.round(loanAmount).toLocaleString()}`, subtext: 'Total loan principal' },
          { label: 'Total Interest Paid', value: `$${Math.round(totalInterest).toLocaleString()}`, subtext: `Over ${termMonths} months`, isHighlight: true },
          { label: 'Sales Tax Due', value: `$${Math.round(salesTax).toLocaleString()}`, subtext: `${(taxRate * 100).toFixed(1)}% tax on net price` },
          { label: 'Total Out-of-Pocket Cost', value: `$${Math.round(totalCostOfVehicle).toLocaleString()}`, subtext: 'Vehicle + tax + financing' },
        ],
        breakdownTitle: 'Vehicle Financing Breakdown',
        breakdownRows: [
          { label: 'Vehicle Net Cost', value: `$${(price - down - trade).toLocaleString()}` },
          { label: 'State/Local Sales Tax', value: `$${Math.round(salesTax).toLocaleString()}` },
          { label: 'Finance Interest Cost', value: `$${Math.round(totalInterest).toLocaleString()}` },
        ],
        interpretation: `Financing $${Math.round(loanAmount).toLocaleString()} at ${(apr * 100).toFixed(1)}% APR over ${termMonths} months costs $${monthlyPayment.toFixed(2)} per month.`,
        formulaExplanation: 'PMT = Loan × [r(1+r)^n] / [(1+r)^n - 1] where Loan = (Price + Sales Tax - Down - Trade-in).',
        exampleCalculation: '$35,000 car with $5k down and $2k trade-in at 5.9% for 60 months results in a $583.56/month payment.',
      };
    },
    seo: {
      title: 'Auto Loan Calculator - Monthly Car Payment & Financing',
      metaDescription: 'Free auto loan calculator. Accurately calculate monthly car payments with trade-in value, down payment, sales tax, and loan term.',
      keywords: ['auto loan calculator', 'car payment calculator', 'car financing', 'vehicle loan'],
    },
    howTo: [
      { step: 1, title: 'Enter Vehicle Price', description: 'Input the negotiated selling price of the car.' },
      { step: 2, title: 'Deduct Down Payment & Trade-In', description: 'Enter any upfront cash down and agreed dealer trade-in credit.' },
      { step: 3, title: 'Apply Taxes & APR', description: 'Provide local sales tax percentage and auto loan financing rate.' },
      { step: 4, title: 'Select Loan Term', description: 'Pick term length from 36 to 72 months to view your monthly installment.' },
    ],
  },

  // 4. Credit Card Payoff Calculator
  {
    id: 'credit-card-payoff-calculator',
    name: 'Credit Card Payoff Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate how long it takes to become debt-free and how much interest you can save by paying more than the minimum.',
    iconName: 'CreditCard',
    tags: ['credit card', 'debt payoff', 'interest savings', 'debt snowball', 'apr'],
    inputs: [
      { id: 'balance', label: 'Current Credit Card Balance', type: 'number', defaultValue: 6000, min: 100, step: 100, prefix: '$' },
      { id: 'apr', label: 'Credit Card APR', type: 'number', defaultValue: 21.5, min: 1, max: 40, step: 0.1, suffix: '%' },
      { id: 'monthlyPayment', label: 'Planned Monthly Payment', type: 'number', defaultValue: 250, min: 15, step: 10, prefix: '$' },
    ],
    calculate: (inputs): CalculatorResult => {
      const balance = Number(inputs.balance) || 6000;
      const apr = (Number(inputs.apr) || 21.5) / 100;
      const monthlyPayment = Number(inputs.monthlyPayment) || 250;
      const monthlyRate = apr / 12;

      const monthlyInterestFirst = balance * monthlyRate;
      if (monthlyPayment <= monthlyInterestFirst) {
        return {
          success: false,
          error: `Monthly payment of $${monthlyPayment} is less than or equal to monthly interest ($${monthlyInterestFirst.toFixed(2)}). You will never pay off this debt at this rate.`,
          primary: { label: 'Time to Payoff', value: 'Infinite' },
          metrics: [
            { label: 'Minimum Required to Reduce Principal', value: `$${(monthlyInterestFirst + 1).toFixed(2)}/mo` },
          ],
        };
      }

      let currentBal = balance;
      let months = 0;
      let totalInterest = 0;

      while (currentBal > 0 && months < 600) {
        const interest = currentBal * monthlyRate;
        totalInterest += interest;
        const principal = monthlyPayment - interest;
        currentBal -= principal;
        months++;
      }

      const years = (months / 12).toFixed(1);
      const totalPaid = balance + totalInterest;

      return {
        success: true,
        primary: { label: 'Debt-Free Timeline', value: `${months} Months`, unit: `(~${years} yrs)` },
        metrics: [
          { label: 'Total Interest Paid', value: `$${Math.round(totalInterest).toLocaleString()}`, subtext: 'Cost of borrowing', isHighlight: true },
          { label: 'Total Amount Repaid', value: `$${Math.round(totalPaid).toLocaleString()}`, subtext: 'Principal + interest' },
          { label: 'Monthly Payment', value: `$${monthlyPayment.toFixed(2)}/mo`, subtext: `APR ${Number(inputs.apr)}%` },
          { label: 'Starting Balance', value: `$${balance.toLocaleString()}`, subtext: 'Current revolving balance' },
        ],
        breakdownTitle: 'Cost Breakdown',
        breakdownRows: [
          { label: 'Original Principal Debt', value: `$${balance.toLocaleString()}`, percentage: Math.round((balance / totalPaid) * 100) },
          { label: 'Finance Charge (Interest)', value: `$${Math.round(totalInterest).toLocaleString()}`, percentage: Math.round((totalInterest / totalPaid) * 100) },
        ],
        interpretation: `By paying $${monthlyPayment}/month, you eliminate your $${balance.toLocaleString()} credit card balance in ${months} months, paying $${Math.round(totalInterest).toLocaleString()} in total interest.`,
        formulaExplanation: 'Balance_(t+1) = Balance_t × (1 + APR/12) - Payment each month until balance reaches zero.',
        exampleCalculation: 'Paying $250/mo on a $6,000 balance at 21.5% APR pays off in 33 months with $1,971 in total interest.',
      };
    },
    seo: {
      title: 'Credit Card Payoff Calculator - Debt-Free Timeline',
      metaDescription: 'Calculate how quickly you can pay off credit card debt, total interest charges, and the savings of paying higher monthly amounts.',
      keywords: ['credit card payoff calculator', 'credit card interest', 'debt payoff', 'eliminate credit debt'],
    },
    howTo: [
      { step: 1, title: 'Enter Balance', description: 'Provide the current statement balance of your credit card.' },
      { step: 2, title: 'Enter Card APR', description: 'Input your card annual percentage rate from your monthly statement.' },
      { step: 3, title: 'Specify Monthly Payment', description: 'Set your targeted monthly payment amount above the minimum.' },
      { step: 4, title: 'View Payoff Schedule', description: 'See exactly how many months until zero balance and total interest.' },
    ],
  },

  // 5. Retirement Savings & FIRE Calculator
  {
    id: 'retirement-fire-calculator',
    name: 'Retirement & FIRE Number Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate your retirement nest egg requirement, FIRE target, and projected portfolio at retirement age.',
    iconName: 'PiggyBank',
    tags: ['retirement', 'FIRE', 'financial independence', 'nest egg', 'pension', '401k'],
    inputs: [
      { id: 'currentAge', label: 'Current Age', type: 'number', defaultValue: 32, min: 18, max: 80, step: 1, suffix: 'Years' },
      { id: 'retirementAge', label: 'Target Retirement Age', type: 'number', defaultValue: 60, min: 25, max: 90, step: 1, suffix: 'Years' },
      { id: 'annualExpenses', label: 'Desired Annual Retirement Income', type: 'number', defaultValue: 60000, min: 10000, step: 5000, prefix: '$' },
      { id: 'currentSavings', label: 'Current Retirement Savings', type: 'number', defaultValue: 75000, min: 0, step: 5000, prefix: '$' },
      { id: 'monthlyContribution', label: 'Monthly Savings / 401(k)', type: 'number', defaultValue: 800, min: 0, step: 50, prefix: '$' },
      { id: 'expectedReturn', label: 'Expected Annual Portfolio Return', type: 'number', defaultValue: 7, min: 1, max: 15, step: 0.5, suffix: '%' },
      { id: 'swr', label: 'Safe Withdrawal Rate (SWR)', type: 'number', defaultValue: 4, min: 2.5, max: 6, step: 0.1, suffix: '%' },
    ],
    calculate: (inputs): CalculatorResult => {
      const currentAge = Number(inputs.currentAge) || 32;
      const retAge = Number(inputs.retirementAge) || 60;
      const annualSpend = Number(inputs.annualExpenses) || 60000;
      const currentSavings = Number(inputs.currentSavings) || 0;
      const monthlySave = Number(inputs.monthlyContribution) || 0;
      const r = (Number(inputs.expectedReturn) || 7) / 100;
      const swrRate = (Number(inputs.swr) || 4) / 100;

      const yearsToGrow = Math.max(1, retAge - currentAge);
      const fireTarget = annualSpend / swrRate;

      // Project portfolio at retirement age
      let balance = currentSavings;
      for (let y = 1; y <= yearsToGrow; y++) {
        balance = balance * (1 + r) + monthlySave * 12;
      }

      const surplus = balance - fireTarget;
      const fundedPercent = Math.min(200, Math.round((balance / fireTarget) * 100));

      return {
        success: true,
        primary: { label: 'Target FIRE Nest Egg', value: `$${Math.round(fireTarget).toLocaleString()}` },
        metrics: [
          { label: 'Projected Portfolio at Retirement', value: `$${Math.round(balance).toLocaleString()}`, subtext: `At age ${retAge}`, isHighlight: true },
          { label: 'Retirement Goal Status', value: surplus >= 0 ? `Fully Funded (+${Math.round(surplus).toLocaleString()})` : `Shortfall ($${Math.abs(Math.round(surplus)).toLocaleString()})`, badge: surplus >= 0 ? 'On Track' : 'Needs Boost' },
          { label: 'Years to Retirement', value: `${yearsToGrow} Years`, subtext: `From age ${currentAge} to ${retAge}` },
          { label: 'Annual Safe Income', value: `$${Math.round(annualSpend).toLocaleString()}/yr`, subtext: `${(swrRate * 100).toFixed(1)}% Safe Withdrawal Rate` },
        ],
        breakdownTitle: 'FIRE Funding Progress',
        breakdownRows: [
          { label: 'Target Portfolio (Rule of 25)', value: `$${Math.round(fireTarget).toLocaleString()}`, percentage: 100 },
          { label: 'Projected Value at Retirement', value: `$${Math.round(balance).toLocaleString()}`, percentage: fundedPercent },
        ],
        interpretation: `To sustain $${annualSpend.toLocaleString()}/year at a ${(swrRate * 100).toFixed(1)}% safe withdrawal rate, you need $${Math.round(fireTarget).toLocaleString()}. At age ${retAge}, your projected portfolio is $${Math.round(balance).toLocaleString()} (${fundedPercent}% of goal).`,
        formulaExplanation: 'FIRE Target = Annual Expenses / Safe Withdrawal Rate. Future Balance = PV(1+r)^t + PMT × [((1+r)^t - 1)/r].',
        exampleCalculation: '$60,000 annual spend / 0.04 (4% rule) = $1,500,000 target. Compounding $75k + $800/mo over 28 yrs at 7% projects to $1,288,574.',
      };
    },
    seo: {
      title: 'Retirement & FIRE Calculator - Financial Independence Target',
      metaDescription: 'Free FIRE and retirement calculator. Calculate your target retirement nest egg, safe withdrawal rate, and savings timeline.',
      keywords: ['retirement calculator', 'fire calculator', 'financial independence', '401k calculator', 'safe withdrawal rate'],
    },
    howTo: [
      { step: 1, title: 'Set Age Milestones', description: 'Enter current age and targeted retirement age.' },
      { step: 2, title: 'Specify Retirement Spending', description: 'Input your desired annual living expenses during retirement.' },
      { step: 3, title: 'Enter Current Savings & Deposits', description: 'Add your starting retirement balance and monthly contribution.' },
      { step: 4, title: 'Review FIRE Readiness', description: 'Examine your target nest egg and projected portfolio balance.' },
    ],
  },

  // 6. Investment ROI Calculator
  {
    id: 'investment-roi-calculator',
    name: 'Return on Investment (ROI) Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate total Return on Investment (ROI), net profit, and Compound Annual Growth Rate (CAGR).',
    iconName: 'BadgeDollarSign',
    tags: ['roi', 'return on investment', 'cagr', 'profitability', 'capital gains'],
    inputs: [
      { id: 'initialInvestment', label: 'Initial Amount Invested', type: 'number', defaultValue: 10000, min: 1, step: 500, prefix: '$' },
      { id: 'finalValue', label: 'Final Value / Total Returns', type: 'number', defaultValue: 16500, min: 0, step: 500, prefix: '$' },
      { id: 'investmentLengthYears', label: 'Investment Length', type: 'number', defaultValue: 4, min: 0.1, max: 50, step: 0.5, suffix: 'Years' },
    ],
    calculate: (inputs): CalculatorResult => {
      const initial = Number(inputs.initialInvestment) || 10000;
      const finalVal = Number(inputs.finalValue) || 16500;
      const years = Number(inputs.investmentLengthYears) || 4;

      const netProfit = finalVal - initial;
      const totalRoi = (netProfit / initial) * 100;
      const cagr = (Math.pow(finalVal / initial, 1 / years) - 1) * 100;

      return {
        success: true,
        primary: { label: 'Total ROI', value: `${totalRoi >= 0 ? '+' : ''}${totalRoi.toFixed(2)}%` },
        metrics: [
          { label: 'Net Profit', value: `$${Math.round(netProfit).toLocaleString()}`, subtext: totalRoi >= 0 ? 'Total gain' : 'Total loss', isHighlight: true },
          { label: 'Annualized Return (CAGR)', value: `${cagr.toFixed(2)}%/yr`, subtext: `Compounded over ${years} years` },
          { label: 'Initial Investment', value: `$${initial.toLocaleString()}`, subtext: 'Cost basis' },
          { label: 'Final Value', value: `$${finalVal.toLocaleString()}`, subtext: 'Ending value' },
        ],
        breakdownTitle: 'Capital Performance',
        breakdownRows: [
          { label: 'Original Capital', value: `$${initial.toLocaleString()}`, percentage: Math.round((initial / finalVal) * 100) },
          { label: 'Net Capital Gain', value: `$${Math.round(netProfit).toLocaleString()}`, percentage: Math.round((netProfit / finalVal) * 100) },
        ],
        interpretation: `An investment of $${initial.toLocaleString()} growing to $${finalVal.toLocaleString()} in ${years} years delivers a ${totalRoi.toFixed(1)}% total ROI and a ${cagr.toFixed(2)}% annualized compound rate.`,
        formulaExplanation: 'ROI = [(Final Value - Initial Investment) / Initial Investment] × 100. CAGR = [(Final / Initial)^(1/t) - 1] × 100.',
        exampleCalculation: '$10,000 invested returning $16,500 after 4 years yields +65.00% total ROI and 13.34% CAGR.',
      };
    },
    seo: {
      title: 'ROI Calculator - Return on Investment & Annualized CAGR',
      metaDescription: 'Calculate return on investment (ROI), net profit, and compound annual growth rate (CAGR) for stocks, real estate, and business ventures.',
      keywords: ['roi calculator', 'return on investment', 'cagr calculator', 'annualized return'],
    },
    howTo: [
      { step: 1, title: 'Enter Invested Capital', description: 'Provide the initial purchase cost or starting principal.' },
      { step: 2, title: 'Enter Ending Value', description: 'Input the final sale price, current value, or total payout.' },
      { step: 3, title: 'Specify Time Horizon', description: 'Enter holding period in years to compute annualized CAGR.' },
    ],
  },

  // 7. Personal Loan / EMI Calculator
  {
    id: 'personal-loan-calculator',
    name: 'Personal Loan & EMI Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate monthly personal loan payments, total interest charges, and effective APR including origination fees.',
    iconName: 'Banknote',
    tags: ['personal loan', 'emi calculator', 'loan repayment', 'unsecured loan'],
    inputs: [
      { id: 'loanAmount', label: 'Loan Principal Amount', type: 'number', defaultValue: 15000, min: 500, step: 500, prefix: '$' },
      { id: 'interestRate', label: 'Annual Interest Rate', type: 'number', defaultValue: 9.5, min: 1, max: 36, step: 0.25, suffix: '%' },
      { id: 'loanTermMonths', label: 'Loan Term', type: 'select', defaultValue: 36, options: [{ label: '12 Months (1 Year)', value: 12 }, { label: '24 Months (2 Years)', value: 24 }, { label: '36 Months (3 Years)', value: 36 }, { label: '48 Months (4 Years)', value: 48 }, { label: '60 Months (5 Years)', value: 60 }] },
      { id: 'originationFeePercent', label: 'Origination Fee', type: 'number', defaultValue: 3, min: 0, max: 10, step: 0.5, suffix: '%' },
    ],
    calculate: (inputs): CalculatorResult => {
      const principal = Number(inputs.loanAmount) || 15000;
      const rate = (Number(inputs.interestRate) || 9.5) / 100;
      const termMonths = Number(inputs.loanTermMonths) || 36;
      const origFeePct = (Number(inputs.originationFeePercent) || 0) / 100;

      const monthlyRate = rate / 12;
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
      const totalRepaid = emi * termMonths;
      const totalInterest = totalRepaid - principal;
      const originationFee = principal * origFeePct;
      const cashReceived = principal - originationFee;

      return {
        success: true,
        primary: { label: 'Monthly Payment (EMI)', value: `$${emi.toFixed(2)}`, unit: '/month' },
        metrics: [
          { label: 'Total Interest Payable', value: `$${Math.round(totalInterest).toLocaleString()}`, subtext: 'Financing charge', isHighlight: true },
          { label: 'Origination Fee Deducted', value: `$${Math.round(originationFee).toLocaleString()}`, subtext: `${(origFeePct * 100).toFixed(1)}% of loan` },
          { label: 'Net Cash Received', value: `$${Math.round(cashReceived).toLocaleString()}`, subtext: 'Disbursed to your account' },
          { label: 'Total Amount Repaid', value: `$${Math.round(totalRepaid).toLocaleString()}`, subtext: `Over ${termMonths} months` },
        ],
        breakdownTitle: 'Repayment Structure',
        breakdownRows: [
          { label: 'Principal Borrowed', value: `$${principal.toLocaleString()}`, percentage: Math.round((principal / totalRepaid) * 100) },
          { label: 'Interest Expense', value: `$${Math.round(totalInterest).toLocaleString()}`, percentage: Math.round((totalInterest / totalRepaid) * 100) },
        ],
        interpretation: `Borrowing $${principal.toLocaleString()} at ${(rate * 100).toFixed(2)}% over ${termMonths} months requires an installment of $${emi.toFixed(2)}/month.`,
        formulaExplanation: 'EMI = P · r · (1+r)^n / ((1+r)^n - 1) where r = annual rate / 12 and n = term in months.',
        exampleCalculation: '$15,000 at 9.5% for 36 months = $480.52/month. Total interest paid is $2,298.72.',
      };
    },
    seo: {
      title: 'Personal Loan Calculator - Monthly EMI & Interest Repayment',
      metaDescription: 'Calculate monthly payments (EMI), interest costs, and upfront fees for personal loans and debt consolidation.',
      keywords: ['personal loan calculator', 'emi calculator', 'loan payment calculator', 'unsecured loan'],
    },
    howTo: [
      { step: 1, title: 'Enter Loan Amount', description: 'Input desired borrowing principal amount.' },
      { step: 2, title: 'Specify Interest Rate', description: 'Enter annual fixed interest rate offered by the lender.' },
      { step: 3, title: 'Select Term', description: 'Pick repayment term from 12 to 60 months.' },
      { step: 4, title: 'Include Fees', description: 'Optionally add origination fees to calculate net payout.' },
    ],
  },

  // 8. Simple Savings Goal Calculator
  {
    id: 'savings-goal-calculator',
    name: 'Savings Goal Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate how much you need to save each month to reach a specific financial target by a target date.',
    iconName: 'Target',
    tags: ['savings goal', 'financial goal', 'monthly savings', 'emergency fund', 'budgeting'],
    inputs: [
      { id: 'targetAmount', label: 'Savings Goal Target', type: 'number', defaultValue: 25000, min: 500, step: 500, prefix: '$' },
      { id: 'currentSaved', label: 'Already Saved', type: 'number', defaultValue: 3000, min: 0, step: 250, prefix: '$' },
      { id: 'monthsToSave', label: 'Timeframe to Reach Goal', type: 'number', defaultValue: 24, min: 1, max: 240, step: 1, suffix: 'Months' },
      { id: 'annualYield', label: 'High-Yield Savings Rate (APY)', type: 'number', defaultValue: 4.5, min: 0, max: 15, step: 0.1, suffix: '%' },
    ],
    calculate: (inputs): CalculatorResult => {
      const target = Number(inputs.targetAmount) || 25000;
      const current = Number(inputs.currentSaved) || 0;
      const months = Number(inputs.monthsToSave) || 24;
      const apy = (Number(inputs.annualYield) || 4.5) / 100;
      const monthlyRate = apy / 12;

      // Future value of existing savings
      const fvCurrent = current * Math.pow(1 + monthlyRate, months);
      const remainingTarget = Math.max(0, target - fvCurrent);

      let monthlyDepositNeeded = 0;
      if (monthlyRate > 0) {
        monthlyDepositNeeded = remainingTarget / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      } else {
        monthlyDepositNeeded = remainingTarget / months;
      }

      const totalDeposited = current + monthlyDepositNeeded * months;
      const interestEarned = Math.max(0, target - totalDeposited);

      return {
        success: true,
        primary: { label: 'Required Monthly Deposit', value: `$${monthlyDepositNeeded.toFixed(2)}`, unit: '/month' },
        metrics: [
          { label: 'Remaining Goal Gap', value: `$${Math.round(target - current).toLocaleString()}`, subtext: 'Principal to accumulate' },
          { label: 'Interest Assisted by HYSA', value: `$${Math.round(interestEarned).toLocaleString()}`, subtext: `At ${(apy * 100).toFixed(1)}% APY`, isHighlight: true },
          { label: 'Total Out-of-Pocket', value: `$${Math.round(totalDeposited).toLocaleString()}`, subtext: 'Your total deposits' },
          { label: 'Target Date', value: `${months} Months`, subtext: `${(months / 12).toFixed(1)} years` },
        ],
        breakdownTitle: 'Goal Funding Breakdown',
        breakdownRows: [
          { label: 'Existing Savings', value: `$${current.toLocaleString()}`, percentage: Math.round((current / target) * 100) },
          { label: 'New Monthly Deposits', value: `$${Math.round(monthlyDepositNeeded * months).toLocaleString()}`, percentage: Math.round(((monthlyDepositNeeded * months) / target) * 100) },
          { label: 'Interest Earned', value: `$${Math.round(interestEarned).toLocaleString()}`, percentage: Math.round((interestEarned / target) * 100) },
        ],
        interpretation: `To reach your $${target.toLocaleString()} goal in ${months} months, save $${monthlyDepositNeeded.toFixed(2)} each month. Compounding interest contributes $${Math.round(interestEarned).toLocaleString()} toward your goal.`,
        formulaExplanation: 'PMT = [Target - Current(1+r)^n] / [((1+r)^n - 1) / r] where r is monthly APY.',
        exampleCalculation: 'To save $25,000 in 24 months with $3,000 starting in a 4.5% HYSA, you need to deposit $878.89/month.',
      };
    },
    seo: {
      title: 'Savings Goal Calculator - Required Monthly Deposit',
      metaDescription: 'Calculate how much money you need to save each month to reach any financial milestone or emergency fund target.',
      keywords: ['savings goal calculator', 'target savings', 'emergency fund calculator', 'monthly savings goal'],
    },
    howTo: [
      { step: 1, title: 'Set Goal Target', description: 'Enter total sum of money you wish to accumulate.' },
      { step: 2, title: 'Enter Current Savings', description: 'Input money you already have saved toward this specific goal.' },
      { step: 3, title: 'Set Deadline', description: 'Choose how many months you have to complete your goal.' },
      { step: 4, title: 'Factor in APY', description: 'Add your savings account interest rate to let compound yield help.' },
    ],
  },

  // 9. Salary to Hourly Wage Converter
  {
    id: 'salary-to-hourly-calculator',
    name: 'Salary to Hourly Wage Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Convert annual salary into hourly, daily, weekly, and monthly rates with custom work hours and paid time off.',
    iconName: 'Briefcase',
    tags: ['salary to hourly', 'wage converter', 'hourly rate', 'paycheck', 'income calculator'],
    inputs: [
      { id: 'annualSalary', label: 'Annual Base Salary', type: 'number', defaultValue: 75000, min: 1000, step: 1000, prefix: '$' },
      { id: 'hoursPerWeek', label: 'Work Hours per Week', type: 'number', defaultValue: 40, min: 5, max: 80, step: 1, suffix: 'Hours' },
      { id: 'paidWeeksPerYear', label: 'Paid Weeks per Year', type: 'number', defaultValue: 52, min: 20, max: 52, step: 1, suffix: 'Weeks' },
    ],
    calculate: (inputs): CalculatorResult => {
      const annual = Number(inputs.annualSalary) || 75000;
      const hoursPerWeek = Number(inputs.hoursPerWeek) || 40;
      const paidWeeks = Number(inputs.paidWeeksPerYear) || 52;

      const totalAnnualHours = hoursPerWeek * paidWeeks;
      const hourlyWage = annual / totalAnnualHours;
      const dailyPay = hourlyWage * (hoursPerWeek / 5);
      const weeklyPay = annual / paidWeeks;
      const biWeeklyPay = weeklyPay * 2;
      const monthlyPay = annual / 12;

      return {
        success: true,
        primary: { label: 'Equivalent Hourly Rate', value: `$${hourlyWage.toFixed(2)}`, unit: '/hour' },
        metrics: [
          { label: 'Monthly Gross Pay', value: `$${monthlyPay.toFixed(2)}`, subtext: 'Before taxes', isHighlight: true },
          { label: 'Bi-Weekly Paycheck', value: `$${biWeeklyPay.toFixed(2)}`, subtext: 'Every 2 weeks (26 pay periods)' },
          { label: 'Weekly Pay', value: `$${weeklyPay.toFixed(2)}`, subtext: `${hoursPerWeek} hrs/wk` },
          { label: 'Daily Pay (8 hrs)', value: `$${dailyPay.toFixed(2)}`, subtext: '5-day work week' },
        ],
        breakdownTitle: 'Earnings Breakdown',
        breakdownRows: [
          { label: 'Hourly Rate', value: `$${hourlyWage.toFixed(2)} / hr` },
          { label: 'Daily Rate (8 hrs)', value: `$${dailyPay.toFixed(2)} / day` },
          { label: 'Weekly Gross', value: `$${weeklyPay.toFixed(2)} / wk` },
          { label: 'Monthly Gross', value: `$${monthlyPay.toFixed(2)} / mo` },
          { label: 'Annual Gross', value: `$${annual.toLocaleString()} / yr` },
        ],
        interpretation: `$${annual.toLocaleString()}/year working ${hoursPerWeek} hours/week over ${paidWeeks} weeks is equivalent to $${hourlyWage.toFixed(2)} per hour ($${monthlyPay.toFixed(2)}/month).`,
        formulaExplanation: 'Hourly Rate = Annual Salary / (Hours per Week × Paid Weeks per Year).',
        exampleCalculation: '$75,000 salary ÷ (40 hrs × 52 wks = 2,080 annual hours) = $36.06 per hour.',
      };
    },
    seo: {
      title: 'Salary to Hourly Calculator - Convert Annual Salary to Hourly Wage',
      metaDescription: 'Convert annual salary to hourly wage, daily, weekly, and monthly pay rates. Adjust for work hours and unpaid leave.',
      keywords: ['salary to hourly calculator', 'hourly wage converter', 'salary converter', 'annual to hourly'],
    },
    howTo: [
      { step: 1, title: 'Enter Annual Salary', description: 'Input your yearly base salary or contracted compensation.' },
      { step: 2, title: 'Enter Standard Weekly Hours', description: 'Specify typical work hours per week (standard 40).' },
      { step: 3, title: 'Set Weeks Worked', description: 'Enter 52 for salaried jobs with paid PTO, or less for unpaid leave.' },
      { step: 4, title: 'Compare Rates', description: 'Instantly view your equivalent hourly, daily, bi-weekly, and monthly rates.' },
    ],
  },
];
