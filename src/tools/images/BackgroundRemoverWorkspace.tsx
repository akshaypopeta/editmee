import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Wand2,
  Download,
  Check,
  Columns,
  Sparkles,
  Sliders,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';

export const BackgroundRemoverWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [tolerance, setTolerance] = useState(38);
  const [edgeFeather, setEdgeFeather] = useState(true);
  const [replaceColor, setReplaceColor] = useState('transparent');
  const [customColor, setCustomColor] = useState('#2563eb');

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

  // Re-process background removal
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    let isMounted = true;
    setIsProcessing(true);

    const activeColor = replaceColor === 'custom' ? customColor : replaceColor;

    ImageEngine.removeBackground(imgElement, {
      tolerance,
      edgeFeather,
      replaceColor: activeColor,
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
  }, [imgElement, tolerance, edgeFeather, replaceColor, customColor]);

  // Download Transparent PNG
  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_cutout.png`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'bg-remover',
        toolName: 'Background Remover',
        category: 'images',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Cutout created (Tolerance ${tolerance})`,
      });
    }, 'image/png');
  };

  return (
    <div id="bg-remover-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Background Remover & Cutout Studio
            </h1>
            <p className="text-[11px] text-slate-400">Smart client-side color edge segmentation with smooth alpha feathering</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSplitView(!splitView)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                splitView ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" /> Before / After
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download PNG
            </button>
          </div>
        )}
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Wand2 className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Remove backgrounds automatically</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Create transparent PNG cutouts for product listings, profile avatars, and design layouts in real-time.
            </p>
            <label
              htmlFor="bg-init-file"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image File
              <input
                id="bg-init-file"
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
              <span className="font-semibold text-slate-200 block mb-1">Segmentation Controls</span>

              {/* Color Tolerance Slider */}
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1.5">
                  <span>Detection Tolerance</span>
                  <span className="font-mono text-purple-400">{tolerance}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Strict Edge</span>
                  <span>Wide Range</span>
                </div>
              </div>

              {/* Feathering Toggle */}
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={edgeFeather}
                  onChange={(e) => setEdgeFeather(e.target.checked)}
                  className="rounded border-slate-700 accent-purple-600"
                />
                Smooth edge feathering (Anti-Aliasing)
              </label>

              {/* Replacement Background Color */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="font-semibold text-slate-200 block">Replace Background</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'transparent', label: 'Alpha (Clear)' },
                    { id: '#ffffff', label: 'Studio White' },
                    { id: '#000000', label: 'Deep Black' },
                    { id: '#f8fafc', label: 'Off-White' },
                    { id: '#1e293b', label: 'Dark Slate' },
                    { id: 'custom', label: 'Custom Color' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setReplaceColor(bg.id)}
                      className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                        replaceColor === bg.id
                          ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-semibold shadow-sm'
                          : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>

                {replaceColor === 'custom' && (
                  <div className="pt-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Stage: Canvas Viewport with Alpha Checkerboard */}
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
                      className="absolute top-0 bottom-0 w-0.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md border border-white">
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
                      className="w-32 accent-purple-500 cursor-pointer"
                    />
                    <span className="text-purple-400 font-semibold">Cutout</span>
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
