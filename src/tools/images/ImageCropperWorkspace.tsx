import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Crop,
  Download,
  RotateCw,
  RefreshCw,
  Check,
  Grid,
  Maximize2,
  Lock,
  Unlock,
  Circle,
  Square,
  Sliders,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

interface CropBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
}

export const ImageCropperWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  // Aspect ratio presets
  const [aspectPreset, setAspectPreset] = useState<string>('free'); // 'free', '1:1', '16:9', '9:16', '4:3', '3:2', 'circle'
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [rotation, setRotation] = useState<number>(0); // -45 to 45 or 90 steps

  // Crop box in percentage of displayed image
  const [cropBox, setCropBox] = useState<CropBox>({ x: 10, y: 10, w: 80, h: 80 });
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Dragging state
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const activeDrag = useRef<{
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w';
    startX: number;
    startY: number;
    initialCrop: CropBox;
  } | null>(null);

  // Handle file selection
  const handleFileChange = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setImageSrc(url);
      const img = await FileEngine.loadImage(selectedFile);
      setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setCropBox({ x: 10, y: 10, w: 80, h: 80 });
      setRotation(0);
    } catch (err) {
      console.error('Error loading image for cropper:', err);
    }
  };

  // Adjust crop box when aspect ratio preset changes
  useEffect(() => {
    if (!imgDimensions) return;
    const imgAspect = imgDimensions.width / imgDimensions.height;

    setCropBox((prev) => {
      let targetRatio: number | null = null;
      if (aspectPreset === '1:1' || aspectPreset === 'circle') targetRatio = 1;
      else if (aspectPreset === '16:9') targetRatio = 16 / 9;
      else if (aspectPreset === '9:16') targetRatio = 9 / 16;
      else if (aspectPreset === '4:3') targetRatio = 4 / 3;
      else if (aspectPreset === '3:2') targetRatio = 3 / 2;

      if (!targetRatio) return prev;

      // Calculate new width & height respecting the ratio in percentage
      // ratio = (w * imgW) / (h * imgH) => h = (w * imgW) / (ratio * imgH)
      let newW = prev.w;
      let newH = (newW * imgDimensions.width) / (targetRatio * imgDimensions.height);

      if (newH > 95) {
        newH = 80;
        newW = (newH * targetRatio * imgDimensions.height) / imgDimensions.width;
      }
      if (newW > 95) {
        newW = 80;
        newH = (newW * imgDimensions.width) / (targetRatio * imgDimensions.height);
      }

      const x = Math.min(prev.x, 100 - newW);
      const y = Math.min(prev.y, 100 - newH);
      return { x: Math.max(0, x), y: Math.max(0, y), w: Math.min(100, newW), h: Math.min(100, newH) };
    });
  }, [aspectPreset, imgDimensions]);

  // Generate cropped preview
  const generateCroppedOutput = useCallback(() => {
    if (!imageSrc || !imgDimensions) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const sx = (cropBox.x / 100) * naturalW;
      const sy = (cropBox.y / 100) * naturalH;
      const sw = (cropBox.w / 100) * naturalW;
      const sh = (cropBox.h / 100) * naturalH;

      canvas.width = Math.max(1, Math.round(sw));
      canvas.height = Math.max(1, Math.round(sh));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (aspectPreset === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      if (aspectPreset === 'circle') {
        ctx.restore();
      }

      canvas.toBlob((b) => {
        if (b) {
          setCroppedBlob(b);
          const u = URL.createObjectURL(b);
          setCroppedUrl((old) => {
            if (old) URL.revokeObjectURL(old);
            return u;
          });
        }
        setIsProcessing(false);
      }, aspectPreset === 'circle' ? 'image/png' : file?.type || 'image/png');
    };
    img.src = imageSrc;
  }, [imageSrc, imgDimensions, cropBox, aspectPreset, file]);

  useEffect(() => {
    const timer = setTimeout(generateCroppedOutput, 150);
    return () => clearTimeout(timer);
  }, [generateCroppedOutput]);

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    type: 'move' | 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w'
  ) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    activeDrag.current = {
      type,
      startX: clientX,
      startY: clientY,
      initialCrop: { ...cropBox },
    };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!activeDrag.current || !stageRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = stageRef.current.getBoundingClientRect();
    const dxPercent = ((clientX - activeDrag.current.startX) / rect.width) * 100;
    const dyPercent = ((clientY - activeDrag.current.startY) / rect.height) * 100;

    const init = activeDrag.current.initialCrop;
    const type = activeDrag.current.type;

    setCropBox(() => {
      let x = init.x;
      let y = init.y;
      let w = init.w;
      let h = init.h;

      if (type === 'move') {
        x = Math.max(0, Math.min(100 - w, init.x + dxPercent));
        y = Math.max(0, Math.min(100 - h, init.y + dyPercent));
      } else {
        if (type.includes('e')) {
          w = Math.max(10, Math.min(100 - x, init.w + dxPercent));
        }
        if (type.includes('s')) {
          h = Math.max(10, Math.min(100 - y, init.h + dyPercent));
        }
        if (type.includes('w')) {
          const maxDelta = init.w - 10;
          const delta = Math.min(maxDelta, Math.max(-init.x, dxPercent));
          x = init.x + delta;
          w = init.w - delta;
        }
        if (type.includes('n')) {
          const maxDelta = init.h - 10;
          const delta = Math.min(maxDelta, Math.max(-init.y, dyPercent));
          y = init.y + delta;
          h = init.h - delta;
        }
      }

      return { x, y, w, h };
    });
  };

  const handlePointerUp = () => {
    activeDrag.current = null;
  };

  // Download cropped image
  const handleDownload = () => {
    if (!croppedBlob || !file) return;
    const ext = aspectPreset === 'circle' ? 'png' : file.name.split('.').pop() || 'png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_cropped.${ext}`;
    FileEngine.downloadBlob(croppedBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-cropper',
      toolName: 'Image Cropper',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Cropped area (${Math.round(cropBox.w)}% × ${Math.round(cropBox.h)}%)`,
    });
  };

  // Current crop pixel dimensions
  const cropPixelW = imgDimensions ? Math.round((cropBox.w / 100) * imgDimensions.width) : 0;
  const cropPixelH = imgDimensions ? Math.round((cropBox.h / 100) * imgDimensions.height) : 0;

  return (
    <div id="image-cropper-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20">
              <Crop className="w-5 h-5" />
            </span>
            Image Cropper & Aspect Ratio Tool
            {imgDimensions && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold font-mono">
                {cropPixelW} × {cropPixelH} px
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Direct interactive drag-to-crop with rule-of-thirds grid, aspect ratio locks, and circular avatar masking.
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={!croppedBlob || isProcessing}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Cropped
            </button>
          </div>
        )}
      </div>

      {!imageSrc ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-red-500 transition-colors">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crop className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to crop</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Supports PNG, JPEG, WebP, and GIF. Direct interactive crop handles and instant aspect presets.
          </p>
          <label
            htmlFor="cropper-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Crop className="w-4 h-4" /> Choose Image File
            <input
              id="cropper-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Crop Presets</h3>
              <label
                htmlFor="cropper-change-file"
                className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Change Image
                <input
                  id="cropper-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
              </label>
            </div>

            {/* Aspect Ratio Chips */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'free', label: 'Freeform' },
                  { id: '1:1', label: '1:1 Square' },
                  { id: '16:9', label: '16:9 Cinema' },
                  { id: '9:16', label: '9:16 Story' },
                  { id: '4:3', label: '4:3 Standard' },
                  { id: '3:2', label: '3:2 Classic' },
                  { id: 'circle', label: 'Circular' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAspectPreset(preset.id)}
                    className={`px-2 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      aspectPreset === preset.id
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Overlay Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-slate-500" /> Rule-of-Thirds Grid
              </span>
              <button
                type="button"
                onClick={() => setShowGrid((prev) => !prev)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  showGrid ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {showGrid ? 'Visible' : 'Hidden'}
              </button>
            </div>

            {/* Readout stats */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Original Dimensions:</span>
                <span className="font-mono text-slate-800">
                  {imgDimensions?.width} × {imgDimensions?.height} px
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Cropped Dimensions:</span>
                <span className="font-mono font-bold text-red-600">
                  {cropPixelW} × {cropPixelH} px
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Selected Crop Area:</span>
                <span className="font-mono text-slate-800">
                  {Math.round(cropBox.w)}% × {Math.round(cropBox.h)}%
                </span>
              </div>
            </div>

            {/* Mini Output Preview */}
            {croppedUrl && (
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Cropped Preview</label>
                <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center min-h-[140px]">
                  <img
                    src={croppedUrl}
                    alt="Cropped Preview"
                    className={`max-h-32 object-contain ${aspectPreset === 'circle' ? 'rounded-full' : 'rounded'}`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Interactive Crop Stage (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">
                Interactive Canvas (Drag frame or corners to resize)
              </span>
              <button
                type="button"
                onClick={() => setCropBox({ x: 10, y: 10, w: 80, h: 80 })}
                className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                Reset Box
              </button>
            </div>

            {/* Direct interactive image stage */}
            <div
              ref={stageRef}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="relative min-h-[420px] bg-slate-950 rounded-xl overflow-hidden select-none flex items-center justify-center p-4"
            >
              <div className="relative max-w-full max-h-[60vh] inline-block">
                {imageSrc && (
                  <img
                    ref={imgRef}
                    src={imageSrc}
                    alt="Source"
                    className="max-h-[60vh] max-w-full object-contain pointer-events-none block"
                  />
                )}

                {/* Darkening Mask around Crop Box */}
                <div className="absolute inset-0 pointer-events-none bg-black/50" />

                {/* Active Crop Window */}
                <div
                  onMouseDown={(e) => handlePointerDown(e, 'move')}
                  onTouchStart={(e) => handlePointerDown(e, 'move')}
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.w}%`,
                    height: `${cropBox.h}%`,
                  }}
                  className={`absolute border-2 border-white shadow-2xl cursor-move overflow-hidden ${
                    aspectPreset === 'circle' ? 'rounded-full' : ''
                  }`}
                >
                  {/* Clear cutout showing full brightness image underneath */}
                  {imageSrc && imgDimensions && (
                    <img
                      src={imageSrc}
                      alt="Crop View"
                      className="absolute max-w-none pointer-events-none"
                      style={{
                        width: imgRef.current ? imgRef.current.clientWidth : '100%',
                        height: imgRef.current ? imgRef.current.clientHeight : '100%',
                        left: `-${(cropBox.x / cropBox.w) * 100}%`,
                        top: `-${(cropBox.y / cropBox.h) * 100}%`,
                      }}
                    />
                  )}

                  {/* Rule-of-Thirds Grid */}
                  {showGrid && aspectPreset !== 'circle' && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-white/30" />
                      <div className="border-r border-white/30" />
                      <div />
                    </div>
                  )}

                  {/* Corner Handles */}
                  <div
                    onMouseDown={(e) => handlePointerDown(e, 'nw')}
                    onTouchStart={(e) => handlePointerDown(e, 'nw')}
                    className="absolute top-0 left-0 w-4 h-4 bg-white border border-red-600 cursor-nwse-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handlePointerDown(e, 'ne')}
                    onTouchStart={(e) => handlePointerDown(e, 'ne')}
                    className="absolute top-0 right-0 w-4 h-4 bg-white border border-red-600 cursor-nesw-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handlePointerDown(e, 'se')}
                    onTouchStart={(e) => handlePointerDown(e, 'se')}
                    className="absolute bottom-0 right-0 w-4 h-4 bg-white border border-red-600 cursor-nwse-resize z-20"
                  />
                  <div
                    onMouseDown={(e) => handlePointerDown(e, 'sw')}
                    onTouchStart={(e) => handlePointerDown(e, 'sw')}
                    className="absolute bottom-0 left-0 w-4 h-4 bg-white border border-red-600 cursor-nesw-resize z-20"
                  />

                  {/* Dimension pill */}
                  <div className="absolute top-2 left-2 bg-black/75 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow pointer-events-none">
                    {cropPixelW} × {cropPixelH}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
