import { LogoElement, LogoVariationType, CanvasDimensions } from './types';

/**
 * Creates an editable variation of the logo elements
 */
export function createLogoVariation(
  elements: LogoElement[],
  variationType: LogoVariationType,
  canvasSize: CanvasDimensions
): LogoElement[] {
  const cloned: LogoElement[] = JSON.parse(JSON.stringify(elements));

  switch (variationType) {
    case 'monochrome-black': {
      return cloned.map((el) => ({
        ...el,
        fillType: 'solid',
        fillColor: el.fillColor === 'transparent' ? 'transparent' : '#09090b',
        gradient: undefined,
        stroke: el.stroke
          ? { ...el.stroke, color: el.stroke.color === 'transparent' ? 'transparent' : '#09090b' }
          : undefined,
        shadow: undefined,
      }));
    }

    case 'monochrome-white': {
      return cloned.map((el) => ({
        ...el,
        fillType: 'solid',
        fillColor: el.fillColor === 'transparent' ? 'transparent' : '#ffffff',
        gradient: undefined,
        stroke: el.stroke
          ? { ...el.stroke, color: el.stroke.color === 'transparent' ? 'transparent' : '#ffffff' }
          : undefined,
        shadow: undefined,
      }));
    }

    case 'icon-only': {
      const iconAndShapes = cloned.filter((el) => el.type !== 'text');
      if (iconAndShapes.length === 0) return cloned;

      // Compute center of remaining elements
      let sumX = 0;
      let sumY = 0;
      iconAndShapes.forEach((el) => {
        sumX += el.x;
        sumY += el.y;
      });
      const avgX = sumX / iconAndShapes.length;
      const avgY = sumY / iconAndShapes.length;
      const shiftX = canvasSize.width / 2 - avgX;
      const shiftY = canvasSize.height / 2 - avgY;

      return iconAndShapes.map((el) => ({
        ...el,
        x: Math.round(el.x + shiftX),
        y: Math.round(el.y + shiftY),
      }));
    }

    case 'horizontal-lockup': {
      // Separate icon/symbol vs text
      const symbols = cloned.filter((el) => el.type === 'icon' || el.type === 'shape');
      const texts = cloned.filter((el) => el.type === 'text');

      if (symbols.length === 0 || texts.length === 0) return cloned;

      const centerY = canvasSize.height / 2;
      const leftSymbolX = canvasSize.width * 0.3;
      const rightTextX = canvasSize.width * 0.65;

      const updatedSymbols = symbols.map((el) => ({
        ...el,
        x: Math.round(leftSymbolX),
        y: Math.round(centerY),
      }));

      // Distribute text vertically on the right
      const updatedTexts = texts.map((el, i) => {
        const offset = (i - (texts.length - 1) / 2) * 45;
        return {
          ...el,
          textAlign: 'left' as const,
          x: Math.round(rightTextX),
          y: Math.round(centerY + offset),
        };
      });

      return [...updatedSymbols, ...updatedTexts];
    }

    case 'vertical-lockup': {
      const symbols = cloned.filter((el) => el.type === 'icon' || el.type === 'shape');
      const texts = cloned.filter((el) => el.type === 'text');

      if (symbols.length === 0 || texts.length === 0) return cloned;

      const centerX = canvasSize.width / 2;
      const topSymbolY = canvasSize.height * 0.35;

      const updatedSymbols = symbols.map((el) => ({
        ...el,
        x: Math.round(centerX),
        y: Math.round(topSymbolY),
      }));

      const updatedTexts = texts.map((el, i) => ({
        ...el,
        textAlign: 'center' as const,
        x: Math.round(centerX),
        y: Math.round(canvasSize.height * 0.6 + i * 50),
      }));

      return [...updatedSymbols, ...updatedTexts];
    }

    case 'inverted': {
      return cloned.map((el) => {
        let fill = el.fillColor;
        if (fill && fill.startsWith('#')) {
          const hex = fill.replace('#', '');
          if (hex.length === 6) {
            const r = 255 - parseInt(hex.substring(0, 2), 16);
            const g = 255 - parseInt(hex.substring(2, 4), 16);
            const b = 255 - parseInt(hex.substring(4, 6), 16);
            fill = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          }
        }
        return {
          ...el,
          fillColor: fill,
        };
      });
    }

    case 'full-color':
    case 'original':
    default:
      return cloned;
  }
}

/**
 * Triggers client-side vector PDF generation/printing via print-rendered vector SVG iframe
 */
export function exportVectorAsPdf(svgString: string, width: number, height: number, filename = 'logo.pdf') {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @page {
            size: ${width}px ${height}px;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          svg {
            width: 100%;
            height: 100%;
            display: block;
          }
        </style>
      </head>
      <body>
        ${svgString}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 350);
}

/**
 * Parses and sanitizes an imported SVG text string into LogoElements
 */
export function parseImportedSvg(svgText: string, canvasSize: CanvasDimensions): LogoElement[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svgText, 'image/svg+xml');

  // Check for parser error
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid or corrupted SVG file.');
  }

  const elements: LogoElement[] = [];
  const svgRoot = xmlDoc.querySelector('svg');
  if (!svgRoot) throw new Error('No root SVG element found.');

  // Extract paths
  const paths = xmlDoc.querySelectorAll('path');
  paths.forEach((p, idx) => {
    const d = p.getAttribute('d');
    if (!d || d.length < 5) return;

    const fill = p.getAttribute('fill') || '#0f172a';
    const stroke = p.getAttribute('stroke');
    const strokeWidth = parseFloat(p.getAttribute('stroke-width') || '0');

    elements.push({
      id: `imported-path-${Date.now()}-${idx}`,
      name: `Imported Path ${idx + 1}`,
      type: 'icon',
      iconName: `Path ${idx + 1}`,
      svgPath: d,
      viewBox: '0 0 24 24',
      x: canvasSize.width / 2 + (idx % 3) * 20,
      y: canvasSize.height / 2 + Math.floor(idx / 3) * 20,
      width: 120,
      height: 120,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillColor: fill === 'none' ? 'transparent' : fill,
      stroke: stroke && stroke !== 'none' ? { color: stroke, width: strokeWidth || 2 } : undefined,
    });
  });

  // Extract text
  const textNodes = xmlDoc.querySelectorAll('text');
  textNodes.forEach((t, idx) => {
    const content = t.textContent?.trim();
    if (!content) return;

    const fill = t.getAttribute('fill') || '#0f172a';
    const fontSize = parseFloat(t.getAttribute('font-size') || '36');
    const fontFamily = t.getAttribute('font-family') || 'Inter, sans-serif';

    elements.push({
      id: `imported-text-${Date.now()}-${idx}`,
      name: `Imported Text: ${content.substring(0, 10)}`,
      type: 'text',
      text: content,
      fontFamily,
      fontSize: fontSize || 36,
      fontWeight: '700',
      x: canvasSize.width / 2,
      y: canvasSize.height / 2 + 100 + idx * 40,
      width: Math.max(150, content.length * 20),
      height: 60,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      fillColor: fill,
    });
  });

  return elements;
}
