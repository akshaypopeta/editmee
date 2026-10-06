import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  Trash2,
  Copy,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { DesignElement, CanvasSettings, DrawingPoint, DrawingPath } from './types';
import {
  renderCanvas,
  hitTestElement,
  hitTestHandle,
  calculateSnapping,
  HandleHit,
} from './canvasEngine';

interface CanvasViewportProps {
  elements: DesignElement[];
  settings: CanvasSettings;
  selectedIds: string[];
  onSelectElement: (id: string | null, multi?: boolean) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onCommitHistory: () => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  onNudgeSelected: (dx: number, dy: number) => void;
  isDrawingMode: boolean;
  drawingTool: 'brush' | 'pencil' | 'highlighter' | 'eraser';
  drawColor: string;
  drawWidth: number;
  onAddDrawingElement: (paths: DrawingPath[]) => void;
  onUpdateCanvasSettings: (updates: Partial<CanvasSettings>) => void;
  fitTrigger?: number;
  onOpenInspector?: () => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  elements,
  settings,
  selectedIds,
  onSelectElement,
  onUpdateElement,
  onCommitHistory,
  onDeleteSelected,
  onDuplicateSelected,
  onNudgeSelected,
  isDrawingMode,
  drawingTool,
  drawColor,
  drawWidth,
  onAddDrawingElement,
  onUpdateCanvasSettings,
  fitTrigger = 0,
  onOpenInspector,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Interaction State
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeGuides, setActiveGuides] = useState<
    Array<{ orientation: 'horizontal' | 'vertical'; position: number }>
  >([]);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanToolActive, setIsPanToolActive] = useState(false);

  // Dragging / Resizing / Rotating / Drawing / Panning state ref
  const interactionRef = useRef<{
    mode: 'none' | 'move' | 'resize' | 'rotate' | 'pan' | 'draw';
    handle?: HandleHit['handle'];
    startX: number;
    startY: number;
    initialElementState?: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    };
    currentDrawingPoints?: DrawingPoint[];
    initialPan?: { x: number; y: number };
  }>({ mode: 'none', startX: 0, startY: 0 });

  // Touch pinch-to-zoom and pan state ref
  const touchPinchRef = useRef<{
    initialDistance: number;
    initialZoom: number;
    initialMidX: number;
    initialMidY: number;
    initialPan: { x: number; y: number };
  } | null>(null);

  // Measure container and perform responsive Fit-to-Workspace
  const fitToWorkspace = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth < 40 || clientHeight < 40) return;

    // Responsive padding: minimal on mobile to maximize canvas size, standard on desktop
    const paddingX = clientWidth < 640 ? 8 : clientWidth < 1024 ? 16 : 24;
    const paddingY = clientHeight < 640 ? 8 : clientHeight < 1024 ? 16 : 24;
    const availW = Math.max(40, clientWidth - paddingX * 2);
    const availH = Math.max(40, clientHeight - paddingY * 2);

    const scaleX = availW / settings.width;
    const scaleY = availH / settings.height;
    const bestFit = Math.min(scaleX, scaleY);
    const targetZoom = Math.max(0.1, Math.min(3.0, Number(bestFit.toFixed(3))));

    onUpdateCanvasSettings({
      zoom: targetZoom,
      panOffset: { x: 0, y: 0 },
    });
  }, [settings.width, settings.height, onUpdateCanvasSettings]);

  // Initial fit on mount safely
  useEffect(() => {
    fitToWorkspace();
    const t1 = setTimeout(fitToWorkspace, 100);

    let rafId: number | null = null;
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    let lastHeight = typeof window !== 'undefined' ? window.innerHeight : 0;

    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const curWidth = window.innerWidth;
        const curHeight = window.innerHeight;
        // Only re-fit if orientation or significant dimension changed (>40px)
        if (Math.abs(curWidth - lastWidth) > 40 || Math.abs(curHeight - lastHeight) > 60) {
          lastWidth = curWidth;
          lastHeight = curHeight;
          fitToWorkspace();
        }
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(t1);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, [fitToWorkspace]);

  // Respond to explicit fitTrigger (e.g. from topbar button or panel toggle)
  useEffect(() => {
    if (fitTrigger > 0) {
      fitToWorkspace();
    }
  }, [fitTrigger, fitToWorkspace]);

  // Dynamic Resizing via ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    let lastW = 0;
    let lastH = 0;
    let ro: ResizeObserver | null = null;

    try {
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const w = entry.contentRect.width;
            const h = entry.contentRect.height;
            if (w > 50 && h > 50) {
              if (Math.abs(w - lastW) > 16 || Math.abs(h - lastH) > 16) {
                lastW = w;
                lastH = h;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                  fitToWorkspace();
                }, 100);
              }
            }
          }
        });
        ro.observe(el);
      }
    } catch {}

    return () => {
      if (ro) ro.disconnect();
      clearTimeout(timeoutId);
    };
  }, [fitToWorkspace]);

  // Translate client coordinates (mouse/touch) into Artboard Canvas Coordinates
  const getCanvasCoordsFromClient = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = settings.width / rect.width;
      const scaleY = settings.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    [settings.width, settings.height]
  );

  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
      return getCanvasCoordsFromClient(e.clientX, e.clientY);
    },
    [getCanvasCoordsFromClient]
  );

  // Render loop whenever state changes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderCanvas(ctx, elements, settings, {
      interactive: true,
      selectedIds,
      hoveredId,
      activeGuides,
      exportScale: 1,
    });
  }, [elements, settings, selectedIds, hoveredId, activeGuides]);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      redraw();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [redraw]);

  // Keyboard Shortcuts & Spacebar Panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          onDeleteSelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateSelected();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNudgeSelected(e.shiftKey ? -10 : -1, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNudgeSelected(e.shiftKey ? 10 : 1, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNudgeSelected(0, e.shiftKey ? -10 : -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNudgeSelected(0, e.shiftKey ? 10 : 1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedIds, onDeleteSelected, onDuplicateSelected, onNudgeSelected]);

  // Pointer Down logic shared by mouse & touch
  const startSinglePointerInteraction = (
    clientX: number,
    clientY: number,
    isMiddleOrSpace: boolean,
    shiftKey: boolean
  ) => {
    // 0. Pan Canvas Mode
    if (isMiddleOrSpace || isPanToolActive) {
      interactionRef.current = {
        mode: 'pan',
        startX: clientX,
        startY: clientY,
        initialPan: { ...(settings.panOffset || { x: 0, y: 0 }) },
      };
      return;
    }

    const { x, y } = getCanvasCoordsFromClient(clientX, clientY);
    const selectedEl = elements.find((el) => selectedIds.includes(el.id));

    // 1. Freehand Drawing Mode
    if (isDrawingMode) {
      interactionRef.current = {
        mode: 'draw',
        startX: x,
        startY: y,
        currentDrawingPoints: [{ x, y, pressure: 1 }],
      };
      return;
    }

    // 2. Selection handle hit testing
    if (selectedEl) {
      const handleHit = hitTestHandle(x, y, selectedEl);
      if (handleHit) {
        if (handleHit.type === 'rotation') {
          interactionRef.current = {
            mode: 'rotate',
            startX: x,
            startY: y,
            initialElementState: {
              x: selectedEl.x,
              y: selectedEl.y,
              width: selectedEl.width,
              height: selectedEl.height,
              rotation: selectedEl.rotation,
            },
          };
          return;
        } else if (handleHit.type === 'handle') {
          interactionRef.current = {
            mode: 'resize',
            handle: handleHit.handle,
            startX: x,
            startY: y,
            initialElementState: {
              x: selectedEl.x,
              y: selectedEl.y,
              width: selectedEl.width,
              height: selectedEl.height,
              rotation: selectedEl.rotation,
            },
          };
          return;
        }
      }
    }

    // 3. Element body hit testing
    const hitEl = hitTestElement(x, y, elements);
    if (hitEl) {
      onSelectElement(hitEl.id, shiftKey);
      interactionRef.current = {
        mode: 'move',
        startX: x,
        startY: y,
        initialElementState: {
          x: hitEl.x,
          y: hitEl.y,
          width: hitEl.width,
          height: hitEl.height,
          rotation: hitEl.rotation,
        },
      };
    } else {
      // Clicked on canvas artboard background
      onSelectElement(null);
      interactionRef.current = { mode: 'none', startX: x, startY: y };
    }
  };

  // Pointer Move logic shared by mouse & touch
  const processPointerMove = (clientX: number, clientY: number, shiftKey: boolean) => {
    const inter = interactionRef.current;
    const selectedEl = elements.find((el) => selectedIds.includes(el.id));

    // Panning canvas
    if (inter.mode === 'pan' && inter.initialPan) {
      const dx = clientX - inter.startX;
      const dy = clientY - inter.startY;
      onUpdateCanvasSettings({
        panOffset: {
          x: inter.initialPan.x + dx,
          y: inter.initialPan.y + dy,
        },
      });
      return;
    }

    const { x, y } = getCanvasCoordsFromClient(clientX, clientY);

    // Hover Cursor & Highlight (desktop mouse only)
    if (inter.mode === 'none') {
      if (isSpacePressed || isPanToolActive) {
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
        return;
      }
      if (isDrawingMode) {
        if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
        return;
      }

      if (selectedEl) {
        const handleHit = hitTestHandle(x, y, selectedEl);
        if (handleHit) {
          if (handleHit.type === 'rotation') {
            if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
            return;
          }
          if (handleHit.type === 'handle') {
            if (canvasRef.current) {
              const h = handleHit.handle;
              const cursor =
                h === 'nw' || h === 'se'
                  ? 'nwse-resize'
                  : h === 'ne' || h === 'sw'
                  ? 'nesw-resize'
                  : h === 'n' || h === 's'
                  ? 'ns-resize'
                  : 'ew-resize';
              canvasRef.current.style.cursor = cursor;
            }
            return;
          }
        }
      }

      const hit = hitTestElement(x, y, elements);
      setHoveredId(hit ? hit.id : null);
      if (canvasRef.current) {
        canvasRef.current.style.cursor = hit ? 'move' : 'default';
      }
      return;
    }

    // Active Drawing Mode
    if (inter.mode === 'draw' && inter.currentDrawingPoints) {
      inter.currentDrawingPoints.push({ x, y, pressure: 1 });
      return;
    }

    // Active Move
    if (inter.mode === 'move' && selectedEl && inter.initialElementState) {
      const dx = x - inter.startX;
      const dy = y - inter.startY;

      let newX = inter.initialElementState.x + dx;
      let newY = inter.initialElementState.y + dy;

      if (settings.enableSnapping) {
        const snap = calculateSnapping(
          { ...selectedEl, x: newX, y: newY },
          elements,
          settings.width,
          settings.height
        );
        newX = snap.snappedX;
        newY = snap.snappedY;
        setActiveGuides(snap.guides);
      } else {
        setActiveGuides([]);
      }

      onUpdateElement(selectedEl.id, { x: newX, y: newY });
      return;
    }

    // Active Resize
    if (inter.mode === 'resize' && selectedEl && inter.initialElementState && inter.handle) {
      const dx = x - inter.startX;
      const dy = y - inter.startY;
      const init = inter.initialElementState;
      const h = inter.handle;

      let newX = init.x;
      let newY = init.y;
      let newW = init.width;
      let newH = init.height;

      if (h.includes('e')) newW = Math.max(20, init.width + dx);
      if (h.includes('s')) newH = Math.max(20, init.height + dy);
      if (h.includes('w')) {
        const potentialW = init.width - dx;
        if (potentialW >= 20) {
          newW = potentialW;
          newX = init.x + dx;
        }
      }
      if (h.includes('n')) {
        const potentialH = init.height - dy;
        if (potentialH >= 20) {
          newH = potentialH;
          newY = init.y + dy;
        }
      }

      // Aspect ratio preservation when Shift held
      if (shiftKey && init.height > 0) {
        const aspect = init.width / init.height;
        newH = newW / aspect;
      }

      onUpdateElement(selectedEl.id, { x: newX, y: newY, width: newW, height: newH });
      return;
    }

    // Active Rotation
    if (inter.mode === 'rotate' && selectedEl && inter.initialElementState) {
      const cx = selectedEl.x + selectedEl.width / 2;
      const cy = selectedEl.y + selectedEl.height / 2;
      const rad = Math.atan2(y - cy, x - cx);
      let deg = (rad * 180) / Math.PI + 90;

      if (shiftKey) {
        deg = Math.round(deg / 15) * 15;
      }

      onUpdateElement(selectedEl.id, { rotation: Math.round(deg) });
      return;
    }
  };

  // Pointer Up logic
  const finishPointerInteraction = () => {
    const inter = interactionRef.current;
    setActiveGuides([]);

    // Commit freehand drawing path into elements list
    if (inter.mode === 'draw' && inter.currentDrawingPoints && inter.currentDrawingPoints.length > 1) {
      const minX = Math.min(...inter.currentDrawingPoints.map((p) => p.x));
      const minY = Math.min(...inter.currentDrawingPoints.map((p) => p.y));

      const relativePoints = inter.currentDrawingPoints.map((p) => ({
        x: p.x - minX,
        y: p.y - minY,
        pressure: p.pressure,
      }));

      const newPath: DrawingPath = {
        points: relativePoints,
        color: drawColor,
        width: drawWidth,
        tool: drawingTool,
        opacity: drawingTool === 'highlighter' ? 0.45 : 1,
      };

      onAddDrawingElement([newPath]);
    }

    if (inter.mode !== 'none' && inter.mode !== 'pan') {
      onCommitHistory();
    }

    interactionRef.current = { mode: 'none', startX: 0, startY: 0 };
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const isMiddle = e.button === 1;
    startSinglePointerInteraction(e.clientX, e.clientY, isMiddle || isSpacePressed, e.shiftKey);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    processPointerMove(e.clientX, e.clientY, e.shiftKey);
  };

  const handleMouseUp = () => {
    finishPointerInteraction();
  };

  // Touch Handlers for Mobile & Tablet (Pinch-to-zoom, Pan, Single-finger editing)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      const t = e.touches[0];
      startSinglePointerInteraction(t.clientX, t.clientY, isPanToolActive, false);
    } else if (e.touches.length === 2) {
      // Two fingers: Pinch-to-zoom and Two-finger Pan
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchPinchRef.current = {
        initialDistance: distance,
        initialZoom: settings.zoom,
        initialMidX: midX,
        initialMidY: midY,
        initialPan: { ...(settings.panOffset || { x: 0, y: 0 }) },
      };
      interactionRef.current = { mode: 'pan', startX: midX, startY: midY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    if (e.touches.length === 1 && interactionRef.current.mode !== 'pan') {
      const t = e.touches[0];
      processPointerMove(t.clientX, t.clientY, false);
    } else if (e.touches.length === 2 && touchPinchRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const distance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      const scale = distance / touchPinchRef.current.initialDistance;
      const newZoom = Math.max(0.05, Math.min(4.0, touchPinchRef.current.initialZoom * scale));

      const deltaX = midX - touchPinchRef.current.initialMidX;
      const deltaY = midY - touchPinchRef.current.initialMidY;

      onUpdateCanvasSettings({
        zoom: Number(newZoom.toFixed(3)),
        panOffset: {
          x: touchPinchRef.current.initialPan.x + deltaX,
          y: touchPinchRef.current.initialPan.y + deltaY,
        },
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) {
      finishPointerInteraction();
      touchPinchRef.current = null;
    } else if (e.touches.length === 1) {
      touchPinchRef.current = null;
      interactionRef.current = { mode: 'none', startX: 0, startY: 0 };
    }
  };

  // Zoom via wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      onUpdateCanvasSettings({
        zoom: Math.max(0.05, Math.min(4.0, Number((settings.zoom + delta).toFixed(3)))),
      });
    } else {
      // Pan via wheel
      const currentPan = settings.panOffset || { x: 0, y: 0 };
      onUpdateCanvasSettings({
        panOffset: {
          x: currentPan.x - e.deltaX * 0.8,
          y: currentPan.y - e.deltaY * 0.8,
        },
      });
    }
  };

  const selectedEl = elements.find((el) => selectedIds.includes(el.id)) || null;

  return (
    <main
      ref={containerRef}
      onWheel={handleWheel}
      className="flex-1 w-full h-full min-h-[360px] sm:min-h-[480px] bg-slate-950 relative overflow-hidden flex items-center justify-center select-none touch-none"
      style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }}
    >
      {/* Dimension Label Tag (Top-Left) */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 shadow-md">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span className="font-semibold">
          {settings.width} × {settings.height} px
        </span>
        <span className="text-slate-500">•</span>
        <button
          type="button"
          onClick={fitToWorkspace}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Click to Fit to Screen"
        >
          {Math.round(settings.zoom * 100)}%
        </button>
      </div>

      {/* Floating Canvas View Controls HUD (Bottom-Right) */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-xl gap-0.5 text-slate-300">
        <button
          type="button"
          onClick={() =>
            onUpdateCanvasSettings({
              zoom: Math.max(0.05, Number((settings.zoom - 0.1).toFixed(2))),
            })
          }
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() =>
            onUpdateCanvasSettings({
              zoom: 1.0,
              panOffset: { x: 0, y: 0 },
            })
          }
          className="px-2 py-1 text-[11px] font-mono font-bold hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="Reset to 100%"
        >
          {Math.round(settings.zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={() =>
            onUpdateCanvasSettings({
              zoom: Math.min(4.0, Number((settings.zoom + 0.1).toFixed(2))),
            })
          }
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />

        <button
          type="button"
          onClick={fitToWorkspace}
          className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors cursor-pointer text-slate-400 hover:text-white"
          title="Fit to Workspace"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => setIsPanToolActive(!isPanToolActive)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            isPanToolActive ? 'bg-red-600 text-white' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
          title="Pan / Hand Tool"
        >
          <Hand className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Contextual Quick Actions for Selected Element (Mobile / Tablet bottom HUD) */}
      {selectedEl && (
        <div className="absolute top-3 right-3 lg:top-auto lg:bottom-3 lg:left-1/2 lg:-translate-x-1/2 z-10 flex items-center bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-2xl gap-1 text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 truncate max-w-[80px]">
            {selectedEl.type}
          </span>
          <div className="w-[1px] h-4 bg-slate-800" />
          <button
            type="button"
            onClick={onDuplicateSelected}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDeleteSelected}
            className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {onOpenInspector && (
            <button
              type="button"
              onClick={onOpenInspector}
              className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ml-1"
            >
              <Sliders className="w-3 h-3 text-red-400" />
              <span>Inspect</span>
            </button>
          )}
        </div>
      )}

      {/* Panning & Scaled Canvas Container Wrapper */}
      <div
        className="relative flex items-center justify-center will-change-transform"
        style={{
          transform: `translate3d(${settings.panOffset?.x || 0}px, ${settings.panOffset?.y || 0}px, 0)`,
          transition: interactionRef.current.mode === 'pan' ? 'none' : 'transform 0.08s ease-out',
        }}
      >
        <div
          className="relative shadow-2xl rounded-sm border border-slate-800/80 bg-slate-900 overflow-visible transition-shadow"
          style={{
            width: Math.max(20, Math.round(settings.width * settings.zoom)),
            height: Math.max(20, Math.round(settings.height * settings.zoom)),
          }}
        >
          <canvas
            ref={canvasRef}
            width={settings.width}
            height={settings.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className="w-full h-full block touch-none"
          />
        </div>
      </div>
    </main>
  );
};
