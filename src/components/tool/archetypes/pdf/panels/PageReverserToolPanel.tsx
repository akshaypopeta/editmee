import React from 'react';
import { RotateCw, Sliders, ArrowDownUp } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

interface PageReverserToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  reverseScope: 'all' | 'odd' | 'even';
  setReverseScope: (scope: 'all' | 'odd' | 'even') => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const PageReverserToolPanel: React.FC<PageReverserToolPanelProps> = ({
  docInfo,
  reverseScope,
  setReverseScope,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const total = docInfo?.numPages || 1;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-red-500" />
            PDF Page Reverser & Inversion Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Invert the page sequence of your document for reverse feeder scans or back-to-front printing.
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
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Reversal Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'all', label: 'Invert Entire Document', desc: `Pages ${total} down to 1` },
              { id: 'odd', label: 'Reverse Odd Pages Only', desc: 'Preserve even page slots' },
              { id: 'even', label: 'Reverse Even Pages Only', desc: 'Preserve odd page slots' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setReverseScope(item.id as any)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  reverseScope === item.id
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Sequence Demonstration */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Output Sequence Mapping:
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-2 text-xs font-mono">
            <span className="text-slate-500">Original: [1, 2, 3 ... {total}]</span>
            <span className="text-red-500">→</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Reversed: [{Array.from({ length: Math.min(6, total) }, (_, i) => total - i).join(', ')}
              {total > 6 ? ', ... 1' : ''}]
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
