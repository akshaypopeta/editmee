import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  RefreshCw,
  Download,
  FileCheck,
  Sparkles,
  Layers,
  FileImage,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ImageConverterWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);
  const [targetFormat, setTargetFormat] = useState<
    'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp' | 'image/x-icon'
  >('image/webp');
  const [quality, setQuality] = useState(90);

  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Image
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
    } catch (err) {
      console.error('Error loading image for converter:', err);
    }
  };

  // Convert whenever parameters change
  useEffect(() => {
    if (!imgElement || !file) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const res = await ImageEngine.convertFormat(imgElement, targetFormat, quality / 100);
        if (!isMounted) return;
        setConvertedBlob(res.blob);
        setConvertedUrl(URL.createObjectURL(res.blob));
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
  }, [imgElement, file, targetFormat, quality]);

  // Download converted file
  const handleDownload = () => {
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
      toolName: 'Image Converter',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Converted to ${ext.toUpperCase()} (${FileEngine.formatBytes(convertedBlob.size)})`,
    });
  };

  return (
    <div id="image-converter-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Image Format Converter
              {convertedBlob && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                  {FileEngine.formatBytes(convertedBlob.size)}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">Instant browser-based format transformation (PNG, JPG, WebP, BMP, ICO)</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <label
              htmlFor="converter-change-file"
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Change Image
              <input
                id="converter-change-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Converted
            </button>
          </div>
        )}
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
              <RefreshCw className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Convert image format effortlessly</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Switch between modern WebP, lossless PNG, standard JPEG, BMP, and multi-icon Windows ICO formats.
            </p>
            <label
              htmlFor="converter-init-file"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image to Convert
              <input
                id="converter-init-file"
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
              <span className="font-semibold text-slate-200 block mb-1">Target Format</span>

              {/* Format Tiles */}
              <div className="space-y-2">
                {[
                  {
                    id: 'image/webp',
                    name: 'WebP (Next-Gen)',
                    desc: 'Smallest file size with alpha transparency & high fidelity',
                  },
                  {
                    id: 'image/png',
                    name: 'PNG (Lossless)',
                    desc: 'Preserves sharp graphics, icons, and transparent alpha layers',
                  },
                  {
                    id: 'image/jpeg',
                    name: 'JPEG (Standard)',
                    desc: 'Universal compatibility across all devices and printers',
                  },
                  {
                    id: 'image/x-icon',
                    name: 'ICO (Favicon Studio)',
                    desc: 'Generates multi-resolution icon binary (16, 32, 48, 64px)',
                  },
                  {
                    id: 'image/bmp',
                    name: 'BMP (Bitmap)',
                    desc: 'Standard uncompressed Windows 24-bit bitmap format',
                  },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setTargetFormat(fmt.id as any)}
                    className={`w-full p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      targetFormat === fmt.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{fmt.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{fmt.desc}</div>
                  </button>
                ))}
              </div>

              {/* Quality Slider (for JPEG / WebP) */}
              {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                <div className="pt-3 border-t border-slate-800">
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>Quality Level</span>
                    <span className="font-mono text-indigo-400">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Right Stage: Converted Preview */}
            <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center">
              <div className="max-w-md bg-slate-900/60 rounded-xl border border-slate-800 p-4 flex flex-col items-center shadow-xl">
                <div className="w-full flex items-center justify-between mb-3 text-xs font-semibold">
                  <span className="text-slate-300">Target Preview</span>
                  {convertedBlob && (
                    <span className="font-mono text-indigo-400">
                      {FileEngine.formatBytes(convertedBlob.size)}
                    </span>
                  )}
                </div>
                {convertedUrl && (
                  <img
                    src={convertedUrl}
                    alt="Converted preview"
                    className="max-h-[60vh] object-contain rounded-lg border border-slate-800"
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
