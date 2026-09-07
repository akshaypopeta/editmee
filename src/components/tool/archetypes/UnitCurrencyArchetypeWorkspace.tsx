import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../../types';
import {
  ArrowRightLeft,
  DollarSign,
  Scale,
  Thermometer,
  Layers,
  Copy,
  Check,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { storageEngine } from '../../../core/storage-engine/StorageEngine';

interface Props {
  tool: ToolDefinition;
}

// Unit Categories and conversion factors (relative to base unit)
const UNIT_CATEGORIES: Record<string, { base: string; units: Record<string, number> }> = {
  length: {
    base: 'm',
    units: {
      Meters: 1,
      Kilometers: 1000,
      Centimeters: 0.01,
      Millimeters: 0.001,
      Inches: 0.0254,
      Feet: 0.3048,
      Yards: 0.9144,
      Miles: 1609.34,
      'Nautical Miles': 1852,
    },
  },
  mass: {
    base: 'kg',
    units: {
      Kilograms: 1,
      Grams: 0.001,
      Milligrams: 0.000001,
      Pounds: 0.453592,
      Ounces: 0.0283495,
      MetricTons: 1000,
      Stone: 6.35029,
    },
  },
  speed: {
    base: 'm/s',
    units: {
      'Meters per second (m/s)': 1,
      'Kilometers per hour (km/h)': 0.277778,
      'Miles per hour (mph)': 0.44704,
      'Knots (kts)': 0.514444,
      'Feet per second (ft/s)': 0.3048,
    },
  },
  storage: {
    base: 'MB',
    units: {
      Bytes: 0.000001,
      Kilobytes: 0.001,
      Megabytes: 1,
      Gigabytes: 1000,
      Terabytes: 1000000,
      Petabytes: 1000000000,
    },
  },
};

const CURRENCY_RATES: Record<string, { rate: number; symbol: string; flag: string }> = {
  USD: { rate: 1.0, symbol: '$', flag: '🇺🇸' },
  EUR: { rate: 0.92, symbol: '€', flag: '🇪🇺' },
  GBP: { rate: 0.79, symbol: '£', flag: '🇬🇧' },
  JPY: { rate: 154.5, symbol: '¥', flag: '🇯🇵' },
  CAD: { rate: 1.36, symbol: 'CA$', flag: '🇨🇦' },
  AUD: { rate: 1.52, symbol: 'A$', flag: '🇦🇺' },
  CHF: { rate: 0.91, symbol: 'CHF', flag: '🇨🇭' },
  INR: { rate: 83.4, symbol: '₹', flag: '🇮🇳' },
  SGD: { rate: 1.35, symbol: 'S$', flag: '🇸🇬' },
  AED: { rate: 3.67, symbol: 'AED', flag: '🇦🇪' },
  CNY: { rate: 7.24, symbol: '¥', flag: '🇨🇳' },
};

export const UnitCurrencyArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const toolId = tool.id.toLowerCase();
  const name = tool.name.toLowerCase();

  const isCurrency = name.includes('currency') || toolId.includes('currency') || name.includes('exchange');
  const isTemperature = name.includes('temp') || name.includes('celsius') || name.includes('fahrenheit');

  // Currency State
  const [currencyAmount, setCurrencyAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');

  // Temperature State
  const [tempVal, setTempVal] = useState<number>(25);
  const [tempUnitFrom, setTempUnitFrom] = useState<'C' | 'F' | 'K'>('C');
  const [tempUnitTo, setTempUnitTo] = useState<'C' | 'F' | 'K'>('F');

  // Generic Unit State
  const unitCategoryKey = useMemo(() => {
    if (name.includes('mass') || name.includes('weight') || name.includes('pound') || name.includes('kg')) return 'mass';
    if (name.includes('speed') || name.includes('pace') || name.includes('velocity')) return 'speed';
    if (name.includes('storage') || name.includes('byte') || name.includes('megabyte') || name.includes('gigabyte')) return 'storage';
    return 'length';
  }, [name]);

  const activeCategory = UNIT_CATEGORIES[unitCategoryKey] || UNIT_CATEGORIES.length;
  const unitOptions = Object.keys(activeCategory.units);

  const [unitAmount, setUnitAmount] = useState<number>(10);
  const [fromUnit, setFromUnit] = useState<string>(unitOptions[0]);
  const [toUnit, setToUnit] = useState<string>(unitOptions[1] || unitOptions[0]);

  const [copied, setCopied] = useState(false);

  // Currency Calculation
  const currencyResult = useMemo(() => {
    const fromR = CURRENCY_RATES[fromCurrency]?.rate || 1.0;
    const toR = CURRENCY_RATES[toCurrency]?.rate || 1.0;
    const inUsd = currencyAmount / fromR;
    const converted = inUsd * toR;
    const exchangeRate = toR / fromR;

    return {
      converted: converted.toFixed(2),
      exchangeRate: exchangeRate.toFixed(4),
      inverseRate: (1 / exchangeRate).toFixed(4),
    };
  }, [currencyAmount, fromCurrency, toCurrency]);

  // Temperature Calculation
  const tempResult = useMemo(() => {
    let inCelsius = tempVal;
    if (tempUnitFrom === 'F') {
      inCelsius = (tempVal - 32) * (5 / 9);
    } else if (tempUnitFrom === 'K') {
      inCelsius = tempVal - 273.15;
    }

    let outVal = inCelsius;
    if (tempUnitTo === 'F') {
      outVal = inCelsius * (9 / 5) + 32;
    } else if (tempUnitTo === 'K') {
      outVal = inCelsius + 273.15;
    }

    return {
      converted: outVal.toFixed(2),
      celsius: inCelsius.toFixed(2),
      fahrenheit: (inCelsius * (9 / 5) + 32).toFixed(2),
      kelvin: (inCelsius + 273.15).toFixed(2),
    };
  }, [tempVal, tempUnitFrom, tempUnitTo]);

  // Standard Unit Calculation
  const unitResult = useMemo(() => {
    const fromFactor = activeCategory.units[fromUnit] || 1;
    const toFactor = activeCategory.units[toUnit] || 1;
    const inBase = unitAmount * fromFactor;
    const converted = inBase / toFactor;

    return {
      converted: converted.toLocaleString('en-US', { maximumFractionDigits: 6 }),
      rate: (fromFactor / toFactor).toFixed(6),
    };
  }, [unitAmount, fromUnit, toUnit, activeCategory]);

  const handleCopy = () => {
    let text = `${tool.name}\n`;
    if (isCurrency) {
      text += `${CURRENCY_RATES[fromCurrency]?.symbol}${currencyAmount} ${fromCurrency} = ${CURRENCY_RATES[toCurrency]?.symbol}${currencyResult.converted} ${toCurrency}\nExchange Rate: 1 ${fromCurrency} = ${currencyResult.exchangeRate} ${toCurrency}`;
    } else if (isTemperature) {
      text += `${tempVal}°${tempUnitFrom} = ${tempResult.converted}°${tempUnitTo}\n(C: ${tempResult.celsius}°C, F: ${tempResult.fahrenheit}°F, K: ${tempResult.kelvin}K)`;
    } else {
      text += `${unitAmount} ${fromUnit} = ${unitResult.converted} ${toUnit}`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    storageEngine.addHistoryItem({
      toolId: tool.id,
      toolName: tool.name,
      category: 'calculators',
      status: 'completed',
      outputSummary: text.split('\n')[1] || 'Conversion complete',
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. CURRENCY CONVERTER */}
      {isCurrency && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400" />
                Currency Conversion
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount</label>
                <input
                  type="number"
                  value={currencyAmount}
                  onChange={(e) => setCurrencyAmount(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">From Currency</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {Object.keys(CURRENCY_RATES).map((curr) => (
                    <option key={curr} value={curr}>
                      {CURRENCY_RATES[curr].flag} {curr} - {CURRENCY_RATES[curr].symbol}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => {
                    const temp = fromCurrency;
                    setFromCurrency(toCurrency);
                    setToCurrency(temp);
                  }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">To Currency</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {Object.keys(CURRENCY_RATES).map((curr) => (
                    <option key={curr} value={curr}>
                      {CURRENCY_RATES[curr].flag} {curr} - {CURRENCY_RATES[curr].symbol}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Conversion!' : 'Copy Conversion'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-6 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  {CURRENCY_RATES[fromCurrency]?.flag} {currencyAmount.toLocaleString()} {fromCurrency} equals
                </div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                  {CURRENCY_RATES[toCurrency]?.symbol}{Number(currencyResult.converted).toLocaleString()}{' '}
                  <span className="text-xl font-bold text-slate-500 dark:text-slate-400">{toCurrency}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2">
                  1 {fromCurrency} = {currencyResult.exchangeRate} {toCurrency} • 1 {toCurrency} = {currencyResult.inverseRate} {fromCurrency}
                </div>
              </div>

              {/* Multi-Currency Cross Rate Table */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Major Cross-Currency Benchmarks</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD'].map((curr) => {
                    const fromR = CURRENCY_RATES[fromCurrency]?.rate || 1;
                    const cR = CURRENCY_RATES[curr]?.rate || 1;
                    const val = ((currencyAmount / fromR) * cR).toFixed(2);
                    return (
                      <div key={curr} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          {CURRENCY_RATES[curr]?.flag} {curr}
                        </div>
                        <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">
                          {CURRENCY_RATES[curr]?.symbol}{Number(val).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEMPERATURE CONVERTER */}
      {isTemperature && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Thermometer className="w-4 h-4 text-red-600 dark:text-red-400" />
                Temperature Scale
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Temperature Value</label>
                <input
                  type="number"
                  value={tempVal}
                  onChange={(e) => setTempVal(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">From</label>
                  <select
                    value={tempUnitFrom}
                    onChange={(e) => setTempUnitFrom(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="K">Kelvin (K)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">To</label>
                  <select
                    value={tempUnitTo}
                    onChange={(e) => setTempUnitTo(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                  >
                    <option value="C">Celsius (°C)</option>
                    <option value="F">Fahrenheit (°F)</option>
                    <option value="K">Kelvin (K)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Temp!' : 'Copy Temperature Conversion'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-6 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  {tempVal}°{tempUnitFrom} equals
                </div>
                <div className="text-5xl font-black text-slate-900 dark:text-white font-mono">
                  {tempResult.converted}°{tempUnitTo}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Celsius</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{tempResult.celsius}°C</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Fahrenheit</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{tempResult.fahrenheit}°F</div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Kelvin</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">{tempResult.kelvin} K</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STANDARD UNIT CONVERTER (Length, Mass, Speed, Storage) */}
      {!isCurrency && !isTemperature && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <Scale className="w-4 h-4 text-red-600 dark:text-red-400" />
                Unit Conversion
              </h3>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Input Value</label>
                <input
                  type="number"
                  value={unitAmount}
                  onChange={(e) => setUnitAmount(Number(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">From Unit</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center -my-1">
                <button
                  type="button"
                  onClick={() => {
                    const temp = fromUnit;
                    setFromUnit(toUnit);
                    setToUnit(temp);
                  }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700 transition-transform active:scale-95 cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">To Unit</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500"
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied Conversion!' : 'Copy Converted Units'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="p-6 bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-center">
                <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">
                  {unitAmount.toLocaleString()} {fromUnit} equals
                </div>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono">
                  {unitResult.converted} <span className="text-xl font-bold text-slate-500 dark:text-slate-400">{toUnit}</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-2">
                  Conversion Factor: 1 {fromUnit} = {unitResult.rate} {toUnit}
                </div>
              </div>

              {/* All Unit Scales */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">All Equivalent Measurements</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {unitOptions.map((u) => {
                    const fromF = activeCategory.units[fromUnit] || 1;
                    const toF = activeCategory.units[u] || 1;
                    const val = ((unitAmount * fromF) / toF).toLocaleString('en-US', { maximumFractionDigits: 4 });
                    return (
                      <div key={u} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{u}</div>
                        <div className="text-sm font-black text-slate-900 dark:text-white font-mono mt-0.5">{val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
