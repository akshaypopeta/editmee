import { CalculatorDefinition, CalculatorResult } from '../types';

export const businessCalculators: CalculatorDefinition[] = [
  // 10. Profit Margin & Markup Calculator
  {
    id: 'profit-margin-calculator',
    name: 'Profit Margin & Markup Calculator',
    category: 'calculators',
    subcategory: 'business',
    description: 'Calculate gross profit, gross margin percentage, markup percentage, and selling price from cost.',
    iconName: 'Percent',
    tags: ['profit margin', 'markup calculator', 'gross margin', 'pricing', 'retail', 'ecommerce'],
    inputs: [
      { id: 'costPrice', label: 'Cost of Goods Sold (COGS)', type: 'number', defaultValue: 60, min: 0.01, step: 1, prefix: '$' },
      { id: 'sellingPrice', label: 'Selling Price / Revenue', type: 'number', defaultValue: 100, min: 0.01, step: 1, prefix: '$' },
    ],
    calculate: (inputs): CalculatorResult => {
      const cost = Number(inputs.costPrice) || 60;
      const price = Number(inputs.sellingPrice) || 100;

      const grossProfit = price - cost;
      const marginPercent = (grossProfit / price) * 100;
      const markupPercent = (grossProfit / cost) * 100;

      return {
        success: true,
        primary: { label: 'Gross Margin', value: `${marginPercent.toFixed(2)}%` },
        metrics: [
          { label: 'Gross Profit', value: `$${grossProfit.toFixed(2)}`, subtext: 'Per unit sold', isHighlight: true },
          { label: 'Markup Percentage', value: `${markupPercent.toFixed(2)}%`, subtext: 'Cost multiplier' },
          { label: 'Cost Price', value: `$${cost.toFixed(2)}`, subtext: 'Unit expense' },
          { label: 'Selling Price', value: `$${price.toFixed(2)}`, subtext: 'Revenue per unit' },
        ],
        breakdownTitle: 'Revenue Share',
        breakdownRows: [
          { label: 'Cost of Goods', value: `$${cost.toFixed(2)}`, percentage: Math.round((cost / price) * 100) },
          { label: 'Gross Profit', value: `$${grossProfit.toFixed(2)}`, percentage: Math.round(marginPercent) },
        ],
        interpretation: `A $${cost.toFixed(2)} item sold for $${price.toFixed(2)} delivers a $${grossProfit.toFixed(2)} profit, a ${marginPercent.toFixed(1)}% gross margin, and a ${markupPercent.toFixed(1)}% markup on cost.`,
        formulaExplanation: 'Gross Margin % = [(Price - Cost) / Price] × 100. Markup % = [(Price - Cost) / Cost] × 100.',
        exampleCalculation: 'Buying for $60 and selling for $100 gives $40 gross profit. Margin is 40.00%; markup is 66.67%.',
      };
    },
    seo: {
      title: 'Profit Margin & Markup Calculator - Business Pricing',
      metaDescription: 'Free profit margin and markup calculator. Convert between margin, markup, cost, and revenue to set optimal product prices.',
      keywords: ['profit margin calculator', 'markup calculator', 'gross profit margin', 'retail pricing'],
    },
    howTo: [
      { step: 1, title: 'Enter Unit Cost', description: 'Input your wholesale cost of goods or production cost.' },
      { step: 2, title: 'Enter Target Retail Price', description: 'Input your sales price to see resulting profit margins.' },
      { step: 3, title: 'Compare Margin vs Markup', description: 'Notice that margin is profit over revenue, while markup is profit over cost.' },
    ],
  },

  // 11. Break-Even Analysis Calculator
  {
    id: 'break-even-calculator',
    name: 'Break-Even Analysis Calculator',
    category: 'calculators',
    subcategory: 'business',
    description: 'Determine the exact sales volume and revenue needed to cover total fixed and variable operating costs.',
    iconName: 'Scale',
    tags: ['break even', 'business plan', 'unit economics', 'fixed costs', 'contribution margin'],
    inputs: [
      { id: 'fixedCosts', label: 'Total Fixed Costs (Monthly/Annual)', type: 'number', defaultValue: 12000, min: 0, step: 500, prefix: '$' },
      { id: 'variableCostPerUnit', label: 'Variable Cost per Unit', type: 'number', defaultValue: 25, min: 0, step: 1, prefix: '$' },
      { id: 'salePricePerUnit', label: 'Sales Price per Unit', type: 'number', defaultValue: 65, min: 0.01, step: 1, prefix: '$' },
    ],
    calculate: (inputs): CalculatorResult => {
      const fixed = Number(inputs.fixedCosts) || 12000;
      const varCost = Number(inputs.variableCostPerUnit) || 25;
      const price = Number(inputs.salePricePerUnit) || 65;

      const unitContribution = price - varCost;
      if (unitContribution <= 0) {
        return {
          success: false,
          error: `Sales price ($${price}) must be higher than variable cost per unit ($${varCost}) to generate positive contribution margin.`,
          primary: { label: 'Break-Even Point', value: 'Not Possible' },
          metrics: [{ label: 'Unit Loss', value: `-$${(varCost - price).toFixed(2)}/unit` }],
        };
      }

      const breakEvenUnits = Math.ceil(fixed / unitContribution);
      const breakEvenRevenue = breakEvenUnits * price;
      const contributionRatio = (unitContribution / price) * 100;

      return {
        success: true,
        primary: { label: 'Break-Even Units', value: `${breakEvenUnits.toLocaleString()} Units`, unit: 'needed' },
        metrics: [
          { label: 'Break-Even Revenue', value: `$${breakEvenRevenue.toLocaleString()}`, subtext: 'Zero-profit sales target', isHighlight: true },
          { label: 'Contribution Margin', value: `$${unitContribution.toFixed(2)}/unit`, subtext: `${contributionRatio.toFixed(1)}% margin ratio` },
          { label: 'Fixed Costs to Cover', value: `$${fixed.toLocaleString()}`, subtext: 'Rent, salaries, software' },
          { label: 'Unit Price vs Cost', value: `$${price.toFixed(2)} / $${varCost.toFixed(2)}`, subtext: 'Price / Variable cost' },
        ],
        breakdownTitle: 'Unit Economic Allocation',
        breakdownRows: [
          { label: 'Variable Cost Portion', value: `$${varCost.toFixed(2)}`, percentage: Math.round((varCost / price) * 100) },
          { label: 'Contribution to Overhead', value: `$${unitContribution.toFixed(2)}`, percentage: Math.round(contributionRatio) },
        ],
        interpretation: `With $${fixed.toLocaleString()} in fixed costs and a $${unitContribution.toFixed(2)} contribution margin per unit, you must sell ${breakEvenUnits.toLocaleString()} units ($${breakEvenRevenue.toLocaleString()} in revenue) to break even.`,
        formulaExplanation: 'Break-Even Units = Fixed Costs / (Sale Price - Variable Cost). Break-Even Revenue = Break-Even Units × Sale Price.',
        exampleCalculation: '$12,000 fixed costs ÷ ($65 price - $25 variable cost = $40 contribution) = 300 units ($19,500 revenue).',
      };
    },
    seo: {
      title: 'Break-Even Calculator - Break-Even Units & Revenue Analysis',
      metaDescription: 'Free break-even analysis calculator. Find how many units you need to sell to cover fixed and variable overhead costs.',
      keywords: ['break even calculator', 'break even analysis', 'contribution margin', 'business break even'],
    },
    howTo: [
      { step: 1, title: 'Enter Total Fixed Costs', description: 'Sum all overhead expenses that do not change with sales volume (rent, salaries, licenses).' },
      { step: 2, title: 'Enter Unit Variable Cost', description: 'Input material, labor, and packaging cost incurred per unit produced.' },
      { step: 3, title: 'Set Selling Price', description: 'Input your customer price per unit to compute the unit contribution margin.' },
    ],
  },

  // 12. Sales Tax / VAT / GST Calculator
  {
    id: 'sales-tax-vat-calculator',
    name: 'Sales Tax, VAT & GST Calculator',
    category: 'calculators',
    subcategory: 'business',
    description: 'Calculate consumption tax (Sales Tax, VAT, or GST) with both tax-inclusive (extract tax) and tax-exclusive (add tax) modes.',
    iconName: 'Receipt',
    tags: ['sales tax', 'vat calculator', 'gst calculator', 'tax inclusive', 'tax exclusive'],
    inputs: [
      { id: 'amount', label: 'Transaction Amount', type: 'number', defaultValue: 150, min: 0.01, step: 1, prefix: '$' },
      { id: 'taxRate', label: 'Tax Rate Percentage', type: 'number', defaultValue: 8.25, min: 0, max: 50, step: 0.05, suffix: '%' },
      { id: 'calculationMode', label: 'Calculation Mode', type: 'select', defaultValue: 'add', options: [{ label: 'Tax Exclusive (Add Tax to Amount)', value: 'add' }, { label: 'Tax Inclusive (Extract Tax from Gross)', value: 'extract' }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const amt = Number(inputs.amount) || 150;
      const rate = (Number(inputs.taxRate) || 8.25) / 100;
      const mode = inputs.calculationMode || 'add';

      let netAmount = 0;
      let taxAmount = 0;
      let grossAmount = 0;

      if (mode === 'add') {
        netAmount = amt;
        taxAmount = amt * rate;
        grossAmount = netAmount + taxAmount;
      } else {
        grossAmount = amt;
        netAmount = grossAmount / (1 + rate);
        taxAmount = grossAmount - netAmount;
      }

      return {
        success: true,
        primary: { label: mode === 'add' ? 'Total with Tax (Gross)' : 'Net Amount (Pre-Tax)', value: `$${grossAmount.toFixed(2)}` },
        metrics: [
          { label: 'Tax Amount', value: `$${taxAmount.toFixed(2)}`, subtext: `${(rate * 100).toFixed(2)}% tax`, isHighlight: true },
          { label: 'Net Amount (Pre-Tax)', value: `$${netAmount.toFixed(2)}`, subtext: 'Base price' },
          { label: 'Total Gross Price', value: `$${grossAmount.toFixed(2)}`, subtext: 'Final customer price' },
          { label: 'Effective Rate', value: `${(rate * 100).toFixed(2)}%`, subtext: mode === 'add' ? 'Added to subtotal' : 'Extracted from gross' },
        ],
        breakdownTitle: 'Invoice Breakdown',
        breakdownRows: [
          { label: 'Pre-Tax Subtotal', value: `$${netAmount.toFixed(2)}`, percentage: Math.round((netAmount / grossAmount) * 100) },
          { label: 'Tax Portion', value: `$${taxAmount.toFixed(2)}`, percentage: Math.round((taxAmount / grossAmount) * 100) },
        ],
        interpretation: mode === 'add'
          ? `Adding ${(rate * 100).toFixed(2)}% tax to a $${netAmount.toFixed(2)} subtotal adds $${taxAmount.toFixed(2)} in tax for a final total of $${grossAmount.toFixed(2)}.`
          : `A gross price of $${grossAmount.toFixed(2)} with ${(rate * 100).toFixed(2)}% VAT contains $${taxAmount.toFixed(2)} in tax, leaving a pre-tax net of $${netAmount.toFixed(2)}.`,
        formulaExplanation: mode === 'add' ? 'Tax = Net × Rate; Gross = Net + Tax.' : 'Net = Gross / (1 + Rate); Tax = Gross - Net.',
        exampleCalculation: '$150 subtotal with 8.25% tax = $12.38 tax, total $162.38.',
      };
    },
    seo: {
      title: 'Sales Tax, VAT & GST Calculator - Add or Extract Tax',
      metaDescription: 'Free sales tax and VAT calculator. Add tax to wholesale prices or extract tax included in gross retail receipts.',
      keywords: ['sales tax calculator', 'vat calculator', 'gst calculator', 'tax inclusive calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Amount', description: 'Input your item subtotal or receipt gross amount.' },
      { step: 2, title: 'Specify Tax Percentage', description: 'Enter state, municipal, VAT, or GST percentage rate.' },
      { step: 3, title: 'Choose Mode', description: 'Select whether to add tax onto a price or strip tax out of a total.' },
    ],
  },

  // 13. Discount & Sale Price Calculator
  {
    id: 'discount-sale-calculator',
    name: 'Discount & Sale Price Calculator',
    category: 'calculators',
    subcategory: 'business',
    description: 'Calculate sale price, total money saved, stacked promotional discounts, and final price with sales tax.',
    iconName: 'Tag',
    tags: ['discount calculator', 'sale price', 'shopping savings', 'coupon calculator', 'black friday'],
    inputs: [
      { id: 'originalPrice', label: 'Original List Price', type: 'number', defaultValue: 120, min: 0.01, step: 1, prefix: '$' },
      { id: 'discountPercent', label: 'Primary Discount', type: 'number', defaultValue: 30, min: 0, max: 100, step: 5, suffix: '%' },
      { id: 'extraCouponPercent', label: 'Additional Coupon / Promo', type: 'number', defaultValue: 10, min: 0, max: 90, step: 5, suffix: '%' },
      { id: 'salesTaxRate', label: 'Sales Tax', type: 'number', defaultValue: 7, min: 0, max: 25, step: 0.25, suffix: '%' },
    ],
    calculate: (inputs): CalculatorResult => {
      const orig = Number(inputs.originalPrice) || 120;
      const d1 = (Number(inputs.discountPercent) || 30) / 100;
      const d2 = (Number(inputs.extraCouponPercent) || 0) / 100;
      const taxRate = (Number(inputs.salesTaxRate) || 0) / 100;

      const afterD1 = orig * (1 - d1);
      const afterD2 = afterD1 * (1 - d2);
      const tax = afterD2 * taxRate;
      const finalPrice = afterD2 + tax;
      const totalSavings = orig - afterD2;
      const effectiveDiscount = (totalSavings / orig) * 100;

      return {
        success: true,
        primary: { label: 'Final Out-of-Pocket Price', value: `$${finalPrice.toFixed(2)}` },
        metrics: [
          { label: 'Total Money Saved', value: `$${totalSavings.toFixed(2)}`, subtext: `${effectiveDiscount.toFixed(1)}% total savings`, isHighlight: true },
          { label: 'Pre-Tax Sale Price', value: `$${afterD2.toFixed(2)}`, subtext: 'Before local sales tax' },
          { label: 'Sales Tax Added', value: `$${tax.toFixed(2)}`, subtext: `${(taxRate * 100).toFixed(1)}% tax rate` },
          { label: 'Original Price', value: `$${orig.toFixed(2)}`, subtext: 'MSRP' },
        ],
        breakdownTitle: 'Discount Stack Progression',
        breakdownRows: [
          { label: 'Original Price', value: `$${orig.toFixed(2)}` },
          { label: `After ${(d1 * 100)}% Discount`, value: `$${afterD1.toFixed(2)}` },
          ...(d2 > 0 ? [{ label: `After Extra ${(d2 * 100)}% Promo`, value: `$${afterD2.toFixed(2)}` }] : []),
          { label: 'Sales Tax', value: `+$${tax.toFixed(2)}` },
          { label: 'Final Checkout Total', value: `$${finalPrice.toFixed(2)}` },
        ],
        interpretation: `An original $${orig.toFixed(2)} item discounted by ${(d1 * 100)}% plus an extra ${(d2 * 100)}% coupon saves you $${totalSavings.toFixed(2)} (${effectiveDiscount.toFixed(1)}% off).`,
        formulaExplanation: 'Sale Price = Original × (1 - Discount1) × (1 - Discount2). Final = Sale Price × (1 + Tax).',
        exampleCalculation: '$120 item with 30% off ($84) plus extra 10% off = $75.60. With 7% tax ($5.29), total is $80.89.',
      };
    },
    seo: {
      title: 'Discount Calculator - Sale Price, Coupons & Total Savings',
      metaDescription: 'Free discount and sale price calculator. Stack multiple promo codes and calculate final checkout cost with sales tax.',
      keywords: ['discount calculator', 'sale price calculator', 'coupon savings', 'percent off calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Original Tag Price', description: 'Input MSRP sticker price of the product.' },
      { step: 2, title: 'Enter Sale Percentage', description: 'Provide the advertised percentage discount (e.g. 25% off).' },
      { step: 3, title: 'Stack Promo Codes', description: 'Optionally add any extra checkout promo code or loyalty coupon.' },
      { step: 4, title: 'Include Tax', description: 'Include local sales tax rate to get your final receipt price.' },
    ],
  },

  // 14. Customer Lifetime Value (LTV) Calculator
  {
    id: 'customer-lifetime-value-calculator',
    name: 'Customer Lifetime Value (LTV) Calculator',
    category: 'calculators',
    subcategory: 'business',
    description: 'Calculate Customer Lifetime Value (LTV), LTV:CAC ratio benchmarks, and maximum allowable customer acquisition budget.',
    iconName: 'Users',
    tags: ['customer lifetime value', 'ltv calculator', 'cac', 'saas economics', 'unit economics'],
    inputs: [
      { id: 'avgPurchaseValue', label: 'Average Purchase / Order Value', type: 'number', defaultValue: 85, min: 1, step: 5, prefix: '$' },
      { id: 'purchaseFreqYear', label: 'Purchase Frequency (Orders/Year)', type: 'number', defaultValue: 4.5, min: 0.1, max: 365, step: 0.5, suffix: 'Orders/Yr' },
      { id: 'customerLifespanYears', label: 'Average Customer Lifespan', type: 'number', defaultValue: 3, min: 0.1, max: 20, step: 0.5, suffix: 'Years' },
      { id: 'grossMarginPercent', label: 'Gross Margin Percentage', type: 'number', defaultValue: 65, min: 1, max: 100, step: 1, suffix: '%' },
      { id: 'currentCac', label: 'Customer Acquisition Cost (CAC)', type: 'number', defaultValue: 60, min: 1, step: 5, prefix: '$' },
    ],
    calculate: (inputs): CalculatorResult => {
      const aov = Number(inputs.avgPurchaseValue) || 85;
      const freq = Number(inputs.purchaseFreqYear) || 4.5;
      const lifespan = Number(inputs.customerLifespanYears) || 3;
      const margin = (Number(inputs.grossMarginPercent) || 65) / 100;
      const cac = Number(inputs.currentCac) || 60;

      const customerAnnualRevenue = aov * freq;
      const lifetimeRevenue = customerAnnualRevenue * lifespan;
      const ltvGrossProfit = lifetimeRevenue * margin;
      const ltvCacRatio = ltvGrossProfit / Math.max(1, cac);
      const maxRecommendedCac = ltvGrossProfit / 3; // 3:1 LTV:CAC rule of thumb

      return {
        success: true,
        primary: { label: 'Customer Lifetime Value (LTV)', value: `$${Math.round(ltvGrossProfit).toLocaleString()}`, unit: 'gross profit' },
        metrics: [
          { label: 'LTV : CAC Ratio', value: `${ltvCacRatio.toFixed(2)} : 1`, subtext: ltvCacRatio >= 3 ? 'Healthy (≥3:1)' : 'High risk (<3:1)', badge: ltvCacRatio >= 3 ? 'Strong' : 'Caution', isHighlight: true },
          { label: 'Lifetime Gross Revenue', value: `$${Math.round(lifetimeRevenue).toLocaleString()}`, subtext: `${(freq * lifespan).toFixed(1)} total purchases` },
          { label: 'Max Recommended CAC (3:1)', value: `$${Math.round(maxRecommendedCac).toLocaleString()}`, subtext: 'Target acquisition budget' },
          { label: 'Net Value after Acquisition', value: `$${Math.round(ltvGrossProfit - cac).toLocaleString()}`, subtext: 'LTV minus CAC' },
        ],
        breakdownTitle: 'Customer Revenue Flow',
        breakdownRows: [
          { label: 'Annual Revenue per Customer', value: `$${Math.round(customerAnnualRevenue).toLocaleString()} / yr` },
          { label: 'Gross Margin Share', value: `${(margin * 100).toFixed(0)}%` },
          { label: 'Customer Acquisition Cost', value: `$${cac.toLocaleString()}` },
          { label: 'Net Profit per Customer', value: `$${Math.round(ltvGrossProfit - cac).toLocaleString()}` },
        ],
        interpretation: `Each customer generates $${Math.round(lifetimeRevenue).toLocaleString()} in lifetime revenue ($${Math.round(ltvGrossProfit).toLocaleString()} in gross margin). With a $${cac} CAC, your LTV:CAC ratio is ${ltvCacRatio.toFixed(2)}:1.`,
        formulaExplanation: 'LTV = Average Order Value × Purchase Frequency × Customer Lifespan × Gross Margin %.',
        exampleCalculation: '$85 AOV × 4.5 orders/yr × 3 years = $1,147.50 revenue. At 65% gross margin, LTV = $745.88 gross profit.',
      };
    },
    seo: {
      title: 'Customer Lifetime Value (LTV) Calculator - SaaS & E-commerce',
      metaDescription: 'Calculate customer lifetime value (LTV) and LTV:CAC ratios. Benchmark unit economics for subscription and commerce businesses.',
      keywords: ['ltv calculator', 'customer lifetime value', 'ltv to cac', 'unit economics'],
    },
    howTo: [
      { step: 1, title: 'Enter Average Order Value', description: 'Input your typical transaction size or monthly subscription rate.' },
      { step: 2, title: 'Set Annual Purchase Frequency', description: 'Enter how many times per year an active customer orders.' },
      { step: 3, title: 'Enter Customer Retention Span', description: 'Input the average number of years a customer remains active before churn.' },
      { step: 4, title: 'Factor Margin & CAC', description: 'Add your gross margin % and acquisition cost to evaluate unit economics health.' },
    ],
  },
];
