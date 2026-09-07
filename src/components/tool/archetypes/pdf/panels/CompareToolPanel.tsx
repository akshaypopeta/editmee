import React, { useRef } from 'react';
import { GitCompare, Upload, FileText, X, Sliders, CheckCircle2 } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../../../../core/file-engine/FileEngine';

interface CompareToolPanelProps {
  fileA: File | null;
  docInfoA: PdfDocumentInfo | null;
  compareFileB: File | null;
  setCompareFileB: (file: File | null) => void;
  compareDocInfoB: PdfDocumentInfo | null;
  setCompareDocInfoB: (info: PdfDocumentInfo | null) => void;
  setCompareBufferB: (buf: ArrayBuffer | null) => void;
  compareMode: 'side-by-side' | 'overlay';
  setCompareMode: (mode: 'side-by-side' | 'overlay') => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
  formatBytes: (bytes: number) => string;
}

export const CompareToolPanel: React.FC<CompareToolPanelProps> = ({
  fileA,
  docInfoA,
  compareFileB,
  setCompareFileB,
  compareDocInfoB,
  setCompareDocInfoB,
  setCompareBufferB,
  compareMode,
  setCompareMode,
  isAdvancedMode,
  setIsAdvancedMode,
  formatBytes,
}) => {
  const fileInputBRef = useRef<HTMLInputElement | null>(null);

  const handleFileBChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompareFileB(file);
    const buf = await FileEngine.readAsArrayBuffer(file);
    setCompareBufferB(buf);

    try {
      const { PdfEngine } = await import('../../../../../core/pdf-engine/PdfEngine');
      const info = await PdfEngine.getDocumentInfo(buf);
      setCompareDocInfoB(info);
    } catch {
      setCompareDocInfoB(null);
    }
  };

  const removeFileB = () => {
    setCompareFileB(null);
    setCompareDocInfoB(null);
    setCompareBufferB(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-red-500" />
            PDF Compare & Visual Diff Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare Document A (Base) against Document B (Modified Revision) with precision side-by-side delta sheets.
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
          {isAdvancedMode ? 'Advanced Pro Mode' : 'Quick Mode'}
        </button>
      </div>

      {/* Dual Document Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Document A (Base) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Document A (Original / Base)
            </span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {fileA?.name || 'Base Document.pdf'}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2">
            <span>{docInfoA?.numPages || 1} Pages</span>
            <span>•</span>
            <span>{fileA ? formatBytes(fileA.size) : '0 B'}</span>
          </div>
        </div>

        {/* Document B (Modified) */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              Document B (Modified Revision)
            </span>
            {compareFileB && (
              <button
                type="button"
                onClick={removeFileB}
                className="text-slate-400 hover:text-red-500 cursor-pointer"
                title="Remove Document B"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <input
            ref={fileInputBRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileBChange}
            className="hidden"
          />

          {compareFileB ? (
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {compareFileB.name}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                <span>{compareDocInfoB?.numPages || 1} Pages</span>
                <span>•</span>
                <span>{formatBytes(compareFileB.size)}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputBRef.current?.click()}
              className="w-full py-3 border border-dashed border-red-300 dark:border-red-800 hover:border-red-500 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 cursor-pointer bg-red-50/30 dark:bg-red-950/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Revision PDF (Doc B)</span>
            </button>
          )}
        </div>
      </div>

      {/* Comparison Options */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Comparison Report Format
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              id: 'side-by-side',
              title: 'Side-by-Side Dual Sheets',
              desc: 'Dual-page layout showing Document A and Document B synchronized',
            },
            {
              id: 'overlay',
              title: 'Visual Diff Audit Report',
              desc: 'High-contrast delta summary page with document metrics',
            },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setCompareMode(mode.id as any)}
              className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                compareMode === mode.id
                  ? 'border-red-500 bg-red-50/40 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-medium'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="text-xs font-bold">{mode.title}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
