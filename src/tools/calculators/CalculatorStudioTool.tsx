import React, { useState } from 'react';
import { ToolDefinition, ToolResult } from '../../types';
import { CalculatorEngine } from '../../core/calculators/CalculatorEngine';
import {
  Calculator as CalcIcon,
  DollarSign,
  TrendingUp,
  Scale,
  History,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react';

export const CalculatorStudioTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scientific' | 'loan' | 'compound' | 'units'>('scientific');

  // Scientific Calc state
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [calcHistory, setCalcHistory] = useState<{ expr: string; res: string }[]>([]);

  // Loan Calc state
  const [loanAmount, setLoanAmount] = useState(250000);
  const [loanRate, setLoanRate] = useState(6.5);
  const [loanTenure, setLoanTenure] = useState(15);

  // Compound Interest state
  const [principal, setPrincipal] = useState(10000);
  const [annualRate, setAnnualRate] = useState(8);
  const [years, setYears] = useState(10);

  // Unit Converter state
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temperature' | 'storage' | 'speed'>('length');
  const [unitVal, setUnitVal] = useState(100);
  const [unitFrom, setUnitFrom] = useState('meter');
  const [unitTo, setUnitTo] = useState('foot');

  // Scientific Button Press
  const handleBtnPress = (btn: string) => {
    if (btn === 'C') {
      setDisplay('0');
      setFormula('');
      return;
    }

    if (btn === '=') {
      try {
        const cleanFormula = formula + display;
        // Evaluate safe arithmetic
        const sanitized = cleanFormula.replace(/×/g, '*').replace(/÷/g, '/');
        // Simple safe evaluator for math tokens
        const evalRes = Function(`'use strict'; return (${sanitized})`)();
        const resStr = String(Number(evalRes.toFixed(8)));
        setCalcHistory((prev) => [{ expr: cleanFormula, res: resStr }, ...prev.slice(0, 9)]);
        setDisplay(resStr);
        setFormula('');
      } catch (err) {
        setDisplay('Error');
      }
      return;
    }

    if (['+', '-', '×', '÷'].includes(btn)) {
      setFormula((f) => f + display + ' ' + btn + ' ');
      setDisplay('0');
      return;
    }

    if (btn === '±') {
      setDisplay((d) => (d.startsWith('-') ? d.slice(1) : '-' + d));
      return;
    }

    if (btn === '%') {
      setDisplay((d) => String(Number(d) / 100));
      return;
    }

    if (btn === '√') {
      setDisplay((d) => String(Math.sqrt(Number(d))));
      return;
    }

    setDisplay((d) => (d === '0' ? btn : d + btn));
  };

  // Compute Loan Results
  const loanResults = CalculatorEngine.calculateEmi(loanAmount, loanRate, loanTenure);

  // Compute Compound Interest Results
  const compoundResults = CalculatorEngine.calculateCompoundInterest(principal, annualRate, years);

  // Compute Unit Conversion
  const convertedUnit = CalculatorEngine.convertUnits(unitVal, unitCategory, unitFrom, unitTo);

  return (
    <div id="calculator-studio-workspace" className="flex flex-col h-[calc(100vh-8rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-sm">
      {/* Top Header */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-white flex items-center gap-2">
            <CalcIcon className="w-5 h-5 text-blue-400" />
            Financial & Scientific Studio
          </h1>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('scientific')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'scientific' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Scientific
          </button>
          <button
            onClick={() => setActiveTab('loan')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'loan' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Loan & Mortgage
          </button>
          <button
            onClick={() => setActiveTab('compound')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'compound' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Compound Interest
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'units' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Unit Converter
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 p-6 bg-slate-950 overflow-y-auto flex items-center justify-center">
        {/* TAB 1: Scientific Calculator */}
        {activeTab === 'scientific' && (
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-4">
            {/* Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-right space-y-1">
              <div className="text-xs text-slate-500 font-mono h-4">{formula}</div>
              <div className="text-3xl font-mono font-bold text-white tracking-tight overflow-x-auto">{display}</div>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-2 text-sm font-medium">
              {['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '√', '='].map(
                (btn) => {
                  const isOp = ['÷', '×', '-', '+', '='].includes(btn);
                  const isSpec = ['C', '±', '%', '√'].includes(btn);
                  return (
                    <button
                      key={btn}
                      onClick={() => handleBtnPress(btn)}
                      className={`py-3.5 rounded-lg transition-colors cursor-pointer ${
                        btn === '='
                          ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm font-semibold'
                          : isOp
                          ? 'bg-slate-800 hover:bg-slate-700 text-blue-400'
                          : isSpec
                          ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-400'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800/80'
                      }`}
                    >
                      {btn}
                    </button>
                  );
                }
              )}
            </div>

            {/* History */}
            {calcHistory.length > 0 && (
              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                <div className="text-slate-500 font-medium flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Recent Calculations
                </div>
                <div className="max-h-24 overflow-y-auto space-y-0.5 font-mono text-slate-400">
                  {calcHistory.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{item.expr}</span>
                      <span className="text-white font-bold">= {item.res}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Loan & Mortgage */}
        {activeTab === 'loan' && (
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Loan & Mortgage Calculator
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sliders */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Loan Amount</span>
                    <span className="font-mono text-white font-semibold">${loanAmount.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={1000000}
                    step={5000}
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Interest Rate (% per annum)</span>
                    <span className="font-mono text-white font-semibold">{loanRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.1}
                    value={loanRate}
                    onChange={(e) => setLoanRate(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Tenure (Years)</span>
                    <span className="font-mono text-white font-semibold">{loanTenure} Years</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={30}
                    value={loanTenure}
                    onChange={(e) => setLoanTenure(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Result Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Estimated Monthly EMI</div>
                  <div className="text-3xl font-semibold text-blue-400 font-mono mt-1">
                    ${loanResults.monthlyEmi.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Principal Amount:</span>
                    <span className="text-slate-200 font-mono">${loanAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Interest Payable:</span>
                    <span className="text-amber-400 font-mono">${loanResults.totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-300">Total Payment:</span>
                    <span className="text-white font-mono">${loanResults.totalPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Compound Interest */}
        {activeTab === 'compound' && (
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" /> Compound Interest & Wealth Growth
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Initial Principal</span>
                    <span className="font-mono text-white font-semibold">${principal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={200000}
                    step={1000}
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Annual Return Rate (%)</span>
                    <span className="font-mono text-white font-semibold">{annualRate}%</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={0.5}
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Investment Period (Years)</span>
                    <span className="font-mono text-white font-semibold">{years} Years</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>

              {/* Result */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Future Total Balance</div>
                  <div className="text-3xl font-semibold text-blue-400 font-mono mt-1">
                    ${compoundResults.finalAmount.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Invested:</span>
                    <span className="text-slate-200 font-mono">${principal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Interest Earned:</span>
                    <span className="text-emerald-400 font-mono">+${compoundResults.totalInterest.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Unit Converter */}
        {activeTab === 'units' && (
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl space-y-6">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400" /> Universal Unit Converter
            </h2>

            {/* Category Select */}
            <div className="grid grid-cols-5 gap-1 text-xs">
              {(['length', 'weight', 'temperature', 'storage', 'speed'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setUnitCategory(cat);
                    if (cat === 'length') {
                      setUnitFrom('meter');
                      setUnitTo('foot');
                    } else if (cat === 'weight') {
                      setUnitFrom('kilogram');
                      setUnitTo('pound');
                    } else if (cat === 'temperature') {
                      setUnitFrom('celsius');
                      setUnitTo('fahrenheit');
                    } else if (cat === 'storage') {
                      setUnitFrom('gigabyte');
                      setUnitTo('megabyte');
                    } else if (cat === 'speed') {
                      setUnitFrom('kmh');
                      setUnitTo('mph');
                    }
                  }}
                  className={`py-1.5 rounded-md uppercase font-medium text-[10px] transition-colors cursor-pointer ${
                    unitCategory === cat ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* From / To controls */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400">Value to Convert</label>
                <input
                  type="number"
                  value={unitVal}
                  onChange={(e) => setUnitVal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 font-mono text-sm text-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">From Unit</label>
                <input
                  type="text"
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value.toLowerCase())}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 font-mono text-sm text-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">Target Unit</label>
              <input
                type="text"
                value={unitTo}
                onChange={(e) => setUnitTo(e.target.value.toLowerCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-md p-2.5 font-mono text-sm text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            {/* Result */}
            <div className="bg-slate-950 border border-slate-800 rounded-md p-4 text-center">
              <div className="text-xs text-slate-500">Converted Output</div>
              <div className="text-2xl font-bold font-mono text-blue-400 mt-1">
                {convertedUnit} {unitTo}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const calculatorStudioToolDef: ToolDefinition = {
  id: 'calculator-studio',
  name: 'Financial & Scientific Studio',
  description: 'Full scientific calculator, loan & mortgage amortizer, compound interest wealth modeler, and universal unit converter.',
  category: 'calculators',
  subcategory: 'math',
  iconName: 'Calculator',
  version: '2.0.0',
  tags: ['calculator', 'finance', 'scientific', 'mortgage', 'loan', 'compound', 'units', 'flagship'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'amount', label: 'Principal / Value', type: 'number', defaultValue: 10000 },
    ],
  },
  outputSchema: {
    type: 'text',
    filename: 'calculation.txt',
  },
  customWorkspace: CalculatorStudioTool,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      text: `Calculated values for ${input.amount || 0}`,
    };
  },
};

