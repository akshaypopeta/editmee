import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Download,
  Split,
  ZoomIn,
  Sliders,
  Layers,
  ArrowRight,
  Maximize2,
  Zap,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

export const ImageUpscalerWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [scaleFactor, setScaleFactor] = useState<number>(2); // 2, 3, 4
  const [algorithm, setAlgorithm] = useState<'smooth' | 'crisp' | 'sharpen'>('smooth');
  const [sharpenAmount, setSharpenAmount] = useState<number>(25);

  const [upscaledBlob, setUpscaledBlob] = useState<Blob | null>(null);
  const [upscaledUrl, setUpscaledUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Split view slider
  const [splitPos, setSplitPos] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplit = useRef<boolean>(false);

  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
    } catch (err) {
      console.error('Error loading image for upscaler:', err);
    }
  };

  // Perform upscaling
  useEffect(() => {
    if (!imgElement) return;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      const origW = imgElement.naturalWidth;
      const origH = imgElement.naturalHeight;
      const targetW = origW * scaleFactor;
      const targetH = origH * scaleFactor;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (algorithm === 'crisp') {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(imgElement, 0, 0, targetW, targetH);
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(imgElement, 0, 0, targetW, targetH);

        // Apply sharpening if requested
        if (algorithm === 'sharpen' && sharpenAmount > 0) {
          const imgData = ctx.getImageData(0, 0, targetW, targetH);
          const data = imgData.data;
          const copy = new Uint8ClampedArray(data);
          const strength = (sharpenAmount / 100) * 0.8;

          for (let y = 1; y < targetH - 1; y++) {
            for (let x = 1; x < targetW - 1; x++) {
              const idx = (y * targetW + x) * 4;
              for (let c = 0; c < 3; c++) {
                const current = copy[idx + c];
                const up = copy[((y - 1) * targetW + x) * 4 + c];
                const down = copy[((y + 1) * targetW + x) * 4 + c];
                const left = copy[(y * targetW + (x - 1)) * 4 + c];
                const right = copy[(y * targetW + (x + 1)) * 4 + c];

                const laplacian = 5 * current - up - down - left - right;
                data[idx + c] = Math.min(255, Math.max(0, current + (laplacian - current) * strength));
              }
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }
      }

      canvas.toBlob(
        (b) => {
          if (b) {
            setUpscaledBlob(b);
            const u = URL.createObjectURL(b);
            setUpscaledUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return u;
            });
          }
          setIsProcessing(false);
        },
        'image/png',
        0.98
      );
    }, 150);

    return () => clearTimeout(timer);
  }, [imgElement, scaleFactor, algorithm, sharpenAmount]);

  const handleDownload = () => {
    if (!upscaledBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_upscaled_${scaleFactor}x.png`;
    FileEngine.downloadBlob(upscaledBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-upscaler',
      toolName: 'Image Upscaler',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Upscaled ${scaleFactor}× to ${imgElement ? imgElement.naturalWidth * scaleFactor : 0} × ${
        imgElement ? imgElement.naturalHeight * scaleFactor : 0
      } px`,
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
    <div id="image-upscaler-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
              <Zap className="w-5 h-5" />
            </span>
            Image Upscaler & Super-Resolution
            {imgElement && (
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold font-mono">
                {scaleFactor}× ({imgElement.naturalWidth * scaleFactor} × {imgElement.naturalHeight * scaleFactor} px)
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enlarge small images up to 4× with edge enhancement, bicubic smoothing, and noise minimization.
          </p>
        </div>

        {file && (
          <button
            type="button"
            onClick={handleDownload}
            disabled={!upscaledBlob || isProcessing}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Upscaled ({scaleFactor}×)
          </button>
        )}
      </div>

      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-teal-500 transition-colors">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to upscale</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Increase resolution up to 4× without blurry artifacts. Ideal for logos, icons, and small photos.
          </p>
          <label
            htmlFor="upscaler-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Zap className="w-4 h-4" /> Choose Image File
            <input
              id="upscaler-file-input"
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
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Upscaling Multiplier</h3>
              <label
                htmlFor="upscaler-change-file"
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                Change Image
                <input
                  id="upscaler-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Scale Factors: 2x, 3x, 4x */}
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScaleFactor(s)}
                  className={`py-3 rounded-xl border text-center transition-all cursor-pointer ${
                    scaleFactor === s
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-lg font-black">{s}×</span>
                  <span className="text-[10px] opacity-80">
                    {s === 2 ? 'Double' : s === 3 ? 'Triple' : 'Quadruple'}
                  </span>
                </button>
              ))}
            </div>

            {/* Algorithm Choice */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Enhancement Mode</label>
              <div className="space-y-2">
                {[
                  { id: 'smooth', label: 'Bicubic High-Fidelity', desc: 'Smooth gradient reconstruction for photos' },
                  { id: 'sharpen', label: 'Edge-Enhancing Reconstruction', desc: 'Sharpens contours and micro-details' },
                  { id: 'crisp', label: 'Pixel-Art Sharp', desc: 'Preserves sharp block boundaries for icons' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setAlgorithm(mode.id as any)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      algorithm === mode.id
                        ? 'bg-teal-50 border-teal-500 text-teal-950 ring-1 ring-teal-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-xs font-bold">{mode.label}</span>
                    <span className="text-[10px] text-slate-500">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sharpen slider if sharpen mode */}
            {algorithm === 'sharpen' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Sharpen Strength</span>
                  <span className="font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {sharpenAmount}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={sharpenAmount}
                  onChange={(e) => setSharpenAmount(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            )}

            {/* Dimension Readout */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Original:</span>
                <span className="font-mono text-slate-800">
                  {imgElement?.naturalWidth} × {imgElement?.naturalHeight} px
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Upscaled ({scaleFactor}×):</span>
                <span className="font-mono font-bold text-teal-600">
                  {imgElement ? imgElement.naturalWidth * scaleFactor : 0} ×{' '}
                  {imgElement ? imgElement.naturalHeight * scaleFactor : 0} px
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Output Format:</span>
                <span className="font-mono text-slate-800">PNG (Uncompressed)</span>
              </div>
            </div>
          </div>

          {/* Interactive Split Comparison (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Before / After Split Inspection</span>
              <span className="text-[11px] font-mono text-slate-400">Slide to compare pixel detail</span>
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
              {/* Upscaled Background */}
              {upscaledUrl && (
                <img
                  src={upscaledUrl}
                  alt="Upscaled"
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

              {/* Split handle */}
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
                1× Original ({imgElement?.naturalWidth} × {imgElement?.naturalHeight})
              </span>
              <span className="absolute bottom-3 right-3 bg-teal-600/90 text-white text-[10px] font-mono px-2 py-1 rounded-md z-20">
                {scaleFactor}× Upscaled ({imgElement ? imgElement.naturalWidth * scaleFactor : 0} ×{' '}
                {imgElement ? imgElement.naturalHeight * scaleFactor : 0})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
