import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileEngine } from '../../core/file-engine/FileEngine';
import {
  ImageEngine,
  ImageAdjustments,
  DEFAULT_ADJUSTMENTS,
  FilterPreset,
  AnnotationItem,
  POPULAR_RESIZE_PRESETS,
} from '../../core/image-engine/ImageEngine';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import {
  Upload,
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  Sun,
  Contrast,
  Droplet,
  Type,
  Maximize2,
  Wand2,
  Check,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Eraser,
  PenTool,
  ShieldAlert,
  ArrowRight,
  Square,
  Circle,
  Hash,
  Eye,
  Columns,
  Layers,
  Palette,
  Image as ImageIcon,
  FileImage,
} from 'lucide-react';

export const ImageStudioTool: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  // Transformations
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [maintainAspect, setMaintainAspect] = useState(true);

  // Filters & Adjustments
  const [adjustments, setAdjustments] = useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);
  const [presetFilter, setPresetFilter] = useState<FilterPreset>('none');

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'adjust' | 'filters' | 'crop' | 'resize' | 'watermark' | 'annotate' | 'bg_remove' | 'enhance' | 'passport'
  >('adjust');

  // Watermark
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.35);
  const [watermarkPosition, setWatermarkPosition] = useState<
    'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right' | 'tile'
  >('tile');

  // Annotations
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [selectedAnnTool, setSelectedAnnTool] = useState<
    'arrow' | 'rect' | 'circle' | 'text' | 'step_badge' | 'pixelate_redaction' | 'blur_redaction' | 'brush'
  >('arrow');
  const [annColor, setAnnColor] = useState('#ef4444');
  const [annStrokeWidth, setAnnStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBrushPoints, setCurrentBrushPoints] = useState<{ x: number; y: number }[]>([]);

  // Split View (Before / After)
  const [showSplitView, setShowSplitView] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // 0 to 100%

  // Zoom & Pan
  const [zoomScale, setZoomScale] = useState(1);

  // Background Remover options
  const [bgTolerance, setBgTolerance] = useState(38);
  const [bgFeather, setBgFeather] = useState(true);
  const [bgReplaceColor, setBgReplaceColor] = useState('transparent');

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const splitOriginalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  // Export Settings
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [exportQuality, setExportQuality] = useState(92);

  // Undo / Redo History
  const [history, setHistory] = useState<
    {
      adjustments: ImageAdjustments;
      presetFilter: FilterPreset;
      rotation: number;
      flipH: boolean;
      flipV: boolean;
      annotations: AnnotationItem[];
    }[]
  >([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Push state to history
  const pushHistory = useCallback(
    (newState: {
      adjustments: ImageAdjustments;
      presetFilter: FilterPreset;
      rotation: number;
      flipH: boolean;
      flipV: boolean;
      annotations: AnnotationItem[];
    }) => {
      setHistory((prev) => [...prev.slice(0, historyIdx + 1), newState]);
      setHistoryIdx((prev) => prev + 1);
    },
    [historyIdx]
  );

  // File Upload handler
  const handleFileUpload = async (file: File) => {
    try {
      setImageFile(file);
      const img = await FileEngine.loadImage(file);
      setImgElement(img);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setAdjustments(DEFAULT_ADJUSTMENTS);
      setPresetFilter('none');
      setAnnotations([]);
      setZoomScale(1);

      // Render clean original to split canvas
      if (splitOriginalCanvasRef.current) {
        splitOriginalCanvasRef.current.width = img.naturalWidth;
        splitOriginalCanvasRef.current.height = img.naturalHeight;
        const origCtx = splitOriginalCanvasRef.current.getContext('2d');
        origCtx?.drawImage(img, 0, 0);
      }

      setHistory([
        {
          adjustments: DEFAULT_ADJUSTMENTS,
          presetFilter: 'none',
          rotation: 0,
          flipH: false,
          flipV: false,
          annotations: [],
        },
      ]);
      setHistoryIdx(0);
    } catch (err) {
      console.error('Failed to load image:', err);
    }
  };

  // Re-render canvas whenever pipeline parameters change
  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    let isMounted = true;

    ImageEngine.processImage(imgElement, {
      width: targetWidth > 0 ? targetWidth : undefined,
      height: targetHeight > 0 ? targetHeight : undefined,
      rotation,
      flipH,
      flipV,
      adjustments,
      presetFilter,
      watermark:
        activeTab === 'watermark' && watermarkText
          ? {
              type: 'text',
              text: watermarkText,
              color: watermarkColor,
              opacity: watermarkOpacity,
              position: watermarkPosition,
            }
          : undefined,
      annotations,
    }).then((processedCanvas) => {
      if (!isMounted || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      canvasRef.current.width = processedCanvas.width;
      canvasRef.current.height = processedCanvas.height;
      ctx.drawImage(processedCanvas, 0, 0);

      // Also keep original split canvas in sync with dimensions
      if (splitOriginalCanvasRef.current) {
        splitOriginalCanvasRef.current.width = processedCanvas.width;
        splitOriginalCanvasRef.current.height = processedCanvas.height;
        const sCtx = splitOriginalCanvasRef.current.getContext('2d');
        sCtx?.drawImage(imgElement, 0, 0, processedCanvas.width, processedCanvas.height);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [
    imgElement,
    rotation,
    flipH,
    flipV,
    targetWidth,
    targetHeight,
    adjustments,
    presetFilter,
    watermarkText,
    watermarkColor,
    watermarkOpacity,
    watermarkPosition,
    annotations,
    activeTab,
  ]);

  // Adjustment Slider change
  const handleAdjustmentChange = (key: keyof ImageAdjustments, value: any) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  // Auto-Enhance
  const handleAutoEnhance = async () => {
    if (!imgElement) return;
    try {
      const enhancedCanvas = await ImageEngine.autoEnhance(imgElement, { strength: 90, boostVibrance: true });
      const newImg = await FileEngine.loadImage(enhancedCanvas.toDataURL('image/png'));
      setImgElement(newImg);
    } catch (err) {
      console.error('Auto enhance error:', err);
    }
  };

  // Background Removal
  const handleRemoveBackground = async () => {
    if (!imgElement) return;
    try {
      const resultCanvas = await ImageEngine.removeBackground(imgElement, {
        tolerance: bgTolerance,
        edgeFeather: bgFeather,
        replaceColor: bgReplaceColor,
      });
      const newImg = await FileEngine.loadImage(resultCanvas.toDataURL('image/png'));
      setImgElement(newImg);
      setTargetWidth(newImg.naturalWidth);
      setTargetHeight(newImg.naturalHeight);
    } catch (err) {
      console.error('Background removal error:', err);
    }
  };

  // 2x Upscale
  const handleUpscale2x = async () => {
    if (!imgElement) return;
    try {
      const upscaledCanvas = await ImageEngine.upscaleImage(imgElement, 2, 2.0);
      const newImg = await FileEngine.loadImage(upscaledCanvas.toDataURL('image/png'));
      setImgElement(newImg);
      setTargetWidth(newImg.naturalWidth);
      setTargetHeight(newImg.naturalHeight);
    } catch (err) {
      console.error('Upscale error:', err);
    }
  };

  // Passport Photo Preset
  const handlePassportPhoto = async (preset: 'US_2x2' | 'EU_35x45' | 'IN_35x45') => {
    if (!imgElement) return;
    try {
      const sheet = await ImageEngine.createPassportPhotoGrid(imgElement, preset, 6);
      const newImg = await FileEngine.loadImage(sheet.toDataURL('image/png'));
      setImgElement(newImg);
      setTargetWidth(newImg.naturalWidth);
      setTargetHeight(newImg.naturalHeight);
    } catch (err) {
      console.error('Passport photo error:', err);
    }
  };

  // Canvas Mouse Down for Annotation Drawing
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTab !== 'annotate' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setDrawStart({ x, y });

    if (selectedAnnTool === 'brush') {
      setCurrentBrushPoints([{ x, y }]);
    } else if (selectedAnnTool === 'step_badge') {
      const nextStepNum = annotations.filter((a) => a.type === 'step_badge').length + 1;
      const newAnn: AnnotationItem = {
        id: String(Date.now()),
        type: 'step_badge',
        x,
        y,
        color: annColor,
        stepNumber: nextStepNum,
      };
      setAnnotations((prev) => [...prev, newAnn]);
      setIsDrawing(false);
    } else if (selectedAnnTool === 'text') {
      const textVal = prompt('Enter annotation label text:', 'Note');
      if (textVal) {
        const newAnn: AnnotationItem = {
          id: String(Date.now()),
          type: 'text',
          x,
          y,
          text: textVal,
          color: annColor,
          fontSize: 28,
        };
        setAnnotations((prev) => [...prev, newAnn]);
      }
      setIsDrawing(false);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedAnnTool === 'brush') {
      setCurrentBrushPoints((prev) => [...prev, { x, y }]);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const endX = (e.clientX - rect.left) * scaleX;
    const endY = (e.clientY - rect.top) * scaleY;

    let newAnn: AnnotationItem | null = null;

    if (selectedAnnTool === 'arrow') {
      newAnn = {
        id: String(Date.now()),
        type: 'arrow',
        x: drawStart.x,
        y: drawStart.y,
        endX,
        endY,
        color: annColor,
        strokeWidth: annStrokeWidth,
      };
    } else if (selectedAnnTool === 'rect') {
      newAnn = {
        id: String(Date.now()),
        type: 'rect',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
        color: annColor,
        strokeWidth: annStrokeWidth,
      };
    } else if (selectedAnnTool === 'circle') {
      newAnn = {
        id: String(Date.now()),
        type: 'circle',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
        color: annColor,
        strokeWidth: annStrokeWidth,
      };
    } else if (selectedAnnTool === 'pixelate_redaction') {
      newAnn = {
        id: String(Date.now()),
        type: 'pixelate_redaction',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
        mosaicSize: 14,
      };
    } else if (selectedAnnTool === 'blur_redaction') {
      newAnn = {
        id: String(Date.now()),
        type: 'blur_redaction',
        x: Math.min(drawStart.x, endX),
        y: Math.min(drawStart.y, endY),
        width: Math.abs(endX - drawStart.x),
        height: Math.abs(endY - drawStart.y),
      };
    } else if (selectedAnnTool === 'brush' && currentBrushPoints.length > 1) {
      newAnn = {
        id: String(Date.now()),
        type: 'brush',
        x: currentBrushPoints[0].x,
        y: currentBrushPoints[0].y,
        points: currentBrushPoints,
        color: annColor,
        strokeWidth: annStrokeWidth,
      };
    }

    if (newAnn) {
      setAnnotations((prev) => [...prev, newAnn!]);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentBrushPoints([]);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1];
      setAdjustments(prev.adjustments);
      setPresetFilter(prev.presetFilter);
      setRotation(prev.rotation);
      setFlipH(prev.flipH);
      setFlipV(prev.flipV);
      setAnnotations(prev.annotations);
      setHistoryIdx(historyIdx - 1);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1];
      setAdjustments(next.adjustments);
      setPresetFilter(next.presetFilter);
      setRotation(next.rotation);
      setFlipH(next.flipH);
      setFlipV(next.flipV);
      setAnnotations(next.annotations);
      setHistoryIdx(historyIdx + 1);
    }
  };

  // Export & Download
  const handleExport = () => {
    if (!canvasRef.current || !imageFile) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = exportFormat === 'image/jpeg' ? 'jpg' : exportFormat === 'image/webp' ? 'webp' : 'png';
        const baseName = imageFile.name.replace(/\.[^/.]+$/, '');
        const filename = `${baseName}_edited.${ext}`;
        FileEngine.downloadBlob(blob, filename);

        storageEngine.addHistoryItem({
          toolId: 'image-studio',
          toolName: 'Image Studio',
          category: 'images',
          status: 'completed',
          outputFilename: filename,
          outputSummary: `Exported ${canvasRef.current?.width}x${canvasRef.current?.height} ${ext.toUpperCase()}`,
        });
      },
      exportFormat,
      exportQuality / 100
    );
  };

  return (
    <div id="image-studio-workspace" className="flex flex-col h-[calc(100vh-8.5rem)] bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-md">
      {/* Top Header Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {!imageFile ? (
            <label
              htmlFor="img-upload-top"
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Open Image
              <input
                id="img-upload-top"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
          ) : (
            <div className="flex items-center gap-2">
              <label
                htmlFor="img-upload-replace"
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors"
                title="Change Image"
              >
                <Upload className="w-4 h-4" />
                <input
                  id="img-upload-replace"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>

              <div className="h-4 w-px bg-slate-800" />

              {/* Transformations */}
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                title="Rotate 90° Clockwise"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFlipH(!flipH)}
                className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  flipH ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={`p-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  flipV ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-800" />

              {/* Quick AI & Engine Actions */}
              <button
                onClick={handleAutoEnhance}
                className="px-2.5 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Auto Tone & Contrast Equalizer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Auto Enhance
              </button>
              <button
                onClick={handleUpscale2x}
                className="px-2.5 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-xs font-medium text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="2x Super-Resolution Upscaler"
              >
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                2x Upscale
              </button>

              <div className="h-4 w-px bg-slate-800" />

              {/* Undo / Redo */}
              <button
                onClick={handleUndo}
                disabled={historyIdx <= 0}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40 cursor-pointer"
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIdx >= history.length - 1}
                className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-40 cursor-pointer"
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Center Canvas Controls */}
        {imageFile && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSplitView(!showSplitView)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                showSplitView ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Split View Before / After"
            >
              <Columns className="w-3.5 h-3.5" />
              Before / After
            </button>

            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-slate-400">
              <button
                onClick={() => setZoomScale((z) => Math.max(0.2, Number((z - 0.1).toFixed(1))))}
                className="p-1 hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs px-2 font-mono text-slate-200">{Math.round(zoomScale * 100)}%</span>
              <button
                onClick={() => setZoomScale((z) => Math.min(3, Number((z + 0.1).toFixed(1))))}
                className="p-1 hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="px-2 py-0.5 text-[10px] hover:text-white text-slate-400 border-l border-slate-800 cursor-pointer"
              >
                100%
              </button>
            </div>
          </div>
        )}

        {/* Right Export Actions */}
        {imageFile && (
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={(e: any) => setExportFormat(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
            >
              <option value="image/png">PNG (Lossless)</option>
              <option value="image/jpeg">JPG (Standard)</option>
              <option value="image/webp">WebP (Modern)</option>
            </select>

            <button
              onClick={handleExport}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        )}
      </div>

      {/* Main Split Layout: Tool Tabs / Sidebar & Canvas Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {!imageFile ? (
          /* Empty State Dropzone */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/40">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shadow-sm">
              <ImageIcon className="w-10 h-10" />
            </div>
            <h2 className="text-base font-bold text-white mb-1">Image Studio Flagship Workspace</h2>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              Professional client-side editing pipeline: color grading, instant background remover, super-resolution upscaling, vector annotations, and passport photo grids.
            </p>
            <label
              htmlFor="main-file-upload"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white flex items-center gap-2 cursor-pointer shadow-md transition-all hover:scale-105"
            >
              <Upload className="w-4 h-4" />
              Select Image File
              <input
                id="main-file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              />
            </label>
          </div>
        ) : (
          <>
            {/* Left Sidebar: Tool Categories & Adjustments */}
            <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
              {/* Category Tab Bar */}
              <div className="p-2 border-b border-slate-800 flex flex-wrap gap-1 bg-slate-950/60">
                {[
                  { id: 'adjust', label: 'Color', icon: Sliders },
                  { id: 'filters', label: 'Filters', icon: Palette },
                  { id: 'resize', label: 'Resize', icon: Maximize2 },
                  { id: 'bg_remove', label: 'Cutout', icon: Wand2 },
                  { id: 'annotate', label: 'Draw', icon: PenTool },
                  { id: 'watermark', label: 'Watermark', icon: Type },
                  { id: 'passport', label: 'Passport', icon: FileImage },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 min-w-[64px] py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Panel */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                {/* 1. Color Grading & Adjustments */}
                {activeTab === 'adjust' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Light & Exposure</span>
                      <button
                        onClick={() => setAdjustments(DEFAULT_ADJUSTMENTS)}
                        className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>

                    {/* Brightness */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Brightness</span>
                        <span>{adjustments.brightness}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.brightness}
                        onChange={(e) => handleAdjustmentChange('brightness', Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Contrast */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Contrast</span>
                        <span>{adjustments.contrast}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.contrast}
                        onChange={(e) => handleAdjustmentChange('contrast', Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Saturation */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Saturation</span>
                        <span>{adjustments.saturation}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.saturation}
                        onChange={(e) => handleAdjustmentChange('saturation', Number(e.target.value))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Temperature (Warmth) */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Temperature (Warm / Cool)</span>
                        <span>{adjustments.temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.temperature}
                        onChange={(e) => handleAdjustmentChange('temperature', Number(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Tint */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Tint (Magenta / Green)</span>
                        <span>{adjustments.tint}</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={adjustments.tint}
                        onChange={(e) => handleAdjustmentChange('tint', Number(e.target.value))}
                        className="w-full accent-pink-500 cursor-pointer"
                      />
                    </div>

                    {/* Highlights & Shadows */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Highlights</span>
                          <span>{adjustments.highlights}</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={adjustments.highlights}
                          onChange={(e) => handleAdjustmentChange('highlights', Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Shadows</span>
                          <span>{adjustments.shadows}</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          value={adjustments.shadows}
                          onChange={(e) => handleAdjustmentChange('shadows', Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Sharpen & Blur */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Sharpen</span>
                          <span>{adjustments.sharpen}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={adjustments.sharpen}
                          onChange={(e) => handleAdjustmentChange('sharpen', Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Blur</span>
                          <span>{adjustments.blur}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={adjustments.blur}
                          onChange={(e) => handleAdjustmentChange('blur', Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Vignette & Grain */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Vignette</span>
                          <span>{adjustments.vignette}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={adjustments.vignette}
                          onChange={(e) => handleAdjustmentChange('vignette', Number(e.target.value))}
                          className="w-full accent-slate-400 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Noise / Grain</span>
                          <span>{adjustments.noise}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={adjustments.noise}
                          onChange={(e) => handleAdjustmentChange('noise', Number(e.target.value))}
                          className="w-full accent-slate-400 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Toggles: Grayscale, Sepia, Invert */}
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleAdjustmentChange('grayscale', !adjustments.grayscale)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          adjustments.grayscale ? 'bg-blue-600 text-white border-blue-500' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        B&W
                      </button>
                      <button
                        onClick={() => handleAdjustmentChange('sepia', !adjustments.sepia)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          adjustments.sepia ? 'bg-amber-600 text-white border-amber-500' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        Sepia
                      </button>
                      <button
                        onClick={() => handleAdjustmentChange('invert', !adjustments.invert)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                          adjustments.invert ? 'bg-purple-600 text-white border-purple-500' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        Invert
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Preset Filter Palettes */}
                {activeTab === 'filters' && (
                  <div className="space-y-3">
                    <span className="font-semibold text-slate-200 block">Artistic Filter Presets</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: 'none', label: 'Original / Normal' },
                          { id: 'vivid_hdr', label: 'Vivid HDR' },
                          { id: 'cyberpunk', label: 'Cyberpunk' },
                          { id: 'vintage', label: 'Vintage Gold' },
                          { id: 'noir', label: 'Classic Noir' },
                          { id: 'warm_sun', label: 'Golden Hour' },
                          { id: 'cool_slate', label: 'Cool Slate' },
                          { id: 'emerald', label: 'Emerald Forest' },
                          { id: 'moody_teal', label: 'Moody Teal' },
                          { id: 'dramatic', label: 'Dramatic' },
                          { id: 'sunset', label: 'Sunset Glow' },
                          { id: 'faded', label: 'Faded Film' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setPresetFilter(f.id)}
                          className={`p-2.5 rounded-xl border text-left font-medium transition-colors cursor-pointer ${
                            presetFilter === f.id
                              ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold shadow-sm'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <div className="text-xs">{f.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Resize & Presets */}
                {activeTab === 'resize' && (
                  <div className="space-y-4">
                    <span className="font-semibold text-slate-200 block">Dimensions & Scale</span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={targetWidth}
                          onChange={(e) => {
                            const w = Number(e.target.value);
                            setTargetWidth(w);
                            if (maintainAspect && imgElement) {
                              setTargetHeight(Math.round((w / imgElement.naturalWidth) * imgElement.naturalHeight));
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={targetHeight}
                          onChange={(e) => {
                            const h = Number(e.target.value);
                            setTargetHeight(h);
                            if (maintainAspect && imgElement) {
                              setTargetWidth(Math.round((h / imgElement.naturalHeight) * imgElement.naturalWidth));
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintainAspect}
                        onChange={(e) => setMaintainAspect(e.target.checked)}
                        className="rounded border-slate-700 accent-blue-600"
                      />
                      Maintain aspect ratio lock
                    </label>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Popular Presets
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {POPULAR_RESIZE_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => {
                              setTargetWidth(preset.width);
                              setTargetHeight(preset.height);
                              setMaintainAspect(false);
                            }}
                            className="w-full p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer"
                          >
                            <span className="font-medium text-slate-200">{preset.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {preset.width}x{preset.height}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Background Removal */}
                {activeTab === 'bg_remove' && (
                  <div className="space-y-4">
                    <span className="font-semibold text-slate-200 block">Instant Background Cutout</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Automatically detects border color spaces and creates transparent PNG cutouts.
                    </p>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Color Tolerance</span>
                        <span>{bgTolerance}</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="70"
                        value={bgTolerance}
                        onChange={(e) => setBgTolerance(Number(e.target.value))}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bgFeather}
                        onChange={(e) => setBgFeather(e.target.checked)}
                        className="rounded border-slate-700 accent-purple-600"
                      />
                      Anti-aliased soft edge feathering
                    </label>

                    <div className="pt-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Replacement Background</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'transparent', label: 'Alpha' },
                          { id: '#ffffff', label: 'White' },
                          { id: '#0f172a', label: 'Dark' },
                        ].map((bg) => (
                          <button
                            key={bg.id}
                            onClick={() => setBgReplaceColor(bg.id)}
                            className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                              bgReplaceColor === bg.id
                                ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-semibold'
                                : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {bg.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleRemoveBackground}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 font-semibold text-white flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Wand2 className="w-4 h-4" />
                      Apply Cutout
                    </button>
                  </div>
                )}

                {/* 5. Watermark */}
                {activeTab === 'watermark' && (
                  <div className="space-y-4">
                    <span className="font-semibold text-slate-200 block">Watermark Studio</span>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Watermark Text</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Color</label>
                        <input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Opacity ({Math.round(watermarkOpacity * 100)}%)</label>
                        <input
                          type="range"
                          min="0.05"
                          max="1"
                          step="0.05"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Position Mode</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'tile', label: 'Tile Repeat' },
                          { id: 'center', label: 'Center' },
                          { id: 'bottom-right', label: 'Bottom Right' },
                          { id: 'top-left', label: 'Top Left' },
                          { id: 'top-right', label: 'Top Right' },
                          { id: 'bottom-left', label: 'Bottom Left' },
                        ].map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => setWatermarkPosition(pos.id as any)}
                            className={`p-2 rounded-lg border text-center font-medium cursor-pointer ${
                              watermarkPosition === pos.id
                                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold'
                                : 'border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Annotations */}
                {activeTab === 'annotate' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">Vector Annotations</span>
                      <button
                        onClick={() => setAnnotations([])}
                        className="text-[11px] text-red-400 hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'arrow', label: 'Arrow', icon: ArrowRight },
                        { id: 'rect', label: 'Rectangle', icon: Square },
                        { id: 'circle', label: 'Circle', icon: Circle },
                        { id: 'brush', label: 'Freehand', icon: PenTool },
                        { id: 'text', label: 'Text Tag', icon: Type },
                        { id: 'step_badge', label: '1-2-3 Step', icon: Hash },
                        { id: 'pixelate_redaction', label: 'Mosaic Censor', icon: ShieldAlert },
                        { id: 'blur_redaction', label: 'Blur Censor', icon: ShieldAlert },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSel = selectedAnnTool === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setSelectedAnnTool(item.id as any)}
                            className={`p-2 rounded-xl border flex items-center gap-1.5 text-left font-medium transition-colors cursor-pointer ${
                              isSel
                                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[11px] truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Color</label>
                        <input
                          type="color"
                          value={annColor}
                          onChange={(e) => setAnnColor(e.target.value)}
                          className="w-full h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Thickness ({annStrokeWidth}px)</label>
                        <input
                          type="range"
                          min="1"
                          max="16"
                          value={annStrokeWidth}
                          onChange={(e) => setAnnStrokeWidth(Number(e.target.value))}
                          className="w-full accent-blue-500 cursor-pointer mt-2"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 italic">
                      Click and drag directly on the canvas preview to draw annotations or redaction boxes.
                    </p>
                  </div>
                )}

                {/* 7. Passport Photo Studio */}
                {activeTab === 'passport' && (
                  <div className="space-y-4">
                    <span className="font-semibold text-slate-200 block">Passport & ID Sheet Generator</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Generates standard printable 4x6 inch sheet with 6 aligned photos and cutting guide lines.
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={() => handlePassportPhoto('US_2x2')}
                        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-slate-200">US Passport / Visa (2x2 inch)</div>
                        <div className="text-[10px] text-slate-400">Standard 600x600 px @ 300 DPI (6 Copies)</div>
                      </button>

                      <button
                        onClick={() => handlePassportPhoto('EU_35x45')}
                        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-slate-200">EU / UK / Schengen (35x45 mm)</div>
                        <div className="text-[10px] text-slate-400">Standard 413x531 px @ 300 DPI (6 Copies)</div>
                      </button>

                      <button
                        onClick={() => handlePassportPhoto('IN_35x45')}
                        className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-left cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-slate-200">India Passport (35x45 mm)</div>
                        <div className="text-[10px] text-slate-400">Standard White Background Grid (6 Copies)</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Stage: High-Performance Zoomable Canvas Viewport */}
            <div
              ref={stageContainerRef}
              className="flex-1 bg-slate-950 p-6 overflow-auto flex items-center justify-center relative select-none"
            >
              <div
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.1s ease-out',
                }}
                className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800/80 bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] bg-[length:24px_24px]"
              >
                {/* Processed Live Canvas */}
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className={`block max-h-[75vh] max-w-full object-contain ${
                    activeTab === 'annotate' ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                />

                {/* Split View Overlay (Before / After Comparison) */}
                {showSplitView && (
                  <div
                    style={{ clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)` }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <canvas ref={splitOriginalCanvasRef} className="block w-full h-full object-contain" />
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

                {showSplitView && (
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
                    <span className="text-blue-400 font-semibold">Processed</span>
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
