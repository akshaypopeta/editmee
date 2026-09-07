import React, { useState } from 'react';
import { Bookmark, Plus, Trash2, Sliders, ChevronRight } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

export interface BookmarkEntry {
  id: string;
  title: string;
  pageNumber: number;
  level: number;
}

interface BookmarkToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  bookmarkList: BookmarkEntry[];
  setBookmarkList: React.Dispatch<React.SetStateAction<BookmarkEntry[]>>;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const BookmarkToolPanel: React.FC<BookmarkToolPanelProps> = ({
  docInfo,
  bookmarkList,
  setBookmarkList,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const maxPages = docInfo?.numPages || 1;
  const [newTitle, setNewTitle] = useState('');
  const [newPage, setNewPage] = useState<number>(1);
  const [newLevel, setNewLevel] = useState<number>(1);

  const handleAddBookmark = () => {
    if (!newTitle.trim()) return;
    setBookmarkList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        title: newTitle.trim(),
        pageNumber: newPage,
        level: newLevel,
      },
    ]);
    setNewTitle('');
  };

  const handleRemoveBookmark = (id: string) => {
    setBookmarkList((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-red-500" />
            PDF Bookmark Indexer & Outline Tree
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Construct navigation table-of-contents bookmarks and hierarchical document outlines.
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
          {isAdvancedMode ? 'Advanced Hierarchy' : 'Quick Mode'}
        </button>
      </div>

      {/* Add New Bookmark Row */}
      <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Add New Bookmark
        </h4>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            placeholder="Bookmark Title (e.g. Chapter 1: Introduction)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full sm:flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          />

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">Page:</span>
              <input
                type="number"
                min="1"
                max={maxPages}
                value={newPage}
                onChange={(e) => setNewPage(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 px-2 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
              />
            </div>

            {isAdvancedMode && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">Level:</span>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(parseInt(e.target.value, 10))}
                  className="px-2 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
                >
                  <option value={1}>Level 1 (Main)</option>
                  <option value={2}>Level 2 (Sub)</option>
                  <option value={3}>Level 3 (Detail)</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddBookmark}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Bookmark Outline Tree */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Document Navigation Outline ({bookmarkList.length})
        </h4>

        {bookmarkList.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No bookmarks added yet. Add section bookmarks above to build your document outline.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {bookmarkList.map((bm) => (
              <div
                key={bm.id}
                style={{ paddingLeft: `${(bm.level - 1) * 16 + 12}px` }}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs"
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{bm.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-slate-500 font-mono">
                    Page {bm.pageNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveBookmark(bm.id)}
                  className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
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
