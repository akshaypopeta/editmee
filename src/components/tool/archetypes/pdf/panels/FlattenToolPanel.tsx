import React from 'react';
import { Layers, Lock, Check, Sliders } from 'lucide-react';

interface FlattenToolPanelProps {
  flattenFormsOnly: boolean;
  setFlattenFormsOnly: (val: boolean) => void;
  flattenAnnotationsOnly: boolean;
  setFlattenAnnotationsOnly: (val: boolean) => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const FlattenToolPanel: React.FC<FlattenToolPanelProps> = ({
  flattenFormsOnly,
  setFlattenFormsOnly,
  flattenAnnotationsOnly,
  setFlattenAnnotationsOnly,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-red-500" />
            PDF Form & Annotation Flattening
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Render dynamic AcroForm fields and interactive annotations permanently into static background vector graphics.
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
          {isAdvancedMode ? 'Selective Targets' : 'Flatten All'}
        </button>
      </div>

      <div className="space-y-3">
        {/* Flatten Forms Option */}
        <div
          onClick={() => setFlattenFormsOnly(!flattenFormsOnly)}
          className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            flattenFormsOnly
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div>
            <div className="text-xs font-bold">Flatten AcroForm Fields (Textboxes, Checkboxes, Dropdowns)</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Converts form inputs into uneditable text characters embedded in the page stream.
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
              flattenFormsOnly ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {flattenFormsOnly && <Check className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Flatten Annotations Option */}
        <div
          onClick={() => setFlattenAnnotationsOnly(!flattenAnnotationsOnly)}
          className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            flattenAnnotationsOnly
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div>
            <div className="text-xs font-bold">Flatten Annotations & Comments (Sticky Notes, Markups, Stamps)</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Merges comment popups, highlights, and vector shapes into the static document canvas.
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
              flattenAnnotationsOnly ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {flattenAnnotationsOnly && <Check className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    </div>
  );
};
