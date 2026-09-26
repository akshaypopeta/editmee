import React, { useState } from 'react';
import {
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Type,
  Square,
  Sparkles,
  Layers,
  Wand2,
  Check,
  RefreshCw,
  Scissors,
  ChevronRight,
  X,
} from 'lucide-react';
import { DesignElement, CanvasSettings, BlendMode } from './types';
import { FILTER_PRESETS, DEFAULT_IMAGE_FILTERS, removeImageBackground } from './imageFilters';

interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  elements: DesignElement[];
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  canvasSettings: CanvasSettings;
  onUpdateCanvasSettings: (updates: Partial<CanvasSettings>) => void;
  onSelectElement: (id: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedElement,
  elements,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElement,
  canvasSettings,
  onUpdateCanvasSettings,
  onSelectElement,
  isOpen = true,
  onClose,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'layers'>('properties');
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const blendModes: BlendMode[] = [
    'normal',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
  ];

  const fontFamilies = [
    'system-ui, -apple-system, sans-serif',
    'Playfair Display, Georgia, serif',
    'Georgia, serif',
    'Impact, sans-serif',
    'Arial Black, sans-serif',
    'Courier New, monospace',
    'Trebuchet MS, sans-serif',
  ];

  const handleRemoveBackground = async () => {
    if (!selectedElement || selectedElement.type !== 'image' || !selectedElement.imageSrc) return;
    setIsRemovingBg(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedElement.imageSrc;
      await new Promise((res) => {
        img.onload = res;
      });
      const newSrc = await removeImageBackground(img, 36);
      onUpdateElement(selectedElement.id, { imageSrc: newSrc });
    } catch (e) {
      console.error('BG removal failed:', e);
    } finally {
      setIsRemovingBg(false);
    }
  };

  const renderPanelContent = () => (
    <>
      {/* TAB 1: PROPERTIES INSPECTOR */}
      {activeTab === 'properties' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-200">
          {selectedElement ? (
            <>
              {/* Element Title & Quick Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={selectedElement.name}
                    onChange={(e) =>
                      onUpdateElement(selectedElement.id, { name: e.target.value })
                    }
                    className="bg-transparent hover:bg-slate-800 focus:bg-slate-800 px-1 py-0.5 rounded text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-red-500 w-full truncate"
                  />
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                    {selectedElement.type} layer
                  </span>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        locked: !selectedElement.locked,
                      })
                    }
                    className={`p-1.5 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                      selectedElement.locked ? 'text-amber-400' : 'text-slate-400'
                    }`}
                    title={selectedElement.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        visible: !selectedElement.visible,
                      })
                    }
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={selectedElement.visible ? 'Hide' : 'Show'}
                  >
                    {selectedElement.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateElement(selectedElement.id)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteElement(selectedElement.id)}
                    className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete (Del)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Transform & Geometry */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Transform & Position
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-mono text-slate-500 mr-2">X</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { x: Number(e.target.value) })
                      }
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-mono text-slate-500 mr-2">Y</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { y: Number(e.target.value) })
                      }
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-mono text-slate-500 mr-2">W</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          width: Math.max(10, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
                    <span className="text-[11px] font-mono text-slate-500 mr-2">H</span>
                    <input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          height: Math.max(10, Number(e.target.value)),
                        })
                      }
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Rotation & Flips */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1">
                    <RotateCw className="w-3.5 h-3.5 text-slate-500 mr-2" />
                    <input
                      type="number"
                      min="-360"
                      max="360"
                      value={Math.round(selectedElement.rotation || 0)}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, {
                          rotation: Number(e.target.value),
                        })
                      }
                      className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500 font-mono">°</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        flipH: !selectedElement.flipH,
                      })
                    }
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      selectedElement.flipH
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateElement(selectedElement.id, {
                        flipV: !selectedElement.flipV,
                      })
                    }
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      selectedElement.flipV
                        ? 'bg-red-600 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Flip Vertical"
                  >
                    <FlipVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Opacity & Blend Mode */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Opacity: {Math.round((selectedElement.opacity ?? 1) * 100)}%
                  </label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={selectedElement.opacity ?? 1}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, { opacity: Number(e.target.value) })
                  }
                  className="w-full accent-red-500 cursor-pointer mb-2"
                />

                <label className="text-[11px] text-slate-400 block mb-1">Blend Mode</label>
                <select
                  value={selectedElement.blendMode || 'normal'}
                  onChange={(e) =>
                    onUpdateElement(selectedElement.id, {
                      blendMode: e.target.value as BlendMode,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 capitalize focus:outline-none focus:border-red-500 cursor-pointer"
                >
                  {blendModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </div>

              {/* TYPE SPECIFIC: TEXT CONTROLS */}
              {selectedElement.type === 'text' && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Typography Settings
                  </label>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Content</label>
                    <textarea
                      rows={3}
                      value={selectedElement.text || ''}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { text: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Font Family</label>
                    <select
                      value={selectedElement.fontFamily || fontFamilies[0]}
                      onChange={(e) =>
                        onUpdateElement(selectedElement.id, { fontFamily: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      {fontFamilies.map((f) => (
                        <option key={f} value={f}>
                          {f.split(',')[0]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Size</label>
                      <input
                        type="number"
                        min="8"
                        max="240"
                        value={selectedElement.fontSize || 32}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Color</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={selectedElement.textColor || '#ffffff'}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              textColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded bg-transparent cursor-pointer"
                        />
                        <input
                          type="text"
                          value={selectedElement.textColor || '#ffffff'}
                          onChange={(e) =>
                            onUpdateElement(selectedElement.id, {
                              textColor: e.target.value,
                            })
                          }
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alignment buttons */}
                  <div className="flex items-center gap-1">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() =>
                          onUpdateElement(selectedElement.id, { textAlign: align })
                        }
                        className={`flex-1 py-1 rounded text-xs font-bold capitalize transition-colors cursor-pointer ${
                          selectedElement.textAlign === align
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TYPE SPECIFIC: SHAPE CONTROLS */}
              {selectedElement.type === 'shape' && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Shape Fill & Stroke
                  </label>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Fill Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={selectedElement.fillColor || '#3b82f6'}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, { fillColor: e.target.value })
                        }
                        className="w-8 h-8 rounded bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedElement.fillColor || '#3b82f6'}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, { fillColor: e.target.value })
                        }
                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Stroke Width ({selectedElement.strokeWidth || 0}px)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="32"
                        value={selectedElement.strokeWidth || 0}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            strokeWidth: Number(e.target.value),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Stroke Color</label>
                      <input
                        type="color"
                        value={selectedElement.strokeColor || '#ffffff'}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            strokeColor: e.target.value,
                          })
                        }
                        className="w-full h-8 rounded bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  {selectedElement.shapeType === 'rounded-rect' && (
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Corner Radius: {selectedElement.cornerRadius ?? 16}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        value={selectedElement.cornerRadius ?? 16}
                        onChange={(e) =>
                          onUpdateElement(selectedElement.id, {
                            cornerRadius: Number(e.target.value),
                          })
                        }
                        className="w-full accent-red-500 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TYPE SPECIFIC: IMAGE & FILTER CONTROLS */}
              {selectedElement.type === 'image' && (
                <div className="space-y-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Image Enhancements
                    </label>
                  </div>

                  {/* AI & Algorithmic Background Remover */}
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    disabled={isRemovingBg}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isRemovingBg ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Detecting & Removing Background...</span>
                      </>
                    ) : (
                      <>
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Remove Background (1-Click)</span>
                      </>
                    )}
                  </button>

                  {/* Filter Presets */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-2">
                      Color Grade Presets
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {FILTER_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            const cur = selectedElement.filters || { ...DEFAULT_IMAGE_FILTERS };
                            onUpdateElement(selectedElement.id, {
                              filters: {
                                ...cur,
                                ...preset.filters,
                                preset: preset.id,
                              },
                            });
                          }}
                          className={`p-2 rounded-lg border text-left cursor-pointer transition-colors ${
                            selectedElement.filters?.preset === preset.id
                              ? 'bg-red-600/20 border-red-500 text-red-300'
                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          <div className="text-[11px] font-bold truncate">{preset.name}</div>
                          <div className="text-[9px] text-slate-500 truncate">{preset.category}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Manual Adjustment Sliders */}
                  <div className="space-y-2">
                    {[
                      { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
                      { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
                      { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
                      { key: 'temperature', label: 'Warmth', min: -100, max: 100 },
                      { key: 'blur', label: 'Blur', min: 0, max: 20 },
                    ].map(({ key, label, min, max }) => {
                      const curFilters = selectedElement.filters || { ...DEFAULT_IMAGE_FILTERS };
                      const val = (curFilters as any)[key] ?? 0;
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                            <span>{label}</span>
                            <span className="font-mono">{val}</span>
                          </div>
                          <input
                            type="range"
                            min={min}
                            max={max}
                            value={val}
                            onChange={(e) =>
                              onUpdateElement(selectedElement.id, {
                                filters: {
                                  ...curFilters,
                                  [key]: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full accent-red-500 cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Document / Canvas Inspector when nothing is selected */
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Document Canvas
                </span>
                <div className="text-sm font-black text-white">{canvasSettings.name}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {canvasSettings.width} × {canvasSettings.height} {canvasSettings.unit} • {canvasSettings.dpi} DPI
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Canvas Dimensions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Width (px)</label>
                    <input
                      type="number"
                      value={canvasSettings.width}
                      onChange={(e) =>
                        onUpdateCanvasSettings({ width: Math.max(100, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Height (px)</label>
                    <input
                      type="number"
                      value={canvasSettings.height}
                      onChange={(e) =>
                        onUpdateCanvasSettings({ height: Math.max(100, Number(e.target.value)) })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl text-xs text-slate-400">
                💡 <strong className="text-slate-200">Pro Tip:</strong> Click any element on the canvas to inspect its layer properties, typography, geometry, shadows, or filters.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LAYERS LIST */}
      {activeTab === 'layers' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {elements.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No layers yet. Add text, shapes, or images from the left drawer.
            </div>
          ) : (
            // Render from topmost zIndex down
            [...elements]
              .sort((a, b) => b.zIndex - a.zIndex)
              .map((el) => {
                const isSelected = selectedElement?.id === el.id;
                return (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-600/20 border-red-500 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {el.type === 'text' && <Type className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      {el.type === 'shape' && <Square className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {el.type === 'image' && <Layers className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                      {el.type === 'icon' && <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      {el.type === 'qr' && <Square className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      <span className="text-xs font-medium truncate">{el.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onReorderElement(el.id, 'up')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onReorderElement(el.id, 'down')}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateElement(el.id, { visible: !el.visible })}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title={el.visible ? 'Hide' : 'Show'}
                      >
                        {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Panel */}
      {isOpen && (
        <aside className="hidden lg:flex w-80 lg:w-84 bg-slate-900 border-l border-slate-800 flex-col h-full select-none shrink-0 transition-all">
          {/* Tab Header: Properties vs Layers + Collapse button */}
          <div className="h-11 border-b border-slate-800 flex items-center px-3 gap-2 bg-slate-950/40 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('properties')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'properties'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Inspector</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layers')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'layers'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers ({elements.length})</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Collapse Inspector"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">{renderPanelContent()}</div>
        </aside>
      )}

      {/* Mobile Slide-up Sheet */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 border-t border-slate-800 flex flex-col shadow-2xl lg:hidden max-h-[80vh] rounded-t-2xl overflow-hidden pb-[env(safe-area-inset-bottom)] animate-in slide-in-from-bottom duration-200">
            <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-2 bg-slate-950/80 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'properties'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Inspector</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('layers')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'layers'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Layers ({elements.length})</span>
              </button>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">{renderPanelContent()}</div>
          </div>
        </>
      )}
    </>
  );
};
