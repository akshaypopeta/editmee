import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Maximize2,
  Download,
  Check,
  Columns,
  Sparkles,
  Sliders,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react';

export const ImageUpscalerWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [factor, setFactor] = useState<2 | 4 | 8>(2);
  const [sharpenStrength, setSharpenStrength] = useState(1.5);
  const [isProcessing, setIsProcessing] = useState(false);

  const [splitView, setSplitView] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [zoomScale, setZoomScale] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const origCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Image
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);

      if (origCanvasRef.current) {
        origCanvasRef.current.width = img.naturalWidth;
        origCanvasRef.current.height = img.naturalHeight;
        const ctx = origCanvasRef.current.getContext('2d');
        ctx?.drawImage(img, 0, 0);
      }
    } catch (err) {
      console.error('Error loading image:', err);
    }
  };

  // Process Upscaling
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    let isMounted = true;
    setIsProcessing(true);

    ImageEngine.upscaleImage(imgElement, factor, sharpenStrength).then((processedCanvas) => {
      if (!isMounted || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      canvasRef.current.width = processedCanvas.width;
      canvasRef.current.height = processedCanvas.height;
      ctx.drawImage(processedCanvas, 0, 0);

      if (origCanvasRef.current) {
        origCanvasRef.current.width = processedCanvas.width;
        origCanvasRef.current.height = processedCanvas.height;
        const oCtx = origCanvasRef.current.getContext('2d');
        oCtx?.drawImage(imgElement, 0, 0, processedCanvas.width, processedCanvas.height);
      }
      setIsProcessing(false);
    });

    return () => {
      isMounted = false;
    };
  }, [imgElement, factor, sharpenStrength]);

  // Download Upscaled Image
  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_${factor}x_super_res.png`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'image-upscaler',
        toolName: 'Image Upscaler',
        category: 'images',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Upscaled ${factor}x (${canvasRef.current?.width}x${canvasRef.current?.height} px)`,
      });
    }, 'image/png');
  };

  return (
    <div id="image-upscaler-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Maximize2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Super-Resolution Image Upscaler
              {imgElement && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                  {imgElement.naturalWidth * factor} × {imgElement.naturalHeight * factor} px ({factor}x)
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">Iterative multi-pass bicubic upsampling with edge unsharp masking</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitView(!splitView)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                splitView ? 'bg-blue-600/30 border-blue-500 text-blue-300' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Before / After
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Ultra-HD
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
            <h2 className="text-base font-bold text-white mb-1">Enlarge images with crystal clarity</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Upscale low-resolution photos 2x, 4x, or 8x with smart edge-preserving interpolation and detail enhancement.
            </p>
            <label
              htmlFor="upscaler-init-file"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image to Upscale
              <input
                id="upscaler-init-file"
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
              <span className="font-semibold text-slate-200 block mb-1">Upscale Factor</span>

              {/* Upscale Factor Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 2, label: '2x HD', desc: 'Double Pixel Count' },
                  { id: 4, label: '4x Quad', desc: 'Quad Resolution' },
                  { id: 8, label: '8x Ultra', desc: 'Max Clarity' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFactor(f.id as any)}
                    className={`p-3 rounded-xl border text-center transition-colors cursor-pointer ${
                      factor === f.id
                        ? 'bg-blue-600/30 border-blue-500 text-blue-200 font-semibold shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-white text-sm">{f.label}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>

              {/* Sharpening Strength Slider */}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between text-slate-300 font-medium mb-1.5">
                  <span>Edge Sharpening Factor</span>
                  <span className="font-mono text-blue-400">{sharpenStrength}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={sharpenStrength}
                  onChange={(e) => setSharpenStrength(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Dimension Comparison Info Card */}
              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3.5 space-y-2 mt-auto">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Input Resolution:</span>
                  <span className="font-mono text-slate-300">
                    {imgElement?.naturalWidth} × {imgElement?.naturalHeight}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Upscaled Resolution:</span>
                  <span className="font-mono text-blue-400 font-bold">
                    {(imgElement?.naturalWidth || 0) * factor} × {(imgElement?.naturalHeight || 0) * factor}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Pixel Multiplier:</span>
                  <span className="font-mono text-emerald-400 font-bold">{factor * factor}x Pixels</span>
                </div>
              </div>
            </div>

            {/* Right Stage: Canvas Viewport */}
            <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center relative select-none">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:24px_24px]">
                <canvas ref={canvasRef} className="max-h-[65vh] max-w-full object-contain block" />

                {/* Split View Overlay */}
                {splitView && (
                  <div
                    style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <canvas ref={origCanvasRef} className="block w-full h-full object-contain" />
                    <div
                      style={{ left: `${splitPos}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md border border-white">
                        ↔
                      </div>
                    </div>
                  </div>
                )}

                {splitView && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] shadow-lg">
                    <span className="text-slate-400">Original</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={splitPos}
                      onChange={(e) => setSplitPos(Number(e.target.value))}
                      className="w-32 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-blue-400 font-semibold">{factor}x Upscaled</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
