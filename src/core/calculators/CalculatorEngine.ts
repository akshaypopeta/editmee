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
}
