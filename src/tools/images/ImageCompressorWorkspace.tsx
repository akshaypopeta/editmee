import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Minimize2,
  Download,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  Sliders,
  FileCheck,
} from 'lucide-react';

export const ImageCompressorWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<'quality' | 'target_size'>('quality');
  const [quality, setQuality] = useState(75);
  const [targetKb, setTargetKb] = useState(250);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [savingsPercent, setSavingsPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load image
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
      setTargetKb(Math.max(50, Math.round((selectedFile.size * 0.5) / 1024)));
    } catch (e) {
      console.error('Error loading image:', e);
    }
  };

  // Perform compression whenever parameters change
  useEffect(() => {
    if (!imgElement || !file) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        if (mode === 'quality') {
          const res = await ImageEngine.compressImage(imgElement, quality / 100, format);
          if (!isMounted) return;
          setCompressedBlob(res.blob);
          setCompressedSize(res.blob.size);
          setSavingsPercent(res.savingsPercent);
          setCompressedUrl(URL.createObjectURL(res.blob));
        } else {
          const res = await ImageEngine.compressToTargetSize(imgElement, targetKb, format as any);
          if (!isMounted) return;
          setCompressedBlob(res.blob);
          setCompressedSize(res.blob.size);
          const savings = originalSize > 0 ? Math.max(0, Math.round(((originalSize - res.blob.size) / originalSize) * 100)) : 0;
          setSavingsPercent(savings);
          setCompressedUrl(URL.createObjectURL(res.blob));
        }
      } catch (err) {
        console.error('Compression error:', err);
      } finally {
        if (isMounted) setIsProcessing(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imgElement, file, mode, quality, targetKb, format, originalSize]);

  // Download compressed image
  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_compressed.${ext}`;
    FileEngine.downloadBlob(compressedBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-compressor',
      toolName: 'Image Compressor',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Reduced from ${FileEngine.formatBytes(originalSize)} to ${FileEngine.formatBytes(compressedSize)} (${savingsPercent}% saved)`,
    });
  };

  return (
    <div id="image-compressor-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Minimize2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Image Compressor
              {savingsPercent > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  -{savingsPercent}% Saved
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">Client-side lossless and lossy optimization with real-time preview</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="compressor-change-file"
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Change
              <input
                id="compressor-change-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Compressed
            </button>
          </div>
        )}
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Minimize2 className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Upload an image to compress</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Reduce file size dramatically while maintaining visual fidelity for web and apps.
            </p>
            <label
              htmlFor="compress-init-file"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image (JPEG, PNG, WebP)
              <input
                id="compress-init-file"
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
              {/* Mode Toggle */}
              <div>
                <span className="font-semibold text-slate-200 block mb-2">Compression Strategy</span>
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setMode('quality')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      mode === 'quality' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Quality Slider
                  </button>
                  <button
                    onClick={() => setMode('target_size')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-center transition-colors cursor-pointer ${
                      mode === 'target_size' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Target Size
                  </button>
                </div>
              </div>

              {/* Quality or Target Size Controls */}
              {mode === 'quality' ? (
                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5 font-medium">
                    <span>Quality Level</span>
                    <span className="font-mono text-emerald-400">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Max Compression</span>
                    <span>Lossless High</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-slate-300 mb-1.5 font-medium">
                    <span>Target Size Budget</span>
                    <span className="font-mono text-emerald-400">{targetKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max={Math.max(500, Math.round(originalSize / 1024))}
                    value={targetKb}
                    onChange={(e) => setTargetKb(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Target Format */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Output Format</label>
                <select
                  value={format}
                  onChange={(e: any) => setFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 outline-none"
                >
                  <option value="image/jpeg">JPEG (Universal / Smallest)</option>
                  <option value="image/webp">WebP (Modern Web Standard)</option>
                  <option value="image/png">PNG (Lossless Graphics)</option>
                </select>
              </div>

              {/* Compression Metric Summary Card */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3.5 space-y-2 mt-auto">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Original Size:</span>
                  <span className="font-mono text-slate-300">{FileEngine.formatBytes(originalSize)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Compressed Size:</span>
                  <span className="font-mono text-emerald-400 font-bold">{FileEngine.formatBytes(compressedSize)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Space Saved:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {savingsPercent}% ({FileEngine.formatBytes(Math.max(0, originalSize - compressedSize))})
                  </span>
                </div>
              </div>
            </div>

            {/* Right Stage: Side-by-Side Comparison */}
            <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center gap-6">
              {/* Original Preview */}
              <div className="flex-1 max-w-md bg-slate-900/60 rounded-xl border border-slate-800 p-3 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 text-xs font-semibold text-slate-400">
                  <span>Original</span>
                  <span className="font-mono text-slate-400">{FileEngine.formatBytes(originalSize)}</span>
                </div>
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt="Original"
                    className="max-h-[55vh] object-contain rounded-lg border border-slate-800"
                  />
                )}
              </div>

              {/* Arrow */}
              <div className="p-2 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 shadow-md">
                <ArrowRight className="w-5 h-5" />
              </div>

              {/* Compressed Preview */}
              <div className="flex-1 max-w-md bg-slate-900/60 rounded-xl border border-emerald-500/30 p-3 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 text-xs font-semibold text-emerald-400">
                  <span>Compressed ({savingsPercent}% saved)</span>
                  <span className="font-mono">{FileEngine.formatBytes(compressedSize)}</span>
                </div>
                {compressedUrl && (
                  <img
                    src={compressedUrl}
                    alt="Compressed"
                    className="max-h-[55vh] object-contain rounded-lg border border-emerald-500/20"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
