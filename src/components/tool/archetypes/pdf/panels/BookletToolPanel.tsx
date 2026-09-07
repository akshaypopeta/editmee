import React from 'react';
import { BookOpen, Sliders } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

interface BookletToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  bookletPaperSize: 'A4' | 'Letter';
  setBookletPaperSize: (size: 'A4' | 'Letter') => void;
  bookletGutter: number;
  setBookletGutter: (val: number) => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const BookletToolPanel: React.FC<BookletToolPanelProps> = ({
  docInfo,
  bookletPaperSize,
  setBookletPaperSize,
  bookletGutter,
  setBookletGutter,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const pageCount = docInfo?.numPages || 1;
  const signatureSheets = Math.ceil(pageCount / 4);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-500" />
            PDF Booklet & Saddle-Stitch Imposition
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arrange pages into 2-up sheet signatures for duplex printing, center folding, and stapled booklet binding.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Paper Sheet Size
            </label>
            <select
              value={bookletPaperSize}
              onChange={(e) => setBookletPaperSize(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="A4">ISO A4 Landscape (297 × 210 mm)</option>
              <option value="Letter">US Letter Landscape (11 × 8.5 in)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Center Fold Margin / Gutter (pt)
            </label>
            <input
              type="number"
              min="0"
              max="72"
              value={bookletGutter}
              onChange={(e) => setBookletGutter(Math.max(0, parseInt(e.target.value, 10) || 0))}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Imposition Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Booklet Calculation Breakdown:
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div>• Input Pages: <span className="font-semibold text-slate-800 dark:text-slate-200">{pageCount}</span></div>
            <div>• Saddle-Stitch Signature Multiplier: <span className="font-semibold text-slate-800 dark:text-slate-200">4 pages per sheet</span></div>
            <div>• Required 2-Sided Sheets: <span className="font-semibold text-slate-800 dark:text-slate-200">{signatureSheets} physical sheets</span></div>
            <div>• Automatic Blank Padding: <span className="font-semibold text-slate-800 dark:text-slate-200">{signatureSheets * 4 - pageCount} blank page(s)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
