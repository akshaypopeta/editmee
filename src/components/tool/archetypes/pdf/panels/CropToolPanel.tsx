import React from 'react';
import { Crop, Sliders, Check } from 'lucide-react';

interface CropToolPanelProps {
  cropTop: number;
  setCropTop: (val: number) => void;
  cropBottom: number;
  setCropBottom: (val: number) => void;
  cropLeft: number;
  setCropLeft: (val: number) => void;
  cropRight: number;
  setCropRight: (val: number) => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const CropToolPanel: React.FC<CropToolPanelProps> = ({
  cropTop,
  setCropTop,
  cropBottom,
  setCropBottom,
  cropLeft,
  setCropLeft,
  cropRight,
  setCropRight,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const applyPreset = (t: number, b: number, l: number, r: number) => {
    setCropTop(t);
    setCropBottom(b);
    setCropLeft(l);
    setCropRight(r);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Crop className="w-4 h-4 text-red-500" />
            PDF Crop Pages & Margin Trimmer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Trim excess white margins, header/footer spacing, and printer crop marks with point precision (72 pt = 1 inch).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            isAdvancedMode
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {isAdvancedMode ? 'Advanced Pro Mode' : 'Quick Presets'}
        </button>
      </div>

      {/* Quick Trim Presets */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Margin Crop Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { name: 'Standard (0.5 in)', t: 36, b: 36, l: 36, r: 36 },
            { name: 'Wide (0.75 in)', t: 54, b: 54, l: 54, r: 54 },
            { name: 'Header Only (1 in)', t: 72, b: 0, l: 0, r: 0 },
            { name: 'Footer Only (1 in)', t: 0, b: 72, l: 0, r: 0 },
          ].map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p.t, p.b, p.l, p.r)}
              className={`p-2.5 rounded-xl border text-center text-xs font-medium cursor-pointer transition-all ${
                cropTop === p.t && cropBottom === p.b && cropLeft === p.l && cropRight === p.r
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Margin Point Inputs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Top Margin (pt)
          </label>
          <input
            type="number"
            min="0"
            max="300"
            value={cropTop}
            onChange={(e) => setCropTop(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Bottom Margin (pt)
          </label>
          <input
            type="number"
            min="0"
            max="300"
            value={cropBottom}
            onChange={(e) => setCropBottom(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Left Margin (pt)
          </label>
          <input
            type="number"
            min="0"
            max="300"
            value={cropLeft}
            onChange={(e) => setCropLeft(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Right Margin (pt)
          </label>
          <input
            type="number"
            min="0"
            max="300"
            value={cropRight}
            onChange={(e) => setCropRight(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
          />
        </div>
      </div>

      {/* Geometry preview summary */}
      <div className="p-3 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/30 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
        <span>Active Trim Bounding Box:</span>
        <span className="font-mono font-bold">
          Top {cropTop}pt · Bottom {cropBottom}pt · Left {cropLeft}pt · Right {cropRight}pt
        </span>
      </div>
    </div>
  );
};
