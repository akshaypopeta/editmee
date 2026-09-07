import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Download,
  RefreshCw,
  Sliders,
  Check,
  Maximize2,
  Compass,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

export const ImageRotatorWorkspace: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0); // -180 to 180
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);
  const [autoExpand, setAutoExpand] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<'transparent' | '#ffffff' | '#000000'>('transparent');

  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outDimensions, setOutDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // Render transformed image on canvas
  useEffect(() => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rad = (rotation * Math.PI) / 180;
      const cos = Math.abs(Math.cos(rad));
      const sin = Math.abs(Math.sin(rad));

      let w = img.naturalWidth;
      let h = img.naturalHeight;

      if (autoExpand) {
        w = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
        h = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);
      }

      canvas.width = Math.max(1, w);
      canvas.height = Math.max(1, h);

      if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      setOutDimensions({ width: canvas.width, height: canvas.height });

      canvas.toBlob((b) => {
        if (b) {
          setPreviewBlob(b);
          const u = URL.createObjectURL(b);
          setPreviewUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return u;
          });
        }
        setIsProcessing(false);
      }, bgColor === 'transparent' ? 'image/png' : imageFile?.type || 'image/jpeg');
    };
    img.src = imageSrc;
  }, [imageSrc, rotation, flipH, flipV, autoExpand, bgColor, imageFile]);

  const handleDownload = () => {
    if (!previewBlob || !imageFile) return;
    const ext = bgColor === 'transparent' ? 'png' : imageFile.name.split('.').pop() || 'png';
    const base = imageFile.name.replace(/\.[^/.]+$/, '');
    const filename = `${base}_rotated.${ext}`;
    FileEngine.downloadBlob(previewBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-rotator',
      toolName: 'Image Rotator',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Rotated ${rotation}° (Flip H: ${flipH}, Flip V: ${flipV})`,
    });
  };

  return (
    <div id="image-rotator-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20">
              <RotateCw className="w-5 h-5" />
            </span>
            Image Rotator, Flipper & Straightener
            {outDimensions && (
              <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold font-mono">
                {outDimensions.width} × {outDimensions.height} px
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rotate clockwise or counter-clockwise, mirror horizontally or vertically, and fine-tune angles with auto-expanding bounds.
          </p>
        </div>

        {imageFile && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRotation(0);
                setFlipH(false);
                setFlipV(false);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!previewBlob || isProcessing}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Transformed
            </button>
          </div>
        )}
      </div>

      {!imageSrc ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-orange-500 transition-colors">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RotateCw className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to rotate & flip</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Supports PNG, JPEG, WebP, GIF, and BMP. Fast GPU-accelerated canvas rotation with zero compression artifacts.
          </p>
          <label
            htmlFor="rotator-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <RotateCw className="w-4 h-4" /> Choose Image File
            <input
              id="rotator-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Orientation Controls</h3>
              <label
                htmlFor="rotator-change-file"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                Change Image
                <input
                  id="rotator-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Quick 90° Rotation Buttons */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Step Rotation</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev - 90 < -180 ? prev - 90 + 360 : prev - 90))}
                  className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-orange-600" />
                  -90° Left
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90 > 180 ? prev + 90 - 360 : prev + 90))}
                  className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 text-orange-600" />
                  +90° Right
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 180 > 180 ? prev - 180 : prev + 180))}
                  className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-orange-600" />
                  180° Flip
                </button>
              </div>
            </div>

            {/* Mirror / Flip Toggles */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Mirror Reflections</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    flipH
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" />
                  Flip Horizontal
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV((prev) => !prev)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    flipV
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" />
                  Flip Vertical
                </button>
              </div>
            </div>

            {/* Fine Angle Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-slate-400" /> Fine Straightening Angle
                </span>
                <span className="font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {rotation}°
                </span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="0.5"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>-180°</span>
                <button
                  type="button"
                  onClick={() => setRotation(0)}
                  className="text-orange-600 hover:underline cursor-pointer"
                >
                  Zero (0°)
                </button>
                <span>+180°</span>
              </div>
            </div>

            {/* Canvas Bounds & Background */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Auto-Expand Canvas</span>
                <input
                  type="checkbox"
                  checked={autoExpand}
                  onChange={(e) => setAutoExpand(e.target.checked)}
                  className="w-4 h-4 accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Rotated Corner Fill</label>
                <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setBgColor('transparent')}
                    className={`py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      bgColor === 'transparent' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Transparent
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('#ffffff')}
                    className={`py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      bgColor === '#ffffff' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    White
                  </button>
                  <button
                    type="button"
                    onClick={() => setBgColor('#000000')}
                    className={`py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                      bgColor === '#000000' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Black
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas Preview Stage (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">Transformed Result</span>
              {outDimensions && (
                <span className="text-[11px] font-mono text-slate-400">
                  {outDimensions.width} × {outDimensions.height} px
                </span>
              )}
            </div>

            <div className="min-h-[380px] sm:min-h-[460px] bg-slate-950 rounded-xl overflow-auto p-4 flex items-center justify-center border border-slate-800">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Rotated result"
                  className="max-h-[60vh] max-w-full object-contain rounded shadow-2xl"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
