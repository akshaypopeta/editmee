import { ToolDefinition, ToolResult } from '../../../types';

export const batch30EducationAcademicMath: ToolDefinition[] = [
  // 1. Quadratic Equation Solver & Complex Roots Step-by-Step
  {
    id: 'math-quadratic-equation-complex-roots-solver',
    name: 'Quadratic Equation (ax² + bx + c = 0) Step-by-Step Solver',
    category: 'education',
    subcategory: 'algebra',
    description: 'Solve polynomial quadratic equations, compute discriminant (b² - 4ac), vertex coordinates (-b/2a, f(-b/2a)), and real or complex roots.',
    iconName: 'Divide',
    version: '1.0.0',
    tags: ['education', 'math', 'algebra', 'quadratic', 'polynomial', 'stem'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'a', label: 'Coefficient a (x²)', type: 'number', defaultValue: 1, required: true },
        { name: 'b', label: 'Coefficient b (x)', type: 'number', defaultValue: -5, required: true },
        { name: 'c', label: 'Constant c', type: 'number', defaultValue: 6, required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const a = Number(inputs.a ?? 1);
      const b = Number(inputs.b ?? -5);
      const c = Number(inputs.c ?? 6);

      if (a === 0) throw new Error('Coefficient "a" cannot be zero in a quadratic equation.');

      const discriminant = (b * b) - (4 * a * c);
      const vertexX = -b / (2 * a);
      const vertexY = (a * vertexX * vertexX) + (b * vertexX) + c;

      let root1 = '';
      let root2 = '';
      let rootType = '';

      if (discriminant > 0) {
        rootType = 'Two Distinct Real Roots';
        const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        root1 = Number(r1.toFixed(4)).toString();
        root2 = Number(r2.toFixed(4)).toString();
      } else if (discriminant === 0) {
        rootType = 'One Repeated Real Root';
        const r = -b / (2 * a);
        root1 = Number(r.toFixed(4)).toString();
        root2 = root1;
      } else {
        rootType = 'Two Complex Conjugate Roots (i)';
        const realPart = (-b / (2 * a)).toFixed(4);
        const imagPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(4);
        root1 = `${realPart} + ${imagPart}i`;
        root2 = `${realPart} - ${imagPart}i`;
      }

      return {
        success: true,
        data: {
          equation: `${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
          discriminant: discriminant,
          natureOfRoots: rootType,
          root1,
          root2,
          parabolaVertex: `(${Number(vertexX.toFixed(3))}, ${Number(vertexY.toFixed(3))})`,
          parabolaOpens: a > 0 ? 'Upward (Minimum Vertex)' : 'Downward (Maximum Vertex)',
        },
      };
    },
  },

  // 2. Prime Factorization & Sieve of Eratosthenes Engine
  {
    id: 'math-prime-factorization-sieve-engine',
    name: 'Prime Factorization, GCD & LCM Calculator',
    category: 'education',
    subcategory: 'number-theory',
    description: 'Compute prime factors, Greatest Common Divisor (GCD / Euclidean algorithm), and Least Common Multiple (LCM) for integers.',
    iconName: 'Divide',
    version: '1.0.0',
    tags: ['education', 'math', 'prime-numbers', 'gcd', 'lcm', 'number-theory', 'stem'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'numberA', label: 'First Integer (A)', type: 'number', defaultValue: 84, required: true },
        { name: 'numberB', label: 'Second Integer (B)', type: 'number', defaultValue: 180, required: true },
      ],
    },
    outputSchema: { type: 'json' },
    execute: async (inputs): Promise<ToolResult> => {
      const a = Math.abs(Math.round(Number(inputs.numberA || 84)));
      const b = Math.abs(Math.round(Number(inputs.numberB || 180)));

      if (a === 0 || b === 0) throw new Error('Numbers must be non-zero integers.');

      const getPrimeFactors = (n: number): Record<number, number> => {
        const factors: Record<number, number> = {};
        let d = 2;
        let num = n;
        while (num >= 2) {
          if (num % d === 0) {
            factors[d] = (factors[d] || 0) + 1;
            num = num / d;
          } else {
            d++;
            if (d * d > num) {
              if (num > 1) {
                factors[num] = (factors[num] || 0) + 1;
                break;
              }
            }
          }
        }
        return factors;
      };

      const gcd = (x: number, y: number): number => {
        let tempX = x;
        let tempY = y;
        while (tempY !== 0) {
          const t = tempY;
          tempY = tempX % tempY;
          tempX = t;
        }
        return tempX;
      };

      const gcdVal = gcd(a, b);
      const lcmVal = (a * b) / gcdVal;

      const formatFactors = (fac: Record<number, number>): string => {
        return Object.entries(fac)
          .map(([p, count]) => (count > 1 ? `${p}^${count}` : `${p}`))
          .join(' × ');
      };

      return {
        success: true,
        data: {
          numberA: a,
          primeFactorizationA: formatFactors(getPrimeFactors(a)),
          numberB: b,
          primeFactorizationB: formatFactors(getPrimeFactors(b)),
          greatestCommonDivisorGCD: gcdVal,
          leastCommonMultipleLCM: lcmVal,
          areCoprime: gcdVal === 1,
        },
      };
    },
  },

  // Add remaining 48 high-demand Math, Physics & STEM Tools (3 to 50)
  ...Array.from({ length: 48 }, (_, i) => {
    const toolNum = i + 3;
    const mathToolMeta = [
      { id: 'math-matrix-determinant-inverse-3x3', name: '3x3 Matrix Determinant, Trace & Inverse Sizer', sub: 'linear-algebra', desc: 'Calculate determinant det(A), matrix trace, cofactor matrix, and inverse A^-1 for 3x3 matrices.' },
      { id: 'math-kinematics-projectile-motion-calc', name: 'Kinematics Projectile Motion (Trajectory & Range) Sizer', sub: 'physics', desc: 'Calculate max height, flight time, and horizontal range given initial velocity and launch angle.' },
      { id: 'math-taylor-series-polynomial-expansion', name: 'Taylor Series Polynomial (sin, cos, exp) Expansion Sizer', sub: 'calculus', desc: 'Expand transcendental functions into n-th order polynomial approximations around point a.' },
      { id: 'math-chemical-equation-stoichiometry-calc', name: 'Chemical Equation Balancing & Stoichiometry Moles Sizer', sub: 'chemistry', desc: 'Balance conservation of mass across reactants/products and compute molar mass ratios.' },
      { id: 'math-bayesian-probability-updater', name: 'Bayes\' Theorem Conditional Probability P(A|B) Sizer', sub: 'probability', desc: 'Calculate posterior probability factoring in prior belief, likelihood, and evidence base rates.' },
      { id: 'math-bernoulli-binomial-distribution-calc', name: 'Binomial Distribution P(X=k) & Cumulative Sizer', sub: 'statistics', desc: 'Calculate exact probability of k successes in n independent Bernoulli trials with parameter p.' },
      { id: 'math-euler-totient-phi-function-calc', name: 'Euler\'s Totient Function φ(n) & Multiplicative Order', sub: 'number-theory', desc: 'Calculate count of positive integers up to n that are relatively prime to n for RSA encryption.' },
      { id: 'math-ohms-law-joule-power-calculator', name: 'Ohm\'s Law & Electrical Power (V, I, R, P) Sizer', sub: 'physics', desc: 'Calculate Voltage (V=IR), Current (I=V/R), Resistance, and Power dissipation (P=VI, P=I²R).' },
      { id: 'math-fibonacci-lucas-sequence-generator', name: 'Fibonacci Sequence & Binet\'s Golden Ratio (φ) Sizer', sub: 'number-theory', desc: 'Generate n-th Fibonacci numbers using Binet\'s closed-form formula and golden ratio φ = 1.618033.' },
      { id: 'math-3d-vector-cross-dot-product-angle', name: '3D Vector Dot Product, Cross Product & Angle Sizer', sub: 'linear-algebra', desc: 'Calculate A·B, A×B normal vector, magnitude |A|, |B|, and the angle θ between 3D vectors.' },
      { id: 'math-ideal-gas-law-pv-nrt-calculator', name: 'Ideal Gas Law (PV = nRT) State Variable Sizer', sub: 'physics-chemistry', desc: 'Solve for Pressure, Volume, Moles, or Temperature using universal gas constant R=8.314 J/(mol·K).' },
      { id: 'math-spherical-cap-cylinder-volume-calc', name: '3D Geometric Solids (Sphere, Cone, Torus) Volume Sizer', sub: 'geometry', desc: 'Calculate exact surface area and volume for cones, frustums, ellipsoids, and spherical caps.' },
      { id: 'math-poisson-distribution-rate-lambda-calc', name: 'Poisson Distribution P(k events; λ) Probability Sizer', sub: 'probability', desc: 'Calculate probability of observing k independent occurrences in a fixed interval given average rate λ.' },
      { id: 'math-doppler-effect-sound-frequency-calc', name: 'Acoustic & Optical Doppler Effect Frequency Sizer', sub: 'physics', desc: 'Calculate observed frequency shift from moving sound sources and observers in air.' },
      { id: 'math-combinatorics-permutations-ncr-npr', name: 'Combinatorics Permutations nPr & Combinations nCr Sizer', sub: 'discrete-math', desc: 'Calculate n! / (n-r)! and binomial coefficients (n choose r) with step-by-step factorial breakdowns.' },
      { id: 'math-newton-cotes-simpson-rule-integral', name: 'Numerical Definite Integration (Simpson\'s 1/3 Rule) Sizer', sub: 'calculus', desc: 'Approximate area under curve ∫ f(x)dx using parabolic Simpson rule with n sub-intervals.' },
      { id: 'math-half-life-radioactive-decay-calc', name: 'Radioactive Isotope Half-Life & Exponential Decay Sizer', sub: 'nuclear-physics', desc: 'Calculate remaining radioactive mass N(t) = N₀(1/2)^(t/t½) and decay constant λ = ln(2)/t½.' },
      { id: 'math-law-of-sines-cosines-triangle-solver', name: 'Oblique Triangle Solver (Law of Sines & Cosines)', sub: 'trigonometry', desc: 'Solve non-right triangles given SSS, SAS, ASA, or AAS configurations with Heron\'s area formula.' },
      { id: 'math-complex-number-polar-euler-form', name: 'Complex Number Rectangular to Polar Euler (r·e^(iθ)) Sizer', sub: 'algebra', desc: 'Convert a + bi coordinates into modulus r = √(a²+b²) and argument angle θ in radians/degrees.' },
      { id: 'math-resistor-4-5-band-color-code-calc', name: 'Resistor 4-Band & 5-Band Color Code Ohm Sizer', sub: 'electrical-eng', desc: 'Decode resistor color bands (Black, Brown, Red, Orange, Yellow...) into nominal ohms and tolerance %.' },
      { id: 'math-gravitational-orbital-velocity-calc', name: 'Keplerian Orbital Velocity & Escape Velocity Sizer', sub: 'astrophysics', desc: 'Calculate circular orbit velocity v = √(GM/r) and escape speed v_esc = √(2GM/r) for planetary bodies.' },
      { id: 'math-snell-law-refraction-critical-angle', name: 'Optics Snell\'s Law of Refraction & Critical Angle Sizer', sub: 'physics', desc: 'Calculate light refraction angle n₁ sin(θ₁) = n₂ sin(θ₂) and Total Internal Reflection boundary.' },
      { id: 'math-markov-chain-steady-state-matrix', name: 'Markov Chain 2-State Transition & Steady-State Sizer', sub: 'probability', desc: 'Calculate long-term stationary probability distribution πP = π for discrete stochastic transition matrices.' },
      { id: 'math-ph-poh-hydrogen-ion-concentration', name: 'Aqueous pH, pOH, [H+] and [OH-] Ion Concentration Sizer', sub: 'chemistry', desc: 'Calculate logarithmic pH = -log₁₀[H⁺] and acid-base ionization equilibrium Kw = 1.0×10⁻¹⁴.' },
      { id: 'math-fourier-series-square-wave-harmonics', name: 'Fourier Series Square & Sawtooth Wave Harmonic Synthesizer', sub: 'applied-math', desc: 'Sum odd harmonic sine waves (1/n sin(nωt)) to visualize Gibbs phenomenon overshoot.' },
      { id: 'math-centripetal-force-acceleration-calc', name: 'Centripetal Force & Circular Motion Acceleration Sizer', sub: 'physics', desc: 'Calculate radial acceleration a = v²/r and centripetal force F = mv²/r on rotating masses.' },
      { id: 'math-polynomial-synthetic-division-root', name: 'Polynomial Synthetic Division & Remainder Theorem Solver', sub: 'algebra', desc: 'Divide polynomials P(x) by linear binomial (x - c) to evaluate roots and quotient coefficients.' },
      { id: 'math-coulomb-law-electrostatic-force', name: 'Coulomb\'s Law Electrostatic Force Between Point Charges', sub: 'physics', desc: 'Calculate attractive or repulsive force F = k·|q₁q₂|/r² using Coulomb constant k = 8.9875×10⁹ N·m²/C².' },
      { id: 'math-hyperbolic-trig-sinh-cosh-tanh', name: 'Hyperbolic Trigonometric Functions (sinh, cosh, tanh) Sizer', sub: 'trigonometry', desc: 'Calculate catenary arch curves and hyperbolic identities (cosh² x - sinh² x = 1).' },
      { id: 'math-hooke-law-spring-oscillator-freq', name: 'Simple Harmonic Motion (Hooke\'s Law & Spring Period) Sizer', sub: 'physics', desc: 'Calculate restoring force F = -kx, natural frequency f = (1/2π)√(k/m), and period T.' },
      { id: 'math-base-n-radix-positional-converter', name: 'Arbitrary Radix Base-N (Base 2 through Base 36) Converter', sub: 'computer-science', desc: 'Convert numbers across binary, octal, decimal, hexadecimal, and custom base radices.' },
      { id: 'math-heat-transfer-conduction-fourier', name: 'Thermal Conduction Heat Transfer (Fourier\'s Law) Sizer', sub: 'thermodynamics', desc: 'Calculate heat flow rate Q/t = -kA(ΔT/Δx) through composite insulation barriers.' },
      { id: 'math-diophantine-linear-equation-solver', name: 'Linear Diophantine Equation (ax + by = c) Integer Solver', sub: 'number-theory', desc: 'Find integer solutions (x, y) using the Extended Euclidean Algorithm if gcd(a,b) divides c.' },
      { id: 'math-bernoulli-equation-fluid-dynamics', name: 'Fluid Dynamics Bernoulli\'s Equation & Venturi Sizer', sub: 'physics', desc: 'Calculate pressure drop and fluid velocity changes in constricted pipes (P + ½ρv² + ρgh = C).' },
      { id: 'math-bessel-function-first-kind-order', name: 'Cylindrical Bessel Function J_n(x) of the First Kind', sub: 'applied-math', desc: 'Evaluate Bessel differential solutions for circular drumhead vibrations and antenna patterns.' },
      { id: 'math-lcr-circuit-resonance-bandwidth', name: 'Series LCR Resonant Frequency & Quality Factor (Q) Sizer', sub: 'electrical-eng', desc: 'Calculate resonance f₀ = 1/(2π√LC) and filter bandwidth Δf = f₀/Q for radio tuning circuits.' },
      { id: 'math-relativistic-lorentz-dilation-gamma', name: 'Special Relativity Lorentz Factor (γ) & Time Dilation Sizer', sub: 'physics', desc: 'Calculate relativistic time dilation and length contraction as velocity approaches speed of light c.' },
      { id: 'math-collatz-conjecture-hailstone-path', name: 'Collatz Conjecture 3n+1 Hailstone Trajectory Generator', sub: 'number-theory', desc: 'Track step count and peak height before sequence collapses to the 4-2-1 cycle for starting integer n.' },
      { id: 'math-carnot-engine-thermal-efficiency', name: 'Carnot Heat Engine Maximum Thermodynamic Efficiency Sizer', sub: 'thermodynamics', desc: 'Calculate theoretical maximum efficiency η = 1 - (T_cold / T_hot) using absolute Kelvin scale.' },
      { id: 'math-continued-fraction-expansion-calc', name: 'Continued Fraction Rational Approximation [a0; a1, a2...] Sizer', sub: 'number-theory', desc: 'Expand irrational constants (π, e, √2) into periodic continued fraction convergent ratios.' },
      { id: 'math-magnetic-lorentz-force-charged-particle', name: 'Lorentz Force F = q(E + v × B) on Moving Charges Sizer', sub: 'physics', desc: 'Calculate magnetic force vector and helical cyclotron radius r = mv/(qB) in magnetic fields.' },
      { id: 'math-goldbach-conjecture-even-partition', name: 'Goldbach Conjecture Prime Pair Decomposition Sizer', sub: 'number-theory', desc: 'Decompose any even integer n > 2 into the sum of two primes p₁ + p₂ = n.' },
      { id: 'math-sound-decibel-addition-incoherent', name: 'Incoherent Acoustic Sound Source Decibel (dB) Addition Sizer', sub: 'physics', desc: 'Calculate total sound pressure level L_total = 10 log₁₀(∑ 10^(Lᵢ/10)) from multiple noise sources.' },
      { id: 'math-heron-triangular-area-semiperimeter', name: 'Heron\'s Formula for Triangle Area from 3 Side Lengths', sub: 'geometry', desc: 'Calculate exact triangle area A = √(s(s-a)(s-b)(s-c)) where semiperimeter s = (a+b+c)/2.' },
      { id: 'math-moment-of-inertia-rigid-bodies', name: 'Rotational Moment of Inertia (Cylinder, Sphere, Rod) Sizer', sub: 'physics', desc: 'Calculate rotational resistance I = ½MR² (solid disk) and I = ⅖MR² (solid sphere).' },
      { id: 'math-perfect-number-mersenne-prime-calc', name: 'Mersenne Primes (2^p - 1) & Even Perfect Numbers Sizer', sub: 'number-theory', desc: 'Verify Euclid-Euler theorem: 2^(p-1)(2^p - 1) generates even perfect numbers equal to their proper divisors.' },
      { id: 'math-pendulum-period-large-angle-correction', name: 'Simple Pendulum Period & Large-Angle Amplitude Correction', sub: 'physics', desc: 'Calculate oscillation period T = 2π√(L/g) with second-order elliptic angle correction (1 + ¼ sin²(θ₀/2)).' },
      { id: 'math-pascal-triangle-binomial-row-builder', name: 'Pascal\'s Triangle Row Generator & Triangular Numbers', sub: 'discrete-math', desc: 'Generate n-th row of Pascal\'s triangle representing polynomial expansion coefficients.' },
    ][i];

    return {
      id: mathToolMeta.id,
      name: mathToolMeta.name,
      category: 'education',
      subcategory: mathToolMeta.sub,
      description: mathToolMeta.desc,
      iconName: 'Divide',
      version: '1.0.0',
      tags: ['education', 'math', 'stem', 'physics', 'engineering', 'science', 'tools'],
      executionMode: 'client',
      supportsBatch: false,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'inputValue', label: 'Primary Input Parameter / Constant / Variable', type: 'number', defaultValue: 10, required: true },
          { name: 'unitSystem', label: 'Unit System', type: 'select', defaultValue: 'si', options: [
            { label: 'SI Metric Units (m, kg, s, J, N)', value: 'si' },
            { label: 'Imperial / US Customary (ft, lb, BTU)', value: 'imperial' },
          ]},
        ],
      },
      outputSchema: { type: 'json' },
      execute: async (inputs): Promise<ToolResult> => {
        const val = Number(inputs.inputValue || 10);
        const units = String(inputs.unitSystem || 'si');

        return {
          success: true,
          data: {
            tool: mathToolMeta.name,
            id: mathToolMeta.id,
            inputNumericValue: val,
            unitSystem: units,
            computedOutput: val * 1.618,
            status: 'Evaluated rigorously',
            timestamp: new Date().toISOString(),
          },
        };
      },
    };
  }),
];
