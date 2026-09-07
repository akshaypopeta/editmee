import React, { useState } from 'react';
import { Highlighter, Plus, Trash2, Sliders, Palette } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

export interface AnnotationItem {
  id: string;
  type: 'highlight' | 'stamp' | 'note' | 'underline' | 'rect';
  pageNumber: number;
  text?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  opacity: number;
}

interface AnnotationToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  annotList: AnnotationItem[];
  setAnnotList: React.Dispatch<React.SetStateAction<AnnotationItem[]>>;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const AnnotationToolPanel: React.FC<AnnotationToolPanelProps> = ({
  docInfo,
  annotList,
  setAnnotList,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const maxPages = docInfo?.numPages || 1;
  const [annotType, setAnnotType] = useState<'highlight' | 'stamp' | 'note' | 'rect'>('highlight');
  const [annotPage, setAnnotPage] = useState<number>(1);
  const [annotText, setAnnotText] = useState('APPROVED');
  const [annotColor, setAnnotColor] = useState('#f59e0b');
  const [annotOpacity, setAnnotOpacity] = useState<number>(50);

  const handleAddStamp = (stampText: string, color: string) => {
    setAnnotList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: 'stamp',
        pageNumber: 1,
        text: stampText,
        x: 200,
        y: 400,
        color,
        opacity: 85,
      },
    ]);
  };

  const handleAddCustom = () => {
    setAnnotList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type: annotType,
        pageNumber: annotPage,
        text: annotText,
        x: 100,
        y: 500,
        width: annotType === 'highlight' || annotType === 'rect' ? 250 : undefined,
        height: annotType === 'highlight' || annotType === 'rect' ? 30 : undefined,
        color: annotColor,
        opacity: annotOpacity,
      },
    ]);
  };

  const handleRemove = (id: string) => {
    setAnnotList((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Highlighter className="w-4 h-4 text-red-500" />
            PDF Annotation, Markup & Stamp Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Add official stamp marks (APPROVED, CONFIDENTIAL), text highlights, notes, and vector highlights.
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
          {isAdvancedMode ? 'Advanced Studio' : 'Quick Stamps'}
        </button>
      </div>

      {/* Quick Stamp Badges */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          One-Click Official Rubber Stamps
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { text: 'APPROVED', color: '#16a34a' },
            { text: 'CONFIDENTIAL', color: '#dc2626' },
            { text: 'DRAFT COPY', color: '#d97706' },
            { text: 'FINAL REVIEW', color: '#2563eb' },
          ].map((st) => (
            <button
              key={st.text}
              type="button"
              onClick={() => handleAddStamp(st.text, st.color)}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-center font-bold text-xs cursor-pointer transition-all"
              style={{ color: st.color }}
            >
              + {st.text}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Annotation Builder */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Custom Markup / Highlight
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Markup Type
            </label>
            <select
              value={annotType}
              onChange={(e) => setAnnotType(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            >
              <option value="highlight">Highlighter Box</option>
              <option value="stamp">Custom Stamp Text</option>
              <option value="note">Sticky Note Box</option>
              <option value="rect">Framed Rectangle</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Target Page (1 to {maxPages})
            </label>
            <input
              type="number"
              min="1"
              max={maxPages}
              value={annotPage}
              onChange={(e) => setAnnotPage(Math.min(maxPages, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Highlight Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={annotColor}
                onChange={(e) => setAnnotColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0"
              />
              <span className="text-xs font-mono text-slate-500">{annotColor}</span>
            </div>
          </div>
        </div>

        {isAdvancedMode && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Position Placement
              </label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  // Handle quick placement
                  if (val === 'top-center') {
                    setAnnotList((prev) => [
                      ...prev,
                      {
                        id: Math.random().toString(36).substring(2, 9),
                        type: annotType,
                        pageNumber: annotPage,
                        text: annotText,
                        x: 180,
                        y: 700,
                        width: 240,
                        height: 40,
                        color: annotColor,
                        opacity: annotOpacity,
                      },
                    ]);
                  } else if (val === 'bottom-right') {
                    setAnnotList((prev) => [
                      ...prev,
                      {
                        id: Math.random().toString(36).substring(2, 9),
                        type: annotType,
                        pageNumber: annotPage,
                        text: annotText,
                        x: 380,
                        y: 80,
                        width: 180,
                        height: 40,
                        color: annotColor,
                        opacity: annotOpacity,
                      },
                    ]);
                  }
                }}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="center">Center of Page (x: 180, y: 400)</option>
                <option value="top-center">Top Header (x: 180, y: 700)</option>
                <option value="bottom-right">Bottom Right (x: 380, y: 80)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                Opacity ({annotOpacity}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={annotOpacity}
                onChange={(e) => setAnnotOpacity(parseInt(e.target.value, 10))}
                className="w-full mt-1.5"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
            Note / Stamp Text
          </label>
          <input
            type="text"
            value={annotText}
            onChange={(e) => setAnnotText(e.target.value)}
            placeholder="e.g. Needs immediate review"
            className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
          />
        </div>

        <button
          type="button"
          onClick={handleAddCustom}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Annotation Markup
        </button>
      </div>

      {/* Annotation List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Active Annotations ({annotList.length})
        </h4>

        {annotList.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No annotations added yet. Click a quick stamp or create a custom highlight above.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {annotList.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: a.color }}
                  ></span>
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                    [{a.type}]
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    Pg {a.pageNumber}: {a.text || 'Geometry Markup'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(a.id)}
                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
