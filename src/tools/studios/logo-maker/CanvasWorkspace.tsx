import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Magnet,
  Ruler,
  Shield,
  Lock,
  Unlock,
} from 'lucide-react';
import { LogoElement, CanvasDimensions, AlignmentGuide, ShapeType } from './types';
import { drawShapeOnCanvas } from './vectorShapes';
import { renderThreeDElement } from './threeDRenderer';
import { CanvasRulers } from './CanvasRulers';

interface CanvasWorkspaceProps {
  canvasSize: CanvasDimensions;
  bgType: 'transparent' | 'solid' | 'gradient';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  zoom: number;
  setZoom?: React.Dispatch<React.SetStateAction<number>>;
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isPanMode: boolean;
  showGrid: boolean;
  setShowGrid?: (v: boolean) => void;
  showRulers: boolean;
  setShowRulers?: (v: boolean) => void;
  showSafeArea: boolean;
  setShowSafeArea?: (v: boolean) => void;
  enableSnapping: boolean;
  setEnableSnapping?: (v: boolean) => void;
  elements: LogoElement[];
  selectedIds: string[];
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  activeGuides: AlignmentGuide[];
  setActiveGuides: React.Dispatch<React.SetStateAction<AlignmentGuide[]>>;
  onUpdateElement: (id: string, updates: Partial<LogoElement>) => void;
  onUpdateElementsBatch: (updates: { id: string; changes: Partial<LogoElement> }[]) => void;
  onCommitHistory: () => void;
  cursorPos: { x: number; y: number } | null;
  setCursorPos: (pos: { x: number; y: number } | null) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  onFitCanvas?: () => void;
}

export const CanvasWorkspace: React.FC<CanvasWorkspaceProps> = ({
  canvasSize,
  bgType,
  bgColor,
  gradientStart,
  gradientEnd,
  gradientAngle,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  isPanMode,
  showGrid,
  setShowGrid,
  showRulers,
  setShowRulers,
  showSafeArea,
  setShowSafeArea,
  enableSnapping,
  setEnableSnapping,
  elements,
  selectedIds,
  setSelectedIds,
  activeGuides,
  setActiveGuides,
  onUpdateElement,
  onUpdateElementsBatch,
  onCommitHistory,
  cursorPos,
  setCursorPos,
  canvasRef,
  containerRef,
  onFitCanvas,
}) => {
  // Container dimensions
  const [workspaceSize, setWorkspaceSize] = useState({ width: 800, height: 600 });
  const [activeBadge, setActiveBadge] = useState<string | null>(null);

  // ResizeObserver to ensure continuous auto-fit calculation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleResize = () => {
      setWorkspaceSize({
        width: el.clientWidth || 800,
        height: el.clientHeight || 600,
      });
    };
    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  // Responsive display scale calculation
  const isMobile = workspaceSize.width < 768;
  const isTablet = workspaceSize.width >= 768 && workspaceSize.width < 1024;
  const rulerOffset = showRulers && !isMobile ? 24 : 0;
  const padding = isMobile ? 12 : isTablet ? 24 : 40;

  const availableW = Math.max(60, workspaceSize.width - rulerOffset - padding * 2);
  const availableH = Math.max(60, workspaceSize.height - rulerOffset - padding * 2);

  const baseFitScale = Math.min(availableW / canvasSize.width, availableH / canvasSize.height);
  const displayScale = Math.max(0.05, baseFitScale * zoom);
  const displayWidth = Math.round(canvasSize.width * displayScale);
  const displayHeight = Math.round(canvasSize.height * displayScale);

  // Interaction engine refs
  const interactionTypeRef = useRef<'move' | 'resize' | 'rotate' | 'pan' | 'pinch' | null>(null);
  const resizeHandleRef = useRef<string | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragDistanceRef = useRef<number>(0);
  const startElementStatesRef = useRef<
    {
      id: string;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      fontSize?: number;
    }[]
  >([]);

  // Multi-touch tracking
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number>(0);
  const pinchStartZoomRef = useRef<number>(1);
  const pinchStartMidRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Fit to screen
  const handleResetOrFit = () => {
    if (onFitCanvas) {
      onFitCanvas();
    } else {
      if (setZoom) setZoom(1);
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Set actual backing store pixels
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // 1. Background
    if (bgType === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    } else if (bgType === 'gradient') {
      const angleRad = (gradientAngle * Math.PI) / 180;
      const halfW = canvasSize.width / 2;
      const halfH = canvasSize.height / 2;
      const grad = ctx.createLinearGradient(
        halfW - Math.cos(angleRad) * halfW,
        halfH - Math.sin(angleRad) * halfH,
        halfW + Math.cos(angleRad) * halfW,
        halfH + Math.sin(angleRad) * halfH
      );
      grad.addColorStop(0, gradientStart);
      grad.addColorStop(1, gradientEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }

    // 2. Checkerboard pattern for transparent canvas preview
    if (bgType === 'transparent' && showGrid) {
      const checkSize = 16;
      for (let x = 0; x < canvasSize.width; x += checkSize) {
        for (let y = 0; y < canvasSize.height; y += checkSize) {
          if ((Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0) {
            ctx.fillStyle = '#1e293b';
          } else {
            ctx.fillStyle = '#0f172a';
          }
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
    }

    // 3. Render Elements in exact array order (index 0 is bottom, elements.length - 1 is top)
    elements.forEach((el) => {
      if (!el.visible) return;

      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;
      if (el.blendMode) ctx.globalCompositeOperation = el.blendMode;

      // Translate to element origin and apply rotation
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);

      // Check if 3D rendering is enabled for this element
      if (el.threeD && el.threeD.enabled) {
        renderThreeDElement(ctx, el);
        ctx.restore();
        return;
      }

      // Apply drop shadow if enabled
      if (el.shadow && el.shadow.blur > 0) {
        ctx.shadowColor = el.shadow.color;
        ctx.shadowBlur = el.shadow.blur;
        ctx.shadowOffsetX = el.shadow.offsetX;
        ctx.shadowOffsetY = el.shadow.offsetY;
      }

      // Render TEXT
      if (el.type === 'text') {
        const textContent = el.uppercase ? (el.text || '').toUpperCase() : el.text || '';
        const fontStyle = el.fontStyle || 'normal';
        const fontWeight = el.fontWeight || 'normal';
        const fontSize = el.fontSize || 36;
        const fontFamily = el.fontFamily || 'Inter, sans-serif';

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.textAlign = el.textAlign || 'center';
        ctx.textBaseline = 'middle';

        // Apply Fill
        if ((el.fillType === 'linear' || el.fillType === 'radial') && el.gradient) {
          const grad = ctx.createLinearGradient(-el.width / 2, 0, el.width / 2, 0);
          grad.addColorStop(0, el.gradient.startColor);
          grad.addColorStop(1, el.gradient.endColor);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = el.fillColor || '#000000';
        }

        if (el.isCurved) {
          // Curved / Circular arc text rendering
          const radius = el.curveRadius || 150;
          const direction = el.curveDirection === 'concave' ? -1 : 1;
          const chars = textContent.split('');
          const totalAngle = (el.curveArc || 140) * (Math.PI / 180);
          const angleStep = chars.length > 1 ? totalAngle / (chars.length - 1) : 0;
          const startAngle = -totalAngle / 2;

          ctx.save();
          chars.forEach((char, i) => {
            const charAngle = startAngle + i * angleStep;
            ctx.save();
            ctx.rotate(charAngle * direction);
            ctx.translate(0, -radius * direction);
            if (direction === -1) ctx.rotate(Math.PI);
            ctx.fillText(char, 0, 0);
            if (el.stroke && el.stroke.width > 0) {
              ctx.strokeStyle = el.stroke.color;
              ctx.lineWidth = el.stroke.width;
              ctx.strokeText(char, 0, 0);
            }
            ctx.restore();
          });
          ctx.restore();
        } else {
          // Standard text rendering with letter spacing
          const letterSpacing = el.letterSpacing || 0;
          if (letterSpacing !== 0) {
            const chars = textContent.split('');
            let totalWidth = 0;
            const widths = chars.map((ch) => {
              const w = ctx.measureText(ch).width;
              totalWidth += w + letterSpacing;
              return w;
            });
            totalWidth -= letterSpacing;

            let curX = -totalWidth / 2;
            chars.forEach((ch, idx) => {
              ctx.fillText(ch, curX + widths[idx] / 2, 0);
              if (el.stroke && el.stroke.width > 0) {
                ctx.strokeStyle = el.stroke.color;
                ctx.lineWidth = el.stroke.width;
                ctx.strokeText(ch, curX + widths[idx] / 2, 0);
              }
              curX += widths[idx] + letterSpacing;
            });
          } else {
            ctx.fillText(textContent, 0, 0);
            if (el.stroke && el.stroke.width > 0) {
              ctx.strokeStyle = el.stroke.color;
              ctx.lineWidth = el.stroke.width;
              ctx.strokeText(textContent, 0, 0);
            }
          }
        }
      }

      // Render SHAPES
      if (el.type === 'shape' && el.shapeType) {
        drawShapeOnCanvas(ctx, el);
      }

      // Render ICONS
      if (el.type === 'icon' && el.svgPath) {
        ctx.save();
        const iconSize = Math.min(el.width, el.height);
        const p2d = new Path2D(el.svgPath);

        // Normalize 24x24 standard SVG viewBox
        const scale = iconSize / 24;
        ctx.scale(scale, scale);
        ctx.translate(-12, -12);

        if ((el.fillType === 'linear' || el.fillType === 'radial') && el.gradient) {
          const grad = ctx.createLinearGradient(0, 0, 24, 24);
          grad.addColorStop(0, el.gradient.startColor);
          grad.addColorStop(1, el.gradient.endColor);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = el.fillColor || '#ffffff';
        }

        ctx.fill(p2d);

        if (el.stroke && el.stroke.width > 0) {
          ctx.strokeStyle = el.stroke.color;
          ctx.lineWidth = el.stroke.width / scale;
          ctx.stroke(p2d);
        }
        ctx.restore();
      }

      ctx.restore();
    });

    // 4. Selection Bounding Boxes & High-Resolution Handles
    selectedIds.forEach((id) => {
      const el = elements.find((item) => item.id === id);
      if (!el || !el.visible) return;

      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);

      const hw = el.width / 2;
      const hh = el.height / 2;

      // Outer Selection Rectangle
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = isMobile ? 2.5 : 2;
      ctx.strokeRect(-hw, -hh, el.width, el.height);

      // Distinct, finger-friendly corner & edge handles
      const cornerRadius = isMobile ? 8 : 6;
      const edgeRadius = isMobile ? 6 : 4;

      const cornerHandles = [
        { name: 'tl', x: -hw, y: -hh },
        { name: 'tr', x: hw, y: -hh },
        { name: 'br', x: hw, y: hh },
        { name: 'bl', x: -hw, y: hh },
      ];

      const edgeHandles = [
        { name: 't', x: 0, y: -hh },
        { name: 'r', x: hw, y: 0 },
        { name: 'b', x: 0, y: hh },
        { name: 'l', x: -hw, y: 0 },
      ];

      // Draw Edge Handles
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      edgeHandles.forEach((h) => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, edgeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Draw Corner Handles
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = isMobile ? 3 : 2.5;
      cornerHandles.forEach((h) => {
        ctx.beginPath();
        ctx.arc(h.x, h.y, cornerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      // Rotation Handle (top lollipop)
      const rotStemLength = isMobile ? 32 : 24;
      const rotCircleRadius = isMobile ? 8 : 6;

      ctx.beginPath();
      ctx.moveTo(0, -hh);
      ctx.lineTo(0, -hh - rotStemLength);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -hh - rotStemLength, rotCircleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    });

    // 5. Smart Alignment Guides
    if (activeGuides.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#ec4899'; // Vibrant magenta
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      activeGuides.forEach((guide) => {
        ctx.beginPath();
        if (guide.type === 'x') {
          ctx.moveTo(guide.position, 0);
          ctx.lineTo(guide.position, canvasSize.height);
        } else {
          ctx.moveTo(0, guide.position);
          ctx.lineTo(canvasSize.width, guide.position);
        }
        ctx.stroke();
      });

      ctx.restore();
    }

    // 6. Safe Area Boundary
    if (showSafeArea) {
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      const safeMargin = Math.min(canvasSize.width, canvasSize.height) * 0.08;
      ctx.strokeRect(
        safeMargin,
        safeMargin,
        canvasSize.width - safeMargin * 2,
        canvasSize.height - safeMargin * 2
      );
      ctx.restore();
    }
  }, [
    canvasSize,
    bgType,
    bgColor,
    gradientStart,
    gradientEnd,
    gradientAngle,
    elements,
    selectedIds,
    activeGuides,
    showGrid,
    showSafeArea,
    isMobile,
  ]);

  // Pointer Down (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }

    // Track active pointers
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Multi-touch Pinch Check (2 fingers down)
    if (activePointersRef.current.size === 2) {
      interactionTypeRef.current = 'pinch';
      const pts = Array.from(activePointersRef.current.values());
      pinchStartDistRef.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchStartZoomRef.current = zoom;
      pinchStartMidRef.current = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      pinchStartPanRef.current = { ...panOffset };
      setActiveBadge('Pinch Zoom');
      return;
    }

    if (activePointersRef.current.size > 2) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    startPosRef.current = { x: clickX, y: clickY };
    dragDistanceRef.current = 0;

    // Pan Mode Check
    if (isPanMode || e.button === 1 || (e.altKey && e.button === 0)) {
      interactionTypeRef.current = 'pan';
      startPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hit Testing Handles (Tested in element local space for rotation accuracy)
    if (selectedIds.length === 1) {
      const primary = elements.find((el) => el.id === selectedIds[0]);
      if (primary && primary.visible && !primary.locked) {
        // Transform click to element local coordinate space
        const dx = clickX - primary.x;
        const dy = clickY - primary.y;
        const rad = (-primary.rotation * Math.PI) / 180;
        const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

        const hw = primary.width / 2;
        const hh = primary.height / 2;
        const rotStemLength = isMobile ? 32 : 24;

        const isTouch = e.pointerType === 'touch' || isMobile;
        const rotThreshold = isTouch ? 32 : 18;
        const handleThreshold = isTouch ? 26 : 14;

        // Test Rotation Handle at (0, -hh - rotStemLength)
        const distRot = Math.hypot(localX - 0, localY - (-hh - rotStemLength));
        if (distRot <= rotThreshold) {
          interactionTypeRef.current = 'rotate';
          startPosRef.current = { x: clickX, y: clickY };
          startElementStatesRef.current = [
            {
              id: primary.id,
              x: primary.x,
              y: primary.y,
              width: primary.width,
              height: primary.height,
              rotation: primary.rotation,
              fontSize: primary.fontSize,
            },
          ];
          setActiveBadge(`${primary.rotation}°`);
          return;
        }

        // Test Resize Handles
        const handles = [
          { name: 'tl', x: -hw, y: -hh },
          { name: 't', x: 0, y: -hh },
          { name: 'tr', x: hw, y: -hh },
          { name: 'r', x: hw, y: 0 },
          { name: 'br', x: hw, y: hh },
          { name: 'b', x: 0, y: hh },
          { name: 'bl', x: -hw, y: hh },
          { name: 'l', x: -hw, y: 0 },
        ];

        const hitHandle = handles.find((h) => Math.hypot(localX - h.x, localY - h.y) <= handleThreshold);
        if (hitHandle) {
          interactionTypeRef.current = 'resize';
          resizeHandleRef.current = hitHandle.name;
          startPosRef.current = { x: clickX, y: clickY };
          startElementStatesRef.current = [
            {
              id: primary.id,
              x: primary.x,
              y: primary.y,
              width: primary.width,
              height: primary.height,
              rotation: primary.rotation,
              fontSize: primary.fontSize,
            },
          ];
          setActiveBadge(`${Math.round(primary.width)} × ${Math.round(primary.height)}`);
          return;
        }
      }
    }

    // Hit Test Elements (front-to-back: topmost layer first)
    const hitElement = [...elements].reverse().find((el) => {
      if (!el.visible || el.locked) return false;
      const dx = clickX - el.x;
      const dy = clickY - el.y;
      const rad = (-el.rotation * Math.PI) / 180;
      const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localY = dx * Math.sin(rad) + dy * Math.cos(rad);
      const hw = el.width / 2;
      const hh = el.height / 2;
      return localX >= -hw && localX <= hw && localY >= -hh && localY <= hh;
    });

    if (hitElement) {
      if (e.shiftKey) {
        setSelectedIds((prev) =>
          prev.includes(hitElement.id)
            ? prev.filter((id) => id !== hitElement.id)
            : [...prev, hitElement.id]
        );
      } else if (!selectedIds.includes(hitElement.id)) {
        setSelectedIds([hitElement.id]);
      }

      interactionTypeRef.current = 'move';
      startPosRef.current = { x: clickX, y: clickY };
      startElementStatesRef.current = elements
        .filter((el) =>
          e.shiftKey
            ? [...selectedIds, hitElement.id].includes(el.id)
            : selectedIds.includes(el.id) || el.id === hitElement.id
        )
        .map((el) => ({
          id: el.id,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          rotation: el.rotation,
          fontSize: el.fontSize,
        }));
      setActiveBadge(`X: ${Math.round(hitElement.x)} Y: ${Math.round(hitElement.y)}`);
    } else {
      // Empty canvas touched: On touch, allow smooth 1-finger canvas panning!
      interactionTypeRef.current = 'pan';
      startPosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Pointer Move (Mouse & Touch)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Update pointer position
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Handle Pinch Zoom & Pan
    if (interactionTypeRef.current === 'pinch' && activePointersRef.current.size === 2) {
      const pts = Array.from(activePointersRef.current.values());
      const newDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchStartDistRef.current > 0 && setZoom) {
        const scale = newDist / pinchStartDistRef.current;
        const newZoom = Math.min(4.0, Math.max(0.2, pinchStartZoomRef.current * scale));
        setZoom(Number(newZoom.toFixed(2)));
        setActiveBadge(`${Math.round(newZoom * 100)}%`);
      }
      const newMid = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      setPanOffset({
        x: pinchStartPanRef.current.x + (newMid.x - pinchStartMidRef.current.x),
        y: pinchStartPanRef.current.y + (newMid.y - pinchStartMidRef.current.y),
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasSize.width / rect.width;
    const scaleY = canvasSize.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    setCursorPos({ x: Math.round(currentX), y: Math.round(currentY) });

    if (!interactionTypeRef.current) return;

    dragDistanceRef.current += Math.hypot(
      e.clientX - (activePointersRef.current.get(e.pointerId)?.x || e.clientX),
      e.clientY - (activePointersRef.current.get(e.pointerId)?.y || e.clientY)
    );

    // Pan Viewport
    if (interactionTypeRef.current === 'pan') {
      const dx = e.clientX - startPosRef.current.x;
      const dy = e.clientY - startPosRef.current.y;
      setPanOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      startPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Move Elements
    if (interactionTypeRef.current === 'move') {
      const dx = currentX - startPosRef.current.x;
      const dy = currentY - startPosRef.current.y;

      let snapGuides: AlignmentGuide[] = [];
      const canvasCenterX = canvasSize.width / 2;
      const canvasCenterY = canvasSize.height / 2;
      const threshold = 8;

      const batch = startElementStatesRef.current.map((st) => {
        let newX = st.x + dx;
        let newY = st.y + dy;

        if (enableSnapping) {
          if (Math.abs(newX - canvasCenterX) < threshold) {
            newX = canvasCenterX;
            snapGuides.push({ type: 'x', position: canvasCenterX });
          }
          if (Math.abs(newY - canvasCenterY) < threshold) {
            newY = canvasCenterY;
            snapGuides.push({ type: 'y', position: canvasCenterY });
          }
        }

        return { id: st.id, changes: { x: Math.round(newX), y: Math.round(newY) } };
      });

      if (batch.length > 0) {
        setActiveBadge(`X: ${batch[0].changes.x} Y: ${batch[0].changes.y}`);
      }

      setActiveGuides(snapGuides);
      onUpdateElementsBatch(batch);
    } else if (
      interactionTypeRef.current === 'resize' &&
      startElementStatesRef.current.length === 1
    ) {
      const st = startElementStatesRef.current[0];
      const h = resizeHandleRef.current;
      const targetEl = elements.find((el) => el.id === st.id);

      // Check proportional scaling
      const isCorner = h === 'tl' || h === 'tr' || h === 'br' || h === 'bl';
      const isProportional =
        targetEl?.aspectRatioLocked ||
        (isCorner && (e.shiftKey || targetEl?.type === 'icon' || targetEl?.type === 'text'));

      // Transform delta into local rotation space
      const dxGlobal = currentX - startPosRef.current.x;
      const dyGlobal = currentY - startPosRef.current.y;
      const rad = (-st.rotation * Math.PI) / 180;
      const dxLocal = dxGlobal * Math.cos(rad) - dyGlobal * Math.sin(rad);
      const dyLocal = dxGlobal * Math.sin(rad) + dyGlobal * Math.cos(rad);

      let newW = st.width;
      let newH = st.height;
      const aspect = st.width / Math.max(1, st.height);

      if (h?.includes('r')) newW = Math.max(15, st.width + dxLocal);
      if (h?.includes('l')) newW = Math.max(15, st.width - dxLocal);
      if (h?.includes('b')) newH = Math.max(15, st.height + dyLocal);
      if (h?.includes('t')) newH = Math.max(15, st.height - dyLocal);

      if (isProportional && isCorner) {
        const avgScale = (newW / st.width + newH / st.height) / 2;
        newW = Math.max(15, Math.round(st.width * avgScale));
        newH = Math.max(15, Math.round(newW / aspect));
      }

      const updates: Partial<LogoElement> = {
        width: Math.round(newW),
        height: Math.round(newH),
      };

      // For text elements, scale font size proportionally with width
      if (targetEl?.type === 'text' && st.fontSize) {
        const fontScale = newW / st.width;
        updates.fontSize = Math.max(8, Math.round(st.fontSize * fontScale));
      }

      setActiveBadge(`${Math.round(newW)} × ${Math.round(newH)}`);
      onUpdateElement(st.id, updates);
    } else if (
      interactionTypeRef.current === 'rotate' &&
      startElementStatesRef.current.length === 1
    ) {
      const st = startElementStatesRef.current[0];
      const angleRad = Math.atan2(currentY - st.y, currentX - st.x);
      let angleDeg = Math.round((angleRad * 180) / Math.PI + 90);

      // Snap rotation to 15 degree increments if shift is pressed
      if (e.shiftKey) {
        angleDeg = Math.round(angleDeg / 15) * 15;
      }
      const finalRot = (angleDeg + 360) % 360;
      setActiveBadge(`${finalRot}°`);
      onUpdateElement(st.id, { rotation: finalRot });
    }
  };

  // Pointer Up (Mouse & Touch)
  const handlePointerUp = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (e) {
      activePointersRef.current.delete(e.pointerId);
      try {
        canvasRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    if (activePointersRef.current.size > 0) {
      if (activePointersRef.current.size === 1) {
        interactionTypeRef.current = null;
      }
      return;
    }

    // If it was a quick tap on empty canvas, deselect
    if (
      interactionTypeRef.current === 'pan' &&
      dragDistanceRef.current < 8 &&
      !isPanMode
    ) {
      setSelectedIds([]);
    }

    if (interactionTypeRef.current) {
      interactionTypeRef.current = null;
      resizeHandleRef.current = null;
      setActiveGuides([]);
      setActiveBadge(null);
      onCommitHistory();
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center cursor-default select-none touch-none"
      onPointerLeave={() => {
        setCursorPos(null);
        handlePointerUp();
      }}
    >
      {/* Top & Left Rulers (Hidden on small mobile screens to maximize canvas space) */}
      {showRulers && !isMobile && (
        <CanvasRulers
          canvasWidth={canvasSize.width}
          canvasHeight={canvasSize.height}
          displayWidth={displayWidth}
          displayHeight={displayHeight}
          zoom={zoom}
          cursorPos={cursorPos}
        />
      )}

      {/* Floating Canvas Controls (Mobile / Tablet / Desktop compact toolbar) */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full p-1 shadow-xl">
        <button
          type="button"
          onClick={handleResetOrFit}
          className="px-2.5 py-1 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1"
          title="Fit Canvas to Screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="text-[11px]">Fit</span>
        </button>

        {setZoom && (
          <>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.2, Number((z - 0.1).toFixed(2))))}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.0, Number((z + 0.1).toFixed(2))))}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {setShowGrid && (
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded-full transition-colors ${
              showGrid ? 'text-blue-400 bg-blue-600/20' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        )}

        {setEnableSnapping && (
          <button
            type="button"
            onClick={() => setEnableSnapping(!enableSnapping)}
            className={`p-1 rounded-full transition-colors ${
              enableSnapping ? 'text-blue-400 bg-blue-600/20' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Snapping"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Dynamic Feedback Badge (X/Y or W/H or Angle) */}
      {activeBadge && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-blue-600 text-white font-mono font-bold text-xs px-3 py-1 rounded-full shadow-lg border border-blue-400/40 animate-in fade-in duration-100">
          {activeBadge}
        </div>
      )}

      {/* Viewport Transform Wrapper */}
      <div
        className="relative shadow-2xl rounded-xl border border-slate-800/90 overflow-hidden"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block touch-none"
          style={{
            cursor: isPanMode ? 'grab' : 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  );
};
