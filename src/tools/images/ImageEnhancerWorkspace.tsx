import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Sparkles,
  Download,
  Check,
  Columns,
  Sliders,
  Sun,
  Contrast,
  Droplet,
  Layers,
} from 'lucide-react';

export const ImageEnhancerWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [strength, setStrength] = useState(85);
  const [boostVibrance, setBoostVibrance] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [splitView, setSplitView] = useState(false);
  const [splitPos, setSplitPos] = useState(50);

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

  // Re-process auto enhancement
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    let isMounted = true;
    setIsProcessing(true);

    ImageEngine.autoEnhance(imgElement, {
      strength,
      boostVibrance,
    }).then((processedCanvas) => {
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
  }, [imgElement, strength, boostVibrance]);

  // Download Enhanced Image
  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_enhanced.png`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'image-enhancer',
        toolName: 'Image Enhancer',
        category: 'images',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Enhanced (Strength ${strength}%)`,
      });
    }, 'image/png');
  };

  return (
    <div id="image-enhancer-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Auto Color & Tone Enhancer
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                Level Equalization
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Automatic histogram stretch, shadow recovery, and color vibrance boost</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitView(!splitView)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                splitView ? 'bg-amber-600/30 border-amber-500 text-amber-300' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Before / After
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Enhanced
            </button>
          </div>
        )}
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Enhance photo lighting & colors in 1-click</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Fix underexposed, washed-out, or flat photos with cumulative RGB histogram normalization.
            </p>
            <label
              htmlFor="enhancer-init-file"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image to Enhance
              <input
                id="enhancer-init-file"
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
              <span className="font-semibold text-slate-200 block mb-1">Enhancement Profile</span>

              {/* Strength Slider */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1.5">
                  <span>Equalizer Strength</span>
                  <span className="font-mono text-amber-400">{strength}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Vibrance Toggle */}
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={boostVibrance}
                  onChange={(e) => setBoostVibrance(e.target.checked)}
                  className="rounded border-slate-700 accent-amber-600"
                />
                Smart Vibrance Saturation Boost
              </label>

              {/* Quick Presets */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Enhance Modes
                </span>
                <button
                  onClick={() => {
                    setStrength(50);
                    setBoostVibrance(false);
                  }}
                  className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left cursor-pointer transition-colors"
                >
                  <div className="font-semibold text-slate-200">Subtle Correction (50%)</div>
                  <div className="text-[10px] text-slate-400">Gentle exposure and contrast balance</div>
                </button>
                <button
                  onClick={() => {
                    setStrength(85);
                    setBoostVibrance(true);
                  }}
                  className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left cursor-pointer transition-colors"
                >
                  <div className="font-semibold text-amber-300">Vivid Pop (Recommended)</div>
                  <div className="text-[10px] text-slate-400">Full histogram stretch with rich color vibrancy</div>
                </button>
                <button
                  onClick={() => {
                    setStrength(100);
                    setBoostVibrance(true);
                  }}
                  className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left cursor-pointer transition-colors"
                >
                  <div className="font-semibold text-slate-200">Maximum HDR Stretch (100%)</div>
                  <div className="text-[10px] text-slate-400">Extreme shadow recovery for dark scenes</div>
                </button>
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
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md border border-white">
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
                      className="w-32 accent-amber-500 cursor-pointer"
                    />
                    <span className="text-amber-400 font-semibold">Enhanced</span>
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
