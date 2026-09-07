import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Eraser,
  Plus,
  Trash2,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Layers,
  Eye,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

export interface RedactionBox {
  id: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  reason: string;
  color?: string;
  origin?: 'top-left' | 'bottom-left';
}

interface RedactionToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  redactionBoxes: RedactionBox[];
  setRedactionBoxes: React.Dispatch<React.SetStateAction<RedactionBox[]>>;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
  fileBuffer?: ArrayBuffer | null;
}

export const RedactionToolPanel: React.FC<RedactionToolPanelProps> = ({
  docInfo,
  redactionBoxes,
  setRedactionBoxes,
  isAdvancedMode,
  setIsAdvancedMode,
  fileBuffer,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeReason, setActiveReason] = useState('[REDACTED]');
  const [activeColor, setActiveColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDragRect, setCurrentDragRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Manual coordinate inputs
  const [customX, setCustomX] = useState(50);
  const [customY, setCustomY] = useState(100);
  const [customW, setCustomW] = useState(180);
  const [customH, setCustomH] = useState(30);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageSize, setPageSize] = useState<{ width: number; height: number }>({ width: 595, height: 842 });

  const maxPages = docInfo?.numPages || 1;

  // Render PDF Page to canvas
  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!fileBuffer || !canvasRef.current) return;
      try {
        const pdfjsLib = await import('pdfjs-dist');
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(fileBuffer.slice(0)),
          useSystemFonts: true,
        });
        const doc = await loadingTask.promise;
        const page = await doc.getPage(currentPage);
        if (isCancelled) return;

        const viewportUnscaled = page.getViewport({ scale: 1.0 });
        setPageSize({ width: viewportUnscaled.width, height: viewportUnscaled.height });

        // Calculate responsive scale based on container width
        const containerW = containerRef.current ? containerRef.current.clientWidth : 500;
        const targetWidth = Math.min(600, Math.max(300, containerW - 32));
        const scale = targetWidth / viewportUnscaled.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await page.render({
          canvasContext: ctx,
          viewport,
        } as any).promise;
      } catch (err) {
        console.warn('PDF Page preview rendering notice:', err);
      }
    };

    renderPage();
    return () => {
      isCancelled = true;
    };
  }, [fileBuffer, currentPage]);

  // Handle interactive mouse/touch drawing over page
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (clickX < 0 || clickY < 0 || clickX > rect.width || clickY > rect.height) return;

    setIsDrawing(true);
    setDrawStart({ x: clickX, y: clickY });
    setCurrentDragRect({ x: clickX, y: clickY, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const currentY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);

    setCurrentDragRect({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDragRect || !canvasRef.current) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDragRect(null);
      return;
    }

    const canvas = canvasRef.current;
    if (currentDragRect.w > 5 && currentDragRect.h > 5) {
      // Scale from canvas display coordinates to PDF point coordinates
      const scaleX = pageSize.width / canvas.width;
      const scaleY = pageSize.height / canvas.height;

      const pdfX = Math.round(currentDragRect.x * scaleX);
      const pdfY = Math.round(currentDragRect.y * scaleY);
      const pdfW = Math.round(currentDragRect.w * scaleX);
      const pdfH = Math.round(currentDragRect.h * scaleY);

      const newBox: RedactionBox = {
        id: `redact-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        pageNumber: currentPage,
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
        reason: activeReason,
        color: activeColor,
        origin: 'top-left',
      };

      setRedactionBoxes((prev) => [...prev, newBox]);
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDragRect(null);
  };

  const handleAddManualBox = () => {
    const newBox: RedactionBox = {
      id: `redact-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      pageNumber: currentPage,
      x: customX,
      y: customY,
      width: customW,
      height: customH,
      reason: activeReason,
      color: activeColor,
      origin: 'top-left',
    };
    setRedactionBoxes((prev) => [...prev, newBox]);
  };

  const handleRemoveBox = (id: string) => {
    setRedactionBoxes((prev) => prev.filter((b) => b.id !== id));
  };

  const handleClearPageBoxes = () => {
    setRedactionBoxes((prev) => prev.filter((b) => b.pageNumber !== currentPage));
  };

  const handleClearAllBoxes = () => {
    setRedactionBoxes([]);
  };

  // Pre-configured preset reasons
  const presetReasons = [
    '[REDACTED]',
    'CONFIDENTIAL',
    'PII / PRIVACY',
    'SSN / ID MASKED',
    'FINANCIAL DATA',
    'LEGAL PRIVILEGE',
  ];

  const currentPageBoxes = redactionBoxes.filter((b) => b.pageNumber === currentPage);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Eraser className="w-4 h-4 text-red-500" />
            PDF Permanent Redaction & Sanitization
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Draw blackout boxes directly on pages. Underlying text streams and vector glyphs are permanently destroyed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            isAdvancedMode
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {isAdvancedMode ? 'Manual Coordinates' : 'Visual Draw Mode'}
        </button>
      </div>

      {/* Preset Reasons & Color Selector */}
      <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Redaction Reason Label
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetReasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setActiveReason(reason)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    activeReason === reason
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Mask Color
            </label>
            <div className="flex items-center gap-2">
              {[
                { label: 'Blackout', color: '#000000' },
                { label: 'Whiteout', color: '#ffffff' },
                { label: 'Charcoal', color: '#1e293b' },
              ].map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setActiveColor(c.color)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg flex items-center gap-1.5 border transition-all cursor-pointer ${
                    activeColor === c.color
                      ? 'border-red-500 ring-1 ring-red-500 bg-white dark:bg-slate-900 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Visual Canvas Editor Stage */}
      <div className="space-y-3" ref={containerRef}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Interactive Page Viewer (Page {currentPage} of {maxPages})
            </span>
            <span className="text-[11px] text-slate-400">
              • Click and drag to create blackout box
            </span>
          </div>

          {/* Page Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
              {currentPage} / {maxPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(maxPages, p + 1))}
              disabled={currentPage >= maxPages}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Canvas Display Stage with Overlaid Redaction Boxes */}
        <div className="relative flex justify-center bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden select-none">
          <div
            className="relative shadow-md cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <canvas ref={canvasRef} className="block rounded bg-white" />

            {/* Overlaid Existing Redaction Boxes for Current Page */}
            {canvasRef.current &&
              currentPageBoxes.map((b) => {
                const scaleX = canvasRef.current!.width / pageSize.width;
                const scaleY = canvasRef.current!.height / pageSize.height;
                const left = b.x * scaleX;
                const top = b.y * scaleY;
                const width = b.width * scaleX;
                const height = b.height * scaleY;

                return (
                  <div
                    key={b.id}
                    className="absolute border border-red-500 group flex items-center justify-center text-[10px] font-bold select-none"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      backgroundColor: b.color || '#000000',
                      color: b.color === '#ffffff' ? '#000000' : '#ffffff',
                    }}
                  >
                    <span className="truncate px-1 pointer-events-none">{b.reason}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBox(b.id);
                      }}
                      className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

            {/* Live Dragging Rectangle */}
            {currentDragRect && (
              <div
                className="absolute border-2 border-red-500 pointer-events-none"
                style={{
                  left: `${currentDragRect.x}px`,
                  top: `${currentDragRect.y}px`,
                  width: `${currentDragRect.w}px`,
                  height: `${currentDragRect.h}px`,
                  backgroundColor: activeColor,
                  opacity: 0.8,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Manual Coordinates (Advanced Mode) */}
      {isAdvancedMode && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Manual Coordinate Inputs (Points)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">X Offset (pt)</label>
              <input
                type="number"
                value={customX}
                onChange={(e) => setCustomX(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Y Offset (pt)</label>
              <input
                type="number"
                value={customY}
                onChange={(e) => setCustomY(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Width (pt)</label>
              <input
                type="number"
                value={customW}
                onChange={(e) => setCustomW(parseInt(e.target.value, 10) || 10)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Height (pt)</label>
              <input
                type="number"
                value={customH}
                onChange={(e) => setCustomH(parseInt(e.target.value, 10) || 10)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddManualBox}
            className="w-full py-2 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Manual Redaction Region to Page {currentPage}
          </button>
        </div>
      )}

      {/* Redaction List & Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span>Scheduled Redactions ({redactionBoxes.length} total)</span>
          </h4>
          {redactionBoxes.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearPageBoxes}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear Page {currentPage}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={handleClearAllBoxes}
                className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {redactionBoxes.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No redactions queued. Drag on the page above to black out confidential areas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {redactionBoxes.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-slate-300"
                    style={{ backgroundColor: b.color || '#000' }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">
                    Pg {b.pageNumber}:
                  </span>
                  <span className="text-slate-600 dark:text-slate-400 truncate">{b.reason}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBox(b.id)}
                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Irreversibility and Legal Sanitization Notice */}
      <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
        <div>
          <strong className="block font-bold mb-0.5">Permanent Content Destruction:</strong>
          <span>
            Unlike basic viewer overlays, this tool burns redactions into high-resolution raster bitmaps,
            permanently purging all underlying text streams, OCR tokens, and vector operators.
          </span>
        </div>
      </div>
    </div>
  );
};
