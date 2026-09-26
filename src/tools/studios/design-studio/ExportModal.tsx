import React, { useState } from 'react';
import { X, Download, FileImage, FileCode, FileText, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { DesignElement, CanvasSettings } from './types';
import { exportDesignToFile, ExportConfig } from './exportEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: DesignElement[];
  settings: CanvasSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  elements,
  settings,
}) => {
  const [format, setFormat] = useState<ExportConfig['format']>('png');
  const [scale, setScale] = useState<number>(2);
  const [quality, setQuality] = useState<number>(0.95);
  const [transparentBg, setTransparentBg] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>(settings.name.toLowerCase().replace(/\s+/g, '-'));
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const result = await exportDesignToFile(elements, settings, {
        format,
        scale,
        quality,
        transparentBg,
        filename,
      });

      if (result.success) {
        setExportSuccess(true);
        setTimeout(() => {
          setExportSuccess(false);
          onClose();
        }, 1200);
      } else {
        setExportError(result.error || 'Failed to export document');
      }
    } catch (err: any) {
      setExportError(err?.message || 'Export error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  const formats = [
    { id: 'png', name: 'PNG Image', desc: 'Lossless raster with alpha channel support', icon: FileImage },
    { id: 'jpg', name: 'JPEG Image', desc: 'Optimized for photos and digital web sharing', icon: FileImage },
    { id: 'webp', name: 'WEBP Modern', desc: 'Superior high-compression web format', icon: FileImage },
    { id: 'svg', name: 'Vector SVG', desc: 'Infinitely scalable resolution vector graphic', icon: FileCode },
    { id: 'pdf', name: 'Print Ready PDF', desc: 'Vector document ready for commercial printing', icon: FileText },
    { id: 'json', name: 'EditMee Project', desc: 'Complete editable JSON project state backup', icon: FileCode },
  ] as const;

  const resolutionDimensions = {
    w: Math.round(settings.width * scale),
    h: Math.round(settings.height * scale),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white">Export Center</h2>
            <p className="text-xs text-slate-400">Download high-resolution graphic outputs</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Format Selection Grid */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Output Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((f) => {
                const Icon = f.icon;
                const isSelected = format === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-red-400' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold">{f.name}</div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution / Scale for raster formats */}
          {['png', 'jpg', 'webp', 'pdf'].includes(format) && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Resolution Scale
                </label>
                <span className="text-xs font-mono text-slate-400">
                  {resolutionDimensions.w} × {resolutionDimensions.h} px
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { s: 1, label: '1x (Standard)' },
                  { s: 2, label: '2x (Retina HD)' },
                  { s: 3, label: '3x (300 DPI)' },
                  { s: 4, label: '4x (Ultra 4K)' },
                ].map(({ s, label }) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScale(s)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      scale === s
                        ? 'bg-red-600 text-white border-red-500'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Format Specific Options */}
          {(format === 'png' || format === 'svg') && (
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
                className="rounded accent-red-500 w-4 h-4 cursor-pointer"
              />
              <span>Export with transparent background (removes document backdrop)</span>
            </label>
          )}

          {(format === 'jpg' || format === 'webp') && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Compression Quality</span>
                <span className="font-mono">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          )}

          {/* Filename input */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              File Name
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white focus:outline-none"
              />
              <span className="text-xs font-mono text-slate-500">.{format}</span>
            </div>
          </div>

          {exportError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{exportError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rendering High-Res Output...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Downloaded Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
