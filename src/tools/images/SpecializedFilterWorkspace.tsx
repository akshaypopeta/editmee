import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Layers,
  Split,
  Sparkles,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine, FilterType } from '../../core/image-engine/ImageEngine';

interface FilterOption {
  id: FilterType;
  name: string;
  desc: string;
  defaultIntensity: number;
}

const FILTER_LIST: FilterOption[] = [
  { id: 'vignette', name: 'Vignette', desc: 'Dark circular edge falloff', defaultIntensity: 60 },
  { id: 'pixelate', name: '8-Bit Pixelate', desc: 'Retro arcade mosaic blocks', defaultIntensity: 12 },
  { id: 'invert', name: 'Negative / Invert', desc: 'Inverts color spectrum', defaultIntensity: 100 },
  { id: 'blur', name: 'Gaussian Blur', desc: 'Soft focal defocus', defaultIntensity: 15 },
  { id: 'sharpen', name: 'High-Pass Sharpen', desc: 'Accentuates micro-textures', defaultIntensity: 40 },
  { id: 'rounded_corners', name: 'Rounded Frame', desc: 'Smooth rounded border cut', defaultIntensity: 40 },
];

export const SpecializedFilterWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>('vignette');
  const [intensity, setIntensity] = useState<number>(60);

  const [filteredBlob, setFilteredBlob] = useState<Blob | null>(null);
  const [filteredUrl, setFilteredUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Split View
  const [splitPos, setSplitPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplit = useRef<boolean>(false);

  const handleFileUpload = async (f: File) => {
    try {
      setFile(f);
      const img = await FileEngine.loadImage(f);
      setImgElement(img);
    } catch (err) {
      console.error('Error loading file for specialized filter:', err);
    }
  };

  const handleSelectFilter = (opt: FilterOption) => {
    setActiveFilter(opt.id);
    setIntensity(opt.defaultIntensity);
  };

  // Render filter on canvas
  useEffect(() => {
    if (!imgElement) return;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const canvas = await ImageEngine.applySpecializedFilter(imgElement, activeFilter, {
          intensity,
          radius: intensity,
          blockSize: Math.max(4, Math.round(intensity / 4)),
        });
        canvas.toBlob(
          (b) => {
            if (b) {
              setFilteredBlob(b);
              const u = URL.createObjectURL(b);
              setFilteredUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return u;
              });
            }
            setIsProcessing(false);
          },
          'image/png',
          0.98
        );
      } catch (err) {
        console.error('Error applying specialized filter:', err);
        setIsProcessing(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [imgElement, activeFilter, intensity]);

  const handleDownload = () => {
    if (!filteredBlob || !file) return;
    const base = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${base}_${activeFilter}.png`;
    FileEngine.downloadBlob(filteredBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'specialized-filter',
      toolName: 'Special Effects & Filters',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Applied ${activeFilter} effect (Intensity: ${intensity}%)`,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  return (
    <div id="specialized-filter-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 border border-fuchsia-500/20">
              <Wand2 className="w-5 h-5" />
            </span>
            Special Effects & Creative Filter Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply pixelate mosaic, artistic vignettes, negative color inversions, polaroid framing, and depth blurs.
          </p>
        </div>

        {file && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={!filteredBlob || isProcessing}
            className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 active:bg-fuchsia-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Filtered Image
          </button>
        )}
      </div>

      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-fuchsia-500 transition-colors">
          <div className="w-16 h-16 bg-fuchsia-50 text-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to apply creative filters</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Transform photos with retro 8-bit pixelation, dramatic vignettes, negative inversions, and framing cards.
          </p>
          <label
            htmlFor="filter-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Wand2 className="w-4 h-4" /> Choose Image File
            <input
              id="filter-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Filter Choices (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Creative Effects</h3>
              <label
                htmlFor="filter-change-file"
                className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700 cursor-pointer"
              >
                Change Image
                <input
                  id="filter-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Filter Buttons */}
            <div className="space-y-2">
              {FILTER_LIST.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectFilter(opt)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    activeFilter === opt.id
                      ? 'bg-fuchsia-50 border-fuchsia-500 text-fuchsia-950 ring-1 ring-fuchsia-500/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-xs font-bold">{opt.name}</span>
                  <span className="text-[10px] text-slate-500">{opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Intensity Slider */}
            {activeFilter !== 'invert' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Effect Strength</span>
                  <span className="font-mono text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-200">
                    {intensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={intensity}
                  onChange={(e) => setIntensity(Number(e.target.value))}
                  className="w-full accent-fuchsia-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Split Comparison Stage (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Live Split Comparison</span>
              <span className="text-[11px] font-mono text-slate-400">Drag to inspect filter</span>
            </div>

            <div
              ref={containerRef}
              onMouseDown={() => (isDraggingSplit.current = true)}
              onMouseUp={() => (isDraggingSplit.current = false)}
              onMouseLeave={() => (isDraggingSplit.current = false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative h-96 sm:h-[480px] bg-slate-950 rounded-xl overflow-hidden select-none cursor-ew-resize flex items-center justify-center border border-slate-800"
            >
              {/* Filtered Background */}
              {filteredUrl && (
                <img
                  src={filteredUrl}
                  alt="Filtered"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
              )}

              {/* Original Clipped by Split */}
              {imgElement && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${splitPos}%` }}
                >
                  <img
                    src={imgElement.src}
                    alt="Original"
                    className="absolute top-0 left-0 max-w-none h-full object-contain pointer-events-none"
                    style={{
                      width: containerRef.current ? containerRef.current.clientWidth : '100%',
                    }}
                  />
                </div>
              )}

              {/* Divider handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none z-10 flex items-center justify-center"
                style={{ left: `${splitPos}%` }}
              >
                <div className="w-6 h-6 bg-white text-slate-800 rounded-full shadow-md flex items-center justify-center text-[10px] font-bold">
                  ↔
                </div>
              </div>

              {/* Badges */}
              <span className="absolute bottom-3 left-3 bg-slate-950/80 text-white text-[10px] font-mono px-2 py-1 rounded-md z-20">
                Original
              </span>
              <span className="absolute bottom-3 right-3 bg-fuchsia-600/90 text-white text-[10px] font-mono px-2 py-1 rounded-md z-20">
                {activeFilter.toUpperCase()} Effect
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
