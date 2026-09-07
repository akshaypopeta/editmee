import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import { getCalculatorDef } from '../../../core/calculators/allCalculators';
import { UniversalCalculatorView } from '../../calculators/UniversalCalculatorView';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
  Copy,
  Download,
  Check,
  ArrowRight,
  Sliders,
  Table as TableIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const CalculatorArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  // If this tool has a registered full calculator definition, render UniversalCalculatorView
  const canonicalDef = useMemo(() => getCalculatorDef(tool.id), [tool.id]);
  if (canonicalDef) {
    return <UniversalCalculatorView tool={tool} calculatorId={tool.id} />;
  }

  const toolId = tool.id.toLowerCase();
  const subcategory = (tool.subcategory || '').toLowerCase();
  const name = tool.name.toLowerCase();

  // Determine calculation profile based on tool characteristics
  const calcType = useMemo(() => {
    if (name.includes('loan') || name.includes('mortgage') || name.includes('emi') || toolId.includes('loan') || toolId.includes('mortgage')) {
      return 'loan';
    }
    if (name.includes('interest') || name.includes('investment') || name.includes('roi') || name.includes('compound') || name.includes('savings')) {
      return 'interest';
    }
    if (name.includes('salary') || name.includes('tax') || name.includes('paycheck') || name.includes('income')) {
      return 'tax';
    }
    if (name.includes('bmi') || name.includes('calorie') || name.includes('body') || name.includes('health')) {
      return 'bmi';
    }
    if (name.includes('percentage') || name.includes('discount') || name.includes('margin') || name.includes('markup') || name.includes('tip')) {
      return 'percentage';
    }
    if (name.includes('unit') || name.includes('convert') || name.includes('length') || name.includes('weight') || name.includes('temperature') || name.includes('speed')) {
      return 'unit';
    }
    return 'general';
  }, [toolId, subcategory, name]);

  // Parameters state
  const [val1, setVal1] = useState<number>(() => {
    if (calcType === 'loan') return 250000;
    if (calcType === 'interest') return 10000;
    if (calcType === 'tax') return 75000;
    if (calcType === 'bmi') return 70; // kg
    if (calcType === 'percentage') return 150;
    return 100;
  });

  const [val2, setVal2] = useState<number>(() => {
    if (calcType === 'loan') return 6.5; // interest rate %
    if (calcType === 'interest') return 7.5; // annual return %
    if (calcType === 'tax') return 22; // tax rate %
    if (calcType === 'bmi') return 175; // height cm
    if (calcType === 'percentage') return 20; // %
    return 15;
  });

  const [val3, setVal3] = useState<number>(() => {
    if (calcType === 'loan') return 30; // years
    if (calcType === 'interest') return 10; // years
    if (calcType === 'tax') return 4000; // deductions
    if (calcType === 'percentage') return 1;
    return 5;
  });

  const [copied, setCopied] = useState(false);

  // Compute calculated metrics
  const results = useMemo(() => {
    if (calcType === 'loan') {
      const principal = Math.max(1, val1);
      const annualRate = Math.max(0.1, val2) / 100;
      const years = Math.max(1, val3);
      const monthlyRate = annualRate / 12;
      const totalMonths = years * 12;

      const monthlyPayment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
      const totalPayment = monthlyPayment * totalMonths;
      const totalInterest = totalPayment - principal;

      // Generate first 12 months amortization
      const schedule = [];
      let balance = principal;
      for (let i = 1; i <= Math.min(12, totalMonths); i++) {
        const interestMonth = balance * monthlyRate;
        const principalMonth = monthlyPayment - interestMonth;
        balance -= principalMonth;
        schedule.push({
          period: `Month ${i}`,
          payment: monthlyPayment.toFixed(2),
          principal: principalMonth.toFixed(2),
          interest: interestMonth.toFixed(2),
          balance: Math.max(0, balance).toFixed(2),
        });
      }

      return {
        primaryLabel: 'Estimated Monthly Payment',
        primaryValue: `$${monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        secondaryMetrics: [
          { label: 'Total Principal', value: `$${principal.toLocaleString()}` },
          { label: 'Total Interest', value: `$${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Total Cost of Loan', value: `$${totalPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Total Payments', value: `${totalMonths} months (${years} yrs)` },
        ],
        breakdownRatio: {
          principalPercent: Math.round((principal / totalPayment) * 100),
          interestPercent: Math.round((totalInterest / totalPayment) * 100),
        },
        schedule,
      };
    }

    if (calcType === 'interest') {
      const principal = Math.max(1, val1);
      const annualRate = Math.max(0.1, val2) / 100;
      const years = Math.max(1, val3);
      const compoundTimes = 12; // monthly

      const futureValue = principal * Math.pow(1 + annualRate / compoundTimes, compoundTimes * years);
      const totalInterest = futureValue - principal;

      const schedule = [];
      for (let y = 1; y <= Math.min(10, years); y++) {
        const fvYear = principal * Math.pow(1 + annualRate / compoundTimes, compoundTimes * y);
        schedule.push({
          period: `Year ${y}`,
          payment: `$0.00`,
          principal: `$${principal.toLocaleString()}`,
          interest: `$${(fvYear - principal).toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
          balance: `$${fvYear.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
        });
      }

      return {
        primaryLabel: 'Estimated Future Value',
        primaryValue: `$${futureValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        secondaryMetrics: [
          { label: 'Starting Principal', value: `$${principal.toLocaleString()}` },
          { label: 'Total Interest Earned', value: `$${totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Return on Investment', value: `${((totalInterest / principal) * 100).toFixed(1)}%` },
          { label: 'Compounding Horizon', value: `${years} Years` },
        ],
        breakdownRatio: {
          principalPercent: Math.round((principal / futureValue) * 100),
          interestPercent: Math.round((totalInterest / futureValue) * 100),
        },
        schedule,
      };
    }

    if (calcType === 'tax') {
      const grossIncome = Math.max(0, val1);
      const effectiveRate = Math.min(100, Math.max(0, val2)) / 100;
      const deductions = Math.max(0, val3);

      const taxableIncome = Math.max(0, grossIncome - deductions);
      const totalTax = taxableIncome * effectiveRate;
      const netTakeHome = grossIncome - totalTax;
      const monthlyNet = netTakeHome / 12;
      const biweeklyNet = netTakeHome / 26;

      return {
        primaryLabel: 'Estimated Annual Take-Home Pay',
        primaryValue: `$${netTakeHome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        secondaryMetrics: [
          { label: 'Gross Annual Income', value: `$${grossIncome.toLocaleString()}` },
          { label: 'Total Estimated Tax', value: `$${totalTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Monthly Net Pay', value: `$${monthlyNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
          { label: 'Bi-Weekly Net Pay', value: `$${biweeklyNet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        ],
        breakdownRatio: {
          principalPercent: Math.round((netTakeHome / Math.max(1, grossIncome)) * 100),
          interestPercent: Math.round((totalTax / Math.max(1, grossIncome)) * 100),
        },
        schedule: [
          { period: 'Annual', payment: `$${grossIncome.toLocaleString()}`, principal: `$${netTakeHome.toFixed(2)}`, interest: `$${totalTax.toFixed(2)}`, balance: `$${netTakeHome.toFixed(2)}` },
          { period: 'Monthly', payment: `$${(grossIncome / 12).toFixed(2)}`, principal: `$${monthlyNet.toFixed(2)}`, interest: `$${(totalTax / 12).toFixed(2)}`, balance: `$${monthlyNet.toFixed(2)}` },
          { period: 'Bi-Weekly', payment: `$${(grossIncome / 26).toFixed(2)}`, principal: `$${biweeklyNet.toFixed(2)}`, interest: `$${(totalTax / 26).toFixed(2)}`, balance: `$${biweeklyNet.toFixed(2)}` },
        ],
      };
    }

    if (calcType === 'bmi') {
      const weightKg = Math.max(1, val1);
      const heightCm = Math.max(50, val2);
      const heightM = heightCm / 100;
      const bmi = weightKg / (heightM * heightM);

      let category = 'Normal weight';
      let catColor = 'text-emerald-500';
      if (bmi < 18.5) {
        category = 'Underweight';
        catColor = 'text-amber-500';
      } else if (bmi >= 25 && bmi < 30) {
        category = 'Overweight';
        catColor = 'text-amber-500';
      } else if (bmi >= 30) {
        category = 'Obesity range';
        catColor = 'text-red-500';
      }

      const primeWeightLow = (18.5 * heightM * heightM).toFixed(1);
      const primeWeightHigh = (24.9 * heightM * heightM).toFixed(1);

      return {
        primaryLabel: 'Body Mass Index (BMI)',
        primaryValue: bmi.toFixed(1),
        statusBadge: category,
        statusColor: catColor,
        secondaryMetrics: [
          { label: 'Weight', value: `${weightKg} kg (${(weightKg * 2.20462).toFixed(1)} lbs)` },
          { label: 'Height', value: `${heightCm} cm (${(heightCm / 30.48).toFixed(1)} ft)` },
          { label: 'Healthy Weight Range', value: `${primeWeightLow} - ${primeWeightHigh} kg` },
          { label: 'Classification', value: category },
        ],
        breakdownRatio: {
          principalPercent: Math.min(100, Math.round((bmi / 40) * 100)),
          interestPercent: Math.max(0, 100 - Math.min(100, Math.round((bmi / 40) * 100))),
        },
        schedule: [
          { period: 'Underweight', payment: '< 18.5', principal: 'Risk of deficiency', interest: 'Low', balance: '< 18.5' },
          { period: 'Normal weight', payment: '18.5 - 24.9', principal: 'Optimal health range', interest: 'Low', balance: '18.5 - 24.9' },
          { period: 'Overweight', payment: '25.0 - 29.9', principal: 'Increased cardiovascular risk', interest: 'Moderate', balance: '25 - 29.9' },
          { period: 'Obese', payment: '30.0+', principal: 'High risk health status', interest: 'High', balance: '30.0+' },
        ],
      };
    }

    // Default / Percentage / General
    const base = val1;
    const rate = val2;
    const calculated = (base * rate) / 100;
    const added = base + calculated;
    const discounted = Math.max(0, base - calculated);

    return {
      primaryLabel: `${rate}% of ${base}`,
      primaryValue: calculated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      secondaryMetrics: [
        { label: 'Base Value', value: base.toLocaleString() },
        { label: 'Rate / Percentage', value: `${rate}%` },
        { label: 'Base + Increase', value: added.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
        { label: 'Base - Discount', value: discounted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
      ],
      breakdownRatio: {
        principalPercent: Math.round((discounted / Math.max(1, added)) * 100),
        interestPercent: Math.round((calculated / Math.max(1, added)) * 100),
      },
      schedule: [
        { period: '5%', payment: ((base * 5) / 100).toFixed(2), principal: (base + (base * 5) / 100).toFixed(2), interest: (base - (base * 5) / 100).toFixed(2), balance: '5%' },
        { period: '10%', payment: ((base * 10) / 100).toFixed(2), principal: (base + (base * 10) / 100).toFixed(2), interest: (base - (base * 10) / 100).toFixed(2), balance: '10%' },
        { period: '15%', payment: ((base * 15) / 100).toFixed(2), principal: (base + (base * 15) / 100).toFixed(2), interest: (base - (base * 15) / 100).toFixed(2), balance: '15%' },
        { period: '20%', payment: ((base * 20) / 100).toFixed(2), principal: (base + (base * 20) / 100).toFixed(2), interest: (base - (base * 20) / 100).toFixed(2), balance: '20%' },
        { period: '25%', payment: ((base * 25) / 100).toFixed(2), principal: (base + (base * 25) / 100).toFixed(2), interest: (base - (base * 25) / 100).toFixed(2), balance: '25%' },
      ],
    };
  }, [calcType, val1, val2, val3]);

  const handleCopy = () => {
    const text = `${tool.name}\n${results.primaryLabel}: ${results.primaryValue}\n` +
      results.secondaryMetrics.map((m) => `${m.label}: ${m.value}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Add to history
    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: tool.category,
      status: 'completed',
      outputSummary: `${results.primaryLabel}: ${results.primaryValue}`,
    });
  };

  const handleDownloadCsv = () => {
    if (!results.schedule || results.schedule.length === 0) return;
    const header = 'Period,Primary Calculation,Addition/Principal,Deduction/Interest,Final Balance\n';
    const rows = results.schedule.map((r) => `"${r.period}","${r.payment}","${r.principal}","${r.interest}","${r.balance}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.id}-calculation.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-xs text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600 dark:text-red-400" />
                Calculation Inputs
              </h2>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-900/60">
                Live Engine
              </span>
            </div>

            {/* Input 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="param-val-1">
                  {calcType === 'loan' ? 'Loan / Principal Amount ($)' : calcType === 'interest' ? 'Initial Deposit / Investment ($)' : calcType === 'tax' ? 'Gross Annual Salary ($)' : calcType === 'bmi' ? 'Body Weight (kg)' : 'Base Number / Value'}
                </label>
                <span className="font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {val1.toLocaleString()}
                </span>
              </div>
              <input
                id="param-val-1"
                type="number"
                value={val1}
                onChange={(e) => setVal1(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <input
                type="range"
                min={calcType === 'bmi' ? 30 : 100}
                max={calcType === 'bmi' ? 200 : calcType === 'loan' ? 1000000 : 250000}
                step={calcType === 'bmi' ? 0.5 : 500}
                value={val1}
                onChange={(e) => setVal1(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* Input 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <label htmlFor="param-val-2">
                  {calcType === 'loan' ? 'Annual Interest Rate (%)' : calcType === 'interest' ? 'Annual Expected Return (%)' : calcType === 'tax' ? 'Effective Tax Rate (%)' : calcType === 'bmi' ? 'Height (cm)' : 'Percentage / Rate (%)'}
                </label>
                <span className="font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {val2}%
                </span>
              </div>
              <input
                id="param-val-2"
                type="number"
                step="0.1"
                value={val2}
                onChange={(e) => setVal2(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              />
              <input
                type="range"
                min={calcType === 'bmi' ? 100 : 0.5}
                max={calcType === 'bmi' ? 220 : 30}
                step="0.1"
                value={val2}
                onChange={(e) => setVal2(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            {/* Input 3 */}
            {(calcType === 'loan' || calcType === 'interest' || calcType === 'tax') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <label htmlFor="param-val-3">
                    {calcType === 'loan' ? 'Loan Term (Years)' : calcType === 'interest' ? 'Investment Horizon (Years)' : 'Annual Deductions ($)'}
                  </label>
                  <span className="font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {val3}
                  </span>
                </div>
                <input
                  id="param-val-3"
                  type="number"
                  value={val3}
                  onChange={(e) => setVal3(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>
            )}

            {/* Quick preset buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Quick Presets
              </span>
              <div className="grid grid-cols-3 gap-2">
                {calcType === 'loan' ? (
                  <>
                    <button type="button" onClick={() => { setVal1(150000); setVal2(5.5); setVal3(15); }} className="px-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">15yr / 5.5%</button>
                    <button type="button" onClick={() => { setVal1(300000); setVal2(6.8); setVal3(30); }} className="px-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">30yr / 6.8%</button>
                    <button type="button" onClick={() => { setVal1(500000); setVal2(7.2); setVal3(30); }} className="px-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Jumbo Loan</button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => { setVal1(100); setVal2(10); }} className="px-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">10% Off</button>
                    <button type="button" onClick={() => { setVal1(100); setVal2(20); }} className="px-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">20% Tip</button>
                    <button type="button" onClick={() => { setVal1(100); setVal2(50); }} className="px-2 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer text-slate-700 dark:text-slate-300">Half / 50%</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form: Results Card & Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Result Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {results.primaryLabel}
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                  {results.primaryValue}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Breakdown Visual Proportion Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Principal / Base ({results.breakdownRatio.principalPercent}%)</span>
                <span>Interest / Tax / Rate ({results.breakdownRatio.interestPercent}%)</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 transition-all duration-300"
                  style={{ width: `${results.breakdownRatio.principalPercent}%` }}
                />
                <div
                  className="bg-red-500 transition-all duration-300"
                  style={{ width: `${results.breakdownRatio.interestPercent}%` }}
                />
              </div>
            </div>

            {/* Secondary Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pt-2">
              {results.secondaryMetrics.map((metric, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">{metric.label}</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono">{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          {results.schedule && results.schedule.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs text-slate-900 dark:text-slate-100 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Amortization / Step Breakdown
                </h3>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {results.schedule.length} Periods
                </span>
              </div>

              <div className="overflow-x-auto max-h-64 scrollbar-thin">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950">
                      <th className="py-2 px-3">Period</th>
                      <th className="py-2 px-3">Payment/Rate</th>
                      <th className="py-2 px-3">Principal/Value</th>
                      <th className="py-2 px-3">Interest/Tax</th>
                      <th className="py-2 px-3 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                    {results.schedule.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{row.period}</td>
                        <td className="py-2 px-3">{row.payment}</td>
                        <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">{row.principal}</td>
                        <td className="py-2 px-3 text-red-600 dark:text-red-400 font-semibold">{row.interest}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">{row.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
