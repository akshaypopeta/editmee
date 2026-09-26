import { PDFDocument } from 'pdf-lib';
import { DesignElement, CanvasSettings } from './types';
import { renderCanvas } from './canvasEngine';
import { getShapeSvgPath } from './vectorAssets';
import { generateQrSvg } from './qrGenerator';

export interface ExportConfig {
  format: 'png' | 'jpg' | 'webp' | 'svg' | 'pdf' | 'json';
  scale: number; // 1, 2, 3, 4
  quality: number; // 0.1 to 1.0 (for jpg/webp)
  transparentBg: boolean;
  filename: string;
}

export async function exportDesignToFile(
  elements: DesignElement[],
  settings: CanvasSettings,
  config: ExportConfig
): Promise<{ success: boolean; blob?: Blob; dataUrl?: string; filename: string; error?: string }> {
  try {
    const filename = `${config.filename || 'design-creative-studio'}.${config.format}`;

    // 1. JSON Export
    if (config.format === 'json') {
      const projectData = {
        version: '2.0.0',
        tool: 'Design & Creative Studio Pro',
        exportedAt: new Date().toISOString(),
        settings: {
          name: settings.name,
          width: settings.width,
          height: settings.height,
          unit: settings.unit,
          dpi: settings.dpi,
          bgType: settings.bgType,
          bgColor: settings.bgColor,
          gradientStart: settings.gradientStart,
          gradientEnd: settings.gradientEnd,
          gradientAngle: settings.gradientAngle,
        },
        elements,
      };
      const jsonStr = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      triggerBlobDownload(blob, filename);
      return { success: true, blob, filename };
    }

    // 2. SVG Vector Export
    if (config.format === 'svg') {
      const svgCode = generateVectorSvg(elements, settings, config.transparentBg);
      const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
      triggerBlobDownload(blob, filename);
      return { success: true, blob, filename };
    }

    // 3. Raster Canvas Generation (PNG, JPG, WEBP, PDF)
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = settings.width * config.scale;
    exportCanvas.height = settings.height * config.scale;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    // Adjust settings if transparent background requested
    const renderSettings = {
      ...settings,
      bgType: config.transparentBg ? ('transparent' as const) : settings.bgType,
    };

    renderCanvas(ctx, elements, renderSettings, {
      interactive: false,
      exportScale: config.scale,
      hideHelpers: true,
    });

    // Handle PDF Export via pdf-lib
    if (config.format === 'pdf') {
      const pngDataUrl = exportCanvas.toDataURL('image/png');
      const pngBytes = await fetch(pngDataUrl).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.create();
      // Use dimensions in points (72 DPI standard for PDF pages)
      const pageWidth = settings.width * (72 / settings.dpi);
      const pageHeight = settings.height * (72 / settings.dpi);

      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      const embeddedImage = await pdfDoc.embedPng(pngBytes);

      page.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: pageWidth,
        height: pageHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      triggerBlobDownload(blob, filename);
      return { success: true, blob, filename };
    }

    // Handle PNG / JPG / WEBP raster export
    let mimeType = 'image/png';
    if (config.format === 'jpg') mimeType = 'image/jpeg';
    if (config.format === 'webp') mimeType = 'image/webp';

    const dataUrl = exportCanvas.toDataURL(mimeType, config.quality);
    const blob = await fetch(dataUrl).then((r) => r.blob());
    triggerBlobDownload(blob, filename);

    return { success: true, blob, dataUrl, filename };
  } catch (err: any) {
    console.error('Export Error:', err);
    return {
      success: false,
      filename: `${config.filename}.${config.format}`,
      error: err?.message || 'Export processing failed',
    };
  }
}

export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Clean SVG Vector generator for elements & canvas
 */
export function generateVectorSvg(
  elements: DesignElement[],
  settings: CanvasSettings,
  transparentBg: boolean
): string {
  const w = settings.width;
  const h = settings.height;

  let bgSvg = '';
  if (!transparentBg) {
    if (settings.bgType === 'solid') {
      bgSvg = `<rect width="${w}" height="${h}" fill="${settings.bgColor}" />`;
    } else if (settings.bgType === 'gradient') {
      bgSvg = `
        <defs>
          <linearGradient id="canvasGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${settings.gradientStart}" />
            <stop offset="100%" stop-color="${settings.gradientEnd}" />
          </linearGradient>
        </defs>
        <rect width="${w}" height="${h}" fill="url(#canvasGrad)" />
      `;
    }
  }

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
  let elementsSvg = '';

  for (const el of sorted) {
    if (!el.visible) continue;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const rot = el.rotation ? `transform="rotate(${el.rotation} ${cx} ${cy})"` : '';
    const op = el.opacity < 1 ? `opacity="${el.opacity}"` : '';

    if (el.type === 'shape') {
      const fill = el.fillColor || '#3b82f6';
      const stroke = el.strokeWidth && el.strokeWidth > 0 ? `stroke="${el.strokeColor || '#000'}" stroke-width="${el.strokeWidth}"` : '';
      const pathD = getShapeSvgPath(el.shapeType || 'rect', el.width, el.height);
      elementsSvg += `<g ${rot} ${op} transform="translate(${el.x}, ${el.y})">
        <path d="${pathD}" fill="${fill}" ${stroke} />
      </g>\n`;
    } else if (el.type === 'text') {
      const fill = el.textColor || '#ffffff';
      const fontSize = el.fontSize || 32;
      const fontFamily = el.fontFamily || 'system-ui, sans-serif';
      const fontWeight = el.fontWeight || 'normal';
      const lines = (el.text || '').split('\n');
      const lineHeight = fontSize * (el.lineHeight || 1.2);

      let textContent = '';
      lines.forEach((line, idx) => {
        textContent += `<tspan x="${el.x}" y="${el.y + idx * lineHeight + fontSize}">${escapeXml(line)}</tspan>`;
      });

      elementsSvg += `<text ${rot} ${op} font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}">
        ${textContent}
      </text>\n`;
    } else if (el.type === 'image' && el.imageSrc) {
      elementsSvg += `<image ${rot} ${op} x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" href="${el.imageSrc}" preserveAspectRatio="none" />\n`;
    } else if (el.type === 'qr') {
      const qrSvg = generateQrSvg(el.qrText || '', el.qrColor || '#000000', el.qrBgColor || '#ffffff');
      elementsSvg += `<g ${rot} ${op} transform="translate(${el.x}, ${el.y}) scale(${el.width / 400})">
        ${qrSvg}
      </g>\n`;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  ${bgSvg}
  ${elementsSvg}
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
