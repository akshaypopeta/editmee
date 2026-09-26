import React, { useState } from 'react';
import { CanvasDimensions, CanvasPreset } from './types';
import { CANVAS_PRESETS, convertUnitToPx } from './palettes';
import { Maximize2, X, Check, ArrowRight } from 'lucide-react';

interface CanvasPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDimensions: CanvasDimensions;
  onApplyDimensions: (newDims: CanvasDimensions) => void;
}

export const CanvasPresetModal: React.FC<CanvasPresetModalProps> = ({
  isOpen,
  onClose,
  currentDimensions,
  onApplyDimensions,
}) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [unit, setUnit] = useState<'px' | 'in' | 'cm' | 'mm'>('px');
  const [customWidth, setCustomWidth] = useState<number>(currentDimensions.width);
  const [customHeight, setCustomHeight] = useState<number>(currentDimensions.height);
  const [lockRatio, setLockRatio] = useState<boolean>(false);

  const categories = ['All', 'Branding', 'Social Media', 'Business', 'Custom'];

  const filteredPresets =
    activeCategory === 'All'
      ? CANVAS_PRESETS
      : CANVAS_PRESETS.filter((p) => p.category === activeCategory);

  const handleApplyPreset = (preset: CanvasPreset) => {
    onApplyDimensions({ width: preset.width, height: preset.height, unit: 'px' });
    onClose();
  };

  const handleApplyCustom = () => {
    const finalWidth = convertUnitToPx(customWidth, unit);
    const finalHeight = convertUnitToPx(customHeight, unit);
    if (finalWidth > 0 && finalHeight > 0) {
      onApplyDimensions({ width: finalWidth, height: finalHeight, unit });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Canvas Size & Presets</h2>
              <p className="text-xs text-slate-400">
                Choose standardized export dimensions or configure custom print-ready geometry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-800 flex items-center space-x-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeCategory === 'Custom' ? (
            /* Custom Dimensions Form */
            <div className="max-w-md mx-auto space-y-5 py-4">
              <div className="space-y-1 text-center">
                <h3 className="text-sm font-semibold text-white">Custom Canvas Dimensions</h3>
                <p className="text-xs text-slate-400">Specify exact canvas bounds in pixels or physical print units.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Width</label>
                  <input
                    type="number"
                    min={50}
                    max={8000}
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(10, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Height</label>
                  <input
                    type="number"
                    min={50}
                    max={8000}
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(10, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Unit of Measurement</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['px', 'in', 'cm', 'mm'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        unit === u
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {u.toUpperCase()}
                    </button>
                  ))}
                </div>
                {unit !== 'px' && (
                  <p className="text-[11px] text-slate-400 mt-2 text-center">
                    Computed size: ~{convertUnitToPx(customWidth, unit)} × {convertUnitToPx(customHeight, unit)} px @ 300 DPI
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Apply Custom Size</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Presets Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredPresets.map((preset) => {
                const isSelected =
                  currentDimensions.width === preset.width && currentDimensions.height === preset.height;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-600/10'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </div>
                      <div className="text-[11px] font-mono text-blue-400">
                        {preset.width} × {preset.height} px ({preset.ratio})
                      </div>
                      {preset.description && (
                        <p className="text-[10px] text-slate-400 leading-normal">{preset.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Current active canvas: {currentDimensions.width} × {currentDimensions.height} px</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
