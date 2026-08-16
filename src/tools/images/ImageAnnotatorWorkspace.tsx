import React, { useState, useEffect, useRef } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { ImageEngine, AnnotationItem } from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  PenTool,
  Download,
  ArrowRight,
  Square,
  Circle,
  Type,
  Hash,
  ShieldAlert,
  Undo2,
  Trash2,
  Check,
} from 'lucide-react';

export const ImageAnnotatorWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [activeTool, setActiveTool] = useState<
    'arrow' | 'rect' | 'circle' | 'text' | 'step_badge' | 'pixelate_redaction' | 'blur_redaction' | 'brush'
  >('arrow');
  const [color, setColor] = useState('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState(4);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBrushPoints, setCurrentBrushPoints] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load Image
  const handleFileUpload = async (selectedFile: File) => {
    try {
      setFile(selectedFile);
      const img = await FileEngine.loadImage(selectedFile);
      setImgElement(img);
      setAnnotations([]);
    } catch (err) {
      console.error('Error loading image for annotator:', err);
    }
  };

  // Re-render annotations on canvas
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    ImageEngine.processImage(imgElement, {
      annotations,
    }).then((processedCanvas) => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      canvasRef.current.width = processedCanvas.width;
      canvasRef.current.height = processedCanvas.height;
      ctx.drawImage(processedCanvas, 0, 0);
    });
  }, [imgElement, annotations]);

  // Canvas Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setDrawStart({ x, y });

    if (activeTool === 'brush') {
      setCurrentBrushPoints([{ x, y }]);
    } else if (activeTool === 'step_badge') {
      const nextStep = annotations.filter((a) => a.type === 'step_badge').length + 1;
      setAnnotations((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          type: 'step_badge',
          x,
          y,
          color,
          stepNumber: nextStep,
        },
      ]);
      setIsDrawing(false);
    } else if (activeTool === 'text') {
      const textVal = prompt('Enter annotation label text:', 'Note');
      if (textVal) {
        setAnnotations((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            type: 'text',
            x,
            y,
            text: textVal,
            color,
            fontSize: 28,
          },
        ]);
      }
      setIsDrawing(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === 'brush') {
      setCurrentBrushPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;

    let newAnn: AnnotationItem | null = null;

    if (activeTool === 'arrow') {
      newAnn = {
        id: String(Date.now()),
        type: 'arrow',
        x: drawStart.x,
        y: drawStart.y,
        endX,
        endY,
        color,
        strokeWidth,
      };
    } else if (activeTool === 'rect') {
      newAnn = {
        id: String(Date.now()),
        type: 'rect',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
        color,
        strokeWidth,
      };
    } else if (activeTool === 'circle') {
      newAnn = {
        id: String(Date.now()),
        type: 'circle',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
        color,
        strokeWidth,
      };
    } else if (activeTool === 'pixelate_redaction') {
      newAnn = {
        id: String(Date.now()),
        type: 'pixelate_redaction',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
        mosaicSize: 14,
      };
    } else if (activeTool === 'blur_redaction') {
      newAnn = {
        id: String(Date.now()),
        type: 'blur_redaction',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
      };
    } else if (activeTool === 'brush' && currentBrushPoints.length > 1) {
      newAnn = {
        id: String(Date.now()),
        type: 'brush',
        x: currentBrushPoints[0].x,
        y: currentBrushPoints[0].y,
        points: currentBrushPoints,
        color,
        strokeWidth,
      };
    }

    if (newAnn) {
      setAnnotations((prev) => [...prev, newAnn!]);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentBrushPoints([]);
  };

  // Undo latest annotation
  const handleUndo = () => {
    setAnnotations((prev) => prev.slice(0, -1));
  };

  // Download Annotated Image
  const handleDownload = () => {
    if (!canvasRef.current || !file) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_annotated.png`;
      FileEngine.downloadBlob(blob, filename);

      storageEngine.addHistoryItem({
        toolId: 'image-annotator',
        toolName: 'Image Annotator',
        category: 'images',
        status: 'completed',
        outputFilename: filename,
        outputSummary: `Applied ${annotations.length} annotations`,
      });
    }, 'image/png');
  };

  return (
    <div id="image-annotator-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Image Annotator & Redaction Studio
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                {annotations.length} Overlays
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">High-precision vector markup, numbered step markers, and blur/mosaic redaction</p>
          </div>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={annotations.length === 0}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40 cursor-pointer"
              title="Undo last annotation"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setAnnotations([])}
              disabled={annotations.length === 0}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-red-400 disabled:opacity-40 cursor-pointer"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Annotated
            </button>
          </div>
        )}
      </div>

      {/* Workspace Content */}
      <div className="flex-1 flex overflow-hidden">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <PenTool className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Annotate, mark up, and redact images</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6">
              Draw arrows, callouts, sequential step tags, and censor sensitive data with pixelation or gaussian blur.
            </p>
            <label
              htmlFor="annotator-init-file"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" /> Select Image to Annotate
              <input
                id="annotator-init-file"
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
              <span className="font-semibold text-slate-200 block mb-1">Annotation Tools</span>

              {/* Tools Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'arrow', label: 'Pointer Arrow', icon: ArrowRight },
                  { id: 'rect', label: 'Rectangle', icon: Square },
                  { id: 'circle', label: 'Circle Callout', icon: Circle },
                  { id: 'brush', label: 'Freehand Pen', icon: PenTool },
                  { id: 'text', label: 'Text Note', icon: Type },
                  { id: 'step_badge', label: 'Step 1-2-3', icon: Hash },
                  { id: 'pixelate_redaction', label: 'Mosaic Censor', icon: ShieldAlert },
                  { id: 'blur_redaction', label: 'Blur Censor', icon: ShieldAlert },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const isSel = activeTool === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 text-left font-medium transition-colors cursor-pointer ${
                        isSel
                          ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-semibold shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs">{tool.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Color & Stroke */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Markup Color</label>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Line Width ({strokeWidth}px)</label>
                  <input
                    type="range"
                    min="1"
                    max="18"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer mt-2"
                  />
                </div>
              </div>

              <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3 text-[11px] text-slate-400 leading-relaxed mt-auto">
                💡 <span className="text-slate-300 font-medium">Tip:</span> Click and drag directly on the image to draw shapes, arrows, or redaction blur boxes.
              </div>
            </div>

            {/* Right Stage: Canvas Viewport */}
            <div className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center relative select-none">
              <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:24px_24px]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className="max-h-[65vh] max-w-full object-contain block cursor-crosshair"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
