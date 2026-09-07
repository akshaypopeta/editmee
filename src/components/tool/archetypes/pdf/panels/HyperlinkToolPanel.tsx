import React, { useState } from 'react';
import { Link, Plus, Trash2, Sliders, ExternalLink } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

export interface HyperlinkItem {
  id: string;
  pageNumber: number;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HyperlinkToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  hyperlinksList: HyperlinkItem[];
  setHyperlinksList: React.Dispatch<React.SetStateAction<HyperlinkItem[]>>;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const HyperlinkToolPanel: React.FC<HyperlinkToolPanelProps> = ({
  docInfo,
  hyperlinksList,
  setHyperlinksList,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const maxPages = docInfo?.numPages || 1;
  const [linkUrl, setLinkUrl] = useState('https://editmee.com');
  const [linkPage, setLinkPage] = useState<number>(1);
  const [linkX, setLinkX] = useState<number>(72);
  const [linkY, setLinkY] = useState<number>(600);
  const [linkW, setLinkW] = useState<number>(200);
  const [linkH, setLinkH] = useState<number>(24);

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    setHyperlinksList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        pageNumber: linkPage,
        url: linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`,
        x: linkX,
        y: linkY,
        width: linkW,
        height: linkH,
      },
    ]);
  };

  const handleRemoveLink = (id: string) => {
    setHyperlinksList((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Link className="w-4 h-4 text-red-500" />
            PDF Hyperlink & URI Hotspot Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Embed clickable web URLs, URI links, and interactive hotspot rectangular targets into page layouts.
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
          {isAdvancedMode ? 'Coordinates Pro' : 'Quick Mode'}
        </button>
      </div>

      {/* Add Link Form */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Add Interactive Link Hotspot
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Destination Web URL / URI
            </label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com/pricing"
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
              Page (1 to {maxPages})
            </label>
            <input
              type="number"
              min="1"
              max={maxPages}
              value={linkPage}
              onChange={(e) => setLinkPage(Math.min(maxPages, Math.max(1, parseInt(e.target.value, 10) || 1)))}
              className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {isAdvancedMode && (
          <div className="grid grid-cols-4 gap-2 pt-1">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">X Coord (pt)</label>
              <input
                type="number"
                value={linkX}
                onChange={(e) => setLinkX(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Y Coord (pt)</label>
              <input
                type="number"
                value={linkY}
                onChange={(e) => setLinkY(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Width (pt)</label>
              <input
                type="number"
                value={linkW}
                onChange={(e) => setLinkW(parseInt(e.target.value, 10) || 10)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Height (pt)</label>
              <input
                type="number"
                value={linkH}
                onChange={(e) => setLinkH(parseInt(e.target.value, 10) || 10)}
                className="w-full px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleAddLink}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Clickable Hotspot Link
        </button>
      </div>

      {/* Hyperlink List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Configured Hyperlinks ({hyperlinksList.length})
        </h4>

        {hyperlinksList.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No hyperlinks added yet. Fill in a destination URL above.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {hyperlinksList.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 truncate">
                    {l.url}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 font-mono shrink-0">
                    Pg {l.pageNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(l.id)}
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
