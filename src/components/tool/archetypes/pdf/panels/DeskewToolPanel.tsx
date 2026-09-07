import React from 'react';
import { RotateCcw, RotateCw, Sliders } from 'lucide-react';

interface DeskewToolPanelProps {
  deskewAngle: number;
  setDeskewAngle: (angle: number) => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const DeskewToolPanel: React.FC<DeskewToolPanelProps> = ({
  deskewAngle,
  setDeskewAngle,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-red-500" />
            PDF Scanned Document Deskew & Leveler
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Straighten crooked scanner scans, eliminate document tilt, and realign page matrices.
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
          {isAdvancedMode ? 'Fine-Tune Precision' : 'Quick Mode'}
        </button>
      </div>

      {/* Preset Quick Buttons */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Quick Leveling Adjustments
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[-5, -2, 0, 2, 5].map((ang) => (
            <button
              key={ang}
              type="button"
              onClick={() => setDeskewAngle(ang)}
              className={`p-2.5 rounded-xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                deskewAngle === ang
                  ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              {ang > 0 ? `+${ang}°` : `${ang}°`}
            </button>
          ))}
        </div>
      </div>

      {/* Fine-Tuning Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Precision Rotational Angle
          </label>
          <span className="text-sm font-mono font-bold text-red-600 dark:text-red-400">
            {deskewAngle > 0 ? `+${deskewAngle}` : deskewAngle}°
          </span>
        </div>

        <input
          type="range"
          min="-15"
          max="15"
          step="0.5"
          value={deskewAngle}
          onChange={(e) => setDeskewAngle(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
        />

        <div className="flex justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> -15° (Counter-clockwise)
          </span>
          <span>0° (Level Baseline)</span>
          <span className="flex items-center gap-1">
            +15° (Clockwise) <RotateCw className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
