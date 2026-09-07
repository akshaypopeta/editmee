import React, { useState } from 'react';
import {
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Eye,
  FileCheck,
  HelpCircle,
  Filter
} from 'lucide-react';
import {
  DetectedBlankPageInfo,
  PdfBlankDetectionReport
} from '../../../../../core/pdf-engine/PdfEngine';

interface BlankPageStripperToolPanelProps {
  detectionReport: PdfBlankDetectionReport | null;
  isScanning: boolean;
  scanProgress: { current: number; total: number };
  selectedPagesToRemove: number[]; // 0-based page indices
  setSelectedPagesToRemove: (pages: number[]) => void;
  onRescan: (threshold: number, noiseTol: number) => void;
  onExecuteRemoval: () => void;
  isProcessing: boolean;
  totalOriginalPages: number;
}

export const BlankPageStripperToolPanel: React.FC<BlankPageStripperToolPanelProps> = ({
  detectionReport,
  isScanning,
  scanProgress,
  selectedPagesToRemove,
  setSelectedPagesToRemove,
  onRescan,
  onExecuteRemoval,
  isProcessing,
  totalOriginalPages,
}) => {
  const [sensitivity, setSensitivity] = useState<'strict' | 'standard' | 'relaxed'>('standard');
  const [noiseTolerance, setNoiseTolerance] = useState<number>(20);
  const [filterMode, setFilterMode] = useState<'all' | 'blanks_only' | 'review_only'>('all');
  const [customRange, setCustomRange] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const pages = detectionReport?.pages || [];
  const detectedBlanks = pages.filter((p) => p.isBlank);
  const reviewPages = pages.filter((p) => p.status === 'review_required');

  // Handle sensitivity change
  const handleSensitivityChange = (newSens: 'strict' | 'standard' | 'relaxed') => {
    setSensitivity(newSens);
    const thresh = newSens === 'strict' ? 0.0005 : newSens === 'standard' ? 0.002 : 0.006;
    onRescan(thresh, noiseTolerance);
  };

  const handleNoiseChange = (val: number) => {
    setNoiseTolerance(val);
    const thresh = sensitivity === 'strict' ? 0.0005 : sensitivity === 'standard' ? 0.002 : 0.006;
    onRescan(thresh, val);
  };

  // Toggle single page
  const togglePage = (pageIdx: number) => {
    if (selectedPagesToRemove.includes(pageIdx)) {
      setSelectedPagesToRemove(selectedPagesToRemove.filter((idx) => idx !== pageIdx));
    } else {
      setSelectedPagesToRemove([...selectedPagesToRemove, pageIdx]);
    }
  };

  // Quick selection helpers
  const selectAllDetected = () => {
    const blankIndices = detectedBlanks.map((p) => p.pageIndex);
    setSelectedPagesToRemove(Array.from(new Set(blankIndices)));
  };

  const selectDetectedAndReview = () => {
    const indices = pages.filter((p) => p.isBlank || p.status === 'review_required').map((p) => p.pageIndex);
    setSelectedPagesToRemove(Array.from(new Set(indices)));
  };

  const clearSelection = () => {
    setSelectedPagesToRemove([]);
  };

  const applyCustomRange = () => {
    if (!customRange.trim()) return;
    const parts = customRange.split(',');
    const newSelected = new Set(selectedPagesToRemove);

    for (const part of parts) {
      const range = part.trim().split('-').map(Number);
      if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
        const start = Math.max(1, range[0]);
        const end = Math.min(totalOriginalPages, range[1]);
        for (let p = start; p <= end; p++) {
          newSelected.add(p - 1);
        }
      } else if (range.length === 1 && !isNaN(range[0])) {
        const p = range[0];
        if (p >= 1 && p <= totalOriginalPages) {
          newSelected.add(p - 1);
        }
      }
    }

    setSelectedPagesToRemove(Array.from(newSelected));
    setCustomRange('');
  };

  const filteredPages = pages.filter((p) => {
    if (filterMode === 'blanks_only') return p.isBlank;
    if (filterMode === 'review_only') return p.status === 'review_required';
    return true;
  });

  const remainingPagesCount = Math.max(1, totalOriginalPages - selectedPagesToRemove.length);
  const pagesToRemoveSorted = [...selectedPagesToRemove].sort((a, b) => a - b).map((idx) => idx + 1);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            PDF Blank Page Detector & Stripper
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Safely analyzes text, raster scans, and graphics to detect and remove accidental white pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              showAdvanced
                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Detection Sensitivity</span>
          </button>
        </div>
      </div>

      {/* Scanning Progress */}
      {isScanning && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-spin" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
              Scanning page {scanProgress.current} of {scanProgress.total}...
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Inspecting text streams, embedded scans, vector drawings, and background noise.
            </p>
          </div>
        </div>
      )}

      {/* Advanced Settings (Sensitivity & Noise) */}
      {showAdvanced && (
        <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-red-500" />
              Blankness Threshold
            </span>
            <div className="flex gap-1.5">
              {(['strict', 'standard', 'relaxed'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => handleSensitivityChange(mode)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer ${
                    sensitivity === mode
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-400">Scan Noise Tolerance (Dust/Faint Marks)</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{noiseTolerance}</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={noiseTolerance}
              onChange={(e) => handleNoiseChange(Number(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Higher values ignore light scanner background grain or roller marks without deleting pages with genuine drawings.
            </p>
          </div>
        </div>
      )}

      {/* Safety Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-center">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block uppercase">Original Pages</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">{totalOriginalPages}</span>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 text-center">
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 block uppercase">Detected Blank</span>
          <span className="text-lg font-black text-amber-700 dark:text-amber-300 font-mono">{detectedBlanks.length}</span>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-center">
          <span className="text-[11px] font-medium text-red-600 dark:text-red-400 block uppercase">Pages to Remove</span>
          <span className="text-lg font-black text-red-600 dark:text-red-400 font-mono">{selectedPagesToRemove.length}</span>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 text-center">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 block uppercase">Pages Retained</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{remainingPagesCount}</span>
        </div>
      </div>

      {/* Audit List of pages to remove */}
      {selectedPagesToRemove.length > 0 && (
        <div className="bg-red-50/70 dark:bg-red-950/20 border border-red-200/80 dark:border-red-900/40 rounded-xl p-3 text-xs flex flex-wrap items-center gap-2">
          <span className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
            Selected for deletion:
          </span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {pagesToRemoveSorted.length <= 15
              ? `Pages: ${pagesToRemoveSorted.join(', ')}`
              : `Pages: ${pagesToRemoveSorted.slice(0, 15).join(', ')} + ${pagesToRemoveSorted.length - 15} more`}
          </span>
        </div>
      )}

      {/* Review Warning if ambiguous pages exist */}
      {reviewPages.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200">
              {reviewPages.length} Page{reviewPages.length === 1 ? '' : 's'} Require Review:
            </span>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              Pages {reviewPages.map((p) => p.pageNumber).join(', ')} have minor pixel density (faint note or scan mark) and were NOT auto-selected. Check their thumbnails below before selecting.
            </p>
          </div>
        </div>
      )}

      {/* Control Actions & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        {/* Selection buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={selectAllDetected}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/60 dark:hover:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 transition-colors cursor-pointer"
          >
            Select All Detected Blanks ({detectedBlanks.length})
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Clear Selection
          </button>
        </div>

        {/* Filter view */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All ({pages.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('blanks_only')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              filterMode === 'blanks_only'
                ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Blanks ({detectedBlanks.length})
          </button>
          {reviewPages.length > 0 && (
            <button
              type="button"
              onClick={() => setFilterMode('review_only')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filterMode === 'review_only'
                  ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Review ({reviewPages.length})
            </button>
          )}
        </div>
      </div>

      {/* Custom Range Input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          value={customRange}
          onChange={(e) => setCustomRange(e.target.value)}
          placeholder="Select range (e.g. 2, 4-6, 8)..."
          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500 flex-1 max-w-xs"
        />
        <button
          type="button"
          onClick={applyCustomRange}
          disabled={!customRange.trim()}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Add to Selection
        </button>
      </div>

      {/* Page Thumbnails Review Grid */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Page Review Grid ({filteredPages.length} {filterMode === 'all' ? 'pages' : 'filtered'}):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[440px] overflow-y-auto p-2 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
          {filteredPages.map((p) => {
            const isSelected = selectedPagesToRemove.includes(p.pageIndex);

            return (
              <div
                key={p.pageIndex}
                onClick={() => togglePage(p.pageIndex)}
                className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all cursor-pointer group select-none ${
                  isSelected
                    ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30 ring-2 ring-red-500/20'
                    : p.isBlank
                    ? 'border-amber-400/80 bg-white dark:bg-slate-900 hover:border-amber-500'
                    : p.status === 'review_required'
                    ? 'border-amber-400 bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                {/* Thumbnail Header Bar */}
                <div className="flex items-center justify-between px-2 py-1.5 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60">
                  <span className="text-[11px] font-bold font-mono text-slate-700 dark:text-slate-300">
                    Page {p.pageNumber}
                  </span>
                  <div className="flex items-center">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-red-500" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Thumbnail Preview Image */}
                <div className="relative aspect-[3/4] bg-white flex items-center justify-center p-1.5 overflow-hidden">
                  {p.thumbnailDataUrl ? (
                    <img
                      src={p.thumbnailDataUrl}
                      alt={`Page ${p.pageNumber}`}
                      className="max-h-full max-w-full object-contain shadow-2xs"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <span className="text-[10px] text-slate-400">No preview</span>
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-center">
                    {p.isBlank ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-red-600 text-white shadow-xs">
                        BLANK
                      </span>
                    ) : p.status === 'review_required' ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-500 text-white shadow-xs flex items-center gap-0.5">
                        <HelpCircle className="w-2.5 h-2.5" />
                        REVIEW
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 text-[9px] font-medium rounded-md bg-slate-800/80 text-slate-200 backdrop-blur-xs">
                        CONTENT
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Footer */}
                <div className="px-2 py-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {p.reason}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          {selectedPagesToRemove.length === 0 ? (
            <span>No pages selected for removal. Click page cards to select.</span>
          ) : (
            <span className="text-red-600 dark:text-red-400 font-medium">
              Will remove {selectedPagesToRemove.length} page{selectedPagesToRemove.length === 1 ? '' : 's'}. Document will be cleaned from {totalOriginalPages} to {remainingPagesCount} pages.
            </span>
          )}
        </div>

        <button
          type="button"
          id="btn-execute-strip-blank-pages"
          onClick={onExecuteRemoval}
          disabled={selectedPagesToRemove.length === 0 || isProcessing}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>
            {isProcessing
              ? 'Stripping Selected Pages...'
              : `Strip Selected Pages (${selectedPagesToRemove.length})`}
          </span>
        </button>
      </div>
    </div>
  );
};
