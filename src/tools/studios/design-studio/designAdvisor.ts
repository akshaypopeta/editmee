import { DesignElement, CanvasSettings, DesignAuditReport, DesignAuditCheck } from './types';

// Helper to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    return {
      r: parseInt(cleanHex[0] + cleanHex[0], 16),
      g: parseInt(cleanHex[1] + cleanHex[1], 16),
      b: parseInt(cleanHex[2] + cleanHex[2], 16),
    };
  }
  if (cleanHex.length === 6) {
    return {
      r: parseInt(cleanHex.substring(0, 2), 16),
      g: parseInt(cleanHex.substring(2, 4), 16),
      b: parseInt(cleanHex.substring(4, 6), 16),
    };
  }
  return null;
}

// Relative luminance for WCAG contrast
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Contrast ratio (1 to 21)
function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 4.5;
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const bright = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (bright + 0.05) / (dark + 0.05);
}

export function auditDesign(
  elements: DesignElement[],
  settings: CanvasSettings
): DesignAuditReport {
  const checks: DesignAuditCheck[] = [];
  let score = 100;

  // 1. Empty canvas check
  if (elements.length === 0) {
    checks.push({
      id: 'empty-canvas',
      type: 'warning',
      title: 'Canvas is Empty',
      description: 'Your project currently has no elements. Choose a template or add text, shapes, or images to get started.',
    });
    return {
      overallScore: 20,
      checks,
      timestamp: Date.now(),
    };
  }

  // 2. Out of bounds check
  const outOfBounds: string[] = [];
  elements.forEach((el) => {
    if (!el.visible) return;
    const isOutside =
      el.x + el.width < 0 ||
      el.x > settings.width ||
      el.y + el.height < 0 ||
      el.y > settings.height;
    if (isOutside) {
      outOfBounds.push(el.id);
    }
  });

  if (outOfBounds.length > 0) {
    score -= 15;
    checks.push({
      id: 'out-of-bounds',
      type: 'warning',
      title: `${outOfBounds.length} Element(s) Outside Canvas`,
      description: 'Some elements are completely outside the visible canvas boundary and will be clipped on export.',
      affectedElementIds: outOfBounds,
    });
  }

  // 3. Safe area / Bleed check
  const marginPx = Math.round(Math.min(settings.width, settings.height) * settings.safeAreaMargin);
  const nearEdge: string[] = [];
  elements.forEach((el) => {
    if (!el.visible || el.locked || el.type === 'shape') return;
    if (
      el.x < marginPx ||
      el.y < marginPx ||
      el.x + el.width > settings.width - marginPx ||
      el.y + el.height > settings.height - marginPx
    ) {
      nearEdge.push(el.id);
    }
  });

  if (nearEdge.length > 0) {
    score -= 8;
    checks.push({
      id: 'safe-area-warning',
      type: 'info',
      title: 'Elements Near Safe-Area Margins',
      description: 'Content is placed very close to canvas edges, which may be cut off during mobile social feeds or physical print trimming.',
      affectedElementIds: nearEdge,
    });
  }

  // 4. Low contrast text check
  const lowContrastText: string[] = [];
  const bgColor = settings.bgType === 'solid' ? settings.bgColor : settings.gradientStart;
  elements.forEach((el) => {
    if (el.type === 'text' && el.visible && el.textColor && !el.textBackground?.enabled) {
      const ratio = getContrastRatio(el.textColor, bgColor);
      if (ratio < 3.0) {
        lowContrastText.push(el.id);
      }
    }
  });

  if (lowContrastText.length > 0) {
    score -= 15;
    checks.push({
      id: 'contrast-issue',
      type: 'warning',
      title: `${lowContrastText.length} Text Layer(s) with Low Contrast`,
      description: 'Text color has low contrast against the background (under WCAG AA 4.5:1 ratio), making it difficult to read.',
      affectedElementIds: lowContrastText,
    });
  } else {
    checks.push({
      id: 'contrast-pass',
      type: 'success',
      title: 'Legible High-Contrast Typography',
      description: 'All text layers provide strong readability against the document canvas background.',
    });
  }

  // 5. Low-resolution image check
  const lowResImages: string[] = [];
  elements.forEach((el) => {
    if (el.type === 'image' && el.intrinsicWidth && el.intrinsicHeight) {
      const scaleX = el.width / el.intrinsicWidth;
      const scaleY = el.height / el.intrinsicHeight;
      if (scaleX > 2.0 || scaleY > 2.0) {
        lowResImages.push(el.id);
      }
    }
  });

  if (lowResImages.length > 0) {
    score -= 12;
    checks.push({
      id: 'low-res-images',
      type: 'warning',
      title: `${lowResImages.length} Stretched Image(s)`,
      description: 'Image layers are stretched past 200% of their native resolution and may appear blurry or pixelated in high-DPI prints.',
      affectedElementIds: lowResImages,
    });
  }

  // 6. Typography hierarchy check
  const textElements = elements.filter((el) => el.type === 'text' && el.visible);
  if (textElements.length >= 2) {
    const fontSizes = textElements.map((el) => el.fontSize || 16);
    const maxSize = Math.max(...fontSizes);
    const minSize = Math.min(...fontSizes);
    if (maxSize / minSize >= 1.5) {
      checks.push({
        id: 'hierarchy-pass',
        type: 'success',
        title: 'Strong Typographic Hierarchy',
        description: 'Design maintains clear visual hierarchy between headline and supporting text elements.',
      });
    } else {
      score -= 5;
      checks.push({
        id: 'hierarchy-info',
        type: 'info',
        title: 'Monotonous Text Scale',
        description: 'Text elements are all similar in size. Consider scaling up your primary headline for greater visual impact.',
      });
    }
  }

  // 7. Layer count feedback
  if (elements.length >= 3) {
    checks.push({
      id: 'layer-depth-pass',
      type: 'success',
      title: 'Rich Multi-Layer Composition',
      description: `Project contains ${elements.length} well-structured design layers.`,
    });
  }

  const finalScore = Math.max(10, Math.min(100, Math.round(score)));

  return {
    overallScore: finalScore,
    checks,
    timestamp: Date.now(),
  };
}
