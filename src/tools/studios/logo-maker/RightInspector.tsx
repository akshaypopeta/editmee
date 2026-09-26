import React from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize2,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sliders,
  Type,
  Square,
  Sparkles,
  Layers,
  Palette,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { LogoElement, CanvasDimensions } from './types';
import { POPULAR_FONTS } from './palettes';
import { EXPANDED_FONT_LIBRARY } from './fontLibrary';
import { ThreeDInspectorSection } from './ThreeDInspectorSection';

interface RightInspectorProps {
  selectedElement: LogoElement | null;
  onUpdateSelected: (updates: Partial<LogoElement>) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onAlignSelected: (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => void;
  onReorderLayer: (direction: 'up' | 'down' | 'top' | 'bottom') => void;
  canvasSize: CanvasDimensions;
  onOpenPresetModal: () => void;
  bgType: 'transparent' | 'solid' | 'gradient';
  setBgType: (t: 'transparent' | 'solid' | 'gradient') => void;
  bgColor: string;
  setBgColor: (c: string) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  showRulers: boolean;
  setShowRulers: (val: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (val: boolean) => void;
  enableSnapping: boolean;
  setEnableSnapping: (val: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  selectedElement,
  onUpdateSelected,
  onDeleteSelected,
  onDuplicateSelected,
  onAlignSelected,
  onReorderLayer,
  canvasSize,
  onOpenPresetModal,
  bgType,
  setBgType,
  bgColor,
  setBgColor,
  showGrid,
  setShowGrid,
  showRulers,
  setShowRulers,
  showSafeArea,
  setShowSafeArea,
  enableSnapping,
  setEnableSnapping,
  isCollapsed,
  setIsCollapsed,
}) => {
  if (isCollapsed) {
    return (
      <div className="h-full bg-slate-900 border-l border-slate-800 flex flex-col items-center py-4 px-1.5 shrink-0 z-20">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Open Inspector"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-72 h-full bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 z-20 overflow-hidden">
      {/* Inspector Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {selectedElement ? selectedElement.name : 'Canvas Inspector'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
          title="Collapse Inspector"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {selectedElement ? (
          /* Selected Element Inspector */
          <div className="space-y-4">
            {/* Quick Actions Row */}
            <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-[11px] font-mono text-blue-400 uppercase font-semibold">
                {selectedElement.type}
              </span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={onDuplicateSelected}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onDeleteSelected}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Position & Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Transform & Geometry
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSelected({ aspectRatioLocked: !selectedElement.aspectRatioLocked })
                  }
                  className={`p-1 rounded text-xs flex items-center space-x-1 border transition-colors ${
                    selectedElement.aspectRatioLocked
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title={
                    selectedElement.aspectRatioLocked
                      ? 'Aspect Ratio Locked'
                      : 'Aspect Ratio Unlocked'
                  }
                >
                  {selectedElement.aspectRatioLocked ? (
                    <Lock className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                  <span className="text-[10px]">Ratio</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">X Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => onUpdateSelected({ x: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Y Position</label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => onUpdateSelected({ y: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Width</label>
                  <input
                    type="number"
                    min={10}
                    value={Math.round(selectedElement.width)}
                    onChange={(e) => {
                      const newW = Math.max(10, parseInt(e.target.value) || 10);
                      const updates: Partial<LogoElement> = { width: newW };
                      if (selectedElement.aspectRatioLocked && selectedElement.width > 0) {
                        updates.height = Math.round(
                          (newW / selectedElement.width) * selectedElement.height
                        );
                      }
                      onUpdateSelected(updates);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Height</label>
                  <input
                    type="number"
                    min={10}
                    value={Math.round(selectedElement.height)}
                    onChange={(e) => {
                      const newH = Math.max(10, parseInt(e.target.value) || 10);
                      const updates: Partial<LogoElement> = { height: newH };
                      if (selectedElement.aspectRatioLocked && selectedElement.height > 0) {
                        updates.width = Math.round(
                          (newH / selectedElement.height) * selectedElement.width
                        );
                      }
                      onUpdateSelected(updates);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Alignment Tools */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Alignment
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAlignSelected('left')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white text-center"
                >
                  Left
                </button>
                <button
                  type="button"
                  onClick={() => onAlignSelected('center-h')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white text-center font-semibold text-blue-400"
                >
                  Center
                </button>
                <button
                  type="button"
                  onClick={() => onAlignSelected('right')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white text-center"
                >
                  Right
                </button>
                <button
                  type="button"
                  onClick={() => onAlignSelected('top')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white text-center"
                >
                  Top
                </button>
                <button
                  type="button"
                  onClick={() => onAlignSelected('center-v')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white text-center font-semibold text-blue-400"
                >
                  Middle
                </button>
                <button
                  type="button"
                  onClick={() => onAlignSelected('bottom')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white text-center"
                >
                  Bottom
                </button>
              </div>
            </div>

            {/* Layer Arrange */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Layer Arrange
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onReorderLayer('top')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                  title="Bring to Front"
                >
                  <ChevronsUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>To Front</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReorderLayer('up')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                  title="Bring Forward"
                >
                  <ChevronUp className="w-3.5 h-3.5 text-blue-400" />
                  <span>Forward</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReorderLayer('down')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                  title="Send Backward"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Backward</span>
                </button>
                <button
                  type="button"
                  onClick={() => onReorderLayer('bottom')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                  title="Send to Back"
                >
                  <ChevronsDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>To Back</span>
                </button>
              </div>
            </div>

            {/* Typography Controls */}
            {selectedElement.type === 'text' && (
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Typography
                </span>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Text Content</label>
                  <input
                    type="text"
                    value={selectedElement.text || ''}
                    onChange={(e) => onUpdateSelected({ text: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Font Family</label>
                  <select
                    value={selectedElement.fontFamily}
                    onChange={(e) => onUpdateSelected({ fontFamily: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {[
                      'Luxury & Elegant',
                      'Geometric & Minimal',
                      'Bold & Heavy',
                      'Futuristic & Tech',
                      'Sans Serif',
                      'Serif',
                      'Display',
                      'Gaming & Sports',
                      'Script & Handwritten',
                      'Vintage & Retro',
                      'Monospace',
                    ].map((cat) => {
                      const fontsInCat = EXPANDED_FONT_LIBRARY.filter((f) => f.category === cat);
                      if (fontsInCat.length === 0) return null;
                      return (
                        <optgroup key={cat} label={cat} className="bg-slate-900 text-slate-300 font-bold">
                          {fontsInCat.map((f) => (
                            <option key={f.name} value={f.family} className="bg-slate-950 text-white font-normal">
                              {f.name}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Size ({selectedElement.fontSize}px)</label>
                    <input
                      type="range"
                      min={10}
                      max={140}
                      value={selectedElement.fontSize || 36}
                      onChange={(e) => onUpdateSelected({ fontSize: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Letter Spacing</label>
                    <input
                      type="range"
                      min={-2}
                      max={24}
                      value={selectedElement.letterSpacing || 0}
                      onChange={(e) => onUpdateSelected({ letterSpacing: parseInt(e.target.value) })}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Curved Text Section */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium">Curved / Arc Text</span>
                    <input
                      type="checkbox"
                      checked={!!selectedElement.isCurved}
                      onChange={(e) => onUpdateSelected({ isCurved: e.target.checked })}
                      className="w-4 h-4 accent-blue-500 cursor-pointer"
                    />
                  </div>

                  {selectedElement.isCurved && (
                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Radius</span>
                          <span>{selectedElement.curveRadius || 150}px</span>
                        </div>
                        <input
                          type="range"
                          min={60}
                          max={350}
                          value={selectedElement.curveRadius || 150}
                          onChange={(e) => onUpdateSelected({ curveRadius: parseInt(e.target.value) })}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Arc Angle</span>
                          <span>{selectedElement.curveArc || 180}°</span>
                        </div>
                        <input
                          type="range"
                          min={45}
                          max={360}
                          value={selectedElement.curveArc || 180}
                          onChange={(e) => onUpdateSelected({ curveArc: parseInt(e.target.value) })}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Colors & Appearance */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Fill & Stroke
              </span>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Fill Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={selectedElement.fillColor || '#000000'}
                    onChange={(e) => onUpdateSelected({ fillColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedElement.fillColor || '#000000'}
                    onChange={(e) => onUpdateSelected({ fillColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Opacity</span>
                  <span>{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={selectedElement.opacity ?? 1}
                  onChange={(e) => onUpdateSelected({ opacity: parseFloat(e.target.value) })}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* 3D Studio Section */}
              <ThreeDInspectorSection
                element={selectedElement}
                onChange={onUpdateSelected}
              />
            </div>

            {/* Layer Z-Order Actions */}
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Layer Arrangement
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onReorderLayer('top')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white"
                >
                  Bring to Front
                </button>
                <button
                  type="button"
                  onClick={() => onReorderLayer('bottom')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded text-xs text-slate-300 hover:text-white"
                >
                  Send to Back
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Canvas Global Settings when nothing is selected */
          <div className="space-y-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Active Canvas Size
              </span>
              <button
                type="button"
                onClick={onOpenPresetModal}
                className="w-full p-3 bg-slate-950 border border-slate-800 hover:border-blue-500 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-semibold text-white group-hover:text-blue-400">
                    {canvasSize.width} × {canvasSize.height} px
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Click to switch preset or customize</span>
                </div>
                <Maximize2 className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
              </button>
            </div>

            {/* Background Selector */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Background
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['transparent', 'solid', 'gradient'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBgType(t)}
                    className={`py-1.5 rounded text-xs font-medium border transition-colors capitalize ${
                      bgType === t
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {bgType === 'solid' && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Guides & Snapping Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Workspace Guides
              </span>
              {[
                { label: 'Pixel Rulers', checked: showRulers, onChange: setShowRulers },
                { label: 'Grid / Checkerboard', checked: showGrid, onChange: setShowGrid },
                { label: 'Safe Area Boundary', checked: showSafeArea, onChange: setShowSafeArea },
                { label: 'Smart Snapping', checked: enableSnapping, onChange: setEnableSnapping },
              ].map((item) => (
                <label
                  key={item.label}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer"
                >
                  <span className="text-xs text-slate-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => item.onChange(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
