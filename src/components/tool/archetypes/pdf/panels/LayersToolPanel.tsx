import React, { useState } from 'react';
import { Layers, Plus, Trash2, Eye, EyeOff, Sliders } from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

export interface PdfLayerItem {
  id: string;
  name: string;
  visible: boolean;
  locked?: boolean;
}

interface LayersToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  pdfLayersList: PdfLayerItem[];
  setPdfLayersList: React.Dispatch<React.SetStateAction<PdfLayerItem[]>>;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const LayersToolPanel: React.FC<LayersToolPanelProps> = ({
  docInfo,
  pdfLayersList,
  setPdfLayersList,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  const [newLayerName, setNewLayerName] = useState('');

  const handleToggleLayer = (id: string) => {
    setPdfLayersList((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const handleAddLayer = () => {
    if (!newLayerName.trim()) return;
    setPdfLayersList((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: newLayerName.trim(),
        visible: true,
      },
    ]);
    setNewLayerName('');
  };

  const handleRemoveLayer = (id: string) => {
    setPdfLayersList((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-500" />
            PDF Layers (OCG) & Visibility Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage Optional Content Groups (OCG), CAD overlays, architectural sheets, and layer visibility flags.
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
          {isAdvancedMode ? 'Advanced OCG' : 'Standard'}
        </button>
      </div>

      {/* Add New Layer */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <input
          type="text"
          placeholder="New Layer Name (e.g. Architectural Notes, Electrical Grid)"
          value={newLayerName}
          onChange={(e) => setNewLayerName(e.target.value)}
          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
        />
        <button
          type="button"
          onClick={handleAddLayer}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Layer
        </button>
      </div>

      {/* Layers List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Document Optional Content Groups ({pdfLayersList.length})
        </h4>

        <div className="space-y-1.5">
          {pdfLayersList.map((layer) => (
            <div
              key={layer.id}
              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleLayer(layer.id)}
                  className={`p-1 rounded cursor-pointer ${
                    layer.visible
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-slate-400 bg-slate-200 dark:bg-slate-700'
                  }`}
                  title={layer.visible ? 'Visible (Click to Hide)' : 'Hidden (Click to Show)'}
                >
                  {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{layer.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Status: {layer.visible ? 'Visible on Export' : 'Hidden / Suppressed'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveLayer(layer.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
