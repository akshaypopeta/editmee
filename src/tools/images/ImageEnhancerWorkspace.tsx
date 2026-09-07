import React, { useState, useEffect, useRef } from 'react';
import {
  SunMedium,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  Split,
  Palette,
  Contrast,
  Thermometer,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

interface FilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  sepia: number;
  grayscale: number;
}

const PRESETS: FilterPreset[] = [
  { id: 'normal', name: 'Original', brightness: 0, contrast: 0, saturation: 0, warmth: 0, sepia: 0, grayscale: 0 },
  { id: 'vivid', name: 'Vivid Pop', brightness: 5, contrast: 20, saturation: 35, warmth: 5, sepia: 0, grayscale: 0 },
  { id: 'cinematic', name: 'Cinematic', brightness: -5, contrast: 25, saturation: -10, warmth: 15, sepia: 10, grayscale: 0 },
  { id: 'bw', name: 'Fine B&W', brightness: 5, contrast: 30, saturation: -100, warmth: 0, sepia: 0, grayscale: 100 },
  { id: 'sepia', name: 'Vintage 1970', brightness: 0, contrast: 10, saturation: -20, warmth: 25, sepia: 50, grayscale: 0 },
  { id: 'cool', name: 'Cool Twilight', brightness: 0, contrast: 15, saturation: 10, warmth: -30, sepia: 0, grayscale: 0 },
];

export const ImageEnhancerWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Adjustment sliders
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(0);
  const [warmth, setWarmth] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string>('normal');

  // Preview & Output
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Split view
  const [splitPos, setSplitPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplit = useRef<boolean>(false);

  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
      handleReset();
    } catch (err) {
      console.error('Error loading image for enhancer:', err);
    }
  };

  // Apply preset
  const handleSelectPreset = (p: FilterPreset) => {
    setActivePreset(p.id);
    setBrightness(p.brightness);
    setContrast(p.contrast);
    setSaturation(p.saturation);
    setWarmth(p.warmth);
    setSepia(p.sepia);
    setGrayscale(p.grayscale);
  };

  // 1-Click Auto Enhance
  const handleAutoEnhance = () => {
    setActivePreset('custom');
    setBrightness(8);
    setContrast(18);
    setSaturation(22);
    setWarmth(5);
  };

  // Reset all
  const handleReset = () => {
    setActivePreset('normal');
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setWarmth(0);
    setSepia(0);
    setGrayscale(0);
  };

  // Render on canvas with pixel adjustments
  useEffect(() => {
    if (!imgElement) return;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      const canvas = document.createElement('canvas');
      const w = imgElement.naturalWidth;
      const h = imgElement.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original
      ctx.drawImage(imgElement, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Factors
      const bFactor = (brightness / 100) * 255;
      const cFactor = (contrast + 100) / 100;
      const cIntercept = 128 * (1 - cFactor);
      const sFactor = (saturation + 100) / 100;
      const wFactor = warmth; // -100 to 100
      const sepFactor = sepia / 100;
      const grayFactor = grayscale / 100;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // 1. Brightness
        r += bFactor;
        g += bFactor;
        b += bFactor;

        // 2. Contrast
        r = r * cFactor + cIntercept;
        g = g * cFactor + cIntercept;
        b = b * cFactor + cIntercept;

        // 3. Warmth (temperature shift)
        if (wFactor > 0) {
          r += wFactor * 0.4;
          b -= wFactor * 0.2;
        } else if (wFactor < 0) {
          b += -wFactor * 0.4;
          r -= -wFactor * 0.2;
        }

        // 4. Saturation
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * sFactor;
        g = gray + (g - gray) * sFactor;
        b = gray + (b - gray) * sFactor;

        // 5. Grayscale
        if (grayFactor > 0) {
          r = r * (1 - grayFactor) + gray * grayFactor;
          g = g * (1 - grayFactor) + gray * grayFactor;
          b = b * (1 - grayFactor) + gray * grayFactor;
        }

        // 6. Sepia tone
        if (sepFactor > 0) {
          const sr = r * 0.393 + g * 0.769 + b * 0.189;
          const sg = r * 0.349 + g * 0.686 + b * 0.168;
          const sb = r * 0.272 + g * 0.534 + b * 0.131;
          r = r * (1 - sepFactor) + sr * sepFactor;
          g = g * (1 - sepFactor) + sg * sepFactor;
          b = b * (1 - sepFactor) + sb * sepFactor;
        }

        data[i] = Math.min(255, Math.max(0, r));
        data[i + 1] = Math.min(255, Math.max(0, g));
        data[i + 2] = Math.min(255, Math.max(0, b));
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setEnhancedBlob(blob);
            const u = URL.createObjectURL(blob);
            setEnhancedUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return u;
            });
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95
      );
    }, 120);

    return () => clearTimeout(timer);
  }, [imgElement, brightness, contrast, saturation, warmth, sepia, grayscale]);

  const handleDownload = () => {
    if (!enhancedBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_enhanced.jpg`;
    FileEngine.downloadBlob(enhancedBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-enhancer',
      toolName: 'Image Enhancer',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Color graded & enhanced (Brightness: ${brightness}%, Contrast: ${contrast}%)`,
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
    <div id="image-enhancer-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <SunMedium className="w-5 h-5" />
            </span>
            Image Enhancer & Color Grade Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fine-tune exposure, contrast, vibrance, warmth, and artistic color grading with instant before/after inspection.
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!enhancedBlob || isProcessing}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Enhanced
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-amber-500 transition-colors">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SunMedium className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to enhance</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Supports RAW conversions, JPEG, PNG, and WebP. Adjust lighting, colors, and tone curves instantly.
          </p>
          <label
            htmlFor="enhancer-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <SunMedium className="w-4 h-4" /> Choose Image File
            <input
              id="enhancer-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Color Grading</h3>
              <button
                type="button"
                onClick={handleAutoEnhance}
                className="text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Auto
              </button>
            </div>

            {/* Presets Grid */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Artistic Mood Presets</label>
              <div className="grid grid-cols-3 gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`py-2 px-1 text-center text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      activePreset === p.id
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {/* Brightness */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Exposure / Brightness</span>
                  <span className="font-mono text-amber-600">{brightness > 0 ? `+${brightness}` : brightness}%</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={brightness}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setBrightness(Number(e.target.value));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-amber-600">{contrast > 0 ? `+${contrast}` : contrast}%</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={contrast}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setContrast(Number(e.target.value));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Saturation & Vibrance</span>
                  <span className="font-mono text-amber-600">{saturation > 0 ? `+${saturation}` : saturation}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setSaturation(Number(e.target.value));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Warmth */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Temperature / Warmth</span>
                  <span className="font-mono text-amber-600">{warmth > 0 ? `+${warmth}` : warmth}%</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={warmth}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setWarmth(Number(e.target.value));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Sepia */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Sepia Vintage Tone</span>
                  <span className="font-mono text-amber-600">{sepia}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sepia}
                  onChange={(e) => {
                    setActivePreset('custom');
                    setSepia(Number(e.target.value));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive Split Comparison Stage (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Live Grading Split Comparison</span>
              <span className="text-[11px] font-mono text-slate-400">Drag divider to inspect change</span>
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
              {/* Enhanced Image Background */}
              {enhancedUrl && (
                <img
                  src={enhancedUrl}
                  alt="Enhanced"
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

              {/* Divider line */}
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
              <span className="absolute bottom-3 right-3 bg-amber-600/90 text-white text-[10px] font-mono px-2 py-1 rounded-md z-20">
                Color Graded
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
