import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine, POPULAR_RESIZE_PRESETS, ResizePreset } from '../../core/image-engine/ImageEngine';
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
} from 'lucide-react';

export const ImageResizerWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [targetW, setTargetW] = useState(0);
  const [targetH, setTargetH] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [scalePercent, setScalePercent] = useState(100);
  const [mode, setMode] = useState<'dimensions' | 'percentage' | 'preset'>('dimensions');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');

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
      setScalePercent(100);
    } catch (err) {
      console.error('Error loading image for resizer:', err);
    }
  };

  // Re-render resized canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current || targetW <= 0 || targetH <= 0) return;

    ImageEngine.processImage(imgElement, {
      width: targetW,
      height: targetH,
    }).then((processedCanvas) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;
      canvasRef.current.width = processedCanvas.width;
      canvasRef.current.height = processedCanvas.height;
      ctx.drawImage(processedCanvas, 0, 0);
    });
  }, [imgElement, targetW, targetH]);

  // Width Change
  const handleWidthChange = (w: number) => {
    setTargetW(w);
    if (maintainAspect && origW > 0) {
      setTargetH(Math.max(1, Math.round((w / origW) * origH)));
    }
  };

  // Height Change
  const handleHeightChange = (h: number) => {
    setTargetH(h);
    if (maintainAspect && origH > 0) {
      setTargetW(Math.max(1, Math.round((h / origH) * origW)));
    }
  };

  // Percentage Change
  const handlePercentChange = (pct: number) => {
    setScalePercent(pct);
    if (origW > 0 && origH > 0) {
      setTargetW(Math.max(1, Math.round((origW * pct) / 100)));
      setTargetH(Math.max(1, Math.round((origH * pct) / 100)));
    }
  };

  // Preset Selection
  const handlePresetSelect = (preset: ResizePreset) => {
    setTargetW(preset.width);
    setTargetH(preset.height);
    setMaintainAspect(false);
  };

  // Download Resized Image
  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_${targetW}x${targetH}.${ext}`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'image-resizer',
        toolName: 'Image Resizer',
        category: 'images',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Resized from ${origW}x${origH} to ${targetW}x${targetH}`,
      });
    }, exportFormat);
  };

  return (
    <div id="image-resizer-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Image Resizer & Scaler
              {targetW > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                  {targetW} × {targetH} px
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">High-precision pixel scaling and popular social media presets</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e: any) => setExportFormat(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP</option>
            </select>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Resized
            </button>
          </div>
        )}
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Maximize2 className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Upload an image to resize</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Scale images to exact dimensions or instant presets with multi-step downsampling and bicubic smoothing.
            </p>
            <label
              htmlFor="resizer-init-file"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image
              <input
                id="resizer-init-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <>
            {/* Left Control Panel */}
            <div className="w-80 bg-slate-900 border-r border-slate-800 p-4 space-y-4 flex flex-col text-xs overflow-y-auto">
              {/* Method Selector */}
              <div>
                <span className="font-semibold text-slate-200 block mb-2">Resize Mode</span>
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setMode('dimensions')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      mode === 'dimensions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Exact (px)
                  </button>
                  <button
                    onClick={() => setMode('percentage')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      mode === 'percentage' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Scale (%)
                  </button>
                </div>
              </div>

              {/* Exact Dimension Controls */}
              {mode === 'dimensions' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={targetW}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={targetH}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setMaintainAspect(!maintainAspect)}
                    className={`w-full py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                      maintainAspect
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                        : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {maintainAspect ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    {maintainAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-300 font-medium">
                    <span>Scaling Percentage</span>
                    <span className="font-mono text-blue-400">{scalePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    value={scalePercent}
                    onChange={(e) => handlePercentChange(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="grid grid-cols-4 gap-1">
                    {[25, 50, 75, 200].map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePercentChange(p)}
                        className="py-1 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Presets */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Presets
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {POPULAR_RESIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-medium text-slate-200">{preset.name}</div>
                        <div className="text-[10px] text-slate-500">{preset.category} ({preset.aspect})</div>
                      </div>
                      <span className="text-[11px] text-blue-400 font-mono">
                        {preset.width}x{preset.height}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Stage: Canvas Viewport */}
            <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:24px_24px]">
                <canvas ref={canvasRef} className="max-h-[65vh] max-w-full object-contain block" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
