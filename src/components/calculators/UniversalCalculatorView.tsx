import React, { useState, useId, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Copy,
  Check,
  Info,
  HelpCircle,
  History,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Share2,
} from 'lucide-react';
import { CalculatorDefinition, CalculatorResult } from '../../core/calculators/types';
import { getCalculatorDef } from '../../core/calculators/allCalculators';
import { ToolDefinition } from '../../types';

interface UniversalCalculatorViewProps {
  tool?: ToolDefinition;
  calculatorId?: string;
}

interface CalculationHistoryItem {
  timestamp: string;
  primaryResult: string;
  inputsSummary: string;
}

export const UniversalCalculatorView: React.FC<UniversalCalculatorViewProps> = ({
  tool,
  calculatorId,
}) => {
  const targetId = calculatorId || tool?.id || 'mortgage-calculator';
  const calcDef = useMemo(() => getCalculatorDef(targetId), [targetId]);

  if (!calcDef) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white">Calculator Not Found</h3>
        <p className="text-sm text-slate-400 mt-1">
          Could not find calculation definition for &ldquo;{targetId}&rdquo;.
        </p>
      </div>
    );
  }

  return <CalculatorRunner calcDef={calcDef} tool={tool} />;
};

const CalculatorRunner: React.FC<{
  calcDef: CalculatorDefinition;
  tool?: ToolDefinition;
}> = ({ calcDef }) => {
  // Initialize inputs from defaults
  const initialInputs = useMemo(() => {
    const init: Record<string, any> = {};
    calcDef.inputs.forEach((field) => {
      init[field.id] = field.defaultValue;
    });
    return init;
  }, [calcDef]);

  const [inputs, setInputs] = useState<Record<string, any>>(initialInputs);
  const [copied, setCopied] = useState(false);
  const [showFormula, setShowFormula] = useState(true);
  const [showExample, setShowExample] = useState(false);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const compId = useId();

  // Reset inputs when calculator changes
  useEffect(() => {
    setInputs(initialInputs);
    setHistory([]);
  }, [initialInputs]);

  // Handle single input field change
  const handleInputChange = (fieldId: string, value: any) => {
    setInputs((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Perform calculation
  const result: CalculatorResult = useMemo(() => {
    try {
      return calcDef.calculate(inputs);
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'An error occurred during calculation.',
        primary: { label: 'Result', value: 'Error' },
        metrics: [],
      };
    }
  }, [calcDef, inputs]);

  // Handle reset to default inputs
  const handleReset = () => {
    setInputs(initialInputs);
  };

  // Handle copy primary result
  const handleCopy = () => {
    if (!result.success) return;
    const textToCopy = `${calcDef.name}: ${result.primary.label} = ${result.primary.value} ${result.primary.unit || ''}`.trim();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Save current calculation to local session history
  const handleSaveToHistory = () => {
    if (!result.success) return;
    const summary = calcDef.inputs
      .slice(0, 3)
      .map((f) => `${f.label.split('(')[0].trim()}: ${inputs[f.id]}`)
      .join(', ');

    const newItem: CalculationHistoryItem = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      primaryResult: `${result.primary.label}: ${result.primary.value}`,
      inputsSummary: summary,
    };

    setHistory((prev) => [newItem, ...prev.slice(0, 9)]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {calcDef.name}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">{calcDef.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors"
              title="Reset all inputs to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset Defaults
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                showHistory
                  ? 'bg-red-500/10 text-red-400 border-red-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/50'
              }`}
              title="View session calculation history"
            >
              <History className="w-3.5 h-3.5" />
              History {history.length > 0 && `(${history.length})`}
            </button>
          </div>
        </div>

        {/* Optional History Drawer */}
        {showHistory && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 animate-in fade-in duration-200">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-red-400" />
              Recent Calculation History (This Session)
            </h4>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No saved calculations yet. Click &ldquo;Record to History&rdquo; after any calculation.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700/40 text-xs"
                  >
                    <div className="flex-1 truncate mr-2">
                      <span className="font-semibold text-white">{item.primaryResult}</span>
                      <span className="text-slate-400 ml-2 truncate">({item.inputsSummary})</span>
                    </div>
                    <span className="text-slate-400 whitespace-nowrap">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <span>Input Parameters</span>
              </h3>
              <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                Interactive Live Updates
              </span>
            </div>

            <div className="space-y-4">
              {calcDef.inputs.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor={`${compId}-${field.id}`}
                      className="text-xs font-medium text-slate-300"
                    >
                      {field.label}
                    </label>
                    {field.suffix && field.type === 'number' && (
                      <span className="text-xs text-slate-400">{field.suffix}</span>
                    )}
                  </div>

                  {field.type === 'select' ? (
                    <div className="relative">
                      <select
                        id={`${compId}-${field.id}`}
                        value={inputs[field.id]}
                        onChange={(e) => {
                          const val = field.options?.find((o) => String(o.value) === e.target.value)?.value;
                          handleInputChange(field.id, val ?? e.target.value);
                        }}
                        className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer appearance-none pr-9"
                      >
                        {field.options?.map((opt) => (
                          <option key={String(opt.value)} value={opt.value} className="bg-slate-900 text-white">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  ) : field.type === 'date' ? (
                    <input
                      id={`${compId}-${field.id}`}
                      type="date"
                      value={inputs[field.id] || ''}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  ) : field.type === 'text' ? (
                    <input
                      id={`${compId}-${field.id}`}
                      type="text"
                      value={inputs[field.id] || ''}
                      placeholder={field.placeholder}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                  ) : (
                    <div className="relative flex items-center">
                      {field.prefix && (
                        <span className="absolute left-3.5 text-sm text-slate-400 pointer-events-none font-medium">
                          {field.prefix}
                        </span>
                      )}
                      <input
                        id={`${compId}-${field.id}`}
                        type="number"
                        min={field.min}
                        max={field.max}
                        step={field.step || 'any'}
                        value={inputs[field.id] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Number(e.target.value);
                          handleInputChange(field.id, val);
                        }}
                        className={`w-full bg-slate-800/90 border border-slate-700/80 rounded-xl py-2.5 text-sm text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors ${
                          field.prefix ? 'pl-8 pr-3.5' : 'px-3.5'
                        } ${field.suffix ? 'pr-12' : ''}`}
                      />
                      {field.suffix && (
                        <span className="absolute right-3.5 text-xs text-slate-400 pointer-events-none">
                          {field.suffix}
                        </span>
                      )}
                    </div>
                  )}

                  {field.helperText && (
                    <p className="text-xs text-slate-400 mt-1">{field.helperText}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSaveToHistory}
                disabled={!result.success}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors disabled:opacity-50"
              >
                <History className="w-3.5 h-3.5 text-red-400" />
                Record to History
              </button>
              <span className="text-xs text-slate-400">Updates in real-time</span>
            </div>
          </div>
        </div>

        {/* Right Column: Output Results */}
        <div className="lg:col-span-6 space-y-4">
          {/* Validation Error Banner if computation failed */}
          {!result.success && result.error && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-200">Input Notice</h4>
                <p className="text-xs text-amber-300/90 mt-0.5 leading-relaxed">{result.error}</p>
              </div>
            </div>
          )}

          {/* Primary Result Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {result.primary.label}
                </span>
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {result.primary.value}
                  </span>
                  {result.primary.unit && (
                    <span className="text-sm sm:text-base font-medium text-red-400">
                      {result.primary.unit}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-medium transition-colors shrink-0"
                title="Copy result to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {result.interpretation && (
              <p className="text-xs text-slate-300 mt-4 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700/30">
                {result.interpretation}
              </p>
            )}
          </div>

          {/* Secondary Key Metrics Grid */}
          {result.metrics && result.metrics.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {result.metrics.map((metric, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    metric.isHighlight
                      ? 'bg-red-950/20 border-red-500/30'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 truncate mr-1">
                      {metric.label}
                    </span>
                    {metric.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                        {metric.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-bold text-white truncate">
                    {metric.value}
                  </div>
                  {metric.subtext && (
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {metric.subtext}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Breakdown Table/Rows */}
          {result.breakdownRows && result.breakdownRows.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                {result.breakdownTitle || 'Calculation Breakdown'}
              </h4>

              <div className="space-y-2.5">
                {result.breakdownRows.map((row, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{row.label}</span>
                      <span className="font-medium text-white">{row.value}</span>
                    </div>
                    {typeof row.percentage === 'number' && (
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(0, row.percentage))}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Educational Collapsible Panels: Formula & Step-by-Step Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Formula Accordion */}
        {result.formulaExplanation && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-red-400" />
                Mathematical Formula
              </span>
              {showFormula ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {showFormula && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <code className="block bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-red-300 whitespace-pre-wrap">
                  {result.formulaExplanation}
                </code>
              </div>
            )}
          </div>
        )}

        {/* Practical Example Accordion */}
        {result.exampleCalculation && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <button
              onClick={() => setShowExample(!showExample)}
              className="w-full flex items-center justify-between text-left text-xs font-semibold text-slate-300 uppercase tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-red-400" />
                Worked Example
              </span>
              {showExample ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>
            {showExample && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {result.exampleCalculation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
