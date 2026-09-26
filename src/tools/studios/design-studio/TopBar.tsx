import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Grid,
  ShieldAlert,
  Sparkles,
  Upload,
  Download,
  Check,
  Eye,
  Sliders,
  Laptop,
  Magnet,
  CheckCircle2,
  RefreshCw,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import { CanvasSettings, DocumentPreset } from './types';
import { DOCUMENT_PRESETS } from './documentPresets';

interface TopBarProps {
  settings: CanvasSettings;
  onUpdateSettings: (updates: Partial<CanvasSettings>) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFitScreen: () => void;
  onResetZoom: () => void;
  onOpenAudit: () => void;
  onOpenMockup: () => void;
  onOpenAi: () => void;
  onOpenExport: () => void;
  onTriggerImport: () => void;
  auditScore: number;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isLeftPanelOpen?: boolean;
  onToggleLeftPanel?: () => void;
  isRightPanelOpen?: boolean;
  onToggleRightPanel?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  settings,
  onUpdateSettings,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFitScreen,
  onResetZoom,
  onOpenAudit,
  onOpenMockup,
  onOpenAi,
  onOpenExport,
  onTriggerImport,
  auditScore,
  saveStatus,
  isFullscreen = false,
  onToggleFullscreen,
  isLeftPanelOpen = true,
  onToggleLeftPanel,
  isRightPanelOpen = true,
  onToggleRightPanel,
}) => {
  const handlePresetSelect = (presetId: string) => {
    const preset = DOCUMENT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onUpdateSettings({
      width: preset.width,
      height: preset.height,
      unit: preset.unit,
      dpi: preset.dpi,
    });
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 text-white shrink-0 select-none z-20">
      {/* Left: Project title & Presets */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => onUpdateSettings({ name: e.target.value })}
            className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-800 rounded px-2 py-0.5 text-xs sm:text-sm font-black text-white focus:outline-none focus:ring-1 focus:ring-red-500 w-32 sm:w-48 truncate"
            title="Rename Project"
          />
        </div>

        {/* Preset switcher dropdown */}
        <div className="hidden lg:flex items-center">
          <select
            onChange={(e) => handlePresetSelect(e.target.value)}
            className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500"
            defaultValue=""
          >
            <option value="" disabled>
              📐 Preset ({settings.width}×{settings.height})
            </option>
            <optgroup label="Social Media">
              {DOCUMENT_PRESETS.filter((p) => p.category === 'Social').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.width}×{p.height})
                </option>
              ))}
            </optgroup>
            <optgroup label="Print Formats">
              {DOCUMENT_PRESETS.filter((p) => p.category === 'Print').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Digital & Web">
              {DOCUMENT_PRESETS.filter((p) => p.category === 'Digital').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Autosave status indicator */}
        <div className="hidden xl:flex items-center gap-1 text-[11px] text-slate-400">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-amber-400 font-medium animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="text-slate-400">Unsaved changes</span>
          )}
        </div>
      </div>

      {/* Center: History & Zoom */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo / Redo */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Undo (Ctrl/Cmd + Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Redo (Ctrl/Cmd + Shift + Z)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden md:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoom: Math.max(0.1, settings.zoom - 0.1) })}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5 text-slate-300" />
          </button>
          <button
            type="button"
            onClick={onResetZoom}
            className="px-2 py-0.5 text-xs font-mono font-bold text-slate-300 hover:text-white"
            title="Reset to 100%"
          >
            {Math.round(settings.zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ zoom: Math.min(4.0, settings.zoom + 0.1) })}
            className="p-1.5 rounded hover:bg-slate-700 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5 text-slate-300" />
          </button>
          <button
            type="button"
            onClick={onFitScreen}
            className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Fit to Screen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View toggles: Grid & Snapping */}
        <div className="hidden sm:flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => onUpdateSettings({ showGrid: !settings.showGrid })}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              settings.showGrid ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Grid (G)"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onUpdateSettings({ enableSnapping: !settings.enableSnapping })}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              settings.enableSnapping ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Smart Snapping"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Modals & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Toggle Left Drawer Button (Desktop) */}
        {onToggleLeftPanel && (
          <button
            type="button"
            onClick={onToggleLeftPanel}
            className={`hidden lg:flex items-center p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isLeftPanelOpen
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isLeftPanelOpen ? 'Collapse Tool Drawer' : 'Expand Tool Drawer'}
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Toggle Right Inspector Button (Desktop) */}
        {onToggleRightPanel && (
          <button
            type="button"
            onClick={onToggleRightPanel}
            className={`hidden lg:flex items-center p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isRightPanelOpen
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={isRightPanelOpen ? 'Collapse Inspector' : 'Expand Inspector'}
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Design Audit button */}
        <button
          type="button"
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          title="Design Quality & Contrast Audit"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Audit</span>
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-black ${
              auditScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {auditScore}
          </span>
        </button>

        {/* Mockups button */}
        <button
          type="button"
          onClick={onOpenMockup}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          title="Preview on Devices & Mockups"
        >
          <Laptop className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mockups</span>
        </button>

        {/* AI Creative Studio */}
        <button
          type="button"
          onClick={onOpenAi}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 rounded-lg text-xs font-bold text-purple-300 transition-colors cursor-pointer"
          title="AI Image Generation & Design Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">AI Studio</span>
        </button>

        {/* Import image file */}
        <button
          type="button"
          onClick={onTriggerImport}
          className="p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 transition-colors cursor-pointer"
          title="Upload Images or Graphics"
        >
          <Upload className="w-3.5 h-3.5 inline sm:mr-1" />
          <span className="hidden sm:inline">Import</span>
        </button>

        {/* Fullscreen Workspace Toggle */}
        {onToggleFullscreen && (
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isFullscreen
                ? 'bg-red-600 border-red-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workspace'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Export Center CTA */}
        <button
          type="button"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-black text-white shadow-md shadow-red-600/20 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
