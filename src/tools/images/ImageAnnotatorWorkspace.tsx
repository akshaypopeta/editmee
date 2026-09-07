import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  Download,
  Upload,
  Square,
  Circle,
  ArrowUpRight,
  Type,
  EyeOff,
  RotateCcw,
  Sliders,
  Check,
  Undo2,
  Trash2,
  Palette,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

type ToolType = 'pen' | 'arrow' | 'rect' | 'circle' | 'blur' | 'text';

interface AnnotationItem {
  id: string;
  tool: ToolType;
  color: string;
  width: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  points?: { x: number; y: number }[];
  text?: string;
}

export const ImageAnnotatorWorkspace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Active Tool & Style
  const [activeTool, setActiveTool] = useState<ToolType>('arrow');
  const [strokeColor, setStrokeColor] = useState<string>('#ef4444');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [calloutText, setCalloutText] = useState<string>('Important');

  // History & Annotations
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [history, setHistory] = useState<AnnotationItem[][]>([]);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef<boolean>(false);
  const currentItem = useRef<AnnotationItem | null>(null);

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load Image
  const handleFileUpload = async (f: File) => {
    try {
      setFile(f);
      const img = await FileEngine.loadImage(f);
      setImgElement(img);
      setAnnotations([]);
      setHistory([]);
    } catch (err) {
      console.error('Error loading image for annotator:', err);
    }
  };

  // Re-draw entire canvas whenever annotations change
  const redrawCanvas = () => {
    if (!canvasRef.current || !imgElement) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);

    // Draw all completed annotations
    annotations.forEach((item) => drawItem(ctx, item));

    // Draw active drawing item if currently in progress
    if (currentItem.current) {
      drawItem(ctx, currentItem.current);
    }

    // Export Blob
    canvas.toBlob((b) => {
      setOutputBlob(b);
    }, 'image/png');
  };

  useEffect(() => {
    if (imgElement && canvasRef.current) {
      canvasRef.current.width = imgElement.naturalWidth;
      canvasRef.current.height = imgElement.naturalHeight;
      redrawCanvas();
    }
  }, [imgElement, annotations]);

  // Render individual annotation element
  const drawItem = (ctx: CanvasRenderingContext2D, item: AnnotationItem) => {
    ctx.save();
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (item.tool === 'pen' && item.points && item.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(item.points[0].x, item.points[0].y);
      for (let i = 1; i < item.points.length; i++) {
        ctx.lineTo(item.points[i].x, item.points[i].y);
      }
      ctx.stroke();
    } else if (item.tool === 'arrow') {
      const dx = item.endX - item.startX;
      const dy = item.endY - item.startY;
      const angle = Math.atan2(dy, dx);
      const headlen = item.width * 4;

      ctx.beginPath();
      ctx.moveTo(item.startX, item.startY);
      ctx.lineTo(item.endX, item.endY);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(item.endX, item.endY);
      ctx.lineTo(item.endX - headlen * Math.cos(angle - Math.PI / 6), item.endY - headlen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(item.endX - headlen * Math.cos(angle + Math.PI / 6), item.endY - headlen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (item.tool === 'rect') {
      const w = item.endX - item.startX;
      const h = item.endY - item.startY;
      ctx.strokeRect(item.startX, item.startY, w, h);
    } else if (item.tool === 'circle') {
      const radiusX = Math.abs(item.endX - item.startX) / 2;
      const radiusY = Math.abs(item.endY - item.startY) / 2;
      const centerX = Math.min(item.startX, item.endX) + radiusX;
      const centerY = Math.min(item.startY, item.endY) + radiusY;

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (item.tool === 'blur') {
      // Blur redaction box
      const rx = Math.min(item.startX, item.endX);
      const ry = Math.min(item.startY, item.endY);
      const rw = Math.abs(item.endX - item.startX);
      const rh = Math.abs(item.endY - item.startY);

      if (rw > 2 && rh > 2) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(rx, ry, rw, rh);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx, ry, rw, rh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('REDACTED', rx + rw / 2, ry + rh / 2);
      }
    } else if (item.tool === 'text' && item.text) {
      ctx.font = `bold ${Math.max(16, item.width * 5)}px sans-serif`;
      const textMetrics = ctx.measureText(item.text);
      const th = Math.max(16, item.width * 5);
      const tw = textMetrics.width;

      // Label background pill
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.roundRect(item.startX - 6, item.startY - th - 4, tw + 12, th + 8, 6);
      ctx.fill();

      // Text
      ctx.fillStyle = item.color;
      ctx.textBaseline = 'bottom';
      ctx.fillText(item.text, item.startX, item.startY);
    }

    ctx.restore();
  };

  // Coordinates helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  // Drawing event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    isDrawing.current = true;

    currentItem.current = {
      id: `ann-${Date.now()}`,
      tool: activeTool,
      color: strokeColor,
      width: strokeWidth,
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y,
      points: activeTool === 'pen' ? [coords] : undefined,
      text: activeTool === 'text' ? calloutText : undefined,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !currentItem.current) return;
    const coords = getCanvasCoords(e);

    currentItem.current.endX = coords.x;
    currentItem.current.endY = coords.y;

    if (activeTool === 'pen' && currentItem.current.points) {
      currentItem.current.points.push(coords);
    }

    redrawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || !currentItem.current) return;
    isDrawing.current = false;

    setHistory((prev) => [...prev, annotations]);
    setAnnotations((prev) => [...prev, currentItem.current!]);
    currentItem.current = null;
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0) {
      setAnnotations([]);
      return;
    }
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setAnnotations(prev);
  };

  // Download annotated image
  const handleDownload = () => {
    if (!outputBlob || !file) return;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_annotated.png`;
    FileEngine.downloadBlob(outputBlob, filename);

    storageEngine.addHistoryItem({
      toolId: 'image-annotator',
      toolName: 'Image Markup & Annotator',
      category: 'images',
      status: 'completed',
      outputFilename: filename,
      outputSummary: `Annotated with ${annotations.length} markups`,
    });
  };

  return (
    <div id="image-annotator-workspace" className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-pink-500/10 text-pink-600 border border-pink-500/20">
              <PenTool className="w-5 h-5" />
            </span>
            Image Markup, Blur Redaction & Annotator
            {annotations.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-xs font-bold font-mono">
                {annotations.length} Markups
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Draw directional arrows, highlight callouts, redact sensitive PII with blur blocks, and add custom notes.
          </p>
        </div>

        {file && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              disabled={annotations.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              type="button"
              onClick={() => {
                setHistory((h) => [...h, annotations]);
                setAnnotations([]);
              }}
              disabled={annotations.length === 0}
              className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={!outputBlob}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download Annotated
            </button>
          </div>
        )}
      </div>

      {!file ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-10 text-center hover:border-pink-500 transition-colors">
          <div className="w-16 h-16 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Select an image to annotate</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Perfect for screenshot bug reports, feedback mockups, tutorials, and redacting private information.
          </p>
          <label
            htmlFor="annotator-file-input"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
          >
            <PenTool className="w-4 h-4" /> Choose Image File
            <input
              id="annotator-file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tool Palette (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Markup Tools</h3>
              <label
                htmlFor="annotator-change-file"
                className="text-xs font-semibold text-pink-600 hover:text-pink-700 cursor-pointer"
              >
                Change Image
                <input
                  id="annotator-change-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
            </div>

            {/* Tool Selection Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'arrow', label: 'Arrow', icon: ArrowUpRight },
                { id: 'rect', label: 'Box', icon: Square },
                { id: 'circle', label: 'Circle', icon: Circle },
                { id: 'pen', label: 'Pen', icon: PenTool },
                { id: 'blur', label: 'Redact PII', icon: EyeOff },
                { id: 'text', label: 'Callout', icon: Type },
              ].map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActiveTool(tool.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeTool === tool.id
                        ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-bold">{tool.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Text Callout input if tool is text */}
            {activeTool === 'text' && (
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-1">Callout Text</label>
                <input
                  type="text"
                  value={calloutText}
                  onChange={(e) => setCalloutText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                  placeholder="Enter callout..."
                />
              </div>
            )}

            {/* Colors Palette */}
            {activeTool !== 'blur' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block">Stroke Color</label>
                <div className="flex items-center gap-2">
                  {['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ffffff', '#000000'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setStrokeColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-lg border-2 shadow-sm transition-transform cursor-pointer ${
                        strokeColor === c ? 'scale-110 border-pink-500 ring-2 ring-pink-500/20' : 'border-slate-300'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-200"
                    title="Custom color"
                  />
                </div>
              </div>
            )}

            {/* Line Width Slider */}
            {activeTool !== 'blur' && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>Stroke Thickness</span>
                  <span className="font-mono text-pink-600">{strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full accent-pink-600 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Interactive Annotation Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700">
                Active Canvas — Click & Drag to Markup
              </span>
              {imgElement && (
                <span className="text-[11px] font-mono text-slate-400">
                  {imgElement.naturalWidth} × {imgElement.naturalHeight} px
                </span>
              )}
            </div>

            <div className="min-h-[380px] sm:min-h-[460px] bg-slate-950 rounded-xl overflow-auto p-4 flex items-center justify-center border border-slate-800">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="max-h-[60vh] max-w-full object-contain rounded shadow-2xl cursor-crosshair"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
