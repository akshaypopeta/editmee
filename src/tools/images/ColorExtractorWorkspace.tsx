import React, { useState } from 'react';
import {
  Palette,
  Upload,
  Copy,
  Check,
  Download,
  Code2,
  FileJson,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';

interface Swatch {
  hex: string;
  rgb: string;
  hsl: string;
  count: number;
}

export const ColorExtractorWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [paletteCount, setPaletteCount] = useState<number>(6);
  const [swatches, setSwatches] = useState<Swatch[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileUpload = async (f: File) => {
    try {
      setFile(f);
      const url = URL.createObjectURL(f);
      setImageSrc(url);
      extractColors(f, paletteCount);
    } catch (err) {
      console.error('Error in color extractor upload:', err);
    }
  };

  const extractColors = async (targetFile: File, count: number) => {
    setIsProcessing(true);
    try {
      const img = await FileEngine.loadImage(targetFile);
      const paletteItems = await ImageEngine.extractDominantPalette(img, count);

      const computedSwatches: Swatch[] = paletteItems.map((item, idx) => ({
        hex: item.hex.toUpperCase(),
        rgb: item.rgb,
        hsl: item.hsl,
        count: idx,
      }));

      setSwatches(computedSwatches);
    } catch (err) {
      console.error('Palette extraction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(text);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Download CSS Palette
  const handleDownloadCSS = () => {
    if (swatches.length === 0) return;
    let css = `:root {\n`;
    swatches.forEach((s, idx) => {
      css += `  --color-${idx + 1}: ${s.hex};\n`;
    });
    css += `}\n`;

    const blob = new Blob([css], { type: 'text/css' });
    FileEngine.downloadBlob(blob, 'palette.css');
  };

  // Download JSON
  const handleDownloadJSON = () => {
    if (swatches.length === 0) return;
    const jsonStr = JSON.stringify(swatches, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    FileEngine.downloadBlob(blob, 'palette.json');
  };

  return (
    <div id="color-extractor-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-violet-500/10 text-violet-600 border border-violet-500/20">
              <Palette className="w-5 h-5" />
            </span>
            Color Palette Extractor & Hex Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Extract dominant color schemes, hex codes, RGB/HSL values, and export clean CSS variables from any image.
          </p>
        </div>

        {swatches.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSS}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" /> Export CSS
            </button>
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>
        )}
      </div>

      {!imageSrc ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-violet-500 transition-colors">
          <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Palette className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to extract colors</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            K-Means clustering algorithm extracts the purest harmonious color palette for UI themes and graphic design.
          </p>
          <label
            htmlFor="color-palette-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Palette className="w-4 h-4" /> Choose Image File
            <input
              id="color-palette-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls & Swatch Details (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Palette Controls</h3>
              <label
                htmlFor="color-change-file"
                className="text-xs font-semibold text-violet-600 hover:text-violet-700 cursor-pointer"
              >
                Change Image
                <input
                  id="color-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Swatch count selection */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                <span>Number of Colors</span>
                <span className="font-mono text-violet-600">{paletteCount} Swatches</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[4, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      setPaletteCount(num);
                      if (file) extractColors(file, num);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      paletteCount === num
                        ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Colors
                  </button>
                ))}
              </div>
            </div>

            {/* Swatches List */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">Dominant Palette</span>
              <div className="space-y-2">
                {swatches.map((swatch) => (
                  <div
                    key={swatch.hex}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border border-black/10 shrink-0"
                        style={{ backgroundColor: swatch.hex }}
                      />
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900 block">{swatch.hex}</span>
                        <span className="text-[10px] text-slate-400 block">{swatch.rgb}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(swatch.hex)}
                      className="p-1.5 text-slate-500 hover:text-violet-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Copy Hex"
                    >
                      {copiedHex === swatch.hex ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image & Ribbon Preview (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Source Photo & Extracted Ribbon</span>
            </div>

            {/* Full-width interactive color ribbon */}
            {swatches.length > 0 && (
              <div className="h-16 rounded-xl overflow-hidden flex shadow-md border border-slate-200">
                {swatches.map((s) => (
                  <div
                    key={s.hex}
                    onClick={() => handleCopy(s.hex)}
                    style={{ backgroundColor: s.hex }}
                    className="flex-1 h-full cursor-pointer group relative transition-transform hover:scale-105 hover:z-10"
                    title={`Click to copy ${s.hex}`}
                  >
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-mono font-bold text-white bg-black/40 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.hex}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Image Preview */}
            <div className="min-h-[340px] bg-slate-950 rounded-xl overflow-hidden p-4 flex items-center justify-center border border-slate-800">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Source"
                  className="max-h-[50vh] max-w-full object-contain rounded shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
