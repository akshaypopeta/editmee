import React from 'react';
import { ScanText, Sliders, CheckCircle2 } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

interface OcrToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  ocrLanguage: string;
  setOcrLanguage: (lang: string) => void;
  ocrQuality: 'fast' | 'high';
  setOcrQuality: (q: 'fast' | 'high') => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const OcrToolPanel: React.FC<OcrToolPanelProps> = ({
  docInfo,
  ocrLanguage,
  setOcrLanguage,
  ocrQuality,
  setOcrQuality,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ScanText className="w-4 h-4 text-red-500" />
            PDF OCR & Searchable Text Creator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Extract text from scanned pages and inject an invisible, searchable, and selectable text overlay layer.
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
          {isAdvancedMode ? 'Engine Configuration' : 'Standard Mode'}
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Primary Language
            </label>
            <select
              value={ocrLanguage}
              onChange={(e) => setOcrLanguage(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="eng">English (Latin Script)</option>
              <option value="spa">Spanish (Español)</option>
              <option value="fra">French (Français)</option>
              <option value="deu">German (Deutsch)</option>
              <option value="ita">Italian (Italiano)</option>
              <option value="por">Portuguese (Português)</option>
              <option value="auto">Auto-Detect Multilingual</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Recognition Mode
            </label>
            <select
              value={ocrQuality}
              onChange={(e) => setOcrQuality(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="high">High Accuracy (Deep Neural Text Stream)</option>
              <option value="fast">Fast Scan (Standard Lexical Stream)</option>
            </select>
          </div>
        </div>

        {/* OCR Feature Checklist */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Invisible Searchable Overlay Guarantees:
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
            <li>Preserves 100% original scanned image fidelity and color depth.</li>
            <li>Enables Cmd+F / Ctrl+F keyword search inside Acrobat, Preview, and browsers.</li>
            <li>Allows text selection, copying, and clipboard extraction.</li>
            <li>Full PDF/A compliant output for long-term document archiving.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
