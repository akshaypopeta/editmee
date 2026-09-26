import { LogoElement, CanvasDimensions } from './types';
import { getShapeSvgPath } from './vectorShapes';
import { MATERIAL_DEFINITIONS } from './threeDMaterials';

interface SvgExportOptions {
  elements: LogoElement[];
  canvasSize: CanvasDimensions;
  bgType: 'transparent' | 'solid' | 'gradient';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
}

export function generateVectorSvg(options: SvgExportOptions): string {
  const { elements, canvasSize, bgType, bgColor, gradientStart, gradientEnd, gradientAngle } = options;
  const w = canvasSize.width;
  const h = canvasSize.height;

  let defsXml = '';
  let contentXml = '';

  // Background gradient def if applicable
  if (bgType === 'gradient') {
    const angleRad = (gradientAngle * Math.PI) / 180;
    const x1 = Math.round(50 - Math.cos(angleRad) * 50);
    const y1 = Math.round(50 - Math.sin(angleRad) * 50);
    const x2 = Math.round(50 + Math.cos(angleRad) * 50);
    const y2 = Math.round(50 + Math.sin(angleRad) * 50);
    defsXml += `
    <linearGradient id="bg-grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="${gradientStart}" />
      <stop offset="100%" stop-color="${gradientEnd}" />
    </linearGradient>`;
  }

  // Background rect
  if (bgType === 'solid') {
    contentXml += `  <rect width="${w}" height="${h}" fill="${bgColor}" />\n`;
  } else if (bgType === 'gradient') {
    contentXml += `  <rect width="${w}" height="${h}" fill="url(#bg-grad)" />\n`;
  }

  // Generate Element definitions & nodes
  elements.forEach((el) => {
    if (!el.visible) return;

    // Handle 3D Element in Vector SVG
    if (el.threeD && el.threeD.enabled) {
      const threeD = el.threeD;
      const matDef = MATERIAL_DEFINITIONS[threeD.material] || MATERIAL_DEFINITIONS.gold;
      const radX = (threeD.rotX * Math.PI) / 180;
      const radY = (threeD.rotY * Math.PI) / 180;
      const depth = Math.max(2, Math.min(100, threeD.depth || 25));
      const dx = -Math.sin(radY) * depth * 0.9;
      const dy = Math.sin(radX) * depth * 0.8;
      const sliceCount = Math.max(4, Math.min(16, Math.round(depth / 3)));

      const matGradId = `mat-grad-${el.id}`;
      const lightRad = (threeD.lightAngle * Math.PI) / 180;
      const gx1 = Math.round(50 - Math.cos(lightRad) * 50);
      const gy1 = Math.round(50 - Math.sin(lightRad) * 50);
      const gx2 = Math.round(50 + Math.cos(lightRad) * 50);
      const gy2 = Math.round(50 + Math.sin(lightRad) * 50);

      let gradStopsXml = '';
      const stops = threeD.customGradientStops || matDef.faceGradient;
      stops.forEach((st) => {
        gradStopsXml += `\n      <stop offset="${(st.offset * 100).toFixed(1)}%" stop-color="${st.color}" />`;
      });

      defsXml += `
    <linearGradient id="${matGradId}" x1="${gx1}%" y1="${gy1}%" x2="${gx2}%" y2="${gy2}%">${gradStopsXml}
    </linearGradient>`;

      let filterAttr = '';
      if (threeD.shadowType && threeD.shadowType !== 'none') {
        const shadowId = `shadow-3d-${el.id}`;
        const shadowAngleRad = ((threeD.shadowAngle ?? 315) * Math.PI) / 180;
        const sDist = threeD.shadowDistance || 20;
        const sx = (Math.cos(shadowAngleRad) * sDist + dx).toFixed(1);
        const sy = (Math.sin(shadowAngleRad) * sDist + dy).toFixed(1);
        const sBlur = ((threeD.shadowBlur || 20) / 2).toFixed(1);
        defsXml += `
    <filter id="${shadowId}" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="${sx}" dy="${sy}" stdDeviation="${sBlur}" flood-color="${threeD.shadowColor || '#000000'}" flood-opacity="${threeD.shadowOpacity ?? 0.6}" />
    </filter>`;
        filterAttr = ` filter="url(#${shadowId})"`;
      }

      const transform = `transform="translate(${el.x}, ${el.y}) rotate(${el.rotation})"`;
      const opacityAttr = el.opacity < 1 ? ` opacity="${el.opacity}"` : '';

      contentXml += `  <!-- 3D ${el.name} (${el.type}) [Material: ${matDef.name}] -->\n`;
      contentXml += `  <g id="${el.id}" ${transform}${opacityAttr}${filterAttr}>\n`;

      // 1. Extrusion back-to-front
      for (let i = sliceCount; i >= 1; i--) {
        const t = i / sliceCount;
        const curX = (dx * t).toFixed(1);
        const curY = (dy * t).toFixed(1);
        const sliceFill = i === sliceCount ? matDef.extrusionColors.dark : matDef.extrusionColors.mid;

        contentXml += `    <g transform="translate(${curX}, ${curY})">\n`;
        contentXml += renderElementSvgInner(el, sliceFill, '');
        contentXml += `    </g>\n`;
      }

      // 2. Front face with material gradient and bevel
      let bevelStroke = '';
      if (threeD.bevelSize > 0) {
        bevelStroke = ` stroke="${matDef.bevelColor}" stroke-width="${Math.max(1, threeD.bevelSize * 0.5)}"`;
      }

      contentXml += `    <g transform="translate(0, 0)">\n`;
      contentXml += renderElementSvgInner(el, `url(#${matGradId})`, bevelStroke);
      contentXml += `    </g>\n`;

      contentXml += `  </g>\n`;
      return;
    }

    // Standard 2D Element SVG rendering
    let fillAttr = el.fillColor || '#000000';
    if (el.fillType === 'linear' && el.gradient) {
      const gradId = `grad-${el.id}`;
      const gradAngleRad = (el.gradient.angle * Math.PI) / 180;
      const gx1 = Math.round(50 - Math.cos(gradAngleRad) * 50);
      const gy1 = Math.round(50 - Math.sin(gradAngleRad) * 50);
      const gx2 = Math.round(50 + Math.cos(gradAngleRad) * 50);
      const gy2 = Math.round(50 + Math.sin(gradAngleRad) * 50);
      defsXml += `
    <linearGradient id="${gradId}" x1="${gx1}%" y1="${gy1}%" x2="${gx2}%" y2="${gy2}%">
      <stop offset="0%" stop-color="${el.gradient.startColor}" />
      <stop offset="100%" stop-color="${el.gradient.endColor}" />
    </linearGradient>`;
      fillAttr = `url(#${gradId})`;
    }

    let strokeAttr = '';
    if (el.stroke && el.stroke.width > 0) {
      strokeAttr = ` stroke="${el.stroke.color}" stroke-width="${el.stroke.width}"`;
      if (el.stroke.dash && el.stroke.dash.length > 0) {
        strokeAttr += ` stroke-dasharray="${el.stroke.dash.join(' ')}"`;
      }
    }

    let filterAttr = '';
    if (el.shadow && el.shadow.blur > 0) {
      const shadowId = `shadow-${el.id}`;
      defsXml += `
    <filter id="${shadowId}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="${el.shadow.offsetX}" dy="${el.shadow.offsetY}" stdDeviation="${el.shadow.blur / 2}" flood-color="${el.shadow.color}" />
    </filter>`;
      filterAttr = ` filter="url(#${shadowId})"`;
    }

    const transform = `transform="translate(${el.x}, ${el.y}) rotate(${el.rotation})"`;
    const opacityAttr = el.opacity < 1 ? ` opacity="${el.opacity}"` : '';

    contentXml += `  <!-- ${el.name} (${el.type}) -->\n`;
    contentXml += `  <g id="${el.id}" ${transform}${opacityAttr}${filterAttr}>\n`;
    contentXml += renderElementSvgInner(el, fillAttr, strokeAttr);
    contentXml += `  </g>\n`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>${defsXml}
  </defs>
${contentXml}
</svg>`;
}

function renderElementSvgInner(el: LogoElement, fillAttr: string, strokeAttr: string): string {
  let xml = '';
  if (el.type === 'shape') {
    const pathData = getShapeSvgPath(el.shapeType || 'rect', el.width, el.height, {
      borderRadius: el.borderRadius,
      points: el.points,
      innerRadiusRatio: el.innerRadiusRatio,
    });
    xml += `      <g transform="translate(${-el.width / 2}, ${-el.height / 2})">\n`;
    xml += `        <path d="${pathData}" fill="${fillAttr}"${strokeAttr} />\n`;
    xml += `      </g>\n`;
  } else if (el.type === 'icon' && el.svgPath) {
    const scaleX = el.width / 24;
    const scaleY = el.height / 24;
    xml += `      <g transform="translate(${-el.width / 2}, ${-el.height / 2}) scale(${scaleX.toFixed(4)}, ${scaleY.toFixed(4)})">\n`;
    xml += `        <path d="${el.svgPath}" fill="${fillAttr}"${strokeAttr} />\n`;
    xml += `      </g>\n`;
  } else if (el.type === 'text') {
    const displayText = el.uppercase ? (el.text || '').toUpperCase() : el.text || '';
    const textAnchor = el.textAlign === 'left' ? 'start' : el.textAlign === 'right' ? 'end' : 'middle';
    const letterSpacingAttr = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}px"` : '';
    const fontStyleAttr = el.fontStyle === 'italic' ? ' font-style="italic"' : '';
    const textDecorAttr = el.textDecoration === 'underline' ? ' text-decoration="underline"' : '';

    xml += `      <text x="0" y="0" dominant-baseline="central" text-anchor="${textAnchor}" font-family="${escapeXml(el.fontFamily || 'Inter, sans-serif')}" font-size="${el.fontSize || 36}" font-weight="${el.fontWeight || '700'}" fill="${fillAttr}"${strokeAttr}${letterSpacingAttr}${fontStyleAttr}${textDecorAttr}>${escapeXml(displayText)}</text>\n`;
  }
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
