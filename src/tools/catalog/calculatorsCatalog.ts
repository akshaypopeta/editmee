import { ToolDefinition, ToolResult } from '../../types';

export const calculatorsCatalog: ToolDefinition[] = [
  // 1. Mortgage & Loan Amortization Calculator
  {
    id: 'mortgage-calculator',
    name: 'Mortgage & Loan Payment Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate monthly principal, interest payments, and total loan cost over 15 or 30-year terms.',
    iconName: 'Home',
    version: '1.0.0',
    tags: ['mortgage', 'loan', 'interest', 'real-estate', 'finance'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'principal', label: 'Loan Amount / Principal ($)', type: 'number', defaultValue: 400000 },
        { name: 'interestRate', label: 'Annual Interest Rate (%)', type: 'number', defaultValue: 6.5 },
        { name: 'years', label: 'Loan Term (Years)', type: 'number', defaultValue: 30 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const p = Number(inputs.principal || 400000);
      const r = Number(inputs.interestRate || 6.5) / 100 / 12;
      const n = Number(inputs.years || 30) * 12;

      const monthly = (p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
      const totalPaid = monthly * n;
      const totalInterest = totalPaid - p;

      const res = {
        monthlyPayment: `$${monthly.toFixed(2)}`,
        totalInterestPaid: `$${totalInterest.toFixed(2)}`,
        totalCostOfLoan: `$${totalPaid.toFixed(2)}`,
        monthsCount: n,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 2. Compound Interest & Wealth Accumulator
  {
    id: 'compound-interest-calculator',
    name: 'Compound Interest & Investment Accumulator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Model future investment portfolio growth with regular monthly contributions and compound interest.',
    iconName: 'TrendingUp',
    version: '1.0.0',
    tags: ['compound-interest', 'investment', 'wealth', 'savings', 'growth'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'initial', label: 'Initial Principal ($)', type: 'number', defaultValue: 10000 },
        { name: 'monthly', label: 'Monthly Contribution ($)', type: 'number', defaultValue: 500 },
        { name: 'rate', label: 'Expected Annual Return (%)', type: 'number', defaultValue: 8.0 },
        { name: 'years', label: 'Investment Horizon (Years)', type: 'number', defaultValue: 20 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const p = Number(inputs.initial || 10000);
      const pmt = Number(inputs.monthly || 500);
      const r = Number(inputs.rate || 8) / 100 / 12;
      const n = Number(inputs.years || 20) * 12;

      let balance = p;
      let totalContributions = p;

      for (let i = 0; i < n; i++) {
        balance = balance * (1 + r) + pmt;
        totalContributions += pmt;
      }

      const totalInterest = balance - totalContributions;
      const res = {
        futureValue: `$${Math.round(balance).toLocaleString()}`,
        totalContributions: `$${Math.round(totalContributions).toLocaleString()}`,
        totalInterestEarned: `$${Math.round(totalInterest).toLocaleString()}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 3. BMI & Body Composition Calculator
  {
    id: 'bmi-calculator',
    name: 'Body Mass Index (BMI) & Category Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate BMI, target weight ranges, and category classifications (Metric / Imperial).',
    iconName: 'Activity',
    version: '1.0.0',
    tags: ['bmi', 'health', 'fitness', 'weight', 'body-mass'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'weightKg', label: 'Weight (kg)', type: 'number', defaultValue: 70 },
        { name: 'heightCm', label: 'Height (cm)', type: 'number', defaultValue: 175 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const w = Number(inputs.weightKg || 70);
      const hM = Number(inputs.heightCm || 175) / 100;
      const bmi = Number((w / (hM * hM)).toFixed(1));

      let cat = 'Normal Weight';
      if (bmi < 18.5) cat = 'Underweight';
      else if (bmi >= 25 && bmi < 30) cat = 'Overweight';
      else if (bmi >= 30) cat = 'Obese';

      const res = { bmi, category: cat, healthyBmiRange: '18.5 - 24.9' };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 4. Percentage & Ratio Calculator
  {
    id: 'percentage-calculator',
    name: 'Percentage Increase / Decrease & Ratio Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Calculate what percent X is of Y, percentage increase, discount savings, and aspect ratios.',
    iconName: 'Percent',
    version: '1.0.0',
    tags: ['percentage', 'ratio', 'discount', 'math', 'calculator'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'originalValue', label: 'Original Value', type: 'number', defaultValue: 80 },
        { name: 'newValue', label: 'New Value', type: 'number', defaultValue: 100 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const orig = Number(inputs.originalValue || 80);
      const nw = Number(inputs.newValue || 100);
      const diff = nw - orig;
      const percentChange = ((diff / (orig || 1)) * 100).toFixed(2);

      const res = {
        absoluteDifference: diff,
        percentageChange: `${percentChange}%`,
        isIncrease: diff > 0,
        fraction: `${orig}/${nw}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 5. Currency / Tip & Bill Split Calculator
  {
    id: 'tip-bill-split-calculator',
    name: 'Restaurant Tip & Group Bill Split Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate custom tip percentages (15%, 18%, 20%) and split bills evenly among group members.',
    iconName: 'DollarSign',
    version: '1.0.0',
    tags: ['tip', 'bill-split', 'restaurant', 'dining', 'finance'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'billAmount', label: 'Total Bill ($)', type: 'number', defaultValue: 125.00 },
        { name: 'tipPercent', label: 'Tip Percentage (%)', type: 'number', defaultValue: 20 },
        { name: 'partySize', label: 'Number of People', type: 'number', defaultValue: 4 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const bill = Number(inputs.billAmount || 125);
      const tipPct = Number(inputs.tipPercent || 20);
      const people = Math.max(1, Number(inputs.partySize || 4));

      const tipAmt = (bill * tipPct) / 100;
      const grandTotal = bill + tipAmt;
      const perPerson = grandTotal / people;

      const res = {
        subtotal: `$${bill.toFixed(2)}`,
        tipAmount: `$${tipAmt.toFixed(2)}`,
        grandTotal: `$${grandTotal.toFixed(2)}`,
        amountPerPerson: `$${perPerson.toFixed(2)}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 6. Unit Converter (Length, Weight, Temp, Data)
  {
    id: 'unit-converter',
    name: 'Universal Unit Converter (Metric & Imperial)',
    category: 'calculators',
    subcategory: 'conversion',
    description: 'Convert between Celsius/Fahrenheit, Kilograms/Pounds, Kilometers/Miles, and Bytes/Megabytes.',
    iconName: 'Repeat',
    version: '1.0.0',
    tags: ['unit', 'converter', 'metric', 'imperial', 'celsius', 'fahrenheit'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'value', label: 'Value to Convert', type: 'number', defaultValue: 100 },
        {
          name: 'type',
          label: 'Conversion Type',
          type: 'select',
          defaultValue: 'c-to-f',
          options: [
            { label: 'Celsius to Fahrenheit', value: 'c-to-f' },
            { label: 'Fahrenheit to Celsius', value: 'f-to-c' },
            { label: 'Kilometers to Miles', value: 'km-to-mi' },
            { label: 'Miles to Kilometers', value: 'mi-to-km' },
            { label: 'Kilograms to Pounds', value: 'kg-to-lb' },
            { label: 'Pounds to Kilograms', value: 'lb-to-kg' },
          ],
        },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const v = Number(inputs.value || 0);
      const t = inputs.type || 'c-to-f';
      let result = 0;
      let unit = '';

      if (t === 'c-to-f') { result = (v * 9) / 5 + 32; unit = '°F'; }
      else if (t === 'f-to-c') { result = ((v - 32) * 5) / 9; unit = '°C'; }
      else if (t === 'km-to-mi') { result = v * 0.621371; unit = 'miles'; }
      else if (t === 'mi-to-km') { result = v * 1.60934; unit = 'km'; }
      else if (t === 'kg-to-lb') { result = v * 2.20462; unit = 'lbs'; }
      else if (t === 'lb-to-kg') { result = v / 2.20462; unit = 'kg'; }

      const res = { inputValue: v, result: Number(result.toFixed(2)), unit };
      return { success: true, data: res, text: `${v} converted = ${result.toFixed(2)} ${unit}` };
    },
  },

  // 7. Time & Date Duration Calculator
  {
    id: 'date-duration-calculator',
    name: 'Date Difference & Duration Calculator',
    category: 'calculators',
    subcategory: 'time',
    description: 'Calculate days, weeks, months, and business working days between two calendar dates.',
    iconName: 'Calendar',
    version: '1.0.0',
    tags: ['date', 'duration', 'days', 'calendar', 'time'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'startDate', label: 'Start Date (YYYY-MM-DD)', type: 'text', defaultValue: '2026-01-01' },
        { name: 'endDate', label: 'End Date (YYYY-MM-DD)', type: 'text', defaultValue: '2026-12-31' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const d1 = new Date(inputs.startDate || '2026-01-01');
      const d2 = new Date(inputs.endDate || '2026-12-31');
      const diffMs = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const diffWeeks = (diffDays / 7).toFixed(1);

      const res = {
        days: diffDays,
        weeks: diffWeeks,
        hours: diffDays * 24,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 8. Aspect Ratio & Screen Dimensions Calculator
  {
    id: 'aspect-ratio-calculator',
    name: 'Screen & Video Aspect Ratio Calculator (16:9, 4:3, 21:9)',
    category: 'calculators',
    subcategory: 'design',
    description: 'Calculate matching width or height to maintain 16:9, 4:3, 1:1, or custom aspect ratios.',
    iconName: 'Monitor',
    version: '1.0.0',
    tags: ['aspect-ratio', 'video', 'dimensions', 'resolution', 'design'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'width', label: 'Width (px)', type: 'number', defaultValue: 1920 },
        { name: 'ratio', label: 'Target Ratio', type: 'select', defaultValue: '16:9', options: [{ label: '16:9 (Widescreen)', value: '16:9' }, { label: '4:3 (Standard)', value: '4:3' }, { label: '1:1 (Square)', value: '1:1' }, { label: '21:9 (Ultrawide)', value: '21:9' }, { label: '9:16 (Vertical Reel)', value: '9:16' }] },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const w = Number(inputs.width || 1920);
      const [rw, rh] = (inputs.ratio || '16:9').split(':').map(Number);
      const h = Math.round((w * rh) / rw);
      const res = { width: w, height: h, aspectRatio: inputs.ratio, resolution: `${w} x ${h}` };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 9. Calorie & Basal Metabolic Rate (BMR) Calculator
  {
    id: 'bmr-calorie-calculator',
    name: 'BMR (Basal Metabolic Rate) & Daily Calorie Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate daily resting and active caloric expenditure using Mifflin-St Jeor formula.',
    iconName: 'Flame',
    version: '1.0.0',
    tags: ['bmr', 'calories', 'nutrition', 'fitness', 'health'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'age', label: 'Age (Years)', type: 'number', defaultValue: 30 },
        { name: 'gender', label: 'Gender', type: 'select', defaultValue: 'male', options: [{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }] },
        { name: 'weightKg', label: 'Weight (kg)', type: 'number', defaultValue: 75 },
        { name: 'heightCm', label: 'Height (cm)', type: 'number', defaultValue: 180 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const age = Number(inputs.age || 30);
      const w = Number(inputs.weightKg || 75);
      const h = Number(inputs.heightCm || 180);
      const isMale = inputs.gender === 'male';

      const bmr = Math.round(10 * w + 6.25 * h - 5 * age + (isMale ? 5 : -161));
      const res = {
        bmr: `${bmr} kcal/day (Resting)`,
        sedentaryMaintenance: `${Math.round(bmr * 1.2)} kcal/day`,
        moderateActivity: `${Math.round(bmr * 1.55)} kcal/day`,
        weightLossDeficit: `${Math.round(bmr * 1.55 - 500)} kcal/day`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 10. Bandwidth & File Download Time Calculator
  {
    id: 'bandwidth-download-calculator',
    name: 'Bandwidth & File Download Time Calculator',
    category: 'calculators',
    subcategory: 'network',
    description: 'Calculate transfer duration for large datasets across various network connection speeds.',
    iconName: 'Download',
    version: '1.0.0',
    tags: ['bandwidth', 'download-time', 'network', 'speed', 'transfer'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'fileSizeGb', label: 'File Size (GB)', type: 'number', defaultValue: 10 },
        { name: 'speedMbps', label: 'Internet Speed (Mbps)', type: 'number', defaultValue: 100 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const sizeGb = Number(inputs.fileSizeGb || 10);
      const speedMbps = Number(inputs.speedMbps || 100);

      const sizeMb = sizeGb * 8000; // Gigabytes to Megabits
      const totalSeconds = sizeMb / speedMbps;
      const minutes = (totalSeconds / 60).toFixed(1);

      const res = {
        fileSize: `${sizeGb} GB`,
        networkSpeed: `${speedMbps} Mbps`,
        estimatedDurationMinutes: `${minutes} minutes`,
        totalSeconds: Math.round(totalSeconds),
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 11. Scientific Standard Deviation & Variance
  {
    id: 'standard-deviation-calculator',
    name: 'Scientific Standard Deviation & Variance Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Calculate sample and population standard deviation, variance, and mean for number sets.',
    iconName: 'Activity',
    version: '1.0.0',
    tags: ['statistics', 'standard-deviation', 'variance', 'math', 'mean'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'numbers', label: 'Numbers (comma separated)', type: 'text', defaultValue: '10, 12, 23, 23, 16, 23, 21, 16' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const nums = (inputs.numbers || '').split(',').map((n: string) => Number(n.trim())).filter((n: number) => !isNaN(n));
      if (nums.length === 0) return { success: false, error: 'Provide numbers' };

      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const variance = nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / nums.length;
      const stdDev = Math.sqrt(variance);

      const res = {
        count: nums.length,
        mean: Number(mean.toFixed(2)),
        variance: Number(variance.toFixed(2)),
        populationStandardDeviation: Number(stdDev.toFixed(2)),
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 12. Fuel Cost & Trip Distance Calculator
  {
    id: 'fuel-trip-calculator',
    name: 'Road Trip Fuel Cost & Gas Mileage Calculator',
    category: 'calculators',
    subcategory: 'travel',
    description: 'Estimate total fuel cost and gallons needed for road trips based on vehicle MPG.',
    iconName: 'Navigation',
    version: '1.0.0',
    tags: ['fuel', 'trip', 'gas', 'mpg', 'travel', 'cost'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'distanceMiles', label: 'Trip Distance (Miles)', type: 'number', defaultValue: 450 },
        { name: 'vehicleMpg', label: 'Vehicle Fuel Economy (MPG)', type: 'number', defaultValue: 28 },
        { name: 'gasPricePerGallon', label: 'Gas Price per Gallon ($)', type: 'number', defaultValue: 3.65 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const dist = Number(inputs.distanceMiles || 450);
      const mpg = Number(inputs.vehicleMpg || 28);
      const price = Number(inputs.gasPricePerGallon || 3.65);

      const gallons = dist / (mpg || 1);
      const totalCost = gallons * price;

      const res = {
        distance: `${dist} miles`,
        gallonsRequired: `${gallons.toFixed(1)} gallons`,
        estimatedFuelCost: `$${totalCost.toFixed(2)}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 13. Discount & Sale Price Calculator
  {
    id: 'discount-calculator',
    name: 'Retail Discount & Final Sale Price Calculator',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Calculate final checkout price with percentage discounts and sales tax applied.',
    iconName: 'Tag',
    version: '1.0.0',
    tags: ['discount', 'sale', 'shopping', 'tax', 'savings'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'price', label: 'Original Price ($)', type: 'number', defaultValue: 120 },
        { name: 'discountPercent', label: 'Discount (%)', type: 'number', defaultValue: 25 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const p = Number(inputs.price || 120);
      const d = Number(inputs.discountPercent || 25);
      const savings = (p * d) / 100;
      const finalPrice = p - savings;

      const res = {
        originalPrice: `$${p.toFixed(2)}`,
        savings: `$${savings.toFixed(2)}`,
        finalSalePrice: `$${finalPrice.toFixed(2)}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 14. GPA & College Grade Calculator
  {
    id: 'gpa-calculator',
    name: 'College GPA & Grade Point Average Calculator',
    category: 'calculators',
    subcategory: 'education',
    description: 'Calculate 4.0 scale weighted GPA based on course credit hours and letter grades.',
    iconName: 'GraduationCap',
    version: '1.0.0',
    tags: ['gpa', 'grades', 'college', 'school', 'education'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'courses', label: 'Courses (Grade, Credits per line)', type: 'textarea', defaultValue: 'A, 4\nA-, 3\nB+, 4\nA, 3' },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const gradeMap: Record<string, number> = {
        'A+': 4.0, A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0.0,
      };
      const lines = (inputs.courses || '').split('\n').filter(Boolean);
      let totalPts = 0;
      let totalCredits = 0;

      for (const line of lines) {
        const [g, cStr] = line.split(',').map((s) => s.trim());
        const cred = Number(cStr || 3);
        const pts = gradeMap[g.toUpperCase()] ?? 3.0;
        totalPts += pts * cred;
        totalCredits += cred;
      }

      const gpa = Number((totalPts / (totalCredits || 1)).toFixed(2));
      const res = { gpa, totalCredits, honorsStatus: gpa >= 3.8 ? 'Summa Cum Laude' : gpa >= 3.5 ? 'Magna Cum Laude' : 'Good Standing' };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 15. Prime Factorization & GCD / LCM Calculator
  {
    id: 'prime-factor-calculator',
    name: 'Prime Factorization & GCD / LCM Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Calculate prime factors, Greatest Common Divisor (GCD), and Least Common Multiple (LCM).',
    iconName: 'Hash',
    version: '1.0.0',
    tags: ['prime', 'factors', 'gcd', 'lcm', 'math'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'numberA', label: 'First Number', type: 'number', defaultValue: 48 },
        { name: 'numberB', label: 'Second Number', type: 'number', defaultValue: 180 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      let a = Math.abs(Number(inputs.numberA || 48));
      let b = Math.abs(Number(inputs.numberB || 180));

      function gcd(x: number, y: number): number {
        return y === 0 ? x : gcd(y, x % y);
      }
      const g = gcd(a, b);
      const lcm = (a * b) / g;

      const res = { numberA: a, numberB: b, gcd: g, lcm };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 16. Electricity Power Consumption Cost Calculator
  {
    id: 'electricity-cost-calculator',
    name: 'Appliance Electricity & Power Cost Calculator',
    category: 'calculators',
    subcategory: 'utilities',
    description: 'Calculate monthly and annual kilowatt-hour (kWh) electricity utility costs for home/office appliances.',
    iconName: 'Zap',
    version: '1.0.0',
    tags: ['electricity', 'energy', 'kwh', 'power', 'utility-cost'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'wattage', label: 'Appliance Power (Watts)', type: 'number', defaultValue: 500 },
        { name: 'hoursPerDay', label: 'Hours Used Per Day', type: 'number', defaultValue: 8 },
        { name: 'costPerKwh', label: 'Electricity Cost per kWh ($)', type: 'number', defaultValue: 0.15 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const watts = Number(inputs.wattage || 500);
      const hours = Number(inputs.hoursPerDay || 8);
      const kwhCost = Number(inputs.costPerKwh || 0.15);

      const dailyKwh = (watts * hours) / 1000;
      const monthlyKwh = dailyKwh * 30;
      const monthlyCost = monthlyKwh * kwhCost;

      const res = {
        dailyUsage: `${dailyKwh.toFixed(2)} kWh`,
        monthlyCost: `$${monthlyCost.toFixed(2)}`,
        annualCost: `$${(monthlyCost * 12).toFixed(2)}`,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 17. Timezone World Clock Offset Calculator
  {
    id: 'timezone-offset-calculator',
    name: 'Timezone World Clock & Meeting Time Planner',
    category: 'calculators',
    subcategory: 'time',
    description: 'Compare local hours across UTC, EST, PST, GMT, CET, and JST for remote teams.',
    iconName: 'Globe',
    version: '1.0.0',
    tags: ['timezone', 'world-clock', 'remote', 'meeting', 'time'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'targetHourUtc', label: 'UTC Hour (0-23)', type: 'number', defaultValue: 14 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const utc = Number(inputs.targetHourUtc || 14);
      const fmt = (h: number) => {
        const norm = (h + 24) % 24;
        return `${norm.toString().padStart(2, '0')}:00`;
      };

      const table = {
        UTC: fmt(utc),
        'EST (New York, UTC-5)': fmt(utc - 5),
        'PST (San Francisco, UTC-8)': fmt(utc - 8),
        'GMT (London, UTC+0)': fmt(utc),
        'CET (Berlin, UTC+1)': fmt(utc + 1),
        'JST (Tokyo, UTC+9)': fmt(utc + 9),
      };
      return { success: true, data: table, text: JSON.stringify(table, null, 2) };
    },
  },

  // 18. Dog & Cat Age in Human Years Calculator
  {
    id: 'pet-age-calculator',
    name: 'Dog & Cat Age in Human Years Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate physiological human age equivalents for canine and feline companions.',
    iconName: 'Heart',
    version: '1.0.0',
    tags: ['pet', 'dog-age', 'cat-age', 'animals', 'calculator'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'petType', label: 'Pet Species', type: 'select', defaultValue: 'dog', options: [{ label: 'Dog (Medium 20-50 lbs)', value: 'dog' }, { label: 'Cat', value: 'cat' }] },
        { name: 'calendarYears', label: 'Pet Age in Years', type: 'number', defaultValue: 4 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const yrs = Number(inputs.calendarYears || 4);
      let humanYears = 0;
      if (inputs.petType === 'dog') {
        if (yrs <= 1) humanYears = 15;
        else if (yrs === 2) humanYears = 24;
        else humanYears = 24 + (yrs - 2) * 5;
      } else {
        if (yrs <= 1) humanYears = 15;
        else if (yrs === 2) humanYears = 24;
        else humanYears = 24 + (yrs - 2) * 4;
      }

      const res = { petAge: `${yrs} years`, humanEquivalent: `${humanYears} years old` };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 19. Concrete & Construction Volume Calculator
  {
    id: 'concrete-volume-calculator',
    name: 'Concrete Slab Yardage & Volume Calculator',
    category: 'calculators',
    subcategory: 'construction',
    description: 'Calculate cubic yards and standard 60lb/80lb concrete bags needed for slab pours.',
    iconName: 'Box',
    version: '1.0.0',
    tags: ['concrete', 'construction', 'cubic-yards', 'volume', 'diy'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'lengthFeet', label: 'Slab Length (Feet)', type: 'number', defaultValue: 12 },
        { name: 'widthFeet', label: 'Slab Width (Feet)', type: 'number', defaultValue: 10 },
        { name: 'thicknessInches', label: 'Thickness (Inches)', type: 'number', defaultValue: 4 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const l = Number(inputs.lengthFeet || 12);
      const w = Number(inputs.widthFeet || 10);
      const tIn = Number(inputs.thicknessInches || 4);

      const cubicFeet = l * w * (tIn / 12);
      const cubicYards = cubicFeet / 27;
      const bags80lb = Math.ceil(cubicYards * 45);

      const res = {
        volumeCubicFeet: cubicFeet.toFixed(1),
        volumeCubicYards: cubicYards.toFixed(2),
        estimated80lbBags: bags80lb,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 20. Circle & Geometry Area / Circumference Calculator
  {
    id: 'circle-geometry-calculator',
    name: 'Circle Area, Circumference & Diameter Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Calculate radius, diameter, area (πr²), and circumference (2πr) of circles.',
    iconName: 'Circle',
    version: '1.0.0',
    tags: ['circle', 'geometry', 'area', 'circumference', 'math'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'radius', label: 'Radius', type: 'number', defaultValue: 7 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const r = Number(inputs.radius || 7);
      const d = 2 * r;
      const a = Math.PI * r * r;
      const c = 2 * Math.PI * r;

      const res = {
        radius: r,
        diameter: d,
        area: Number(a.toFixed(3)),
        circumference: Number(c.toFixed(3)),
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 21. Water Intake & Daily Hydration Calculator
  {
    id: 'water-intake-calculator',
    name: 'Daily Water Intake & Hydration Calculator',
    category: 'calculators',
    subcategory: 'health',
    description: 'Calculate recommended daily fluid ounces and liters of water based on body weight and exercise.',
    iconName: 'Droplet',
    version: '1.0.0',
    tags: ['water', 'hydration', 'health', 'fitness', 'nutrition'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'weightLbs', label: 'Body Weight (lbs)', type: 'number', defaultValue: 160 },
        { name: 'dailyExerciseMins', label: 'Exercise per Day (Minutes)', type: 'number', defaultValue: 45 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const lbs = Number(inputs.weightLbs || 160);
      const mins = Number(inputs.dailyExerciseMins || 45);

      const baseOz = lbs * 0.5;
      const exerciseOz = (mins / 30) * 12;
      const totalOz = baseOz + exerciseOz;
      const liters = totalOz * 0.0295735;

      const res = {
        dailyTargetOunces: Math.round(totalOz),
        dailyTargetLiters: Number(liters.toFixed(1)),
        glasses8oz: Math.round(totalOz / 8),
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 22. Simple Paint Coverage Room Calculator
  {
    id: 'paint-coverage-calculator',
    name: 'Interior Room Paint Gallon Coverage Calculator',
    category: 'calculators',
    subcategory: 'diy',
    description: 'Calculate square footage and paint gallons needed for room walls minus doors and windows.',
    iconName: 'PenTool',
    version: '1.0.0',
    tags: ['paint', 'coverage', 'room', 'diy', 'home-improvement'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'roomWidth', label: 'Room Width (Feet)', type: 'number', defaultValue: 14 },
        { name: 'roomLength', label: 'Room Length (Feet)', type: 'number', defaultValue: 16 },
        { name: 'ceilingHeight', label: 'Ceiling Height (Feet)', type: 'number', defaultValue: 9 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const w = Number(inputs.roomWidth || 14);
      const l = Number(inputs.roomLength || 16);
      const h = Number(inputs.ceilingHeight || 9);

      const wallArea = 2 * (w + l) * h;
      const netWallArea = wallArea - 40; // Deduct doors/windows
      const gallons = Math.ceil(netWallArea / 350); // 350 sq ft per gallon

      const res = {
        wallSquareFootage: Math.round(netWallArea),
        gallonsRequiredFor1Coat: gallons,
        gallonsRequiredFor2Coats: gallons * 2,
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 23. Quadratic Equation Solver
  {
    id: 'quadratic-equation-solver',
    name: 'Quadratic Equation Solver (ax² + bx + c = 0)',
    category: 'calculators',
    subcategory: 'math',
    description: 'Find real and complex roots for quadratic algebra polynomials with discriminant steps.',
    iconName: 'Percent',
    version: '1.0.0',
    tags: ['quadratic', 'algebra', 'polynomial', 'math', 'roots'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'a', label: 'Coefficient a', type: 'number', defaultValue: 1 },
        { name: 'b', label: 'Coefficient b', type: 'number', defaultValue: -5 },
        { name: 'c', label: 'Coefficient c', type: 'number', defaultValue: 6 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const a = Number(inputs.a || 1);
      const b = Number(inputs.b || -5);
      const c = Number(inputs.c || 6);

      const d = b * b - 4 * a * c;
      if (d < 0) {
        return { success: true, data: { discriminant: d, roots: 'Complex (No real solutions)' } };
      }
      const x1 = (-b + Math.sqrt(d)) / (2 * a);
      const x2 = (-b - Math.sqrt(d)) / (2 * a);
      const res = { discriminant: d, root1: x1, root2: x2 };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },

  // 24. Car Depreciation & Resale Value Calculator
  {
    id: 'car-depreciation-calculator',
    name: 'Vehicle Depreciation & 5-Year Resale Value',
    category: 'calculators',
    subcategory: 'finance',
    description: 'Estimate annual vehicle value depreciation curves over 5 years.',
    iconName: 'Truck',
    version: '1.0.0',
    tags: ['car', 'depreciation', 'vehicle', 'resale', 'finance'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'purchasePrice', label: 'Vehicle Purchase Price ($)', type: 'number', defaultValue: 35000 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const p = Number(inputs.purchasePrice || 35000);
      const schedule = {
        Year1_Value: `$${Math.round(p * 0.80).toLocaleString()} (20% drop)`,
        Year2_Value: `$${Math.round(p * 0.68).toLocaleString()}`,
        Year3_Value: `$${Math.round(p * 0.58).toLocaleString()}`,
        Year4_Value: `$${Math.round(p * 0.49).toLocaleString()}`,
        Year5_Value: `$${Math.round(p * 0.40).toLocaleString()} (60% total loss)`,
      };
      return { success: true, data: schedule, text: JSON.stringify(schedule, null, 2) };
    },
  },

  // 25. Bra Size & Fitting Calculator
  {
    id: 'clothing-size-converter',
    name: 'International Shoe & Clothing Size Converter',
    category: 'calculators',
    subcategory: 'conversion',
    description: 'Convert US, UK, EU, and Asian shoe and apparel size conventions.',
    iconName: 'ShoppingBag',
    version: '1.0.0',
    tags: ['clothing', 'shoe-size', 'sizing', 'international', 'converter'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'usShoeSize', label: 'US Men Shoe Size', type: 'number', defaultValue: 10 },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      const us = Number(inputs.usShoeSize || 10);
      const eu = us + 33;
      const uk = us - 0.5;
      const cm = us * 0.84 + 19.5;

      const res = {
        usSize: us,
        ukSize: uk,
        euSize: eu,
        footLengthCm: Number(cm.toFixed(1)),
      };
      return { success: true, data: res, text: JSON.stringify(res, null, 2) };
    },
  },
];
