import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  ArrowRightLeft,
  Scale,
  DollarSign,
  Palette,
  Binary,
  Clock,
  Copy,
  Check,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const ConverterStudioWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'units' | 'colors' | 'base' | 'data'>('units');
  const [copied, setCopied] = useState(false);

  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<'length' | 'mass' | 'temp' | 'digital'>('length');
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('feet');

  // Color Converter State
  const [hexColor, setHexColor] = useState<string>('#ef4444');

  // Base Converter State
  const [baseInput, setBaseInput] = useState<string>('255');
  const [baseFrom, setBaseFrom] = useState<number>(10);

  // Units Math
  const convertedUnit = useMemo(() => {
    if (unitCategory === 'length') {
      const toMeters: Record<string, number> = {
        meter: 1,
        kilometer: 1000,
        centimeter: 0.01,
        millimeter: 0.001,
        mile: 1609.34,
        yard: 0.9144,
        feet: 0.3048,
        inch: 0.0254,
      };
      const meters = inputValue * (toMeters[fromUnit] || 1);
      const res = meters / (toMeters[toUnit] || 1);
      return Number(res.toFixed(4));
    }
    if (unitCategory === 'mass') {
      const toKg: Record<string, number> = {
        kilogram: 1,
        gram: 0.001,
        milligram: 0.000001,
        pound: 0.453592,
        ounce: 0.0283495,
        ton: 1000,
      };
      const kg = inputValue * (toKg[fromUnit] || 1);
      const res = kg / (toKg[toUnit] || 1);
      return Number(res.toFixed(4));
    }
    if (unitCategory === 'temp') {
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') return Number(((inputValue * 9) / 5 + 32).toFixed(2));
      if (fromUnit === 'fahrenheit' && toUnit === 'celsius') return Number((((inputValue - 32) * 5) / 9).toFixed(2));
      if (fromUnit === 'celsius' && toUnit === 'kelvin') return Number((inputValue + 273.15).toFixed(2));
      if (fromUnit === 'kelvin' && toUnit === 'celsius') return Number((inputValue - 273.15).toFixed(2));
      return inputValue;
    }
    if (unitCategory === 'digital') {
      const toBytes: Record<string, number> = {
        byte: 1,
        kilobyte: 1024,
        megabyte: 1024 * 1024,
        gigabyte: 1024 * 1024 * 1024,
        terabyte: 1024 * 1024 * 1024 * 1024,
      };
      const bytes = inputValue * (toBytes[fromUnit] || 1);
      const res = bytes / (toBytes[toUnit] || 1);
      return Number(res.toFixed(4));
    }
    return inputValue;
  }, [inputValue, fromUnit, toUnit, unitCategory]);

  // Color Math
  const colorConversions = useMemo(() => {
    let hex = hexColor.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const bigint = parseInt(hex, 16) || 0;
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // HSL
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;
    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rf:
          h = (gf - bf) / d + (gf < bf ? 6 : 0);
          break;
        case gf:
          h = (bf - rf) / d + 2;
          break;
        case bf:
          h = (rf - gf) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      hex: `#${hex}`,
      rgb: `rgb(${r}, ${g}, ${b})`,
      rgba: `rgba(${r}, ${g}, ${b}, 1)`,
      hsl: `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`,
    };
  }, [hexColor]);

  // Base Math
  const baseConversions = useMemo(() => {
    try {
      const dec = parseInt(baseInput, baseFrom);
      if (isNaN(dec)) return { dec: 'Invalid', hex: 'Invalid', bin: 'Invalid', oct: 'Invalid' };
      return {
        dec: dec.toString(10),
        hex: dec.toString(16).toUpperCase(),
        bin: dec.toString(2),
        oct: dec.toString(8),
      };
    } catch {
      return { dec: 'Error', hex: 'Error', bin: 'Error', oct: 'Error' };
    }
  }, [baseInput, baseFrom]);

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Universal Converter Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Multi-Format
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              High-precision unit conversion, color formats, binary/hex encodings, and digital byte calculations.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'units' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Units & Physics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'colors' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Color Formats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('base')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'base' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Base Encodings
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'units' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            {(['length', 'mass', 'temp', 'digital'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setUnitCategory(cat);
                  if (cat === 'length') {
                    setFromUnit('meter');
                    setToUnit('feet');
                  }
                  if (cat === 'mass') {
                    setFromUnit('kilogram');
                    setToUnit('pound');
                  }
                  if (cat === 'temp') {
                    setFromUnit('celsius');
                    setToUnit('fahrenheit');
                  }
                  if (cat === 'digital') {
                    setFromUnit('megabyte');
                    setToUnit('gigabyte');
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                  unitCategory === cat ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="text-xs font-bold text-slate-700 block">From Amount</label>
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-900"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {unitCategory === 'length' && (
                  <>
                    <option value="meter">Meters (m)</option>
                    <option value="kilometer">Kilometers (km)</option>
                    <option value="centimeter">Centimeters (cm)</option>
                    <option value="millimeter">Millimeters (mm)</option>
                    <option value="mile">Miles (mi)</option>
                    <option value="yard">Yards (yd)</option>
                    <option value="feet">Feet (ft)</option>
                    <option value="inch">Inches (in)</option>
                  </>
                )}
                {unitCategory === 'mass' && (
                  <>
                    <option value="kilogram">Kilograms (kg)</option>
                    <option value="gram">Grams (g)</option>
                    <option value="pound">Pounds (lb)</option>
                    <option value="ounce">Ounces (oz)</option>
                    <option value="ton">Metric Tons (t)</option>
                  </>
                )}
                {unitCategory === 'temp' && (
                  <>
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="kelvin">Kelvin (K)</option>
                  </>
                )}
                {unitCategory === 'digital' && (
                  <>
                    <option value="byte">Bytes (B)</option>
                    <option value="kilobyte">Kilobytes (KB)</option>
                    <option value="megabyte">Megabytes (MB)</option>
                    <option value="gigabyte">Gigabytes (GB)</option>
                    <option value="terabyte">Terabytes (TB)</option>
                  </>
                )}
              </select>
            </div>

            <div className="p-5 bg-red-50/50 border border-red-200 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-red-900 block">Converted Result</label>
                <button
                  type="button"
                  onClick={() => handleCopy(String(convertedUnit))}
                  className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="w-full px-3 py-2.5 bg-white border border-red-200 rounded-xl text-lg font-mono font-black text-red-600">
                {convertedUnit}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-red-200 rounded-xl text-xs font-bold text-slate-800"
              >
                {unitCategory === 'length' && (
                  <>
                    <option value="feet">Feet (ft)</option>
                    <option value="meter">Meters (m)</option>
                    <option value="kilometer">Kilometers (km)</option>
                    <option value="centimeter">Centimeters (cm)</option>
                    <option value="millimeter">Millimeters (mm)</option>
                    <option value="mile">Miles (mi)</option>
                    <option value="yard">Yards (yd)</option>
                    <option value="inch">Inches (in)</option>
                  </>
                )}
                {unitCategory === 'mass' && (
                  <>
                    <option value="pound">Pounds (lb)</option>
                    <option value="kilogram">Kilograms (kg)</option>
                    <option value="gram">Grams (g)</option>
                    <option value="ounce">Ounces (oz)</option>
                    <option value="ton">Metric Tons (t)</option>
                  </>
                )}
                {unitCategory === 'temp' && (
                  <>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                    <option value="celsius">Celsius (°C)</option>
                    <option value="kelvin">Kelvin (K)</option>
                  </>
                )}
                {unitCategory === 'digital' && (
                  <>
                    <option value="gigabyte">Gigabytes (GB)</option>
                    <option value="megabyte">Megabytes (MB)</option>
                    <option value="kilobyte">Kilobytes (KB)</option>
                    <option value="byte">Bytes (B)</option>
                    <option value="terabyte">Terabytes (TB)</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'colors' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => setHexColor(e.target.value)}
              className="w-16 h-16 rounded-2xl border border-slate-200 cursor-pointer p-1"
            />
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Input Hex Color</span>
              <input
                type="text"
                value={hexColor}
                onChange={(e) => setHexColor(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(colorConversions).map(([fmt, val]) => (
              <div key={fmt} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500">{fmt}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(val)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 truncate">{val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'base' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Input Value</label>
              <input
                type="text"
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">From Base</label>
              <select
                value={baseFrom}
                onChange={(e) => setBaseFrom(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value={10}>Decimal (Base 10)</option>
                <option value={16}>Hexadecimal (Base 16)</option>
                <option value={2}>Binary (Base 2)</option>
                <option value={8}>Octal (Base 8)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Decimal (Base 10)</span>
              <div className="text-sm font-mono font-black text-slate-900">{baseConversions.dec}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Hex (Base 16)</span>
              <div className="text-sm font-mono font-black text-red-600">{baseConversions.hex}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Binary (Base 2)</span>
              <div className="text-xs font-mono font-bold text-blue-600 break-all">{baseConversions.bin}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Octal (Base 8)</span>
              <div className="text-sm font-mono font-black text-emerald-600">{baseConversions.oct}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const converterStudioToolDef: ToolDefinition = {
  id: 'converter-studio',
  name: 'Converter Studio Pro',
  category: 'converters',
  subcategory: 'units',
  description: 'Universal multi-format conversion studio for physical units, color models, base encodings, and digital data.',
  iconName: 'ArrowRightLeft',
  version: '2.0.0',
  tags: ['converter', 'units', 'currency', 'colors', 'binary', 'hex', 'temperature', 'studio'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  inputSchema: { fields: [] },
  outputSchema: { type: 'custom' },
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  customWorkspace: ConverterStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Converter Studio Ready' };
  },
};
