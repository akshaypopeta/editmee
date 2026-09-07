import { CalculatorDefinition, CalculatorResult } from '../types';

export const mathCalculators: CalculatorDefinition[] = [
  // 15. Quadratic Equation Solver
  {
    id: 'quadratic-equation-solver',
    name: 'Quadratic Equation Solver',
    category: 'calculators',
    subcategory: 'math',
    description: 'Solve any quadratic equation ax² + bx + c = 0 with real or complex roots, discriminant, and parabola vertex.',
    iconName: 'Variable',
    tags: ['quadratic solver', 'algebra', 'roots', 'discriminant', 'parabola', 'polynomial'],
    inputs: [
      { id: 'a', label: 'Coefficient a (x²)', type: 'number', defaultValue: 1, step: 0.1 },
      { id: 'b', label: 'Coefficient b (x)', type: 'number', defaultValue: -5, step: 0.1 },
      { id: 'c', label: 'Constant c', type: 'number', defaultValue: 6, step: 0.1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const a = Number(inputs.a) || 1;
      const b = Number(inputs.b) || 0;
      const c = Number(inputs.c) || 0;

      if (a === 0) {
        if (b === 0) {
          return {
            success: false,
            error: 'Not an equation (a=0 and b=0).',
            primary: { label: 'Roots', value: 'None' },
            metrics: [],
          };
        }
        const linearRoot = -c / b;
        return {
          success: true,
          primary: { label: 'Linear Root (a=0)', value: `x = ${linearRoot.toFixed(4)}` },
          metrics: [{ label: 'Equation Type', value: 'Linear (bx + c = 0)' }],
        };
      }

      const discriminant = b * b - 4 * a * c;
      const vertexX = -b / (2 * a);
      const vertexY = a * vertexX * vertexX + b * vertexX + c;
      const opens = a > 0 ? 'Upward (Minimum at vertex)' : 'Downward (Maximum at vertex)';

      let root1Str = '';
      let root2Str = '';
      let rootType = '';

      if (discriminant > 0) {
        const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        root1Str = `x₁ = ${r1.toFixed(4)}`;
        root2Str = `x₂ = ${r2.toFixed(4)}`;
        rootType = 'Two Distinct Real Roots';
      } else if (discriminant === 0) {
        const r = -b / (2 * a);
        root1Str = `x = ${r.toFixed(4)}`;
        root2Str = 'Single repeated root';
        rootType = 'One Repeated Real Root';
      } else {
        const realPart = (-b / (2 * a)).toFixed(4);
        const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
        root1Str = `x₁ = ${realPart} + ${imagPart}i`;
        root2Str = `x₂ = ${realPart} - ${imagPart}i`;
        rootType = 'Two Complex Conjugate Roots';
      }

      return {
        success: true,
        primary: { label: 'Roots Solution', value: `${root1Str}${root2Str ? `,  ${root2Str}` : ''}` },
        metrics: [
          { label: 'Discriminant (Δ = b² - 4ac)', value: discriminant.toFixed(2), subtext: rootType, isHighlight: true },
          { label: 'Vertex Coordinates (h, k)', value: `(${vertexX.toFixed(2)}, ${vertexY.toFixed(2)})`, subtext: opens },
          { label: 'Y-Intercept', value: `(0, ${c})`, subtext: 'Value of c' },
          { label: 'Axis of Symmetry', value: `x = ${vertexX.toFixed(2)}`, subtext: 'Line x = -b/(2a)' },
        ],
        breakdownTitle: 'Quadratic Properties',
        breakdownRows: [
          { label: 'Root 1 (x₁)', value: root1Str },
          { label: 'Root 2 (x₂)', value: root2Str },
          { label: 'Vertex (h, k)', value: `(${vertexX.toFixed(4)}, ${vertexY.toFixed(4)})` },
          { label: 'Parabola Orientation', value: opens },
        ],
        interpretation: `For ${a}x² + ${b}x + ${c} = 0, the discriminant Δ is ${discriminant.toFixed(2)}. ${rootType}. The parabola has its vertex at (${vertexX.toFixed(2)}, ${vertexY.toFixed(2)}).`,
        formulaExplanation: 'x = [-b ± √(b² - 4ac)] / (2a). Vertex h = -b/(2a), k = c - b²/(4a).',
        exampleCalculation: 'For x² - 5x + 6 = 0: a=1, b=-5, c=6. Δ = 25 - 24 = 1. Roots are (5 ± 1)/2 → x₁ = 3, x₂ = 2.',
      };
    },
    seo: {
      title: 'Quadratic Equation Solver - Real & Complex Roots',
      metaDescription: 'Solve quadratic equations step by step. Calculates roots, discriminant, vertex coordinates, and parabola graph attributes.',
      keywords: ['quadratic formula solver', 'quadratic equation calculator', 'roots of quadratic', 'discriminant calculator'],
    },
    howTo: [
      { step: 1, title: 'Enter Coefficients', description: 'Input coefficients a, b, and c corresponding to ax² + bx + c = 0.' },
      { step: 2, title: 'Check Discriminant', description: 'See whether Δ > 0 (two real roots), Δ = 0 (one real root), or Δ < 0 (complex roots).' },
      { step: 3, title: 'View Roots and Vertex', description: 'Review the precise root coordinates and the parabola vertex point.' },
    ],
  },

  // 16. Scientific Fraction Calculator
  {
    id: 'fraction-calculator',
    name: 'Fractions & Mixed Numbers Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Add, subtract, multiply, and divide fractions with automated GCD reduction, mixed number display, and decimal conversion.',
    iconName: 'Divide',
    tags: ['fraction calculator', 'simplify fractions', 'mixed numbers', 'rational numbers', 'math'],
    inputs: [
      { id: 'num1', label: 'Fraction 1: Numerator', type: 'number', defaultValue: 3, step: 1 },
      { id: 'den1', label: 'Fraction 1: Denominator', type: 'number', defaultValue: 4, min: 1, step: 1 },
      { id: 'operation', label: 'Operation', type: 'select', defaultValue: '+', options: [{ label: 'Addition (+)', value: '+' }, { label: 'Subtraction (-)', value: '-' }, { label: 'Multiplication (×)', value: '*' }, { label: 'Division (÷)', value: '/' }] },
      { id: 'num2', label: 'Fraction 2: Numerator', type: 'number', defaultValue: 2, step: 1 },
      { id: 'den2', label: 'Fraction 2: Denominator', type: 'number', defaultValue: 5, min: 1, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const n1 = Math.round(Number(inputs.num1) || 0);
      const d1 = Math.round(Number(inputs.den1) || 1);
      const op = inputs.operation || '+';
      const n2 = Math.round(Number(inputs.num2) || 0);
      const d2 = Math.round(Number(inputs.den2) || 1);

      if (d1 === 0 || d2 === 0) {
        return {
          success: false,
          error: 'Denominator cannot be zero.',
          primary: { label: 'Result', value: 'Undefined' },
          metrics: [],
        };
      }
      if (op === '/' && n2 === 0) {
        return {
          success: false,
          error: 'Division by zero is undefined.',
          primary: { label: 'Result', value: 'Undefined' },
          metrics: [],
        };
      }

      const gcd = (x: number, y: number): number => {
        let a = Math.abs(x);
        let b = Math.abs(y);
        while (b) {
          const t = b;
          b = a % b;
          a = t;
        }
        return a || 1;
      };

      let resNum = 0;
      let resDen = 1;

      switch (op) {
        case '+':
          resNum = n1 * d2 + n2 * d1;
          resDen = d1 * d2;
          break;
        case '-':
          resNum = n1 * d2 - n2 * d1;
          resDen = d1 * d2;
          break;
        case '*':
          resNum = n1 * n2;
          resDen = d1 * d2;
          break;
        case '/':
          resNum = n1 * d2;
          resDen = d1 * n2;
          break;
      }

      if (resDen < 0) {
        resNum = -resNum;
        resDen = -resDen;
      }

      const commonDivisor = gcd(resNum, resDen);
      const simNum = resNum / commonDivisor;
      const simDen = resDen / commonDivisor;

      const decimalVal = simNum / simDen;

      // Mixed number
      let mixedStr = '';
      if (Math.abs(simNum) >= simDen && simDen !== 1) {
        const whole = Math.trunc(simNum / simDen);
        const rem = Math.abs(simNum % simDen);
        mixedStr = rem !== 0 ? `${whole} ${rem}/${simDen}` : `${whole}`;
      }

      const fractionStr = simDen === 1 ? `${simNum}` : `${simNum}/${simDen}`;

      return {
        success: true,
        primary: { label: 'Simplified Result', value: fractionStr, unit: mixedStr ? `(= ${mixedStr})` : '' },
        metrics: [
          { label: 'Decimal Equivalent', value: decimalVal.toFixed(6), subtext: 'Exact floating point', isHighlight: true },
          { label: 'Mixed Number', value: mixedStr || fractionStr, subtext: 'Whole + remainder fraction' },
          { label: 'Greatest Common Divisor (GCD)', value: commonDivisor, subtext: 'Reduction factor' },
          { label: 'Original Expression', value: `${n1}/${d1} ${op} ${n2}/${d2}`, subtext: 'Input terms' },
        ],
        breakdownTitle: 'Step-by-Step Reduction',
        breakdownRows: [
          { label: 'Common Denominator Term', value: `${resNum}/${resDen}` },
          { label: 'Divided by GCD (' + commonDivisor + ')', value: `${simNum}/${simDen}` },
          { label: 'Decimal Value', value: decimalVal.toString() },
        ],
        interpretation: `Calculating ${n1}/${d1} ${op} ${n2}/${d2} yields unreduced ${resNum}/${resDen}. Dividing numerator and denominator by GCD ${commonDivisor} reduces to ${fractionStr} (${decimalVal.toFixed(4)}).`,
        formulaExplanation: 'Addition: a/b + c/d = (ad + bc)/bd. Division: (a/b) ÷ (c/d) = (ad)/(bc). Simplify via GCD.',
        exampleCalculation: '3/4 + 2/5 = (15 + 8)/20 = 23/20 = 1 3/20 = 1.15.',
      };
    },
    seo: {
      title: 'Fraction Calculator - Add, Subtract, Multiply & Divide Fractions',
      metaDescription: 'Free fraction calculator. Add, subtract, multiply, and divide fractions with automated step-by-step reduction, mixed numbers, and decimals.',
      keywords: ['fraction calculator', 'simplify fractions', 'mixed fraction calculator', 'math fractions'],
    },
    howTo: [
      { step: 1, title: 'Input First Fraction', description: 'Enter numerator and denominator for the first fraction.' },
      { step: 2, title: 'Select Operation', description: 'Choose addition (+), subtraction (-), multiplication (×), or division (÷).' },
      { step: 3, title: 'Input Second Fraction', description: 'Enter numerator and denominator for the second term.' },
      { step: 4, title: 'View Simplified Result', description: 'Review the lowest-term fraction, mixed number, and decimal representation.' },
    ],
  },

  // 17. Pythagorean Theorem Calculator
  {
    id: 'pythagorean-theorem-calculator',
    name: 'Pythagorean Theorem & Right Triangle Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Solve any right triangle side (a, b, or hypotenuse c) using a² + b² = c² plus area, perimeter, and acute angles.',
    iconName: 'Triangle',
    tags: ['pythagorean theorem', 'right triangle', 'hypotenuse', 'geometry', 'trigonometry'],
    inputs: [
      { id: 'solveFor', label: 'Solve For', type: 'select', defaultValue: 'c', options: [{ label: 'Hypotenuse (c)', value: 'c' }, { label: 'Leg a', value: 'a' }, { label: 'Leg b', value: 'b' }] },
      { id: 'side1', label: 'First Known Side', type: 'number', defaultValue: 3, min: 0.01, step: 0.5 },
      { id: 'side2', label: 'Second Known Side', type: 'number', defaultValue: 4, min: 0.01, step: 0.5 },
    ],
    calculate: (inputs): CalculatorResult => {
      const solve = inputs.solveFor || 'c';
      const s1 = Number(inputs.side1) || 3;
      const s2 = Number(inputs.side2) || 4;

      let a = 0;
      let b = 0;
      let c = 0;

      if (solve === 'c') {
        a = s1;
        b = s2;
        c = Math.sqrt(a * a + b * b);
      } else if (solve === 'a') {
        b = s1;
        c = s2;
        if (c <= b) {
          return {
            success: false,
            error: 'Hypotenuse (c) must be strictly greater than Leg b.',
            primary: { label: 'Side a', value: 'Invalid' },
            metrics: [],
          };
        }
        a = Math.sqrt(c * c - b * b);
      } else {
        a = s1;
        c = s2;
        if (c <= a) {
          return {
            success: false,
            error: 'Hypotenuse (c) must be strictly greater than Leg a.',
            primary: { label: 'Side b', value: 'Invalid' },
            metrics: [],
          };
        }
        b = Math.sqrt(c * c - a * a);
      }

      const perimeter = a + b + c;
      const area = 0.5 * a * b;
      const angleA = (Math.asin(a / c) * 180) / Math.PI;
      const angleB = 90 - angleA;

      const solvedVal = solve === 'c' ? c : solve === 'a' ? a : b;

      return {
        success: true,
        primary: { label: `Solved Side ${solve.toUpperCase()}`, value: solvedVal.toFixed(4) },
        metrics: [
          { label: 'Triangle Area', value: area.toFixed(2), subtext: '½ × a × b', isHighlight: true },
          { label: 'Perimeter', value: perimeter.toFixed(2), subtext: 'a + b + c' },
          { label: 'Acute Angle α', value: `${angleA.toFixed(2)}°`, subtext: 'Opposite side a' },
          { label: 'Acute Angle β', value: `${angleB.toFixed(2)}°`, subtext: 'Opposite side b' },
        ],
        breakdownTitle: 'Right Triangle Dimensions',
        breakdownRows: [
          { label: 'Leg a', value: a.toFixed(4) },
          { label: 'Leg b', value: b.toFixed(4) },
          { label: 'Hypotenuse c', value: c.toFixed(4) },
          { label: 'Right Angle γ', value: '90.00°' },
        ],
        interpretation: `For sides a=${a.toFixed(2)}, b=${b.toFixed(2)}, and c=${c.toFixed(2)}, the triangle has an area of ${area.toFixed(2)} and perimeter of ${perimeter.toFixed(2)}.`,
        formulaExplanation: 'a² + b² = c² → c = √(a² + b²), a = √(c² - b²), b = √(c² - a²). Area = ½ab.',
        exampleCalculation: 'With legs 3 and 4: c = √(3² + 4²) = √(9 + 16) = √25 = 5. Area = ½(3)(4) = 6.',
      };
    },
    seo: {
      title: 'Pythagorean Theorem Calculator - Right Triangle Solver',
      metaDescription: 'Free Pythagorean theorem calculator. Solve for legs a, b, or hypotenuse c with angles, perimeter, and area calculations.',
      keywords: ['pythagorean theorem calculator', 'right triangle calculator', 'hypotenuse calculator', 'triangle solver'],
    },
    howTo: [
      { step: 1, title: 'Select Unknown Side', description: 'Choose whether you want to solve for hypotenuse (c) or one of the legs (a or b).' },
      { step: 2, title: 'Enter Known Lengths', description: 'Input the lengths of the two known sides.' },
      { step: 3, title: 'View Complete Triangle Geometry', description: 'Get the exact solved side, angles in degrees, perimeter, and area.' },
    ],
  },

  // 18. Greatest Common Divisor (GCD) & LCM Calculator
  {
    id: 'gcd-lcm-calculator',
    name: 'GCD & LCM Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Find the Greatest Common Divisor (GCD / GCF) and Least Common Multiple (LCM) of numbers using the Euclidean algorithm.',
    iconName: 'Binary',
    tags: ['gcd', 'lcm', 'gcf', 'greatest common divisor', 'least common multiple', 'euclidean algorithm'],
    inputs: [
      { id: 'number1', label: 'First Integer', type: 'number', defaultValue: 48, min: 1, step: 1 },
      { id: 'number2', label: 'Second Integer', type: 'number', defaultValue: 180, min: 1, step: 1 },
      { id: 'number3', label: 'Third Integer (Optional)', type: 'number', defaultValue: 0, min: 0, step: 1 },
    ],
    calculate: (inputs): CalculatorResult => {
      const a = Math.abs(Math.round(Number(inputs.number1) || 1));
      const b = Math.abs(Math.round(Number(inputs.number2) || 1));
      const c = Math.abs(Math.round(Number(inputs.number3) || 0));

      const gcd2 = (x: number, y: number): number => {
        let n1 = x;
        let n2 = y;
        while (n2 !== 0) {
          const t = n2;
          n2 = n1 % n2;
          n1 = t;
        }
        return n1;
      };

      const lcm2 = (x: number, y: number): number => {
        return Math.abs(x * y) / gcd2(x, y);
      };

      let finalGcd = gcd2(a, b);
      let finalLcm = lcm2(a, b);

      if (c > 0) {
        finalGcd = gcd2(finalGcd, c);
        finalLcm = lcm2(finalLcm, c);
      }

      return {
        success: true,
        primary: { label: 'Greatest Common Divisor (GCD)', value: `${finalGcd}` },
        metrics: [
          { label: 'Least Common Multiple (LCM)', value: `${finalLcm.toLocaleString()}`, subtext: 'Smallest common multiple', isHighlight: true },
          { label: 'Inputs Considered', value: c > 0 ? `${a}, ${b}, ${c}` : `${a}, ${b}`, subtext: 'Original integer inputs' },
          { label: 'Product of First Two', value: `${(a * b).toLocaleString()}`, subtext: 'GCD × LCM = a × b' },
        ],
        breakdownTitle: 'Divisor Multiples',
        breakdownRows: [
          { label: `Factorization of ${a}`, value: `${a} ÷ ${finalGcd} = ${a / finalGcd}` },
          { label: `Factorization of ${b}`, value: `${b} ÷ ${finalGcd} = ${b / finalGcd}` },
          ...(c > 0 ? [{ label: `Factorization of ${c}`, value: `${c} ÷ ${finalGcd} = ${c / finalGcd}` }] : []),
        ],
        interpretation: `The greatest integer dividing all inputs evenly is ${finalGcd}. The smallest positive integer divisible by all inputs is ${finalLcm.toLocaleString()}.`,
        formulaExplanation: 'Euclidean Algorithm: gcd(a, b) = gcd(b, a mod b). LCM(a, b) = |a · b| / GCD(a, b).',
        exampleCalculation: 'For 48 and 180: GCD(48, 180) = 12. LCM(48, 180) = (48 × 180) / 12 = 720.',
      };
    },
    seo: {
      title: 'GCD & LCM Calculator - Greatest Common Divisor & Least Common Multiple',
      metaDescription: 'Find GCD (GCF) and LCM of two or three numbers instantly using Euclidean algorithm. Fast, accurate, and educational.',
      keywords: ['gcd calculator', 'lcm calculator', 'gcf calculator', 'greatest common divisor', 'least common multiple'],
    },
    howTo: [
      { step: 1, title: 'Enter First Number', description: 'Input a positive whole number.' },
      { step: 2, title: 'Enter Second Number', description: 'Input the second positive integer.' },
      { step: 3, title: 'Optional Third Number', description: 'Optionally add a third integer to solve across 3 values.' },
    ],
  },

  // 19. Circle & Sphere Geometry Calculator
  {
    id: 'circle-sphere-calculator',
    name: 'Circle & Sphere Geometry Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Calculate circle area, circumference, diameter, radius, and spherical surface area and volume.',
    iconName: 'Circle',
    tags: ['circle calculator', 'sphere calculator', 'circumference', 'area of circle', 'volume of sphere', 'geometry'],
    inputs: [
      { id: 'inputType', label: 'Given Dimension', type: 'select', defaultValue: 'radius', options: [{ label: 'Radius (r)', value: 'radius' }, { label: 'Diameter (d)', value: 'diameter' }, { label: 'Circumference (C)', value: 'circumference' }, { label: 'Circle Area (A)', value: 'area' }] },
      { id: 'inputValue', label: 'Value', type: 'number', defaultValue: 5, min: 0.001, step: 0.5 },
    ],
    calculate: (inputs): CalculatorResult => {
      const type = inputs.inputType || 'radius';
      const val = Number(inputs.inputValue) || 5;

      let r = 0;
      switch (type) {
        case 'radius':
          r = val;
          break;
        case 'diameter':
          r = val / 2;
          break;
        case 'circumference':
          r = val / (2 * Math.PI);
          break;
        case 'area':
          r = Math.sqrt(val / Math.PI);
          break;
      }

      const d = 2 * r;
      const c = 2 * Math.PI * r;
      const area = Math.PI * r * r;
      const sphereSurface = 4 * Math.PI * r * r;
      const sphereVolume = (4 / 3) * Math.PI * Math.pow(r, 3);

      return {
        success: true,
        primary: { label: 'Circle Area', value: area.toFixed(4), unit: 'sq units' },
        metrics: [
          { label: 'Circumference (Perimeter)', value: c.toFixed(4), subtext: '2πr', isHighlight: true },
          { label: 'Radius (r)', value: r.toFixed(4), subtext: `Diameter = ${d.toFixed(4)}` },
          { label: 'Sphere Volume', value: sphereVolume.toFixed(4), subtext: '⁴⁄₃πr³ (3D Sphere)' },
          { label: 'Sphere Surface Area', value: sphereSurface.toFixed(4), subtext: '4πr² (3D Sphere)' },
        ],
        breakdownTitle: 'Geometry Profile',
        breakdownRows: [
          { label: 'Radius (r)', value: r.toFixed(4) },
          { label: 'Diameter (d)', value: d.toFixed(4) },
          { label: 'Circumference (C)', value: c.toFixed(4) },
          { label: '2D Circle Area', value: area.toFixed(4) },
          { label: '3D Sphere Surface Area', value: sphereSurface.toFixed(4) },
          { label: '3D Sphere Volume', value: sphereVolume.toFixed(4) },
        ],
        interpretation: `A circle with radius ${r.toFixed(4)} has a circumference of ${c.toFixed(4)} and an area of ${area.toFixed(4)}. A 3D sphere with this radius has volume ${sphereVolume.toFixed(4)}.`,
        formulaExplanation: 'C = 2πr, Area = πr², Sphere Surface = 4πr², Sphere Volume = ⁴⁄₃πr³.',
        exampleCalculation: 'For radius = 5: C = 2π(5) = 31.4159; Area = π(25) = 78.5398; Sphere Volume = 523.5988.',
      };
    },
    seo: {
      title: 'Circle & Sphere Calculator - Area, Circumference & Volume',
      metaDescription: 'Free geometry calculator for circles and spheres. Solve radius, diameter, circumference, area, surface area, and volume.',
      keywords: ['circle calculator', 'circumference calculator', 'sphere volume calculator', 'area of circle'],
    },
    howTo: [
      { step: 1, title: 'Select Given Dimension', description: 'Choose whether you know radius, diameter, circumference, or area.' },
      { step: 2, title: 'Enter Measurement', description: 'Input your measurement value.' },
      { step: 3, title: 'Review 2D and 3D Outputs', description: 'Instantly view both 2D circle properties and 3D spherical measurements.' },
    ],
  },

  // 20. Exponent & Scientific Notation Calculator
  {
    id: 'exponent-power-calculator',
    name: 'Exponent & Power Calculator',
    category: 'calculators',
    subcategory: 'math',
    description: 'Calculate x to the power of y (xʸ) with negative, decimal, and fractional exponents, square roots, and scientific notation.',
    iconName: 'Superscript',
    tags: ['exponent calculator', 'power calculator', 'scientific notation', 'nth root', 'algebra'],
    inputs: [
      { id: 'base', label: 'Base Number (x)', type: 'number', defaultValue: 2, step: 0.1 },
      { id: 'exponent', label: 'Exponent / Power (y)', type: 'number', defaultValue: 8, step: 0.5 },
    ],
    calculate: (inputs): CalculatorResult => {
      const base = Number(inputs.base);
      const exp = Number(inputs.exponent);

      const result = Math.pow(base, exp);
      const isNegative = base < 0 && Math.abs(exp % 1) > 0;

      if (isNaN(result) || isNegative) {
        return {
          success: false,
          error: 'Negative base with fractional exponent produces a complex/imaginary number.',
          primary: { label: 'Result', value: 'Complex Number' },
          metrics: [],
        };
      }

      const sciNotation = result.toExponential(4);
      const sqrtBase = base >= 0 ? Math.sqrt(base).toFixed(4) : 'N/A';
      const reciprocal = result !== 0 ? (1 / result).toExponential(4) : 'Undefined';

      return {
        success: true,
        primary: { label: `${base}^${exp} Solution`, value: Number.isInteger(result) && Math.abs(result) < 1e12 ? result.toLocaleString() : sciNotation },
        metrics: [
          { label: 'Scientific Notation', value: sciNotation, subtext: 'Base 10 standard', isHighlight: true },
          { label: 'Square Root of Base (√x)', value: sqrtBase, subtext: `x^(1/2)` },
          { label: 'Reciprocal (x^-y)', value: reciprocal, subtext: `1 / (${base}^${exp})` },
          { label: 'Cube of Base (x³)', value: Math.pow(base, 3).toLocaleString(), subtext: 'Base cubed' },
        ],
        breakdownTitle: 'Exponential Profile',
        breakdownRows: [
          { label: 'Standard Decimal', value: result.toString() },
          { label: 'Scientific Notation', value: sciNotation },
          { label: 'Negative Exponent (x^-y)', value: reciprocal },
        ],
        interpretation: `${base} raised to the power of ${exp} equals ${Number.isInteger(result) && Math.abs(result) < 1e12 ? result.toLocaleString() : sciNotation}.`,
        formulaExplanation: 'xʸ = x × x × ... × x (y times). For negative exponents: x^(-y) = 1 / xʸ.',
        exampleCalculation: '2^8 = 256. 10^5 = 100,000. 16^(0.5) = √16 = 4.',
      };
    },
    seo: {
      title: 'Exponent Calculator - Power & Scientific Notation Solver',
      metaDescription: 'Calculate exponents, powers (xʸ), square roots, negative powers, and scientific notation instantly.',
      keywords: ['exponent calculator', 'power calculator', 'scientific notation calculator', 'math power solver'],
    },
    howTo: [
      { step: 1, title: 'Enter Base Number', description: 'Input the base number x.' },
      { step: 2, title: 'Enter Exponent', description: 'Input exponent power y (supports positive, negative, or decimals).' },
      { step: 3, title: 'Read Outputs', description: 'View full standard number, scientific notation, and reciprocals.' },
    ],
  },
];
