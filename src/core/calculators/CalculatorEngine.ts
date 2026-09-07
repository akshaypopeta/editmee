export class CalculatorEngine {
  /**
   * Loan / EMI Calculator
   */
  public static calculateEmi(principal: number, annualRatePercent: number, tenureYears: number) {
    const monthlyRate = annualRatePercent / 12 / 100;
    const months = tenureYears * 12;

    if (monthlyRate === 0) {
      const emi = principal / months;
      return {
        monthlyEmi: Number(emi.toFixed(2)),
        totalPayment: Number(principal.toFixed(2)),
        totalInterest: 0,
      };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    return {
      monthlyEmi: Number(emi.toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      totalInterest: Number(totalInterest.toFixed(2)),
    };
  }

  /**
   * Compound Interest Calculator
   */
  public static calculateCompoundInterest(
    principal: number,
    annualRatePercent: number,
    years: number,
    compoundsPerYear = 12
  ) {
    const r = annualRatePercent / 100;
    const n = compoundsPerYear;
    const t = years;

    const amount = principal * Math.pow(1 + r / n, n * t);
    const interest = amount - principal;

    return {
      finalAmount: Number(amount.toFixed(2)),
      totalInterest: Number(interest.toFixed(2)),
      totalPrincipal: principal,
    };
  }

  /**
   * Unit Converter
   */
  public static convertUnits(
    value: number,
    category: 'length' | 'weight' | 'temperature' | 'storage' | 'speed',
    fromUnit: string,
    toUnit: string
  ): number {
    if (category === 'temperature') {
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') return (value * 9) / 5 + 32;
      if (fromUnit === 'fahrenheit' && toUnit === 'celsius') return ((value - 32) * 5) / 9;
      if (fromUnit === 'celsius' && toUnit === 'kelvin') return value + 273.15;
      if (fromUnit === 'kelvin' && toUnit === 'celsius') return value - 273.15;
      return value;
    }

    const lengthFactors: Record<string, number> = {
      meter: 1,
      kilometer: 1000,
      centimeter: 0.01,
      millimeter: 0.001,
      mile: 1609.34,
      yard: 0.9144,
      foot: 0.3048,
      inch: 0.0254,
    };

    const weightFactors: Record<string, number> = {
      kilogram: 1,
      gram: 0.001,
      milligram: 0.000001,
      metric_ton: 1000,
      pound: 0.453592,
      ounce: 0.0283495,
    };

    const storageFactors: Record<string, number> = {
      byte: 1,
      kilobyte: 1024,
      megabyte: 1024 ** 2,
      gigabyte: 1024 ** 3,
      terabyte: 1024 ** 4,
    };

    const speedFactors: Record<string, number> = {
      mps: 1,
      kmh: 0.277778,
      mph: 0.44704,
      knot: 0.514444,
    };

    let factors: Record<string, number> = lengthFactors;
    if (category === 'weight') factors = weightFactors;
    if (category === 'storage') factors = storageFactors;
    if (category === 'speed') factors = speedFactors;

    const baseValue = value * (factors[fromUnit] || 1);
    const targetValue = baseValue / (factors[toUnit] || 1);

    return Number(targetValue.toFixed(4));
  }

  /**
   * FIRE (Financial Independence, Retire Early) Number
   */
  public static calculateFire(annualExpenses: number, swrPercent = 4, currentSavings = 0, annualSavings = 0, expectedReturn = 7) {
    const swr = swrPercent / 100;
    const fireTarget = annualExpenses / swr;
    const leanFireTarget = (annualExpenses * 0.75) / swr;
    const fatFireTarget = (annualExpenses * 1.5) / swr;

    // Approximate years to reach FIRE using compounding formula
    let years = 0;
    let balance = currentSavings;
    const r = expectedReturn / 100;

    if (balance < fireTarget && annualSavings > 0) {
      while (balance < fireTarget && years < 100) {
        balance = balance * (1 + r) + annualSavings;
        years++;
      }
    }

    return {
      fireTarget: Math.round(fireTarget),
      leanFireTarget: Math.round(leanFireTarget),
      fatFireTarget: Math.round(fatFireTarget),
      yearsToFire: years,
      projectedPortfolioAtFire: Math.round(balance),
    };
  }

  /**
   * Black-Scholes Option Pricing Formula (European Call & Put)
   */
  public static calculateBlackScholes(
    stockPrice: number,
    strikePrice: number,
    daysToExpiry: number,
    volatilityPercent: number,
    riskFreeRatePercent: number,
    dividendYieldPercent = 0
  ) {
    const S = stockPrice;
    const K = strikePrice;
    const T = Math.max(0.001, daysToExpiry / 365);
    const v = Math.max(0.01, volatilityPercent / 100);
    const r = riskFreeRatePercent / 100;
    const q = dividendYieldPercent / 100;

    const d1 = (Math.log(S / K) + (r - q + 0.5 * v * v) * T) / (v * Math.sqrt(T));
    const d2 = d1 - v * Math.sqrt(T);

    // Cumulative normal distribution approximation (Abramowitz and Stegun)
    const cnd = (x: number): number => {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      const absX = Math.abs(x) / Math.sqrt(2);
      const t = 1.0 / (1.0 + p * absX);
      const erf = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
      return 0.5 * (1.0 + sign * erf);
    };

    const callPrice = S * Math.exp(-q * T) * cnd(d1) - K * Math.exp(-r * T) * cnd(d2);
    const putPrice = K * Math.exp(-r * T) * cnd(-d2) - S * Math.exp(-q * T) * cnd(-d1);

    // Greeks
    const deltaCall = Math.exp(-q * T) * cnd(d1);
    const deltaPut = Math.exp(-q * T) * (cnd(d1) - 1);
    const gamma = (Math.exp(-q * T) * Math.exp(-0.5 * d1 * d1)) / (S * v * Math.sqrt(2 * Math.PI * T));
    const thetaCall = (-S * v * Math.exp(-q * T) * Math.exp(-0.5 * d1 * d1)) / (2 * Math.sqrt(2 * Math.PI * T)) - r * K * Math.exp(-r * T) * cnd(d2);
    const vega = (S * Math.exp(-q * T) * Math.sqrt(T) * Math.exp(-0.5 * d1 * d1)) / Math.sqrt(2 * Math.PI);

    return {
      callPrice: Number(Math.max(0, callPrice).toFixed(2)),
      putPrice: Number(Math.max(0, putPrice).toFixed(2)),
      d1: Number(d1.toFixed(4)),
      d2: Number(d2.toFixed(4)),
      deltaCall: Number(deltaCall.toFixed(4)),
      deltaPut: Number(deltaPut.toFixed(4)),
      gamma: Number(gamma.toFixed(4)),
      thetaCall: Number((thetaCall / 365).toFixed(4)),
      vega: Number((vega / 100).toFixed(4)),
    };
  }

  /**
   * Discounted Cash Flow (DCF) Equity Valuation
   */
  public static calculateDcf(
    fcfYear0: number,
    growthRatePercent5Y: number,
    terminalGrowthPercent: number,
    discountRateWACCPercent: number,
    sharesOutstanding: number,
    netDebt = 0
  ) {
    const g = growthRatePercent5Y / 100;
    const tg = terminalGrowthPercent / 100;
    const r = discountRateWACCPercent / 100;

    let pvFcfSum = 0;
    let currentFcf = fcfYear0;

    const projectedCashFlows: { year: number; fcf: number; pvFcf: number }[] = [];

    for (let yr = 1; yr <= 5; yr++) {
      currentFcf *= 1 + g;
      const pv = currentFcf / Math.pow(1 + r, yr);
      pvFcfSum += pv;
      projectedCashFlows.push({ year: yr, fcf: Math.round(currentFcf), pvFcf: Math.round(pv) });
    }

    const terminalVal = (currentFcf * (1 + tg)) / Math.max(0.001, r - tg);
    const pvTerminalVal = terminalVal / Math.pow(1 + r, 5);
    const enterpriseValue = pvFcfSum + pvTerminalVal;
    const equityValue = enterpriseValue - netDebt;
    const fairValuePerShare = equityValue / Math.max(1, sharesOutstanding);

    return {
      enterpriseValue: Math.round(enterpriseValue),
      equityValue: Math.round(equityValue),
      fairValuePerShare: Number(fairValuePerShare.toFixed(2)),
      pvTerminalVal: Math.round(pvTerminalVal),
      projectedCashFlows,
    };
  }

  /**
   * Statistics Suite (Mean, Median, Mode, Variance, StdDev, IQR)
   */
  public static calculateStatistics(numbers: number[]) {
    if (numbers.length === 0) return { mean: 0, median: 0, mode: [], stdDev: 0, variance: 0, min: 0, max: 0, count: 0, sum: 0 };

    const sorted = [...numbers].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / count;

    // Median
    const mid = Math.floor(count / 2);
    const median = count % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    // Mode
    const freq: Record<number, number> = {};
    let maxFreq = 0;
    sorted.forEach((n) => {
      freq[n] = (freq[n] || 0) + 1;
      if (freq[n] > maxFreq) maxFreq = freq[n];
    });
    const mode = Object.keys(freq).filter((k) => freq[Number(k)] === maxFreq).map(Number);

    // Variance & StdDev
    const variance = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    // Quartiles
    const q1 = sorted[Math.floor(count * 0.25)];
    const q3 = sorted[Math.floor(count * 0.75)];
    const iqr = q3 - q1;

    return {
      count,
      sum: Number(sum.toFixed(4)),
      mean: Number(mean.toFixed(4)),
      median: Number(median.toFixed(4)),
      mode: mode.length === count ? [] : mode,
      min: sorted[0],
      max: sorted[count - 1],
      variance: Number(variance.toFixed(4)),
      stdDev: Number(stdDev.toFixed(4)),
      q1,
      q3,
      iqr,
    };
  }
}
