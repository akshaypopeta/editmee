import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  RefreshCw,
  Download,
  FolderArchive,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  FileImage,
} from 'lucide-react';

interface BatchConvertItem {
  id: string;
  file: File;
  targetFormat: string;
  blob: Blob | null;
  status: 'pending' | 'converting' | 'done' | 'error';
}

export const ImageConverterWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single file state
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [targetFormat, setTargetFormat] = useState<
    'image/webp' | 'image/png' | 'image/jpeg' | 'image/bmp' | 'image/x-icon'
  >('image/webp');
  const [quality, setQuality] = useState(90);
  const [icoSizes, setIcoSizes] = useState<number[]>([16, 32, 48]);
  const [fallbackBg, setFallbackBg] = useState<'#ffffff' | '#000000'>('#ffffff');

  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Batch state
  const [batchItems, setBatchItems] = useState<BatchConvertItem[]>([]);
  const [batchTargetFormat, setBatchTargetFormat] = useState<
    'image/webp' | 'image/png' | 'image/jpeg'
  >('image/webp');
  const [batchQuality, setBatchQuality] = useState(90);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Load single image
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
    } catch (err) {
      console.error('Error loading image for converter:', err);
    }
  };

  // Convert single image
  useEffect(() => {
    if (!imgElement || !file) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        if (targetFormat === 'image/x-icon') {
          const blob = await ImageEngine.generateIcoFile(imgElement, icoSizes);
          if (!isMounted) return;
          setConvertedBlob(blob);
          setConvertedUrl(URL.createObjectURL(blob));
        } else {
          const res = await ImageEngine.convertFormat(imgElement, targetFormat, quality / 100);
          if (!isMounted) return;
          setConvertedBlob(res.blob);
          setConvertedUrl(URL.createObjectURL(res.blob));
        }
      } catch (err) {
        console.error('Conversion error:', err);
      } finally {
        if (isMounted) setIsProcessing(false);
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imgElement, file, targetFormat, quality, icoSizes, fallbackBg]);

  // Download single converted image
  const handleDownloadSingle = () => {
    if (!convertedBlob || !file) return;
    const ext =
      targetFormat === 'image/jpeg'
        ? 'jpg'
        : targetFormat === 'image/webp'
        ? 'webp'
        : targetFormat === 'image/bmp'
        ? 'bmp'
        : targetFormat === 'image/x-icon'
        ? 'ico'
        : 'png';

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_converted.${ext}`;
    FileEngine.downloadBlob(convertedBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-converter',
      toolName: 'Image Format Converter',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Converted to ${ext.toUpperCase()} (${FileEngine.formatBytes(convertedBlob.size)})`,
    });
  };

  // Batch upload
  const handleBatchUpload = (files: FileList | null) => {
    if (!files) return;
    const newItems: BatchConvertItem[] = Array.from(files).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      file: f,
      targetFormat: batchTargetFormat,
      blob: null,
      status: 'pending',
    }));
    setBatchItems((prev) => [...prev, ...newItems]);
  };

  // Process batch conversion
  const processBatchQueue = async () => {
    if (batchItems.length === 0 || isBatchProcessing) return;
    setIsBatchProcessing(true);

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      if (item.status === 'done') continue;

      setBatchItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'converting' } : it))
      );

      try {
        const img = await FileEngine.loadImage(item.file);
        const res = await ImageEngine.convertFormat(img, batchTargetFormat, batchQuality / 100);

        setBatchItems((prev) =>
          prev.map((it, idx) =>
            idx === i
              ? {
                  ...it,
                  blob: res.blob,
                  status: 'done',
                }
              : it
          )
        );
      } catch (err) {
        console.error('Batch convert item error:', err);
        setBatchItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'error' } : it))
        );
      }
    }

    setIsBatchProcessing(false);
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const completed = batchItems.filter((it) => it.status === 'done' && it.blob);
    if (completed.length === 0) return;

    const zip = new JSZip();
    const ext = batchTargetFormat === 'image/jpeg' ? 'jpg' : batchTargetFormat === 'image/webp' ? 'webp' : 'png';

    completed.forEach((it) => {
      const baseName = it.file.name.replace(/\.[^/.]+$/, '');
      zip.file(`${baseName}_converted.${ext}`, it.blob!);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    FileEngine.downloadBlob(content, 'converted_images_bundle.zip');

    storageEngine.addHistoryItem({
      toolId: 'image-converter',
      toolName: 'Batch Image Converter',
      category: 'images',
      status: 'completed',
      outputFilename: 'converted_images_bundle.zip',
      outputSummary: `Batch converted ${completed.length} images to ${ext.toUpperCase()}`,
    });
  };

  return (
    <div id="image-converter-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
              <RefreshCw className="w-5 h-5" />
            </span>
            Image Format Converter & Favicon Studio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Convert seamlessly between PNG, JPEG, WebP, BMP, and ICO favicon packages with multi-resolution generation.
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
            Single Converter
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
        !file ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-indigo-500 transition-colors">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to convert</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              Supports PNG, JPG, WebP, BMP, GIF, and SVG. 100% client-side privacy-first conversion.
            </p>
            <label
              htmlFor="converter-file-input"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4" /> Choose Image File
              <input
                id="converter-file-input"
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
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Target Settings</h3>
                <label
                  htmlFor="converter-change-file"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Change Image
                  <input
                    id="converter-change-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  />
                </label>
              </div>

              {/* Target Format Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Convert To</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'image/webp', label: 'WebP', desc: 'Modern & Smallest' },
                    { id: 'image/png', label: 'PNG', desc: 'Lossless & Alpha' },
                    { id: 'image/jpeg', label: 'JPEG', desc: 'Universal Photo' },
                    { id: 'image/x-icon', label: 'ICO', desc: 'Multi-Res Favicon' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setTargetFormat(fmt.id as any)}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        targetFormat === fmt.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-1 ring-indigo-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-xs font-bold">{fmt.label}</span>
                      <span className="text-[10px] text-slate-500">{fmt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lossy Quality Slider */}
              {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>Encoding Quality</span>
                    <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Favicon Multi-Resolution Checkboxes */}
              {targetFormat === 'image/x-icon' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">Bundled Icon Sizes</label>
                  <div className="flex items-center gap-3">
                    {[16, 32, 48, 64].map((size) => (
                      <label key={size} className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={icoSizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setIcoSizes((prev) => [...prev, size].sort((a, b) => a - b));
                            } else if (icoSizes.length > 1) {
                              setIcoSizes((prev) => prev.filter((s) => s !== size));
                            }
                          }}
                          className="w-4 h-4 accent-indigo-600 rounded"
                        />
                        {size}px
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversion Stats Card */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Source Format:</span>
                  <span className="font-mono text-slate-800 uppercase">{file.type.split('/')[1] || 'IMAGE'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Original Size:</span>
                  <span className="font-mono text-slate-800">{FileEngine.formatBytes(file.size)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Output Size:</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {convertedBlob ? FileEngine.formatBytes(convertedBlob.size) : 'Calculating...'}
                  </span>
                </div>
              </div>

              {/* Download button */}
              <button
                type="button"
                onClick={handleDownloadSingle}
                disabled={!convertedBlob || isProcessing}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Converted File
              </button>
            </div>

            {/* Preview Stage (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-700">Converted Live Preview</span>
                {convertedBlob && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {FileEngine.formatBytes(convertedBlob.size)}
                  </span>
                )}
              </div>

              <div className="min-h-[380px] bg-slate-900 rounded-xl p-4 flex items-center justify-center border border-slate-800">
                {convertedUrl ? (
                  <img
                    src={convertedUrl}
                    alt="Converted output"
                    className="max-h-[60vh] max-w-full object-contain rounded shadow-xl"
                  />
                ) : (
                  <div className="text-slate-500 text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Converting image...
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        /* BATCH CONVERSION MODE */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-indigo-500 transition-colors">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FolderArchive className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Batch Image Converter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                Upload multiple images in any format. Convert them all simultaneously and download as a single ZIP bundle.
              </p>
              <label
                htmlFor="batch-converter-input"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" /> Add Files to Convert
                <input
                  id="batch-converter-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleBatchUpload(e.target.files)}
                />
              </label>
            </div>

            {/* Batch Parameters */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
                Batch Target
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Format</label>
                <select
                  value={batchTargetFormat}
                  onChange={(e: any) => setBatchTargetFormat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800"
                >
                  <option value="image/webp">WebP (Recommended web format)</option>
                  <option value="image/png">PNG (Lossless / Transparent)</option>
                  <option value="image/jpeg">JPEG (Universal photo)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Quality</span>
                  <span className="font-mono text-indigo-600">{batchQuality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={batchQuality}
                  onChange={(e) => setBatchQuality(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={processBatchQueue}
                  disabled={batchItems.length === 0 || isBatchProcessing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${isBatchProcessing ? 'animate-spin' : ''}`} />
                  {isBatchProcessing ? 'Converting Queue...' : 'Convert All Files'}
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

          {/* Queue List */}
          {batchItems.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Files to Convert ({batchItems.length})
                </span>
                <button
                  type="button"
                  onClick={() => setBatchItems([])}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {batchItems.map((item) => (
                  <div key={item.id} className="p-3.5 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                        <FileImage className="w-4 h-4 text-indigo-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{item.file.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {FileEngine.formatBytes(item.file.size)} → {batchTargetFormat.split('/')[1].toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.status === 'converting' && (
                        <span className="text-indigo-600 font-semibold flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Converting
                        </span>
                      )}
                      {item.status === 'done' && item.blob && (
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-indigo-600 font-bold">
                            {FileEngine.formatBytes(item.blob.size)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const ext =
                                batchTargetFormat === 'image/jpeg'
                                  ? 'jpg'
                                  : batchTargetFormat === 'image/webp'
                                  ? 'webp'
                                  : 'png';
                              const base = item.file.name.replace(/\.[^/.]+$/, '');
                              FileEngine.downloadBlob(item.blob!, `${base}_converted.${ext}`);
                            }}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-lg border border-slate-200 cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {item.status === 'pending' && <span className="text-slate-400 italic">Ready</span>}
                      {item.status === 'error' && <span className="text-red-500 font-semibold">Failed</span>}
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
