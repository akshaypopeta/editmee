import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Minimize2,
  Download,
  CheckCircle2,
  ArrowRight,
  Sliders,
  FileCheck,
  Split,
  FolderArchive,
  Trash2,
  RefreshCw,
  Info,
  Check,
  Layers,
} from 'lucide-react';

interface BatchItem {
  id: string;
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercent: number;
  blob: Blob | null;
  status: 'pending' | 'processing' | 'done' | 'error';
}

export const ImageCompressorWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single file state
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [mode, setMode] = useState<'quality' | 'target_size'>('quality');
  const [quality, setQuality] = useState(75);
  const [targetKb, setTargetKb] = useState(200);
  const [format, setFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [scale, setScale] = useState<number>(100);

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [savingsPercent, setSavingsPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Split comparison
  const [showSplit, setShowSplit] = useState(true);
  const [splitPos, setSplitPos] = useState(50);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplit = useRef(false);

  // Batch compression state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchFormat, setBatchFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/webp');
  const [batchQuality, setBatchQuality] = useState(75);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Load single image
  const handleSingleUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      setOriginalSize(selectedFile.size);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
      setTargetKb(Math.max(30, Math.round((selectedFile.size * 0.45) / 1024)));
    } catch (e) {
      console.error('Error loading image for compression:', e);
    }
  };

  // Perform single compression whenever parameters change
  useEffect(() => {
    if (!imgElement || !file) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        let workImg = imgElement;
        // Apply downscaling if scale < 100
        if (scale < 100) {
          const scaledW = Math.max(1, Math.round((imgElement.naturalWidth * scale) / 100));
          const scaledH = Math.max(1, Math.round((imgElement.naturalHeight * scale) / 100));
          const downCanvas = document.createElement('canvas');
          downCanvas.width = scaledW;
          downCanvas.height = scaledH;
          const dCtx = downCanvas.getContext('2d');
          if (dCtx) {
            dCtx.drawImage(imgElement, 0, 0, scaledW, scaledH);
            const dataUrl = downCanvas.toDataURL(format, quality / 100);
            const tempImg = new Image();
            await new Promise((res) => {
              tempImg.onload = res;
              tempImg.src = dataUrl;
            });
            workImg = tempImg;
          }
        }

        if (mode === 'quality') {
          const res = await ImageEngine.compressImage(workImg, quality / 100, format);
          if (!isMounted) return;
          setCompressedBlob(res.blob);
          setCompressedSize(res.blob.size);
          const savings = originalSize > 0 ? Math.max(0, Math.round(((originalSize - res.blob.size) / originalSize) * 100)) : 0;
          setSavingsPercent(savings);
          setCompressedUrl(URL.createObjectURL(res.blob));
        } else {
          const res = await ImageEngine.compressToTargetSize(workImg, targetKb, format as any);
          if (!isMounted) return;
          setCompressedBlob(res.blob);
          setCompressedSize(res.blob.size);
          const savings = originalSize > 0 ? Math.max(0, Math.round(((originalSize - res.blob.size) / originalSize) * 100)) : 0;
          setSavingsPercent(savings);
          setCompressedUrl(URL.createObjectURL(res.blob));
        }
      } catch (err) {
        console.error('Compression calculation error:', err);
      } finally {
        if (isMounted) setIsProcessing(false);
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imgElement, file, mode, quality, targetKb, format, scale, originalSize]);

  // Handle Split dragging
  const handleSplitMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingSplit.current || !splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleSplitTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!splitContainerRef.current || e.touches.length === 0) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  // Download single compressed image
  const handleDownloadSingle = () => {
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

  // Batch upload handler
  const handleBatchUpload = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchItem[] = Array.from(files).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      originalSize: f.size,
      compressedSize: 0,
      savingsPercent: 0,
      blob: null,
      status: 'pending',
    }));
    setBatchItems((prev) => [...prev, ...newItems]);
  };

  // Run batch compression
  const processBatchQueue = async () => {
    if (batchItems.length === 0 || isBatchProcessing) return;
    setIsBatchProcessing(true);

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      if (item.status === 'done') continue;

      setBatchItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'processing' } : it))
      );

      try {
        const img = await FileEngine.loadImage(item.file);
        const res = await ImageEngine.compressImage(img, batchQuality / 100, batchFormat);
        const savings =
          item.originalSize > 0
            ? Math.max(0, Math.round(((item.originalSize - res.blob.size) / item.originalSize) * 100))
            : 0;

        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  blob: res.blob,
                  compressedSize: res.blob.size,
                  savingsPercent: savings,
                  status: 'done',
                }
              : it
          )
        );
      } catch (err) {
        console.error('Batch item error:', err);
        setBatchItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'error' } : it))
        );
      }
    }

    setIsBatchProcessing(false);
  };

  // Download all batch items as ZIP
  const handleDownloadAllZip = async () => {
    const completed = batchItems.filter((it) => it.status === 'done' && it.blob);
    if (completed.length === 0) return;

    const zip = new JSZip();
    const ext = batchFormat === 'image/jpeg' ? 'jpg' : batchFormat === 'image/webp' ? 'webp' : 'png';

    completed.forEach((it, idx) => {
      const baseName = it.file.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_compressed.${ext}`, it.blob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    FileEngine.downloadBlob(content, 'compressed_images_bundle.zip');

    storageEngine.addHistoryItem({
      toolId: 'image-compressor',
      toolName: 'Batch Image Compressor',
      category: 'images',
      status: 'completed',
      outputFilename: 'compressed_images_bundle.zip',
      outputSummary: `Compressed ${completed.length} images into ZIP bundle`,
    });
  };

  return (
    <div id="image-compressor-workspace" className="space-y-6">
      {/* Top Banner & Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <Minimize2 className="w-5 h-5" />
            </span>
            Image Compressor
            {activeTab === 'single' && savingsPercent > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                -{savingsPercent}% Saved
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Lossless and lossy client-side optimization. Reduce file size up to 90% without visible quality loss.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'single' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Image
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'batch' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            Batch Queue ({batchItems.length})
          </button>
        </div>
      </div>

      {activeTab === 'single' ? (
        /* SINGLE MODE */
        !file ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-emerald-500 transition-colors">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Minimize2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to compress</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Supports JPEG, PNG, WebP, BMP, and GIF. Images are processed locally on your machine for 100% privacy.
            </p>
            <label
              htmlFor="single-compress-file"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" /> Choose Image File
              <input
                id="single-compress-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleSingleUpload(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls (4 Cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Compression Settings
                </h3>
                <label
                  htmlFor="change-single-file"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  Change Image
                  <input
                    id="change-single-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleSingleUpload(e.target.files[0])}
                  />
                </label>
              </div>

              {/* Mode Switcher */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Compression Strategy</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode('quality')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'quality' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quality Level
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('target_size')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      mode === 'target_size' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Target Budget (KB)
                  </button>
                </div>
              </div>

              {/* Quality or Target Sliders */}
              {mode === 'quality' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Quality Slider</span>
                    <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  {/* Preset chips */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[
                      { label: 'Max (50%)', val: 50 },
                      { label: 'Balanced (75%)', val: 75 },
                      { label: 'High (90%)', val: 90 },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setQuality(p.val)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer ${
                          quality === p.val
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Target Max File Size</span>
                    <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {targetKb} KB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max={Math.max(300, Math.round(originalSize / 1024))}
                    value={targetKb}
                    onChange={(e) => setTargetKb(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>15 KB</span>
                    <span>Max {Math.round(originalSize / 1024)} KB</span>
                  </div>
                </div>
              )}

              {/* Output Format */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Output Format</label>
                <select
                  value={format}
                  onChange={(e: any) => setFormat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="image/webp">WebP (Modern, Smallest size)</option>
                  <option value="image/jpeg">JPEG (Universal photo compatibility)</option>
                  <option value="image/png">PNG (Preserves transparency)</option>
                </select>
              </div>

              {/* Scale Downsampling */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                  <span>Resolution Scale</span>
                  <span className="font-mono text-slate-600">{scale}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[100, 80, 60, 50].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setScale(s)}
                      className={`py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                        scale === s
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Savings Stat Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Original Size:</span>
                  <span className="font-mono font-medium text-slate-700">{FileEngine.formatBytes(originalSize)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Compressed Size:</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {isProcessing ? 'Optimizing...' : FileEngine.formatBytes(compressedSize)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Space Saved:</span>
                  <span className="font-mono text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {savingsPercent}% ({FileEngine.formatBytes(Math.max(0, originalSize - compressedSize))})
                  </span>
                </div>
              </div>

              {/* Download Button */}
              <button
                type="button"
                onClick={handleDownloadSingle}
                disabled={!compressedBlob || isProcessing}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Compressed Image
              </button>
            </div>

            {/* Right Preview Stage (8 Cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Preview Inspection</span>
                  <button
                    type="button"
                    onClick={() => setShowSplit((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      showSplit ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    {showSplit ? 'Split Slider' : 'Side-by-Side'}
                  </button>
                </div>
                {imgElement && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {imgElement.naturalWidth} × {imgElement.naturalHeight} px
                  </span>
                )}
              </div>

              {/* Preview Canvas / Split View */}
              {showSplit ? (
                <div
                  ref={splitContainerRef}
                  onMouseDown={() => (isDraggingSplit.current = true)}
                  onMouseUp={() => (isDraggingSplit.current = false)}
                  onMouseLeave={() => (isDraggingSplit.current = false)}
                  onMouseMove={handleSplitMouseMove}
                  onTouchMove={handleSplitTouchMove}
                  className="relative h-96 sm:h-[480px] bg-slate-900 rounded-xl overflow-hidden select-none cursor-ew-resize flex items-center justify-center"
                >
                  {/* Background: Compressed */}
                  {compressedUrl && (
                    <img
                      src={compressedUrl}
                      alt="Compressed"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  )}

                  {/* Foreground: Original (Clipped by splitPos) */}
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
                          width: splitContainerRef.current ? splitContainerRef.current.clientWidth : '100%',
                        }}
                      />
                    </div>
                  )}

                  {/* Split Divider Line */}
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
                    Original ({FileEngine.formatBytes(originalSize)})
                  </span>
                  <span className="absolute bottom-3 right-3 bg-emerald-600/90 text-white text-[10px] font-mono px-2 py-1 rounded-md z-20">
                    Compressed ({FileEngine.formatBytes(compressedSize)})
                  </span>
                </div>
              ) : (
                /* Side-by-Side */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center">
                    <div className="w-full flex justify-between text-xs font-semibold text-slate-500 mb-2">
                      <span>Original</span>
                      <span className="font-mono">{FileEngine.formatBytes(originalSize)}</span>
                    </div>
                    {imgElement && (
                      <img
                        src={imgElement.src}
                        alt="Original"
                        className="max-h-72 object-contain rounded-lg border border-slate-200"
                      />
                    )}
                  </div>
                  <div className="bg-slate-50 border border-emerald-300 rounded-xl p-3 flex flex-col items-center">
                    <div className="w-full flex justify-between text-xs font-bold text-emerald-700 mb-2">
                      <span>Compressed ({savingsPercent}% saved)</span>
                      <span className="font-mono">{FileEngine.formatBytes(compressedSize)}</span>
                    </div>
                    {compressedUrl && (
                      <img
                        src={compressedUrl}
                        alt="Compressed"
                        className="max-h-72 object-contain rounded-lg border border-emerald-200"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        /* BATCH MODE */
        <div className="space-y-6">
          {/* Batch Dropzone & Global Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-emerald-500 transition-colors">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FolderArchive className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Upload Multiple Images for Batch Compression</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Select 10, 20 or more images. They will be compressed sequentially with full client-side privacy.
              </p>
              <label
                htmlFor="batch-file-input"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" /> Add Files to Queue
                <input
                  id="batch-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleBatchUpload(e.target.files)}
                />
              </label>
            </div>

            {/* Batch Global Settings */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                Batch Parameters
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Batch Format</label>
                <select
                  value={batchFormat}
                  onChange={(e: any) => setBatchFormat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="image/webp">WebP (Smallest file sizes)</option>
                  <option value="image/jpeg">JPEG (Universal standard)</option>
                  <option value="image/png">PNG (Preserves transparent edges)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Batch Quality</span>
                  <span className="font-mono text-emerald-600">{batchQuality}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={batchQuality}
                  onChange={(e) => setBatchQuality(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={processBatchQueue}
                  disabled={batchItems.length === 0 || isBatchProcessing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isBatchProcessing ? 'animate-spin' : ''}`} />
                  {isBatchProcessing ? 'Compressing Queue...' : 'Start Batch Compression'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAllZip}
                  disabled={batchItems.filter((b) => b.status === 'done').length === 0}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <FolderArchive className="w-4 h-4" /> Download All as ZIP
                </button>
              </div>
            </div>
          </div>

          {/* Queue Table */}
          {batchItems.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Files in Queue ({batchItems.length})
                </span>
                <button
                  type="button"
                  onClick={() => setBatchItems([])}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Queue
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {batchItems.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Minimize2 className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{item.file.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {FileEngine.formatBytes(item.originalSize)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {item.status === 'processing' && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Compressing
                        </span>
                      )}
                      {item.status === 'done' && (
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-emerald-600 font-bold">
                            {FileEngine.formatBytes(item.compressedSize)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] font-mono">
                            -{item.savingsPercent}%
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.blob) {
                                const ext =
                                  batchFormat === 'image/jpeg' ? 'jpg' : batchFormat === 'image/webp' ? 'webp' : 'png';
                                const base = item.file.name.replace(/\.[^/.]+$/, '');
                                FileEngine.downloadBlob(item.blob, `${base}_compressed.${ext}`);
                              }
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
                            title="Download single file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-slate-400 italic">Ready</span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-red-500 font-semibold">Failed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
