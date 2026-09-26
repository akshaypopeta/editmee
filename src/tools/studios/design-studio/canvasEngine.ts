import { DesignElement, CanvasSettings, ShapeType } from './types';
import { getShapeSvgPath } from './vectorAssets';
import { buildCssFilterString } from './imageFilters';
import { generateQrDataUrl } from './qrGenerator';

// Image element cache to avoid recreating HTMLImageElements on every frame
const imageCache = new Map<string, HTMLImageElement>();

export function getCachedImage(src: string): HTMLImageElement | null {
  if (!src) return null;
  if (imageCache.has(src)) {
    const img = imageCache.get(src)!;
    return img.complete ? img : null;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  imageCache.set(src, img);
  return null;
}

export interface RenderOptions {
  interactive?: boolean; // whether to draw bounding boxes, handles, guides
  selectedIds?: string[];
  hoveredId?: string | null;
  activeGuides?: Array<{ orientation: 'horizontal' | 'vertical'; position: number }>;
  exportScale?: number;
  hideHelpers?: boolean;
}

export interface HandleHit {
  type: 'handle' | 'rotation' | 'body';
  handle?: 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w';
}

/**
 * Main rendering loop for HTML5 Canvas
 */
export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  elements: DesignElement[],
  settings: CanvasSettings,
  options: RenderOptions = {}
): void {
  const {
    interactive = true,
    selectedIds = [],
    hoveredId = null,
    activeGuides = [],
    exportScale = 1,
    hideHelpers = false,
  } = options;

  const w = settings.width * exportScale;
  const h = settings.height * exportScale;

  ctx.save();
  ctx.scale(exportScale, exportScale);

  // 1. Draw Canvas Background
  if (settings.bgType === 'transparent') {
    if (!hideHelpers) {
      drawCheckerboard(ctx, settings.width, settings.height);
    }
  } else if (settings.bgType === 'solid') {
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, settings.width, settings.height);
  } else if (settings.bgType === 'gradient') {
    const angleRad = (settings.gradientAngle * Math.PI) / 180;
    const cx = settings.width / 2;
    const cy = settings.height / 2;
    const r = Math.max(settings.width, settings.height);
    const x0 = cx - Math.cos(angleRad) * (r / 2);
    const y0 = cy - Math.sin(angleRad) * (r / 2);
    const x1 = cx + Math.cos(angleRad) * (r / 2);
    const y1 = cy + Math.sin(angleRad) * (r / 2);

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, settings.gradientStart);
    grad.addColorStop(1, settings.gradientEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, settings.width, settings.height);
  }

  // 2. Draw Grid (if enabled and interactive)
  if (interactive && settings.showGrid && !hideHelpers) {
    drawGrid(ctx, settings.width, settings.height, settings.gridSize);
  }

  // 3. Draw Elements (sorted by zIndex)
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  for (const el of sorted) {
    if (!el.visible) continue;
    renderElement(ctx, el);
  }

  // 4. Draw Safe Area guides (if enabled and interactive)
  if (interactive && settings.showSafeArea && !hideHelpers) {
    drawSafeArea(ctx, settings.width, settings.height, settings.safeAreaMargin);
  }

  // 5. Draw Active Snapping Guides
  if (interactive && activeGuides.length > 0 && !hideHelpers) {
    drawActiveGuides(ctx, activeGuides, settings.width, settings.height);
  }

  // 6. Draw Selection Bounding Box and Transform Handles
  if (interactive && !hideHelpers && selectedIds.length > 0) {
    const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
    for (const sel of selectedElements) {
      drawBoundingBox(ctx, sel);
    }
  }

  // 7. Draw Hover Box (if element hovered and not selected)
  if (interactive && !hideHelpers && hoveredId && !selectedIds.includes(hoveredId)) {
    const hovered = elements.find((el) => el.id === hoveredId);
    if (hovered && hovered.visible) {
      drawHoverOutline(ctx, hovered);
    }
  }

  ctx.restore();
}

function drawCheckerboard(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const size = 16;
  for (let y = 0; y < height; y += size) {
    for (let x = 0; x < width; x += size) {
      ctx.fillStyle = (Math.floor(x / size) + Math.floor(y / size)) % 2 === 0 ? '#ffffff' : '#e2e8f0';
      ctx.fillRect(x, y, size, size);
    }
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number, size: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);

  for (let x = size; x < width; x += size) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = size; y < height; y += size) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSafeArea(ctx: CanvasRenderingContext2D, width: number, height: number, marginPercent: number): void {
  const marginX = width * marginPercent;
  const marginY = height * marginPercent;

  ctx.save();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.strokeRect(marginX, marginY, width - marginX * 2, height - marginY * 2);
  ctx.restore();
}

function drawActiveGuides(
  ctx: CanvasRenderingContext2D,
  guides: Array<{ orientation: 'horizontal' | 'vertical'; position: number }>,
  canvasW: number,
  canvasH: number
): void {
  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);

  for (const guide of guides) {
    ctx.beginPath();
    if (guide.orientation === 'vertical') {
      ctx.moveTo(guide.position, 0);
      ctx.lineTo(guide.position, canvasH);
    } else {
      ctx.moveTo(0, guide.position);
      ctx.lineTo(canvasW, guide.position);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function renderElement(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  ctx.save();

  // Opacity & Blend Mode
  ctx.globalAlpha = Math.max(0, Math.min(1, el.opacity));
  if (el.blendMode && el.blendMode !== 'normal') {
    ctx.globalCompositeOperation = el.blendMode as GlobalCompositeOperation;
  }

  // Shadow
  if (el.shadow && el.shadow.opacity > 0) {
    ctx.shadowColor = el.shadow.color;
    ctx.shadowBlur = el.shadow.blur;
    ctx.shadowOffsetX = el.shadow.offsetX;
    ctx.shadowOffsetY = el.shadow.offsetY;
  }

  // Transform: translate to center, rotate, translate back
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  ctx.translate(cx, cy);
  if (el.rotation) {
    ctx.rotate((el.rotation * Math.PI) / 180);
  }
  ctx.translate(-cx, -cy);

  // Render specific element type
  switch (el.type) {
    case 'text':
      renderTextElement(ctx, el);
      break;
    case 'shape':
      renderShapeElement(ctx, el);
      break;
    case 'image':
      renderImageElement(ctx, el);
      break;
    case 'drawing':
      renderDrawingElement(ctx, el);
      break;
    case 'qr':
      renderQrElement(ctx, el);
      break;
    case 'icon':
      renderIconElement(ctx, el);
      break;
    default:
      break;
  }

  ctx.restore();
}

function renderTextElement(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  const text = el.text || 'Add Text';
  const fontSize = el.fontSize || 32;
  const fontFamily = el.fontFamily || 'system-ui, sans-serif';
  const fontWeight = el.fontWeight || 'normal';
  const fontStyle = el.fontStyle || 'normal';
  ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';
  ctx.textAlign = (el.textAlign === 'justify' ? 'left' : el.textAlign) || 'left';

  // Background pill / badge
  if (el.textBackground?.enabled) {
    ctx.save();
    ctx.fillStyle = el.textBackground.color || 'rgba(0,0,0,0.5)';
    const pad = el.textBackground.padding || 8;
    const rad = el.textBackground.radius || 8;
    roundRect(ctx, el.x - pad, el.y - pad, el.width + pad * 2, el.height + pad * 2, rad);
    ctx.fill();
    ctx.restore();
  }

  // Fill style
  if (el.textGradient?.enabled) {
    const grad = ctx.createLinearGradient(el.x, el.y, el.x + el.width, el.y + el.height);
    grad.addColorStop(0, el.textGradient.start);
    grad.addColorStop(1, el.textGradient.end);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = el.textColor || '#000000';
  }

  const lines = text.split('\n');
  const lineHeight = fontSize * (el.lineHeight || 1.2);
  let curY = el.y;

  for (const line of lines) {
    let posX = el.x;
    if (el.textAlign === 'center') posX = el.x + el.width / 2;
    if (el.textAlign === 'right') posX = el.x + el.width;

    let displayText = line;
    if (el.textTransform === 'uppercase') displayText = displayText.toUpperCase();
    if (el.textTransform === 'lowercase') displayText = displayText.toLowerCase();

    // Text Outline / Stroke
    if (el.textOutline && el.textOutline.width > 0) {
      ctx.save();
      ctx.strokeStyle = el.textOutline.color;
      ctx.lineWidth = el.textOutline.width;
      ctx.lineJoin = 'round';
      ctx.strokeText(displayText, posX, curY);
      ctx.restore();
    }

    ctx.fillText(displayText, posX, curY);
    curY += lineHeight;
  }
}

function renderShapeElement(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  const shapeType: ShapeType = el.shapeType || 'rect';

  ctx.save();

  // Fill
  if (el.fillGradient?.enabled) {
    const angleRad = (el.fillGradient.angle * Math.PI) / 180;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const r = Math.max(el.width, el.height) / 2;
    const x0 = cx - Math.cos(angleRad) * r;
    const y0 = cy - Math.sin(angleRad) * r;
    const x1 = cx + Math.cos(angleRad) * r;
    const y1 = cy + Math.sin(angleRad) * r;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, el.fillGradient.start);
    grad.addColorStop(1, el.fillGradient.end);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = el.fillColor || '#3b82f6';
  }

  // Stroke
  if (el.strokeWidth && el.strokeWidth > 0) {
    ctx.strokeStyle = el.strokeColor || '#1e293b';
    ctx.lineWidth = el.strokeWidth;
    if (el.strokeDash === 'dashed') ctx.setLineDash([8, 6]);
    if (el.strokeDash === 'dotted') ctx.setLineDash([3, 3]);
  }

  if (shapeType === 'rect') {
    ctx.fillRect(el.x, el.y, el.width, el.height);
    if (el.strokeWidth && el.strokeWidth > 0) ctx.strokeRect(el.x, el.y, el.width, el.height);
  } else if (shapeType === 'rounded-rect') {
    roundRect(ctx, el.x, el.y, el.width, el.height, el.cornerRadius ?? 16);
    ctx.fill();
    if (el.strokeWidth && el.strokeWidth > 0) ctx.stroke();
  } else if (shapeType === 'circle' || shapeType === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse(
      el.x + el.width / 2,
      el.y + el.height / 2,
      el.width / 2,
      el.height / 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    if (el.strokeWidth && el.strokeWidth > 0) ctx.stroke();
  } else {
    // Vector path shape
    ctx.translate(el.x, el.y);
    const path2D = new Path2D(getShapeSvgPath(shapeType, el.width, el.height));
    ctx.fill(path2D);
    if (el.strokeWidth && el.strokeWidth > 0) ctx.stroke(path2D);
  }

  ctx.restore();
}

function renderImageElement(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  if (!el.imageSrc) return;
  const img = getCachedImage(el.imageSrc);

  ctx.save();
  ctx.translate(el.x, el.y);

  if (el.flipH || el.flipV) {
    ctx.translate(el.flipH ? el.width : 0, el.flipV ? el.height : 0);
    ctx.scale(el.flipH ? -1 : 1, el.flipV ? -1 : 1);
  }

  if (el.filters) {
    ctx.filter = buildCssFilterString(el.filters);
  }

  if (img) {
    if (el.crop) {
      ctx.drawImage(
        img,
        el.crop.x,
        el.crop.y,
        el.crop.width,
        el.crop.height,
        0,
        0,
        el.width,
        el.height
      );
    } else {
      ctx.drawImage(img, 0, 0, el.width, el.height);
    }
  } else {
    // Placeholder while image is loading into memory
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, el.width, el.height);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(0, 0, el.width, el.height);
  }

  ctx.restore();
}

function renderDrawingElement(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  if (!el.drawingPaths || el.drawingPaths.length === 0) return;

  ctx.save();
  ctx.translate(el.x, el.y);

  for (const path of el.drawingPaths) {
    if (path.points.length < 2) continue;
    ctx.save();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = path.opacity;

    if (path.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'multiply';
    }

    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

function renderQrElement(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  const qrDataUrl = generateQrDataUrl(el.qrText || 'https://editmee.com', el.qrColor || '#000000', el.qrBgColor || '#ffffff', 400);
  const img = getCachedImage(qrDataUrl);
  if (img) {
    ctx.drawImage(img, el.x, el.y, el.width, el.height);
  }
}

function renderIconElement(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  if (!el.iconPath) return;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(el.width / 24, el.height / 24);
  ctx.fillStyle = el.fillColor || '#38bdf8';
  const path2D = new Path2D(el.iconPath);
  ctx.fill(path2D);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawBoundingBox(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  if (el.rotation) {
    ctx.rotate((el.rotation * Math.PI) / 180);
  }
  ctx.translate(-cx, -cy);

  // Bounding rectangle
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(el.x, el.y, el.width, el.height);

  // Resize handles (8 points)
  const handleSize = 8;
  const handles = [
    { x: el.x, y: el.y }, // nw
    { x: el.x + el.width / 2, y: el.y }, // n
    { x: el.x + el.width, y: el.y }, // ne
    { x: el.x + el.width, y: el.y + el.height / 2 }, // e
    { x: el.x + el.width, y: el.y + el.height }, // se
    { x: el.x + el.width / 2, y: el.y + el.height }, // s
    { x: el.x, y: el.y + el.height }, // sw
    { x: el.x, y: el.y + el.height / 2 }, // w
  ];

  for (const h of handles) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
  }

  // Rotation Handle (top stem)
  const rotDist = 24;
  const rotX = el.x + el.width / 2;
  const rotY = el.y - rotDist;

  ctx.beginPath();
  ctx.moveTo(el.x + el.width / 2, el.y);
  ctx.lineTo(rotX, rotY);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(rotX, rotY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.stroke();

  ctx.restore();
}

function drawHoverOutline(ctx: CanvasRenderingContext2D, el: DesignElement): void {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  if (el.rotation) {
    ctx.rotate((el.rotation * Math.PI) / 180);
  }
  ctx.translate(-cx, -cy);

  ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(el.x, el.y, el.width, el.height);
  ctx.restore();
}

/**
 * Hit-testing helpers for pointer interactions
 */
export function hitTestElement(x: number, y: number, elements: DesignElement[]): DesignElement | null {
  // Check from topmost zIndex down
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  for (const el of sorted) {
    if (!el.visible || el.locked) continue;

    // Transform point by inverse rotation
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const rad = (-el.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const dx = x - cx;
    const dy = y - cy;
    const rotX = cx + (dx * cos - dy * sin);
    const rotY = cy + (dx * sin + dy * cos);

    if (rotX >= el.x && rotX <= el.x + el.width && rotY >= el.y && rotY <= el.y + el.height) {
      return el;
    }
  }
  return null;
}

export function hitTestHandle(
  x: number,
  y: number,
  el: DesignElement,
  handleHitRadius: number = 10
): HandleHit | null {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const rad = (-el.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const dx = x - cx;
  const dy = y - cy;
  const rotX = cx + (dx * cos - dy * sin);
  const rotY = cy + (dx * sin + dy * cos);

  // 1. Rotation handle test
  const rotTargetX = el.x + el.width / 2;
  const rotTargetY = el.y - 24;
  const distRot = Math.hypot(rotX - rotTargetX, rotY - rotTargetY);
  if (distRot <= handleHitRadius) {
    return { type: 'rotation' };
  }

  // 2. Resize handles
  const handles: Array<{ handle: HandleHit['handle']; hx: number; hy: number }> = [
    { handle: 'nw', hx: el.x, hy: el.y },
    { handle: 'n', hx: el.x + el.width / 2, hy: el.y },
    { handle: 'ne', hx: el.x + el.width, hy: el.y },
    { handle: 'e', hx: el.x + el.width, hy: el.y + el.height / 2 },
    { handle: 'se', hx: el.x + el.width, hy: el.y + el.height },
    { handle: 's', hx: el.x + el.width / 2, hy: el.y + el.height },
    { handle: 'sw', hx: el.x, hy: el.y + el.height },
    { handle: 'w', hx: el.x, hy: el.y + el.height / 2 },
  ];

  for (const h of handles) {
    const dist = Math.hypot(rotX - h.hx, rotY - h.hy);
    if (dist <= handleHitRadius) {
      return { type: 'handle', handle: h.handle };
    }
  }

  // 3. Body hit
  if (rotX >= el.x && rotX <= el.x + el.width && rotY >= el.y && rotY <= el.y + el.height) {
    return { type: 'body' };
  }

  return null;
}

/**
 * Intelligent Snapping to Canvas Center, Edges, and Sibling Elements
 */
export function calculateSnapping(
  activeEl: DesignElement,
  otherElements: DesignElement[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = 8
): {
  snappedX: number;
  snappedY: number;
  guides: Array<{ orientation: 'horizontal' | 'vertical'; position: number }>;
} {
  let snappedX = activeEl.x;
  let snappedY = activeEl.y;
  const guides: Array<{ orientation: 'horizontal' | 'vertical'; position: number }> = [];

  const left = activeEl.x;
  const centerX = activeEl.x + activeEl.width / 2;
  const right = activeEl.x + activeEl.width;

  const top = activeEl.y;
  const centerY = activeEl.y + activeEl.height / 2;
  const bottom = activeEl.y + activeEl.height;

  // X Snap Targets
  const xTargets = [
    { pos: 0, guide: 0 },
    { pos: canvasWidth / 2, guide: canvasWidth / 2, isCenter: true },
    { pos: canvasWidth, guide: canvasWidth },
  ];

  for (const other of otherElements) {
    if (!other.visible || other.id === activeEl.id) continue;
    xTargets.push({ pos: other.x, guide: other.x });
    xTargets.push({ pos: other.x + other.width / 2, guide: other.x + other.width / 2, isCenter: true });
    xTargets.push({ pos: other.x + other.width, guide: other.x + other.width });
  }

  // Check X Snapping
  for (const target of xTargets) {
    if (Math.abs(left - target.pos) <= threshold) {
      snappedX = target.pos;
      guides.push({ orientation: 'vertical', position: target.guide });
      break;
    }
    if (Math.abs(centerX - target.pos) <= threshold) {
      snappedX = target.pos - activeEl.width / 2;
      guides.push({ orientation: 'vertical', position: target.guide });
      break;
    }
    if (Math.abs(right - target.pos) <= threshold) {
      snappedX = target.pos - activeEl.width;
      guides.push({ orientation: 'vertical', position: target.guide });
      break;
    }
  }

  // Y Snap Targets
  const yTargets = [
    { pos: 0, guide: 0 },
    { pos: canvasHeight / 2, guide: canvasHeight / 2, isCenter: true },
    { pos: canvasHeight, guide: canvasHeight },
  ];

  for (const other of otherElements) {
    if (!other.visible || other.id === activeEl.id) continue;
    yTargets.push({ pos: other.y, guide: other.y });
    yTargets.push({ pos: other.y + other.height / 2, guide: other.y + other.height / 2, isCenter: true });
    yTargets.push({ pos: other.y + other.height, guide: other.y + other.height });
  }

  // Check Y Snapping
  for (const target of yTargets) {
    if (Math.abs(top - target.pos) <= threshold) {
      snappedY = target.pos;
      guides.push({ orientation: 'horizontal', position: target.guide });
      break;
    }
    if (Math.abs(centerY - target.pos) <= threshold) {
      snappedY = target.pos - activeEl.height / 2;
      guides.push({ orientation: 'horizontal', position: target.guide });
      break;
    }
    if (Math.abs(bottom - target.pos) <= threshold) {
      snappedY = target.pos - activeEl.height;
      guides.push({ orientation: 'horizontal', position: target.guide });
      break;
    }
  }

  return { snappedX, snappedY, guides };
}
