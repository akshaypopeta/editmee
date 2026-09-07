import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Maximize2,
  Download,
  Lock,
  Unlock,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Sliders,
  Check,
  RotateCcw,
  Crop,
  FileImage,
} from 'lucide-react';

interface PresetCategory {
  category: string;
  items: { name: string; width: number; height: number; description?: string }[];
}

const PRESET_GROUPS: PresetCategory[] = [
  {
    category: 'Social Media',
    items: [
      { name: 'Instagram Square (1:1)', width: 1080, height: 1080 },
      { name: 'Instagram Portrait (4:5)', width: 1080, height: 1350 },
      { name: 'Instagram Story / Reel (9:16)', width: 1080, height: 1920 },
      { name: 'YouTube Thumbnail (16:9)', width: 1280, height: 720 },
      { name: 'YouTube Banner', width: 2560, height: 1440 },
      { name: 'X / Twitter Post', width: 1600, height: 900 },
      { name: 'X / Twitter Header', width: 1500, height: 500 },
      { name: 'LinkedIn Post', width: 1200, height: 627 },
      { name: 'LinkedIn Cover', width: 1584, height: 396 },
    ],
  },
  {
    category: 'Display & Screens',
    items: [
      { name: '4K Ultra HD', width: 3840, height: 2160 },
      { name: 'Full HD 1080p', width: 1920, height: 1080 },
      { name: 'HD 720p', width: 1280, height: 720 },
      { name: 'Avatar / Icon', width: 512, height: 512 },
    ],
  },
  {
    category: 'Print (300 DPI)',
    items: [
      { name: 'Passport Photo (2×2")', width: 600, height: 600 },
      { name: 'Standard Photo (4×6")', width: 1800, height: 1200 },
      { name: 'Portrait Photo (5×7")', width: 2100, height: 1500 },
      { name: 'A4 Document', width: 2480, height: 3508 },
      { name: 'US Letter', width: 2550, height: 3300 },
    ],
  },
];

export const ImageResizerWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [targetW, setTargetW] = useState(0);
  const [targetH, setTargetH] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [unit, setUnit] = useState<'px' | 'percent' | 'inch'>('px');
  const [percentVal, setPercentVal] = useState(100);

  // Fit & Resampling options
  const [fitMode, setFitMode] = useState<'exact' | 'contain' | 'cover'>('exact');
  const [containBg, setContainBg] = useState<'transparent' | '#ffffff' | '#000000'>('transparent');
  const [interpolation, setInterpolation] = useState<'smooth' | 'pixelated'>('smooth');

  // Export settings
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState(92);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Image
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
      setOrigW(img.naturalWidth);
      setOrigH(img.naturalHeight);
      setTargetW(img.naturalWidth);
      setTargetH(img.naturalHeight);
      setPercentVal(100);
    } catch (err) {
      console.error('Error loading image for resizer:', err);
    }
  };

  // Re-render resized canvas whenever target or fit parameters change
  useEffect(() => {
    if (!imgElement || targetW <= 0 || targetH <= 0) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resampling style
      ctx.imageSmoothingEnabled = interpolation === 'smooth';
      if (interpolation === 'smooth') {
        ctx.imageSmoothingQuality = 'high';
      }

      if (fitMode === 'exact') {
        ctx.drawImage(imgElement, 0, 0, targetW, targetH);
      } else if (fitMode === 'contain') {
        if (containBg !== 'transparent') {
          ctx.fillStyle = containBg;
          ctx.fillRect(0, 0, targetW, targetH);
        }
        const scale = Math.min(targetW / imgElement.naturalWidth, targetH / imgElement.naturalHeight);
        const w = imgElement.naturalWidth * scale;
        const h = imgElement.naturalHeight * scale;
        const x = (targetW - w) / 2;
        const y = (targetH - h) / 2;
        ctx.drawImage(imgElement, x, y, w, h);
      } else if (fitMode === 'cover') {
        const scale = Math.max(targetW / imgElement.naturalWidth, targetH / imgElement.naturalHeight);
        const w = imgElement.naturalWidth * scale;
        const h = imgElement.naturalHeight * scale;
        const x = (targetW - w) / 2;
        const y = (targetH - h) / 2;
        ctx.drawImage(imgElement, x, y, w, h);
      }

      if (canvasRef.current) {
        canvasRef.current.width = targetW;
        canvasRef.current.height = targetH;
        const prevCtx = canvasRef.current.getContext('2d');
        if (prevCtx) {
          prevCtx.imageSmoothingEnabled = interpolation === 'smooth';
          prevCtx.drawImage(canvas, 0, 0);
        }
      }

      canvas.toBlob(
        (b) => {
          if (!isMounted) return;
          setResizedBlob(b);
          setIsProcessing(false);
        },
        exportFormat,
        quality / 100
      );
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imgElement, targetW, targetH, fitMode, containBg, interpolation, exportFormat, quality]);

  // Width Change handler
  const handleWidthChange = (w: number) => {
    const val = Math.max(1, w);
    setTargetW(val);
    if (maintainAspect && origW > 0) {
      setTargetH(Math.max(1, Math.round((val / origW) * origH)));
    }
  };

  // Height Change handler
  const handleHeightChange = (h: number) => {
    const val = Math.max(1, h);
    setTargetH(val);
    if (maintainAspect && origH > 0) {
      setTargetW(Math.max(1, Math.round((val / origH) * origW)));
    }
  };

  // Percentage Change
  const handlePercentChange = (pct: number) => {
    setPercentVal(pct);
    if (origW > 0 && origH > 0) {
      setTargetW(Math.max(1, Math.round((origW * pct) / 100)));
      setTargetH(Math.max(1, Math.round((origH * pct) / 100)));
    }
  };

  // Preset Selection
  const handlePresetSelect = (w: number, h: number) => {
    setTargetW(w);
    setTargetH(h);
    setMaintainAspect(false);
  };

  // Reset to original
  const handleReset = () => {
    setTargetW(origW);
    setTargetH(origH);
    setPercentVal(100);
    setMaintainAspect(true);
    setFitMode('exact');
  };

  // Download Resized Image
  const handleDownload = () => {
    if (!resizedBlob || !file) return;
    const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_${targetW}x${targetH}.${ext}`;
    FileEngine.downloadBlob(resizedBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-resizer',
      toolName: 'Image Resizer',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Resized to ${targetW} × ${targetH} px (${FileEngine.formatBytes(resizedBlob.size)})`,
    });
  };

  return (
    <div id="image-resizer-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
              <Maximize2 className="w-5 h-5" />
            </span>
            Image Resizer & Dimension Studio
            {file && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                {targetW} × {targetH} px
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Resize photos, graphics, and screenshots with locked aspect ratios, social media presets, and high-fidelity resampling.
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
              disabled={!resizedBlob || isProcessing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Resized
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-blue-500 transition-colors">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Maximize2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to resize</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Supports PNG, JPEG, WebP, SVG, and GIF. Scale dimensions with precision or choose from social media presets.
          </p>
          <label
            htmlFor="resizer-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Upload className="w-4 h-4" /> Choose Image File
            <input
              id="resizer-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Panel (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Dimensions & Scaling</h3>
              <label
                htmlFor="resizer-change-file"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                Change Image
                <input
                  id="resizer-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Unit Selector */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setUnit('px')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  unit === 'px' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pixels (px)
              </button>
              <button
                type="button"
                onClick={() => setUnit('percent')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  unit === 'percent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Percent (%)
              </button>
              <button
                type="button"
                onClick={() => setUnit('inch')}
                className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  unit === 'inch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Inches (300DPI)
              </button>
            </div>

            {/* Inputs & Aspect Lock */}
            {unit === 'px' || unit === 'inch' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {unit === 'inch' ? 'Width (Inches)' : 'Width (px)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={unit === 'inch' ? Number((targetW / 300).toFixed(2)) : targetW}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleWidthChange(unit === 'inch' ? Math.round(val * 300) : val);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {unit === 'inch' ? 'Height (Inches)' : 'Height (px)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={unit === 'inch' ? Number((targetH / 300).toFixed(2)) : targetH}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleHeightChange(unit === 'inch' ? Math.round(val * 300) : val);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setMaintainAspect((prev) => !prev)}
                    className={`text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                      maintainAspect
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {maintainAspect ? <Lock className="w-3.5 h-3.5 text-blue-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                    Lock Aspect Ratio
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">
                    Orig: {origW} × {origH}
                  </span>
                </div>
              </div>
            ) : (
              /* Percentage Slider */
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Scale Percentage</span>
                  <span className="font-mono text-blue-600">{percentVal}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="300"
                  value={percentVal}
                  onChange={(e) => handlePercentChange(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="grid grid-cols-4 gap-1 pt-1">
                  {[25, 50, 75, 150].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePercentChange(pct)}
                      className="py-1 text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Presets Accordion / Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Preset Canvas Sizes</label>
              <select
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [w, h] = e.target.value.split('x').map(Number);
                  handlePresetSelect(w, h);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Choose a preset standard...
                </option>
                {PRESET_GROUPS.map((grp) => (
                  <optgroup key={grp.category} label={grp.category}>
                    {grp.items.map((item) => (
                      <option key={item.name} value={`${item.width}x${item.height}`}>
                        {item.name} ({item.width} × {item.height})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Fit / Scale Mode */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Fit & Aspect Behavior</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setFitMode('exact')}
                  className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    fitMode === 'exact' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                  title="Stretches image to exact dimensions"
                >
                  Stretch
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('contain')}
                  className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    fitMode === 'contain' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                  title="Pads with background color without cropping"
                >
                  Contain
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('cover')}
                  className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    fitMode === 'cover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                  title="Crops center to fill target area completely"
                >
                  Cover
                </button>
              </div>
            </div>

            {/* Resampling Quality */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Interpolation</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInterpolation('smooth')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      interpolation === 'smooth' ? 'bg-blue-100 text-blue-800' : 'text-slate-400'
                    }`}
                  >
                    Smooth Bicubic
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterpolation('pixelated')}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      interpolation === 'pixelated' ? 'bg-blue-100 text-blue-800' : 'text-slate-400'
                    }`}
                  >
                    Pixel Sharp
                  </button>
                </div>
              </div>

              {/* Format & Quality */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Format</label>
                  <select
                    value={exportFormat}
                    onChange={(e: any) => setExportFormat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800"
                  >
                    <option value="image/png">PNG</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Quality ({quality}%)</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Preview Stage (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Resized Output Preview</span>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
                <span>Output: {targetW} × {targetH} px</span>
                {resizedBlob && <span>Size: {FileEngine.formatBytes(resizedBlob.size)}</span>}
              </div>
            </div>

            {/* Canvas Container with Checkerboard Background */}
            <div className="min-h-[380px] sm:min-h-[460px] bg-slate-900/90 rounded-xl overflow-auto p-4 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasRef}
                className="max-h-[60vh] max-w-full object-contain shadow-2xl rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
