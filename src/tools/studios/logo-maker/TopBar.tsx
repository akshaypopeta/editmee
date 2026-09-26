import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Save,
  Download,
  Upload,
  Sparkles,
  Layers,
  CheckCircle2,
  Eye,
  Sliders,
  ChevronDown,
  FileCode,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { CanvasDimensions } from './types';

interface TopBarProps {
  projectName: string;
  setProjectName: (name: string) => void;
  canvasSize: CanvasDimensions;
  onOpenPresetModal: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitCanvas: () => void;
  showRulers: boolean;
  setShowRulers: (val: boolean) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  enableSnapping: boolean;
  setEnableSnapping: (val: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea: (val: boolean) => void;
  onOpenBrandKit: () => void;
  onOpenAudit: () => void;
  auditScore: number;
  onOpenVariations: () => void;
  onOpenPreview: () => void;
  onImportClick: () => void;
  onSaveProject: () => void;
  onExportPng: (scaleMultiplier: number) => void;
  onExportSvg: () => void;
  onExportPdf: () => void;
  onExportJson: () => void;
  onOpenExportCenter?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  projectName,
  setProjectName,
  canvasSize,
  onOpenPresetModal,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitCanvas,
  showRulers,
  setShowRulers,
  showGrid,
  setShowGrid,
  enableSnapping,
  setEnableSnapping,
  showSafeArea,
  setShowSafeArea,
  onOpenBrandKit,
  onOpenAudit,
  auditScore,
  onOpenVariations,
  onOpenPreview,
  onImportClick,
  onSaveProject,
  onExportPng,
  onExportSvg,
  onExportPdf,
  onExportJson,
  onOpenExportCenter,
}) => {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 md:px-4 z-30 shrink-0">
      {/* Left: Project Title & Presets */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent hover:bg-slate-800/60 focus:bg-slate-950 px-2 py-1 rounded text-xs md:text-sm font-semibold text-white border border-transparent focus:border-blue-500 max-w-[140px] md:max-w-[200px]"
          />
        </div>

        <button
          type="button"
          onClick={onOpenPresetModal}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700/60 cursor-pointer"
        >
          <span>
            {canvasSize.width} × {canvasSize.height}
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Center: Undo, Redo, Zoom, Toggles */}
      <div className="flex items-center space-x-1 md:space-x-2">
        {/* Undo / Redo */}
        <div className="flex items-center space-x-0.5 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-md text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={onZoomOut}
            className="text-slate-400 hover:text-white p-0.5"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-[11px] text-slate-300 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={onZoomIn}
            className="text-slate-400 hover:text-white p-0.5"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onFitCanvas}
            className="ml-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 pl-1 border-l border-slate-800"
            title="Fit to Screen"
          >
            Fit
          </button>
        </div>

        {/* Workspace Overlays */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setShowRulers(!showRulers)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showRulers ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Rulers"
          >
            Rulers
          </button>
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showGrid ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Checkerboard Grid"
          >
            Grid
          </button>
          <button
            type="button"
            onClick={() => setEnableSnapping(!enableSnapping)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              enableSnapping ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Smart Snapping"
          >
            Snap
          </button>
          <button
            type="button"
            onClick={() => setShowSafeArea(!showSafeArea)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              showSafeArea ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Safe Area Guide"
          >
            Safe Area
          </button>
        </div>
      </div>

      {/* Right: Brand Kit, Audit, Variations, Export */}
      <div className="flex items-center space-x-2">
        {/* Brand Kit Trigger */}
        <button
          type="button"
          onClick={onOpenBrandKit}
          className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Brand Kit</span>
        </button>

        {/* Brand Audit Trigger with Score */}
        <button
          type="button"
          onClick={onOpenAudit}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audit</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
            {auditScore}
          </span>
        </button>

        {/* Variations Trigger */}
        <button
          type="button"
          onClick={onOpenVariations}
          className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Variations</span>
        </button>

        {/* Preview Mockup Trigger */}
        <button
          type="button"
          onClick={onOpenPreview}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Mockups</span>
        </button>

        {/* Import */}
        <button
          type="button"
          onClick={onImportClick}
          className="p-1.5 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
          title="Import SVG / Image"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Import</span>
        </button>

        {/* Save */}
        <button
          type="button"
          onClick={onSaveProject}
          className="p-1.5 md:px-2.5 md:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1 transition-colors cursor-pointer"
          title="Save Project to Storage"
        >
          <Save className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Save</span>
        </button>

        {/* Export Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => {
                  if (onOpenExportCenter) onOpenExportCenter();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-500/30 text-xs font-bold text-amber-300 hover:bg-amber-500/30 flex items-center justify-between transition-colors mb-1 cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export Studio Pro...</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                  All Formats
                </span>
              </button>

              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Raster Image (PNG)
              </div>
              <button
                type="button"
                onClick={() => {
                  onExportPng(1);
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span>Standard PNG (1x)</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {canvasSize.width} × {canvasSize.height}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportPng(2);
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span>Retina HD (2x)</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {canvasSize.width * 2} × {canvasSize.height * 2}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportPng(3);
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span>Print 300 DPI (3x)</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {canvasSize.width * 3} × {canvasSize.height * 3}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportPng(4);
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between transition-colors"
              >
                <span>Ultra Master (4x)</span>
                <span className="text-[10px] font-mono text-slate-400">
                  {canvasSize.width * 4} × {canvasSize.height * 4}
                </span>
              </button>

              <div className="border-t border-slate-800 my-1" />
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Vector & Project
              </div>
              <button
                type="button"
                onClick={() => {
                  onExportSvg();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Vector SVG File</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportPdf();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-red-400" />
                <span>Vector PDF Print</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportJson();
                  setExportMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:bg-slate-800 flex items-center space-x-2 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-blue-400" />
                <span>Project Backup JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
