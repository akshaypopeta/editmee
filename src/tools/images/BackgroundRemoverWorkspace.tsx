import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Download,
  Pipette,
  Layers,
  Sliders,
  RefreshCw,
  Eye,
  Check,
  Palette,
  Eraser,
  SunMedium,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';

export const BackgroundRemoverWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Background removal parameters
  const [sampledColor, setSampledColor] = useState<{ r: number; g: number; b: number }>({
    r: 255,
    g: 255,
    b: 255,
  });
  const [tolerance, setTolerance] = useState<number>(25);
  const [feather, setFeather] = useState<number>(3);
  const [isPipetteActive, setIsPipetteActive] = useState<boolean>(false);

  // Background replacement mode
  const [bgMode, setBgMode] = useState<'transparent' | 'color' | 'studio-gradient'>('transparent');
  const [replacementColor, setReplacementColor] = useState<string>('#ffffff');

  // Preview checkerboard theme
  const [checkerTheme, setCheckerTheme] = useState<'dark' | 'light'>('dark');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Handle image upload
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);

      // Auto-sample top-left corner color as default background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pixel = ctx.getImageData(0, 0, 1, 1).data;
        setSampledColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      }
    } catch (err) {
      console.error('Error loading image for background removal:', err);
    }
  };

  // Perform background removal on canvas
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

      const targetR = sampledColor.r;
      const targetG = sampledColor.g;
      const targetB = sampledColor.b;
      const tolDist = (tolerance / 100) * 441.67; // max Euclidean distance is sqrt(255^2*3) = 441.67
      const featherRange = (feather / 100) * 100;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Euclidean color distance in RGB
        const dist = Math.sqrt(
          (r - targetR) * (r - targetR) +
          (g - targetG) * (g - targetG) +
          (b - targetB) * (b - targetB)
        );

        if (dist <= tolDist) {
          data[i + 3] = 0; // Fully transparent
        } else if (dist < tolDist + featherRange && featherRange > 0) {
          // Feathered alpha transition
          const alphaFactor = (dist - tolDist) / featherRange;
          data[i + 3] = Math.round(data[i + 3] * alphaFactor);
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Now create composite canvas with replacement background if active
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = w;
      finalCanvas.height = h;
      const fCtx = finalCanvas.getContext('2d');
      if (fCtx) {
        if (bgMode === 'color') {
          fCtx.fillStyle = replacementColor;
          fCtx.fillRect(0, 0, w, h);
        } else if (bgMode === 'studio-gradient') {
          const grad = fCtx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
          grad.addColorStop(0, '#f8fafc');
          grad.addColorStop(1, '#94a3b8');
          fCtx.fillStyle = grad;
          fCtx.fillRect(0, 0, w, h);
        }
        fCtx.drawImage(canvas, 0, 0);
      }

      // Update visible canvas
      if (canvasRef.current) {
        canvasRef.current.width = w;
        canvasRef.current.height = h;
        const dispCtx = canvasRef.current.getContext('2d');
        if (dispCtx) {
          dispCtx.clearRect(0, 0, w, h);
          dispCtx.drawImage(finalCanvas, 0, 0);
        }
      }

      finalCanvas.toBlob(
        (b) => {
          setOutputBlob(b);
          setIsProcessing(false);
        },
        bgMode === 'transparent' ? 'image/png' : 'image/jpeg',
        0.95
      );
    }, 120);

    return () => clearTimeout(timer);
  }, [imgElement, sampledColor, tolerance, feather, bgMode, replacementColor]);

  // Click on canvas to sample color via pipette
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPipetteActive || !canvasRef.current || !imgElement) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = imgElement.naturalWidth / rect.width;
    const scaleY = imgElement.naturalHeight / rect.height;

    const clickX = Math.round((e.clientX - rect.left) * scaleX);
    const clickY = Math.round((e.clientY - rect.top) * scaleY);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imgElement.naturalWidth;
    tempCanvas.height = imgElement.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(imgElement, 0, 0);
      const pixel = ctx.getImageData(clickX, clickY, 1, 1).data;
      setSampledColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
      setIsPipetteActive(false);
    }
  };

  // Download transparent image
  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const ext = bgMode === 'transparent' ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_no_bg.${ext}`;
    FileEngine.downloadBlob(outputBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'bg-remover',
      toolName: 'Background Remover',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Background isolated (Tolerance: ${tolerance}%)`,
    });
  };

  const sampledHex = `#${((1 << 24) + (sampledColor.r << 16) + (sampledColor.g << 8) + sampledColor.b)
    .toString(16)
    .slice(1)}`;

  return (
    <div id="bg-remover-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Eraser className="w-5 h-5" />
            </span>
            Background Remover & Studio Isolator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pick background colors directly from your image, adjust tolerance with feathered edges, and composite studio backdrops.
          </p>
        </div>

        {file && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={!outputBlob || isProcessing}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Result
          </button>
        )}
      </div>

      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-purple-500 transition-colors">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eraser className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to remove background</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Supports portraits, product photography, logos, and graphics. Runs 100% locally in your browser.
          </p>
          <label
            htmlFor="bg-remover-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Eraser className="w-4 h-4" /> Choose Image File
            <input
              id="bg-remover-input"
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
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Color Sampling</h3>
              <label
                htmlFor="bg-change-file"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                Change Image
                <input
                  id="bg-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Eyedropper / Color Swatch */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Key Background Color</label>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border-2 border-slate-200 shadow-sm shrink-0"
                  style={{ backgroundColor: sampledHex }}
                />
                <div className="flex-1">
                  <span className="font-mono text-xs font-bold text-slate-800">{sampledHex.toUpperCase()}</span>
                  <span className="block text-[11px] text-slate-400">
                    RGB({sampledColor.r}, {sampledColor.g}, {sampledColor.b})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPipetteActive((prev) => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPipetteActive
                      ? 'bg-purple-600 text-white shadow-md animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Pipette className="w-3.5 h-3.5" />
                  {isPipetteActive ? 'Click on Canvas...' : 'Pick Color'}
                </button>
              </div>
            </div>

            {/* Sliders: Tolerance & Feather */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Color Tolerance</span>
                  <span className="font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {tolerance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Exact Match</span>
                  <span>Wide Range</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Edge Softness / Feather</span>
                  <span className="font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {feather}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Background Replacement Studio */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">Replacement Backdrop</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setBgMode('transparent')}
                  className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    bgMode === 'transparent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Alpha PNG
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('color')}
                  className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    bgMode === 'color' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Solid Color
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode('studio-gradient')}
                  className={`py-1.5 font-bold rounded-lg transition-colors cursor-pointer ${
                    bgMode === 'studio-gradient' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Studio Grey
                </button>
              </div>

              {bgMode === 'color' && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-slate-600 font-semibold">Choose Color:</span>
                  <input
                    type="color"
                    value={replacementColor}
                    onChange={(e) => setReplacementColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs text-slate-700">{replacementColor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Preview Stage (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Studio Stage</span>
                {isPipetteActive && (
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full animate-bounce">
                    Click anywhere on image to sample background
                  </span>
                )}
              </div>

              {/* Checker Theme toggle */}
              <button
                type="button"
                onClick={() => setCheckerTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Contrast: {checkerTheme === 'dark' ? 'Dark Grid' : 'Light Grid'}
              </button>
            </div>

            {/* Canvas Container */}
            <div
              className={`min-h-[380px] sm:min-h-[460px] rounded-xl overflow-auto p-4 flex items-center justify-center border border-slate-800 ${
                checkerTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'
              }`}
            >
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`max-h-[60vh] max-w-full object-contain rounded shadow-2xl ${
                  isPipetteActive ? 'cursor-crosshair' : 'cursor-default'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
