import React from 'react';
import { FilePlus, Sliders } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

interface BlankPageToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  blankPagePosition: 'before' | 'after' | 'start' | 'end';
  setBlankPagePosition: (pos: 'before' | 'after' | 'start' | 'end') => void;
  blankTargetPage: number;
  setBlankTargetPage: (page: number) => void;
  blankPageCount: number;
  setBlankPageCount: (count: number) => void;
  blankPageSize: 'A4' | 'Letter' | 'match';
  setBlankPageSize: (size: 'A4' | 'Letter' | 'match') => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const BlankPageToolPanel: React.FC<BlankPageToolPanelProps> = ({
  docInfo,
  blankPagePosition,
  setBlankPagePosition,
  blankTargetPage,
  setBlankTargetPage,
  blankPageCount,
  setBlankPageCount,
  blankPageSize,
  setBlankPageSize,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const maxPages = docInfo?.numPages || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FilePlus className="w-4 h-4 text-red-500" />
            Blank Page Inserter
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inject standardized blank pages before, after, or at custom page sequence points.
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
          {isAdvancedMode ? 'Advanced Mode' : 'Quick Mode'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Target Position */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Insertion Location
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'end', label: 'Document End', desc: 'After last page' },
              { id: 'start', label: 'Document Start', desc: 'Before page 1' },
              { id: 'after', label: 'After Page N', desc: 'Following target' },
              { id: 'before', label: 'Before Page N', desc: 'Preceding target' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setBlankPagePosition(p.id as any)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  blankPagePosition === p.id
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{p.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic target page selector */}
        {(blankPagePosition === 'before' || blankPagePosition === 'after') && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Page Number (1 to {maxPages})
            </label>
            <input
              type="number"
              min="1"
              max={maxPages}
              value={blankTargetPage}
              onChange={(e) => setBlankTargetPage(Math.min(maxPages, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Number of Blank Pages to Insert
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={blankPageCount}
              onChange={(e) => setBlankPageCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Page Dimensions
            </label>
            <select
              value={blankPageSize}
              onChange={(e) => setBlankPageSize(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="match">Match Document Page Size</option>
              <option value="A4">ISO A4 (595 × 842 pt)</option>
              <option value="Letter">US Letter (612 × 792 pt)</option>
            </select>
          </div>
        </div>

        <div className="p-3 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/30 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>Output Calculation:</span>
          <span className="font-mono font-bold">
            {maxPages} original pages + {blankPageCount} blank page{blankPageCount > 1 ? 's' : ''} = {maxPages + blankPageCount} total pages
          </span>
        </div>
      </div>
    </div>
  );
};
