import { LogoElement, ThreeDOptions } from './types';
import { MATERIAL_DEFINITIONS, MaterialDefinition } from './threeDMaterials';
import { drawShapeOnCanvas } from './vectorShapes';

/**
 * Renders a LogoElement with high-fidelity 3D extrusion, material shading,
 * directional lighting, bevel rim highlights, and cast shadows.
 */
export function renderThreeDElement(
  ctx: CanvasRenderingContext2D,
  el: LogoElement,
  options?: { isExport?: boolean; highResScale?: number }
) {
  const threeD = el.threeD;
  if (!threeD || !threeD.enabled) return;

  const matDef: MaterialDefinition =
    MATERIAL_DEFINITIONS[threeD.material] || MATERIAL_DEFINITIONS.gold;

  const radX = (threeD.rotX * Math.PI) / 180;
  const radY = (threeD.rotY * Math.PI) / 180;
  const lightRad = (threeD.lightAngle * Math.PI) / 180;

  // Compute depth vector based on 3D pitch/yaw and light direction
  const depth = Math.max(2, Math.min(120, threeD.depth || 25));
  const dx = -Math.sin(radY) * depth * 0.9;
  const dy = Math.sin(radX) * depth * 0.8;

  // Number of extrusion slices for smooth depth rendering
  const sliceCount = Math.max(6, Math.min(36, Math.round(depth / 2.5)));

  ctx.save();

  // Apply pseudo-3D perspective shear & scale
  const skewX = -Math.tan(radY) * 0.22 * (threeD.perspective || 0.35);
  const skewY = Math.tan(radX) * 0.22 * (threeD.perspective || 0.35);
  const scaleX = Math.max(0.4, Math.cos(radY));
  const scaleY = Math.max(0.4, Math.cos(radX));

  ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0);

  // 1. CAST SHADOW LAYER (Behind the 3D object)
  if (threeD.shadowType && threeD.shadowType !== 'none') {
    ctx.save();
    const shadowAngleRad = ((threeD.shadowAngle ?? 315) * Math.PI) / 180;
    const sDist = threeD.shadowDistance || 24;
    const shadowOffsetX = Math.cos(shadowAngleRad) * sDist + dx;
    const shadowOffsetY = Math.sin(shadowAngleRad) * sDist + dy;

    ctx.globalAlpha = (el.opacity ?? 1) * (threeD.shadowOpacity ?? 0.6);
    ctx.shadowColor = threeD.shadowColor || 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = threeD.shadowBlur || 22;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;

    // Draw shadow caster silhouette
    ctx.fillStyle = threeD.shadowColor || '#000000';
    drawElementGeometry(ctx, el, dx, dy);
    ctx.restore();
  }

  // 2. EXTRUSION SLICES (Rendered back-to-front)
  for (let i = sliceCount; i >= 1; i--) {
    const t = i / sliceCount;
    const curDx = dx * t;
    const curDy = dy * t;

    // Color gradient across the depth extrusion
    const sliceColor = interpolateColor(
      matDef.extrusionColors.dark,
      matDef.extrusionColors.light,
      1 - t * 0.75
    );

    ctx.save();
    ctx.fillStyle = sliceColor;

    // Subtle edge shading on the extrusion sides
    if (i === sliceCount || i % 4 === 0) {
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 3;
    }

    drawElementGeometry(ctx, el, curDx, curDy);
    ctx.restore();
  }

  // 3. FRONT FACE MATERIAL RENDERING (At origin)
  ctx.save();
  const faceGrad = createMaterialGradient(ctx, el, matDef, threeD.lightAngle);
  ctx.fillStyle = faceGrad;

  // Apply bevel rim shadow if applicable
  if (threeD.bevelSize > 0) {
    ctx.shadowColor = matDef.bevelShadow;
    ctx.shadowBlur = threeD.bevelSize;
    ctx.shadowOffsetX = -Math.cos(lightRad) * (threeD.bevelSize * 0.5);
    ctx.shadowOffsetY = -Math.sin(lightRad) * (threeD.bevelSize * 0.5);
  }

  drawElementGeometry(ctx, el, 0, 0);
  ctx.restore();

  // 4. BEVEL HIGHLIGHT RIM & SPECULAR CREST
  if (threeD.bevelSize > 0) {
    ctx.save();
    ctx.strokeStyle = matDef.bevelColor;
    ctx.lineWidth = Math.max(1, threeD.bevelSize * 0.6);
    ctx.globalAlpha = Math.min(1, (threeD.specular || 0.85) * (el.opacity ?? 1));

    // Directional highlight on the illuminated edge
    ctx.shadowColor = matDef.bevelColor;
    ctx.shadowBlur = threeD.bevelSize * 1.5;
    ctx.shadowOffsetX = Math.cos(lightRad) * (threeD.bevelSize * 0.5);
    ctx.shadowOffsetY = Math.sin(lightRad) * (threeD.bevelSize * 0.5);

    strokeElementGeometry(ctx, el, 0, 0);
    ctx.restore();
  }

  // 5. SPECULAR GLARE / REFLECTION SWEEP (For Chrome, Gold, Liquid, Glass)
  if (matDef.reflectivity > 0.75 && (threeD.specular || 0.85) > 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    const sweepGrad = ctx.createLinearGradient(
      -el.width / 2,
      -el.height / 2,
      el.width / 2,
      el.height / 2
    );
    const glintAlpha = (matDef.reflectivity * 0.45).toFixed(2);
    sweepGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sweepGrad.addColorStop(0.42, 'rgba(255, 255, 255, 0)');
    sweepGrad.addColorStop(0.48, `rgba(255, 255, 255, ${glintAlpha})`);
    sweepGrad.addColorStop(0.52, `rgba(255, 255, 255, ${glintAlpha})`);
    sweepGrad.addColorStop(0.58, 'rgba(255, 255, 255, 0)');
    sweepGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = sweepGrad;
    drawElementGeometry(ctx, el, 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the filled geometry for any LogoElement at an offset
 */
function drawElementGeometry(
  ctx: CanvasRenderingContext2D,
  el: LogoElement,
  offsetX: number,
  offsetY: number
) {
  ctx.save();
  ctx.translate(offsetX, offsetY);

  if (el.type === 'text') {
    const textContent = el.uppercase ? (el.text || '').toUpperCase() : el.text || '';
    const fontStyle = el.fontStyle || 'normal';
    const fontWeight = el.fontWeight || '700';
    const fontSize = el.fontSize || 36;
    const fontFamily = el.fontFamily || 'Inter, sans-serif';

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = el.textAlign || 'center';
    ctx.textBaseline = 'middle';

    if (el.isCurved) {
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
        ctx.restore();
      });
      ctx.restore();
    } else {
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
          curX += widths[idx] + letterSpacing;
        });
      } else {
        ctx.fillText(textContent, 0, 0);
      }
    }
  } else if (el.type === 'shape' && el.shapeType) {
    drawShapeOnCanvas(ctx, el);
  } else if (el.type === 'icon' && el.svgPath) {
    const iconSize = Math.min(el.width, el.height);
    const p2d = new Path2D(el.svgPath);
    const scale = iconSize / 24;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-12, -12);
    ctx.fill(p2d);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Strokes the geometry for bevel rim highlights
 */
function strokeElementGeometry(
  ctx: CanvasRenderingContext2D,
  el: LogoElement,
  offsetX: number,
  offsetY: number
) {
  ctx.save();
  ctx.translate(offsetX, offsetY);

  if (el.type === 'text') {
    const textContent = el.uppercase ? (el.text || '').toUpperCase() : el.text || '';
    const fontStyle = el.fontStyle || 'normal';
    const fontWeight = el.fontWeight || '700';
    const fontSize = el.fontSize || 36;
    const fontFamily = el.fontFamily || 'Inter, sans-serif';

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = el.textAlign || 'center';
    ctx.textBaseline = 'middle';

    if (el.isCurved) {
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
        ctx.strokeText(char, 0, 0);
        ctx.restore();
      });
      ctx.restore();
    } else {
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
          ctx.strokeText(ch, curX + widths[idx] / 2, 0);
          curX += widths[idx] + letterSpacing;
        });
      } else {
        ctx.strokeText(textContent, 0, 0);
      }
    }
  } else if (el.type === 'shape' && el.shapeType) {
    ctx.stroke();
  } else if (el.type === 'icon' && el.svgPath) {
    const iconSize = Math.min(el.width, el.height);
    const p2d = new Path2D(el.svgPath);
    const scale = iconSize / 24;
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(-12, -12);
    ctx.stroke(p2d);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Creates dynamic multi-stop gradient for the 3D material face aligned with light angle
 */
function createMaterialGradient(
  ctx: CanvasRenderingContext2D,
  el: LogoElement,
  matDef: MaterialDefinition,
  lightAngle: number
): CanvasGradient {
  const angleRad = ((lightAngle || 315) * Math.PI) / 180;
  const hw = el.width / 2;
  const hh = el.height / 2;

  const x1 = -Math.cos(angleRad) * hw;
  const y1 = -Math.sin(angleRad) * hh;
  const x2 = Math.cos(angleRad) * hw;
  const y2 = Math.sin(angleRad) * hh;

  const grad = ctx.createLinearGradient(x1, y1, x2, y2);
  const stops = el.threeD?.customGradientStops || matDef.faceGradient;

  stops.forEach((st) => {
    grad.addColorStop(Math.max(0, Math.min(1, st.offset)), st.color);
  });

  return grad;
}

/**
 * Simple hex color interpolation helper
 */
function interpolateColor(color1: string, color2: string, factor: number): string {
  const c1 = parseHex(color1);
  const c2 = parseHex(color2);

  const r = Math.round(c1.r + factor * (c2.r - c1.r));
  const g = Math.round(c1.g + factor * (c2.g - c1.g));
  const b = Math.round(c1.b + factor * (c2.b - c1.b));

  return `rgb(${r}, ${g}, ${b})`;
}

function parseHex(hexStr: string): { r: number; g: number; b: number } {
  let hex = hexStr.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length < 6) return { r: 100, g: 100, b: 100 };
  const num = parseInt(hex.substring(0, 6), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}
