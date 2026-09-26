import React, { useState } from 'react';
import {
  Edit3,
  Palette,
  Move,
  Maximize2,
  Layers,
  Copy,
  Trash2,
  X,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sliders,
  Type,
  Square,
  Sparkles,
  Check,
} from 'lucide-react';
import { LogoElement, CanvasDimensions } from './types';
import { POPULAR_FONTS } from './palettes';

interface MobileObjectBarProps {
  element: LogoElement;
  canvasSize: CanvasDimensions;
  onUpdateElement: (id: string, updates: Partial<LogoElement>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onDeselect: () => void;
  onReorder: (direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onAlign: (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
  onOpenTextEditor: () => void;
}

type SubPanelType = 'style' | 'position' | 'size' | 'arrange' | null;

export const MobileObjectBar: React.FC<MobileObjectBarProps> = ({
  element,
  canvasSize,
  onUpdateElement,
  onDuplicate,
  onDelete,
  onDeselect,
  onReorder,
  onAlign,
  onOpenTextEditor,
}) => {
  const [activePanel, setActivePanel] = useState<SubPanelType>(null);

  const togglePanel = (panel: SubPanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleToggleAspectLock = () => {
    onUpdateElement(element.id, {
      aspectRatioLocked: !element.aspectRatioLocked,
    });
  };

  const handleToggleLock = () => {
    onUpdateElement(element.id, { locked: !element.locked });
  };

  const paletteSwatches = [
    '#ffffff',
    '#0f172a',
    '#1e3a8a',
    '#2563eb',
    '#3b82f6',
    '#60a5fa',
    '#4f46e5',
    '#7c3aed',
    '#d946ef',
    '#e11d48',
    '#ea580c',
    '#d97706',
    '#eab308',
    '#16a34a',
    '#0d9488',
    '#0891b2',
  ];

  return (
    <div className="md:hidden z-30 shrink-0 bg-slate-900 border-t border-slate-800 flex flex-col shadow-2xl">
      {/* Sub-Panel Drawer (Position, Size, Style, Arrange) */}
      {activePanel && (
        <div className="bg-slate-950/95 border-b border-slate-800 max-h-[38vh] overflow-y-auto p-3 space-y-3 animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              {activePanel === 'position' && 'Position & Alignment'}
              {activePanel === 'size' && 'Size & Aspect Ratio'}
              {activePanel === 'style' && 'Styling & Appearance'}
              {activePanel === 'arrange' && 'Layer Ordering (Z-Index)'}
            </span>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. POSITION PANEL */}
          {activePanel === 'position' && (
            <div className="space-y-3">
              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">X Coordinate</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onUpdateElement(element.id, { x: element.x - 5 })}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center active:bg-slate-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={Math.round(element.x)}
                      onChange={(e) =>
                        onUpdateElement(element.id, { x: parseInt(e.target.value) || 0 })
                      }
                      className="flex-1 text-center bg-slate-950 border border-slate-700 rounded h-7 text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateElement(element.id, { x: element.x + 5 })}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center active:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Y Coordinate</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onUpdateElement(element.id, { y: element.y - 5 })}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center active:bg-slate-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={Math.round(element.y)}
                      onChange={(e) =>
                        onUpdateElement(element.id, { y: parseInt(e.target.value) || 0 })
                      }
                      className="flex-1 text-center bg-slate-950 border border-slate-700 rounded h-7 text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateElement(element.id, { y: element.y + 5 })}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center active:bg-slate-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Alignment Grid */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                  Quick Canvas Align
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onAlign('left')}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium"
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => onAlign('center-h')}
                    className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-xs text-blue-300 font-bold"
                  >
                    Center H
                  </button>
                  <button
                    type="button"
                    onClick={() => onAlign('right')}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium"
                  >
                    Right
                  </button>
                  <button
                    type="button"
                    onClick={() => onAlign('top')}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium"
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    onClick={() => onAlign('center-v')}
                    className="py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 text-xs text-blue-300 font-bold"
                  >
                    Middle V
                  </button>
                  <button
                    type="button"
                    onClick={() => onAlign('bottom')}
                    className="py-1.5 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium"
                  >
                    Bottom
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. SIZE PANEL */}
          {activePanel === 'size' && (
            <div className="space-y-3">
              {/* Aspect Ratio Lock Banner */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center space-x-2">
                  {element.aspectRatioLocked ? (
                    <Lock className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Unlock className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs text-slate-200 font-medium">
                    {element.aspectRatioLocked ? 'Proportional Scale (Locked)' : 'Free Scaling (Unlocked)'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAspectLock}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    element.aspectRatioLocked
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {element.aspectRatioLocked ? 'Unlock' : 'Lock Ratio'}
                </button>
              </div>

              {/* Width & Height Steppers */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Width</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newW = Math.max(15, element.width - 10);
                        const updates: Partial<LogoElement> = { width: newW };
                        if (element.aspectRatioLocked && element.width > 0) {
                          updates.height = Math.round((newW / element.width) * element.height);
                        }
                        onUpdateElement(element.id, updates);
                      }}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={Math.round(element.width)}
                      onChange={(e) => {
                        const newW = Math.max(15, parseInt(e.target.value) || 15);
                        const updates: Partial<LogoElement> = { width: newW };
                        if (element.aspectRatioLocked && element.width > 0) {
                          updates.height = Math.round((newW / element.width) * element.height);
                        }
                        onUpdateElement(element.id, updates);
                      }}
                      className="flex-1 text-center bg-slate-950 border border-slate-700 rounded h-7 text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newW = element.width + 10;
                        const updates: Partial<LogoElement> = { width: newW };
                        if (element.aspectRatioLocked && element.width > 0) {
                          updates.height = Math.round((newW / element.width) * element.height);
                        }
                        onUpdateElement(element.id, updates);
                      }}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">Height</span>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        const newH = Math.max(15, element.height - 10);
                        const updates: Partial<LogoElement> = { height: newH };
                        if (element.aspectRatioLocked && element.height > 0) {
                          updates.width = Math.round((newH / element.height) * element.width);
                        }
                        onUpdateElement(element.id, updates);
                      }}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={Math.round(element.height)}
                      onChange={(e) => {
                        const newH = Math.max(15, parseInt(e.target.value) || 15);
                        const updates: Partial<LogoElement> = { height: newH };
                        if (element.aspectRatioLocked && element.height > 0) {
                          updates.width = Math.round((newH / element.height) * element.width);
                        }
                        onUpdateElement(element.id, updates);
                      }}
                      className="flex-1 text-center bg-slate-950 border border-slate-700 rounded h-7 text-xs font-mono text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newH = element.height + 10;
                        const updates: Partial<LogoElement> = { height: newH };
                        if (element.aspectRatioLocked && element.height > 0) {
                          updates.width = Math.round((newH / element.height) * element.width);
                        }
                        onUpdateElement(element.id, updates);
                      }}
                      className="w-7 h-7 rounded bg-slate-800 text-white font-bold flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Rotation Stepper */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Rotation</span>
                  <span className="font-mono text-blue-400">{element.rotation}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={element.rotation}
                  onChange={(e) =>
                    onUpdateElement(element.id, { rotation: parseInt(e.target.value) })
                  }
                  className="w-full accent-blue-500"
                />
              </div>
            </div>
          )}

          {/* 3. STYLE PANEL */}
          {activePanel === 'style' && (
            <div className="space-y-3">
              {/* Fill Color */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1.5 font-semibold">
                  Primary Fill Color
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={element.fillColor || '#ffffff'}
                    onChange={(e) => onUpdateElement(element.id, { fillColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-700 bg-transparent shrink-0"
                  />
                  <div className="flex-1 flex flex-wrap gap-1.5">
                    {paletteSwatches.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateElement(element.id, { fillColor: c })}
                        className="w-6 h-6 rounded-md border border-slate-700 hover:scale-110 transition-transform"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Opacity Slider */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-blue-400">
                    {Math.round((element.opacity || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={Math.round((element.opacity || 1) * 100)}
                  onChange={(e) =>
                    onUpdateElement(element.id, { opacity: parseInt(e.target.value) / 100 })
                  }
                  className="w-full accent-blue-500"
                />
              </div>

              {/* Shape-specific: Border Radius & Stroke */}
              {element.type === 'shape' && (
                <div className="space-y-2">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Corner Radius</span>
                      <span className="font-mono text-blue-400">{element.borderRadius || 0}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={element.borderRadius || 0}
                      onChange={(e) =>
                        onUpdateElement(element.id, { borderRadius: parseInt(e.target.value) })
                      }
                      className="w-full accent-blue-500"
                    />
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Stroke Width</span>
                      <span className="font-mono text-blue-400">
                        {element.stroke?.width || 0}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      value={element.stroke?.width || 0}
                      onChange={(e) => {
                        const width = parseInt(e.target.value);
                        onUpdateElement(element.id, {
                          stroke: {
                            color: element.stroke?.color || '#ffffff',
                            width,
                          },
                        });
                      }}
                      className="w-full accent-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. ARRANGE (Z-ORDER) PANEL */}
          {activePanel === 'arrange' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-400 mb-1">
                Move layer up or down in the rendering hierarchy:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onReorder('top')}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-left"
                >
                  <ChevronsUp className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Bring to Front</div>
                    <div className="text-[10px] text-slate-400">Move to top-most layer</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onReorder('up')}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-left"
                >
                  <ChevronUp className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Bring Forward</div>
                    <div className="text-[10px] text-slate-400">Move up one layer</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onReorder('down')}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-left"
                >
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Send Backward</div>
                    <div className="text-[10px] text-slate-400">Move down one layer</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onReorder('bottom')}
                  className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center space-x-2 text-left"
                >
                  <ChevronsDown className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Send to Back</div>
                    <div className="text-[10px] text-slate-400">Move to bottom-most layer</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Touch Action Bar */}
      <div className="px-3 py-2 flex items-center justify-between border-t border-slate-800/80 bg-slate-900/95 overflow-x-auto no-scrollbar space-x-2">
        {/* Selected Element Pill */}
        <div className="flex items-center space-x-2 shrink-0 pr-2 border-r border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            {element.type === 'text' && <Type className="w-3.5 h-3.5" />}
            {element.type === 'shape' && <Square className="w-3.5 h-3.5" />}
            {element.type === 'icon' && <Sparkles className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-semibold text-white truncate max-w-[80px]">
            {element.name}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Text: Immediate Edit Button */}
          {element.type === 'text' && (
            <button
              type="button"
              onClick={onOpenTextEditor}
              className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center space-x-1 active:bg-blue-500 shrink-0 shadow-sm shadow-blue-600/30"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Text</span>
            </button>
          )}

          {/* Style */}
          <button
            type="button"
            onClick={() => togglePanel('style')}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors shrink-0 ${
              activePanel === 'style'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 active:bg-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Style</span>
          </button>

          {/* Position */}
          <button
            type="button"
            onClick={() => togglePanel('position')}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors shrink-0 ${
              activePanel === 'position'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 active:bg-slate-800'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>Position</span>
          </button>

          {/* Size */}
          <button
            type="button"
            onClick={() => togglePanel('size')}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors shrink-0 ${
              activePanel === 'size'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 active:bg-slate-800'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Size</span>
          </button>

          {/* Arrange */}
          <button
            type="button"
            onClick={() => togglePanel('arrange')}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 border transition-colors shrink-0 ${
              activePanel === 'arrange'
                ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 active:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Arrange</span>
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 active:text-white shrink-0"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-red-400 active:bg-red-500/20 shrink-0"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Done / Deselect */}
          <button
            type="button"
            onClick={onDeselect}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white shrink-0 ml-1"
            title="Deselect"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
