import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  Calculator as CalcIcon,
  Percent,
  Sigma,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

export const ScientificMathArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  const isPercentage = name.includes('percentage') || name.includes('discount') || name.includes('tip') || name.includes('markup') || name.includes('margin');
  const isStatistics = name.includes('statistic') || name.includes('mean') || name.includes('median') || name.includes('standard deviation') || name.includes('variance') || name.includes('average');

  // Scientific Calculator State
  const [expression, setExpression] = useState<string>('2 * (3.14159 * 15^2)');
  const [sciResult, setSciResult] = useState<string>('1413.7155');
  const [hasError, setHasError] = useState<boolean>(false);

  // Percentage Mode State
  const [pctBase, setPctBase] = useState<number>(250);
  const [pctRate, setPctRate] = useState<number>(15);
  const [pctMode, setPctMode] = useState<'whatIs' | 'increase' | 'decrease' | 'diff'>('whatIs');

  // Statistics Mode State
  const [statsInput, setStatsInput] = useState<string>('12, 18, 24, 30, 36, 42, 48, 54, 60');

  const [copied, setCopied] = useState(false);

  // Percentage Calculations
  const pctResults = useMemo(() => {
    const calculated = (pctBase * pctRate) / 100;
    const increased = pctBase + calculated;
    const decreased = Math.max(0, pctBase - calculated);
    const diffPct = pctBase === 0 ? 0 : ((pctRate - pctBase) / pctBase) * 100;

    return {
      calculated: calculated.toFixed(2),
      increased: increased.toFixed(2),
      decreased: decreased.toFixed(2),
      diffPct: diffPct.toFixed(2),
    };
  }, [pctBase, pctRate]);

  // Statistics Calculations
  const statsResults = useMemo(() => {
    const nums = statsInput
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));

    if (nums.length === 0) {
      return { count: 0, sum: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0, variance: 0 };
    }

    const count = nums.length;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    const sorted = [...nums].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    let median = 0;
    const mid = Math.floor(count / 2);
    if (count % 2 === 0) {
      median = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      median = sorted[mid];
    }

    const variance = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);

    return {
      count,
      sum: sum.toLocaleString(),
      mean: mean.toFixed(4),
      median: median.toFixed(4),
      min,
      max,
      range: (max - min).toFixed(4),
      stdDev: stdDev.toFixed(4),
      variance: variance.toFixed(4),
    };
  }, [statsInput]);

  // Scientific Evaluator
  const evaluateScientific = (expr: string) => {
    try {
      let sanitized = expr
        .replace(/\^/g, '**')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e/gi, 'Math.E');

      // eslint-disable-next-line no-eval
      const res = Function(`"use strict"; return (${sanitized})`)();
      if (typeof res === 'number' && !isNaN(res) && isFinite(res)) {
        setSciResult(res.toLocaleString('en-US', { maximumFractionDigits: 8 }));
        setHasError(false);
      } else {
        setHasError(true);
      }
    } catch {
      setHasError(true);
    }
  };

  const handleSciButtonClick = (sym: string) => {
    const next = expression + sym;
    setExpression(next);
    evaluateScientific(next);
  };

  const handleCopy = () => {
    let text = `${tool.name}\n`;
    if (isPercentage) {
      text += `${pctRate}% of ${pctBase} = ${pctResults.calculated}\nBase + Increase: ${pctResults.increased}\nBase - Discount: ${pctResults.decreased}`;
    } else if (isStatistics) {
      text += `Count: ${statsResults.count}\nMean: ${statsResults.mean}\nMedian: ${statsResults.median}\nStd Dev: ${statsResults.stdDev}`;
    } else {
      text += `Expression: ${expression}\nResult: ${sciResult}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: 'calculators',
      status: 'completed',
      outputSummary: text.split('\n')[1] || 'Completed',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. PERCENTAGE MODE */}
      {isPercentage && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Percent className="w-4 h-4 text-red-600 dark:text-red-400" />
                Percentage Formula Inputs
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Base Number / Amount</label>
                <input
                  type="number"
                  value={pctBase}
                  onChange={(e) => setPctBase(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Percentage / Rate (%)</label>
                <input
                  type="number"
                  value={pctRate}
                  onChange={(e) => setPctRate(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Values!' : 'Copy Percentage Calculations'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-6 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  {pctRate}% of {pctBase.toLocaleString()}
                </div>
                <div className="text-5xl font-black text-slate-900 dark:text-slate-100 font-mono">
                  {Number(pctResults.calculated).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Base + Increase ({pctRate}%)</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">
                    {Number(pctResults.increased).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">e.g. Sales Tax / Markup</div>
                </div>

                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-300">Base - Discount ({pctRate}%)</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-1">
                    {Number(pctResults.decreased).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5">e.g. Sale Price / Markdown</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. STATISTICS MODE */}
      {isStatistics && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Sigma className="w-4 h-4 text-red-600 dark:text-red-400" />
                Data Sample Series
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Values (Comma or Space Separated)</label>
                <textarea
                  rows={6}
                  value={statsInput}
                  onChange={(e) => setStatsInput(e.target.value)}
                  placeholder="e.g. 10, 15, 23, 42, 56, 78"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Stats!' : 'Copy Summary Statistics'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sample Count (n)</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">{statsResults.count}</div>
                </div>
                <div className="p-3.5 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-red-600 dark:text-red-400">Mean / Average (x̄)</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">{statsResults.mean}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Median</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">{statsResults.median}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Std Deviation (σ)</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">{statsResults.stdDev}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sum (∑x)</div>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">{statsResults.sum}</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Min / Max</div>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
                    {statsResults.min} / {statsResults.max}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Variance (σ²)</div>
                  <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">{statsResults.variance}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SCIENTIFIC / BASIC CALCULATOR */}
      {!isPercentage && !isStatistics && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            {/* Screen Display */}
            <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl p-5 shadow-inner space-y-2">
              <div className="text-xs text-slate-400 font-mono overflow-x-auto text-right min-h-[20px]">
                {expression || '0'}
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-right text-emerald-400 tracking-tight">
                {hasError ? 'Syntax Error' : sciResult}
              </div>
            </div>

            {/* Expression input */}
            <input
              type="text"
              value={expression}
              onChange={(e) => {
                setExpression(e.target.value);
                evaluateScientific(e.target.value);
              }}
              placeholder="Enter algebraic expression..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
            />

            {/* Scientific Button Keypad */}
            <div className="grid grid-cols-5 gap-2">
              {['sin(', 'cos(', 'tan(', 'sqrt(', 'pi', 'log(', 'ln(', '^', '(', ')', '7', '8', '9', '/', 'C', '4', '5', '6', '*', 'CE', '1', '2', '3', '-', '%', '0', '.', '+', '=', 'ANS'].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    if (sym === 'C') {
                      setExpression('');
                      setSciResult('0');
                    } else if (sym === 'CE') {
                      const next = expression.slice(0, -1);
                      setExpression(next);
                      evaluateScientific(next);
                    } else if (sym === '=') {
                      evaluateScientific(expression);
                    } else if (sym === 'ANS') {
                      setExpression(sciResult);
                    } else {
                      handleSciButtonClick(sym);
                    }
                  }}
                  className={`py-3 rounded-xl font-mono font-bold text-xs transition-all cursor-pointer ${
                    sym === '='
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                      : ['C', 'CE'].includes(sym)
                      ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      : ['sin(', 'cos(', 'tan(', 'sqrt(', 'log(', 'ln(', '^', 'pi'].includes(sym)
                      ? 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
