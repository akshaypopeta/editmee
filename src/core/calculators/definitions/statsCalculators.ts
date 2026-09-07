import { CalculatorDefinition, CalculatorResult } from '../types';

export const statsCalculators: CalculatorDefinition[] = [
  // 21. Percentage Calculator Suite
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator (3-in-1)',
    category: 'calculators',
    subcategory: 'statistics',
    description: 'Solve what is X% of Y, X is what percentage of Y, and percentage increase or decrease between two numbers.',
    iconName: 'Percent',
    tags: ['percentage calculator', 'percent change', 'percentage increase', 'percentage decrease', 'percent of'],
    inputs: [
      { id: 'mode', label: 'Calculation Type', type: 'select', defaultValue: 'whatIs', options: [{ label: 'What is X% of Y?', value: 'whatIs' }, { label: 'X is what % of Y?', value: 'whatPercent' }, { label: 'Percentage Change from X to Y', value: 'change' }] },
      { id: 'valX', label: 'Value X', type: 'number', defaultValue: 25, step: 1 },
      { id: 'valY', label: 'Value Y', type: 'number', defaultValue: 200, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const mode = inputs.mode || 'whatIs';
      const x = Number(inputs.valX) || 0;
      const y = Number(inputs.valY) || 1;

      let primaryLabel = '';
      let primaryVal = '';
      let metrics: any[] = [];
      let formula = '';
      let interpretation = '';

      if (mode === 'whatIs') {
        const res = (x / 100) * y;
        primaryLabel = `${x}% of ${y}`;
        primaryVal = `${res.toFixed(2)}`;
        metrics = [
          { label: 'Percentage Applied', value: `${x}%`, subtext: 'Rate' },
          { label: 'Base Value', value: `${y}`, subtext: '100% value' },
          { label: 'Remainder', value: `${(y - res).toFixed(2)}`, subtext: `${(100 - x).toFixed(1)}% remaining` },
        ];
        formula = 'Result = (X / 100) × Y';
        interpretation = `${x}% of ${y} is ${res.toFixed(2)}.`;
      } else if (mode === 'whatPercent') {
        if (y === 0) {
          return {
            success: false,
            error: 'Denominator Y cannot be zero.',
            primary: { label: 'Percentage', value: 'Undefined' },
            metrics: [],
          };
        }
        const pct = (x / y) * 100;
        primaryLabel = `${x} as a % of ${y}`;
        primaryVal = `${pct.toFixed(2)}%`;
        metrics = [
          { label: 'Fraction Ratio', value: `${x} / ${y}`, subtext: 'Numerator / Denominator' },
          { label: 'Decimal Equivalent', value: (x / y).toFixed(4), subtext: 'Base 1 decimal' },
          { label: 'Complement', value: `${(100 - pct).toFixed(2)}%`, subtext: 'Portion remaining to 100%' },
        ];
        formula = 'Percentage = (X / Y) × 100';
        interpretation = `${x} is ${pct.toFixed(2)}% of ${y}.`;
      } else {
        if (x === 0) {
          return {
            success: false,
            error: 'Initial value X cannot be zero for percent change.',
            primary: { label: 'Percent Change', value: 'Undefined' },
            metrics: [],
          };
        }
        const diff = y - x;
        const changePct = (diff / Math.abs(x)) * 100;
        const isIncrease = diff >= 0;
        primaryLabel = isIncrease ? 'Percentage Increase' : 'Percentage Decrease';
        primaryVal = `${isIncrease ? '+' : ''}${changePct.toFixed(2)}%`;
        metrics = [
          { label: 'Absolute Difference', value: `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`, subtext: 'Y minus X', isHighlight: true },
          { label: 'Multiplier', value: `${(y / x).toFixed(4)}x`, subtext: 'Ratio of change' },
          { label: 'Initial (X)', value: `${x}`, subtext: 'Starting base' },
          { label: 'Final (Y)', value: `${y}`, subtext: 'Ending value' },
        ];
        formula = 'Change % = [(Y - X) / |X|] × 100';
        interpretation = `Moving from ${x} to ${y} is a ${Math.abs(changePct).toFixed(2)}% ${isIncrease ? 'increase' : 'decrease'}.`;
      }

      return {
        success: true,
        primary: { label: primaryLabel, value: primaryVal },
        metrics,
        formulaExplanation: formula,
        interpretation,
      };
    },
    seo: {
      title: 'Percentage Calculator - Percent Change, Percent Of, Difference',
      metaDescription: 'Free online percentage calculator. Solve what is X% of Y, calculate percent increase and decrease, and find percentage ratios.',
      keywords: ['percentage calculator', 'percent change calculator', 'percent increase', 'percentage of'],
    },
    howTo: [
      { step: 1, title: 'Choose Mode', description: 'Select the percentage question you need answered.' },
      { step: 2, title: 'Enter Numbers', description: 'Input values X and Y.' },
      { step: 3, title: 'Read Direct Results', description: 'Instantly view percentages, differences, and fractional multipliers.' },
    ],
  },

  // 22. Standard Deviation & Variance Calculator
  {
    id: 'standard-deviation-calculator',
    name: 'Standard Deviation & Variance Calculator',
    category: 'calculators',
    subcategory: 'statistics',
    description: 'Calculate mean, median, sample variance, population variance, standard deviation, and standard error for any dataset.',
    iconName: 'BarChart2',
    tags: ['standard deviation', 'variance', 'statistics', 'mean', 'median', 'standard error', 'dataset'],
    inputs: [
      { id: 'dataPoints', label: 'Dataset (Comma or Space separated)', type: 'text', defaultValue: '12, 18, 24, 28, 35, 42, 49, 56', placeholder: 'e.g. 10, 15, 20, 25' },
      { id: 'isSample', label: 'Dataset Type', type: 'select', defaultValue: 'sample', options: [{ label: 'Sample (n - 1 degrees of freedom)', value: 'sample' }, { label: 'Population (N)', value: 'population' }] },
    ],
    calculate: (inputs): CalculatorResult => {
      const raw = String(inputs.dataPoints || '');
      const isSample = (inputs.isSample || 'sample') === 'sample';

      const nums = raw
        .split(/[,\s]+/)
        .map((n) => parseFloat(n.trim()))
        .filter((n) => !isNaN(n));

      if (nums.length < 2) {
        return {
          success: false,
          error: 'Please provide at least two numbers to compute standard deviation.',
          primary: { label: 'Standard Deviation', value: 'N/A' },
          metrics: [],
        };
      }

      const n = nums.length;
      const sum = nums.reduce((a, b) => a + b, 0);
      const mean = sum / n;

      // Sorted for median
      const sorted = [...nums].sort((a, b) => a - b);
      const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

      // Sum of squared deviations
      const ss = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
      const variance = isSample ? ss / (n - 1) : ss / n;
      const stdDev = Math.sqrt(variance);
      const stdError = stdDev / Math.sqrt(n);
      const minVal = sorted[0];
      const maxVal = sorted[n - 1];
      const range = maxVal - minVal;

      return {
        success: true,
        primary: { label: isSample ? 'Sample Standard Deviation (s)' : 'Population Standard Deviation (σ)', value: stdDev.toFixed(4) },
        metrics: [
          { label: 'Mean (Average)', value: mean.toFixed(4), subtext: `Sum = ${sum.toFixed(2)}`, isHighlight: true },
          { label: 'Variance', value: variance.toFixed(4), subtext: isSample ? 's² (n-1)' : 'σ² (N)' },
          { label: 'Median', value: median.toFixed(4), subtext: 'Middle value' },
          { label: 'Standard Error (SE)', value: stdError.toFixed(4), subtext: 's / √n' },
        ],
        breakdownTitle: 'Statistical Summary',
        breakdownRows: [
          { label: 'Sample Size (n)', value: `${n} observations` },
          { label: 'Minimum', value: minVal.toString() },
          { label: 'Maximum', value: maxVal.toString() },
          { label: 'Range (Max - Min)', value: range.toFixed(4) },
          { label: 'Sum of Squares (SS)', value: ss.toFixed(4) },
        ],
        interpretation: `For this dataset of ${n} points, the mean is ${mean.toFixed(2)} and standard deviation is ${stdDev.toFixed(2)}. Roughly 68% of normal observations fall between ${(mean - stdDev).toFixed(2)} and ${(mean + stdDev).toFixed(2)}.`,
        formulaExplanation: 'Sample s = √[ Σ(x - μ)² / (n - 1) ]. Population σ = √[ Σ(x - μ)² / N ].',
        exampleCalculation: 'For 10, 20, 30: Mean = 20. Deviations squared = 100 + 0 + 100 = 200. Sample variance = 200/2 = 100. s = √100 = 10.',
      };
    },
    seo: {
      title: 'Standard Deviation Calculator - Variance, Mean & Median',
      metaDescription: 'Calculate sample and population standard deviation, variance, mean, median, and range from any raw dataset.',
      keywords: ['standard deviation calculator', 'variance calculator', 'sample standard deviation', 'statistics calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Numbers', description: 'Paste or type your numbers separated by commas or spaces.' },
      { step: 2, title: 'Select Sample or Population', description: 'Choose Sample (n - 1) for a representative sample, or Population (N) for an entire census.' },
      { step: 3, title: 'Inspect Summary', description: 'Review the standard deviation, variance, mean, median, and dispersion.' },
    ],
  },

  // 23. Probability & Odds Calculator
  {
    id: 'probability-odds-calculator',
    name: 'Probability & Odds Calculator',
    category: 'calculators',
    subcategory: 'statistics',
    description: 'Convert between probability percentages, decimal probabilities, fractional betting odds, and ratio chances.',
    iconName: 'Dice5',
    tags: ['probability calculator', 'odds converter', 'betting odds', 'chance calculator', 'statistics'],
    inputs: [
      { id: 'favorableOutcomes', label: 'Number of Favorable Outcomes (A)', type: 'number', defaultValue: 1, min: 0, step: 1 },
      { id: 'totalOutcomes', label: 'Total Number of Possible Outcomes (S)', type: 'number', defaultValue: 6, min: 1, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const a = Math.round(Number(inputs.favorableOutcomes) || 0);
      const s = Math.round(Number(inputs.totalOutcomes) || 1);

      if (a > s) {
        return {
          success: false,
          error: 'Favorable outcomes cannot exceed total possible outcomes.',
          primary: { label: 'Probability', value: 'Invalid' },
          metrics: [],
        };
      }

      const probDecimal = a / s;
      const probPercent = probDecimal * 100;
      const unfavorable = s - a;

      // Fractional Odds "Against": unfavorable to favorable
      const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
      const div = gcd(unfavorable, a || 1);
      const oddsAgainstStr = a === 0 ? 'Infinite' : `${unfavorable / div} to ${a / div}`;
      const oddsInFavorStr = unfavorable === 0 ? '100% Certain' : `${a / div} to ${unfavorable / div}`;

      // American Moneyline Odds
      let moneyline = '';
      if (probDecimal > 0.5) {
        const ml = Math.round((probDecimal / (1 - probDecimal)) * -100);
        moneyline = `${ml}`;
      } else if (probDecimal > 0) {
        const ml = Math.round(((1 - probDecimal) / probDecimal) * 100);
        moneyline = `+${ml}`;
      } else {
        moneyline = 'N/A';
      }

      return {
        success: true,
        primary: { label: 'Probability of Event', value: `${probPercent.toFixed(2)}%`, unit: `(${a} in ${s})` },
        metrics: [
          { label: 'Decimal Probability', value: probDecimal.toFixed(4), subtext: 'Scale 0 to 1', isHighlight: true },
          { label: 'Odds Against Event', value: oddsAgainstStr, subtext: 'Unfavorable : Favorable' },
          { label: 'Odds In Favor', value: oddsInFavorStr, subtext: 'Favorable : Unfavorable' },
          { label: 'American Moneyline', value: moneyline, subtext: 'Equivalent sports line' },
        ],
        breakdownTitle: 'Outcome Distribution',
        breakdownRows: [
          { label: 'Favorable Outcomes (A)', value: `${a}`, percentage: Math.round(probPercent) },
          { label: 'Unfavorable Outcomes', value: `${unfavorable}`, percentage: Math.round(100 - probPercent) },
          { label: 'Total Sample Space (S)', value: `${s}`, percentage: 100 },
        ],
        interpretation: `With ${a} favorable out of ${s} total outcomes, the probability is ${probPercent.toFixed(2)}% (odds against are ${oddsAgainstStr}).`,
        formulaExplanation: 'P(A) = Favorable / Total. Odds Against = (Total - Favorable) : Favorable.',
        exampleCalculation: 'Rolling a 4 on a 6-sided die: 1 favorable / 6 total = 16.67% probability (5 to 1 odds against).',
      };
    },
    seo: {
      title: 'Probability & Odds Calculator - Fractional Odds & Chance',
      metaDescription: 'Free probability and odds calculator. Convert favorable outcomes to percentages, fractional odds, ratios, and decimal probabilities.',
      keywords: ['probability calculator', 'odds calculator', 'chance of winning', 'odds converter'],
    },
    howTo: [
      { step: 1, title: 'Enter Desired Event Count', description: 'Input how many winning or favorable outcomes exist.' },
      { step: 2, title: 'Enter Total Possibilities', description: 'Input total size of the sample space.' },
      { step: 3, title: 'View Probability & Odds', description: 'Inspect exact percentage chances and fractional betting odds.' },
    ],
  },

  // 24. Permutation & Combination (nPr / nCr) Calculator
  {
    id: 'permutation-combination-calculator',
    name: 'Permutations & Combinations (nPr / nCr) Calculator',
    category: 'calculators',
    subcategory: 'statistics',
    description: 'Calculate permutations (order matters) and combinations (order does not matter) for picking r elements from n items.',
    iconName: 'Shuffle',
    tags: ['permutations', 'combinations', 'nPr', 'nCr', 'combinatorics', 'factorial'],
    inputs: [
      { id: 'n', label: 'Total Number of Items (n)', type: 'number', defaultValue: 10, min: 1, max: 100, step: 1 },
      { id: 'r', label: 'Number of Items Chosen (r)', type: 'number', defaultValue: 3, min: 0, max: 100, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const n = Math.round(Number(inputs.n) || 10);
      const r = Math.round(Number(inputs.r) || 3);

      if (r > n) {
        return {
          success: false,
          error: 'Number of chosen items (r) cannot exceed total items (n).',
          primary: { label: 'Combinations', value: 'Invalid' },
          metrics: [],
        };
      }

      // Safe factorial/combination computation
      const combinations = (nVal: number, rVal: number): number => {
        if (rVal < 0 || rVal > nVal) return 0;
        if (rVal === 0 || rVal === nVal) return 1;
        const k = Math.min(rVal, nVal - rVal);
        let res = 1;
        for (let i = 1; i <= k; i++) {
          res = (res * (nVal - i + 1)) / i;
        }
        return res;
      };

      const permutations = (nVal: number, rVal: number): number => {
        let res = 1;
        for (let i = 0; i < rVal; i++) {
          res *= nVal - i;
        }
        return res;
      };

      const nCr = combinations(n, r);
      const nPr = permutations(n, r);

      return {
        success: true,
        primary: { label: `Combinations C(${n}, ${r})`, value: nCr.toLocaleString(), unit: 'order does NOT matter' },
        metrics: [
          { label: `Permutations P(${n}, ${r})`, value: nPr.toLocaleString(), subtext: 'Order DOES matter', isHighlight: true },
          { label: 'Arrangement Multiplier (r!)', value: (nPr / Math.max(1, nCr)).toLocaleString(), subtext: 'Ways to arrange chosen group' },
          { label: 'Total Set (n)', value: `${n} items`, subtext: 'Pool size' },
          { label: 'Selected (r)', value: `${r} items`, subtext: 'Subset size' },
        ],
        breakdownTitle: 'Combinatorial Summary',
        breakdownRows: [
          { label: 'Combinations (nCr)', value: `${nCr.toLocaleString()} unique groups` },
          { label: 'Permutations (nPr)', value: `${nPr.toLocaleString()} ordered sequences` },
        ],
        interpretation: `Choosing ${r} items from ${n}: There are ${nCr.toLocaleString()} distinct team combinations, and ${nPr.toLocaleString()} ordered permutations.`,
        formulaExplanation: 'Combinations C(n,r) = n! / [r!(n-r)!]. Permutations P(n,r) = n! / (n-r)!.',
        exampleCalculation: 'Picking 3 from 10: C(10,3) = (10×9×8)/(3×2×1) = 120. P(10,3) = 10×9×8 = 720.',
      };
    },
    seo: {
      title: 'Permutations & Combinations Calculator - nPr and nCr Solver',
      metaDescription: 'Calculate permutations (order matters) and combinations (order does not matter) with formulas and step-by-step logic.',
      keywords: ['permutation calculator', 'combination calculator', 'npr calculator', 'ncr calculator', 'combinatorics'],
    },
    howTo: [
      { step: 1, title: 'Enter Pool Size (n)', description: 'Input the total number of items available.' },
      { step: 2, title: 'Enter Sample Count (r)', description: 'Input how many items you are selecting.' },
      { step: 3, title: 'Compare Orders', description: 'See permutations where order matters (rankings/passwords) vs combinations where order does not matter (lotteries/teams).' },
    ],
  },

  // 25. GPA & Grade Weighted Average Calculator
  {
    id: 'gpa-grade-calculator',
    name: 'College GPA & Weighted Grade Calculator',
    category: 'calculators',
    subcategory: 'statistics',
    description: 'Calculate cumulative semester GPA on a 4.0 scale with custom course grades and credit hours.',
    iconName: 'GraduationCap',
    tags: ['gpa calculator', 'college gpa', 'weighted grade', 'grade point average', 'academic'],
    inputs: [
      { id: 'course1Grade', label: 'Course 1: Letter Grade', type: 'select', defaultValue: 4.0, options: [{ label: 'A (4.0)', value: 4.0 }, { label: 'A- (3.7)', value: 3.7 }, { label: 'B+ (3.3)', value: 3.3 }, { label: 'B (3.0)', value: 3.0 }, { label: 'B- (2.7)', value: 2.7 }, { label: 'C+ (2.3)', value: 2.3 }, { label: 'C (2.0)', value: 2.0 }] },
      { id: 'course1Credits', label: 'Course 1: Credit Hours', type: 'number', defaultValue: 4, min: 1, max: 6, step: 1 },
      { id: 'course2Grade', label: 'Course 2: Letter Grade', type: 'select', defaultValue: 3.7, options: [{ label: 'A (4.0)', value: 4.0 }, { label: 'A- (3.7)', value: 3.7 }, { label: 'B+ (3.3)', value: 3.3 }, { label: 'B (3.0)', value: 3.0 }, { label: 'B- (2.7)', value: 2.7 }, { label: 'C+ (2.3)', value: 2.3 }, { label: 'C (2.0)', value: 2.0 }] },
      { id: 'course2Credits', label: 'Course 2: Credit Hours', type: 'number', defaultValue: 3, min: 1, max: 6, step: 1 },
      { id: 'course3Grade', label: 'Course 3: Letter Grade', type: 'select', defaultValue: 3.3, options: [{ label: 'A (4.0)', value: 4.0 }, { label: 'A- (3.7)', value: 3.7 }, { label: 'B+ (3.3)', value: 3.3 }, { label: 'B (3.0)', value: 3.0 }, { label: 'B- (2.7)', value: 2.7 }, { label: 'C+ (2.3)', value: 2.3 }, { label: 'C (2.0)', value: 2.0 }] },
      { id: 'course3Credits', label: 'Course 3: Credit Hours', type: 'number', defaultValue: 3, min: 1, max: 6, step: 1 },
      { id: 'course4Grade', label: 'Course 4: Letter Grade', type: 'select', defaultValue: 3.0, options: [{ label: 'A (4.0)', value: 4.0 }, { label: 'A- (3.7)', value: 3.7 }, { label: 'B+ (3.3)', value: 3.3 }, { label: 'B (3.0)', value: 3.0 }, { label: 'B- (2.7)', value: 2.7 }, { label: 'C+ (2.3)', value: 2.3 }, { label: 'C (2.0)', value: 2.0 }] },
      { id: 'course4Credits', label: 'Course 4: Credit Hours', type: 'number', defaultValue: 3, min: 1, max: 6, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const g1 = Number(inputs.course1Grade) || 4.0;
      const c1 = Number(inputs.course1Credits) || 3;
      const g2 = Number(inputs.course2Grade) || 3.7;
      const c2 = Number(inputs.course2Credits) || 3;
      const g3 = Number(inputs.course3Grade) || 3.3;
      const c3 = Number(inputs.course3Credits) || 3;
      const g4 = Number(inputs.course4Grade) || 3.0;
      const c4 = Number(inputs.course4Credits) || 3;

      const totalQualityPoints = g1 * c1 + g2 * c2 + g3 * c3 + g4 * c4;
      const totalCredits = c1 + c2 + c3 + c4;
      const gpa = totalQualityPoints / Math.max(1, totalCredits);

      let honor = 'Satisfactory';
      if (gpa >= 3.8) honor = 'Summa Cum Laude Honors';
      else if (gpa >= 3.5) honor = 'Dean\'s List / Magna Cum Laude';
      else if (gpa >= 3.0) honor = 'Good Academic Standing';

      return {
        success: true,
        primary: { label: 'Semester GPA', value: gpa.toFixed(2), unit: '/ 4.00' },
        metrics: [
          { label: 'Academic Standing', value: honor, isHighlight: true },
          { label: 'Total Quality Points', value: totalQualityPoints.toFixed(1), subtext: 'Grade Points × Credits' },
          { label: 'Total Credit Hours', value: `${totalCredits} Credits`, subtext: '4 completed courses' },
          { label: 'Average Grade Point', value: gpa.toFixed(3), subtext: 'Unrounded' },
        ],
        breakdownTitle: 'Course Grade Points',
        breakdownRows: [
          { label: 'Course 1', value: `${g1} pts × ${c1} credits = ${(g1 * c1).toFixed(1)} pts` },
          { label: 'Course 2', value: `${g2} pts × ${c2} credits = ${(g2 * c2).toFixed(1)} pts` },
          { label: 'Course 3', value: `${g3} pts × ${c3} credits = ${(g3 * c3).toFixed(1)} pts` },
          { label: 'Course 4', value: `${g4} pts × ${c4} credits = ${(g4 * c4).toFixed(1)} pts` },
        ],
        interpretation: `Your weighted GPA across ${totalCredits} credit hours is ${gpa.toFixed(2)} on a 4.0 scale (${honor}).`,
        formulaExplanation: 'GPA = Total Quality Points / Total Credit Hours, where Quality Points = Grade Value × Credits.',
        exampleCalculation: '(4.0×4 + 3.7×3 + 3.3×3 + 3.0×3) / 13 credits = 46.0 / 13 = 3.54 GPA.',
      };
    },
    seo: {
      title: 'GPA Calculator - College & High School Grade Point Average',
      metaDescription: 'Free college GPA calculator. Calculate weighted semester GPA on a 4.0 scale with credit hours and honors recognition.',
      keywords: ['gpa calculator', 'college gpa', 'weighted grade calculator', 'grade point average'],
    },
    howTo: [
      { step: 1, title: 'Select Course Grades', description: 'Choose letter grade received for each course.' },
      { step: 2, title: 'Enter Credit Hours', description: 'Input the credit weight of each class (typically 3 or 4 credits).' },
      { step: 3, title: 'View Cumulative GPA', description: 'Review your total quality points, cumulative GPA, and honors tier.' },
    ],
  },
];
