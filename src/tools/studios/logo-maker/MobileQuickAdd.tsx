import React, { useState } from 'react';
import {
  Plus,
  Type,
  Shapes,
  Square,
  Sparkles,
  Palette,
  X,
} from 'lucide-react';
import { ShapeType } from './types';

interface MobileQuickAddProps {
  onAddText: (type: 'title' | 'tagline' | 'curved') => void;
  onAddShape: (type: ShapeType) => void;
  onOpenIcons: () => void;
  onOpenTemplates: () => void;
  onOpenPalettes: () => void;
  isCanvasEmpty: boolean;
}

export const MobileQuickAdd: React.FC<MobileQuickAddProps> = ({
  onAddText,
  onAddShape,
  onOpenIcons,
  onOpenTemplates,
  onOpenPalettes,
  isCanvasEmpty,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // If canvas is completely empty, show the prominent "Start from scratch" banner
  if (isCanvasEmpty) {
    return (
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex justify-center">
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-2xl max-w-sm w-full pointer-events-auto text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Start Your Logo</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Add your first brand mark element to begin:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => onAddText('title')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center space-x-2 text-xs font-semibold text-white transition-colors"
            >
              <Type className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Add Brand Name</span>
            </button>
            <button
              type="button"
              onClick={onOpenIcons}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center space-x-2 text-xs font-semibold text-white transition-colors"
            >
              <Shapes className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Browse Icons</span>
            </button>
            <button
              type="button"
              onClick={() => onAddShape('shield')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center space-x-2 text-xs font-semibold text-white transition-colors"
            >
              <Square className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Add Geometric Mark</span>
            </button>
            <button
              type="button"
              onClick={onOpenTemplates}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center space-x-2 text-xs font-semibold text-white transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Choose Template</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating Action Button (FAB)
  return (
    <div className="md:hidden absolute right-4 bottom-20 z-20">
      {menuOpen && (
        <div className="mb-2 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1 w-44 animate-in slide-in-from-bottom-5 duration-150">
          <button
            type="button"
            onClick={() => {
              onAddText('title');
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
          >
            <Type className="w-4 h-4 text-blue-400" />
            <span>Brand Title</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onAddText('tagline');
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
          >
            <Type className="w-4 h-4 text-slate-400" />
            <span>Tagline</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenIcons();
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
          >
            <Shapes className="w-4 h-4 text-amber-400" />
            <span>Vector Icon</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onAddShape('circle');
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors"
          >
            <Square className="w-4 h-4 text-emerald-400" />
            <span>Vector Shape</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenTemplates();
              setMenuOpen(false);
            }}
            className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-white hover:bg-slate-800 flex items-center space-x-2 transition-colors border-t border-slate-800/80 pt-1.5"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Templates</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className={`w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          menuOpen
            ? 'bg-slate-800 text-white rotate-45'
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40'
        }`}
        title="Add Element"
      >
        <Plus className="w-6 h-6 transition-transform" />
      </button>
    </div>
  );
};
