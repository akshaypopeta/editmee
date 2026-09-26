import { LogoElement, ShapeType } from './types';

export interface ShapeDefinition {
  type: ShapeType;
  name: string;
  category: 'Basic' | 'Polygons' | 'Stars & Bursts' | 'Shields & Badges' | 'Abstract & Curves' | 'Arrows & Lines' | 'Decorative';
  defaultWidth: number;
  defaultHeight: number;
  tags: string[];
}

export const SHAPE_ITEMS: ShapeDefinition[] = [
  // --- BASIC ---
  { type: 'rect', name: 'Rectangle', category: 'Basic', defaultWidth: 160, defaultHeight: 100, tags: ['box', 'card', 'block'] },
  { type: 'rounded-rect', name: 'Rounded Rectangle', category: 'Basic', defaultWidth: 160, defaultHeight: 100, tags: ['smooth', 'button', 'pill'] },
  { type: 'square', name: 'Perfect Square', category: 'Basic', defaultWidth: 120, defaultHeight: 120, tags: ['box', 'cube'] },
  { type: 'circle', name: 'Circle', category: 'Basic', defaultWidth: 120, defaultHeight: 120, tags: ['round', 'dot', 'ball'] },
  { type: 'ellipse', name: 'Ellipse Oval', category: 'Basic', defaultWidth: 160, defaultHeight: 100, tags: ['oval', 'egg'] },
  { type: 'triangle', name: 'Equilateral Triangle', category: 'Basic', defaultWidth: 120, defaultHeight: 110, tags: ['delta', 'pyramid', 'wedge'] },
  { type: 'capsule', name: 'Stadium Capsule', category: 'Basic', defaultWidth: 160, defaultHeight: 70, tags: ['pill', 'stadium', 'bar'] },

  // --- POLYGONS ---
  { type: 'diamond', name: 'Diamond / Rhombus', category: 'Polygons', defaultWidth: 120, defaultHeight: 120, tags: ['gem', 'rhombus', 'square-rotated'] },
  { type: 'rhombus', name: 'Slanted Rhombus', category: 'Polygons', defaultWidth: 140, defaultHeight: 90, tags: ['parallelogram', 'slant'] },
  { type: 'trapezoid', name: 'Keystone Trapezoid', category: 'Polygons', defaultWidth: 150, defaultHeight: 90, tags: ['keystone', 'wedge'] },
  { type: 'parallelogram', name: 'Speed Parallelogram', category: 'Polygons', defaultWidth: 150, defaultHeight: 80, tags: ['fast', 'slant', 'sport'] },
  { type: 'pentagon', name: 'Regular Pentagon', category: 'Polygons', defaultWidth: 120, defaultHeight: 120, tags: ['5-sided', 'poly'] },
  { type: 'hexagon', name: 'Hexagon Honeycomb', category: 'Polygons', defaultWidth: 120, defaultHeight: 130, tags: ['6-sided', 'cell', 'cube'] },
  { type: 'heptagon', name: 'Heptagon', category: 'Polygons', defaultWidth: 120, defaultHeight: 120, tags: ['7-sided', 'poly'] },
  { type: 'octagon', name: 'Octagon Stop', category: 'Polygons', defaultWidth: 120, defaultHeight: 120, tags: ['8-sided', 'stop'] },
  { type: 'decagon', name: 'Decagon Ring', category: 'Polygons', defaultWidth: 120, defaultHeight: 120, tags: ['10-sided', 'seal'] },

  // --- STARS & BURSTS ---
  { type: 'star-4', name: '4-Point Star Sparkle', category: 'Stars & Bursts', defaultWidth: 120, defaultHeight: 120, tags: ['sparkle', 'diamond-star', 'glint'] },
  { type: 'star', name: '5-Point Classic Star', category: 'Stars & Bursts', defaultWidth: 120, defaultHeight: 120, tags: ['star', 'rating', 'favorite'] },
  { type: 'star-6', name: '6-Point Hexagram', category: 'Stars & Bursts', defaultWidth: 120, defaultHeight: 120, tags: ['hexagram', 'seal'] },
  { type: 'star-8', name: '8-Point Compass Star', category: 'Stars & Bursts', defaultWidth: 120, defaultHeight: 120, tags: ['compass', 'octagram', 'rose'] },
  { type: 'star-10', name: '10-Point Decagram', category: 'Stars & Bursts', defaultWidth: 120, defaultHeight: 120, tags: ['sunburst', 'seal'] },
  { type: 'starburst', name: '16-Point Starburst', category: 'Stars & Bursts', defaultWidth: 130, defaultHeight: 130, tags: ['burst', 'certified', 'guarantee', 'stamp'] },

  // --- SHIELDS & BADGES ---
  { type: 'shield', name: 'Heraldic Shield', category: 'Shields & Badges', defaultWidth: 120, defaultHeight: 140, tags: ['security', 'armor', 'crest', 'guard'] },
  { type: 'gothic-shield', name: 'Gothic Pointed Shield', category: 'Shields & Badges', defaultWidth: 120, defaultHeight: 150, tags: ['medieval', 'armor', 'crest'] },
  { type: 'crest', name: 'Regal Crest Frame', category: 'Shields & Badges', defaultWidth: 130, defaultHeight: 140, tags: ['crown', 'frame', 'luxury'] },
  { type: 'badge', name: 'Octagonal Security Badge', category: 'Shields & Badges', defaultWidth: 120, defaultHeight: 120, tags: ['officer', 'guard', 'police'] },
  { type: 'circle-badge', name: 'Notched Circle Stamp', category: 'Shields & Badges', defaultWidth: 130, defaultHeight: 130, tags: ['seal', 'stamp', 'certified'] },
  { type: 'emblem', name: 'Emblem Cartouche', category: 'Shields & Badges', defaultWidth: 140, defaultHeight: 120, tags: ['cartouche', 'frame', 'oval-badge'] },
  { type: 'seal', name: 'Wax Stamp Seal', category: 'Shields & Badges', defaultWidth: 130, defaultHeight: 130, tags: ['wax', 'vintage', 'stamp'] },
  { type: 'ribbon', name: 'Banner Ribbon', category: 'Shields & Badges', defaultWidth: 170, defaultHeight: 55, tags: ['banner', 'flag', 'header'] },
  { type: 'banner', name: 'Folded Header Banner', category: 'Shields & Badges', defaultWidth: 180, defaultHeight: 65, tags: ['arch', 'scroll', 'title'] },
  { type: 'rosette', name: 'Award Rosette', category: 'Shields & Badges', defaultWidth: 130, defaultHeight: 130, tags: ['winner', 'ribbon', 'prize'] },

  // --- ABSTRACT & CURVES ---
  { type: 'ring', name: 'Donut Ring', category: 'Abstract & Curves', defaultWidth: 120, defaultHeight: 120, tags: ['circle-cut', 'donut', 'o'] },
  { type: 'arc', name: 'Sweeping Crescent Arc', category: 'Abstract & Curves', defaultWidth: 120, defaultHeight: 120, tags: ['crescent', 'orbit', 'curve'] },
  { type: 'semicircle', name: 'Dome Semicircle', category: 'Abstract & Curves', defaultWidth: 140, defaultHeight: 80, tags: ['half-circle', 'dome', 'arch'] },
  { type: 'wave', name: 'Ocean Wave Flow', category: 'Abstract & Curves', defaultWidth: 160, defaultHeight: 70, tags: ['water', 'sea', 'fluid'] },
  { type: 'swirl', name: 'Spiral Swirl Vortex', category: 'Abstract & Curves', defaultWidth: 120, defaultHeight: 120, tags: ['vortex', 'twister', 'spin'] },
  { type: 'spiral', name: 'Fibonacci Spiral', category: 'Abstract & Curves', defaultWidth: 120, defaultHeight: 120, tags: ['nautilus', 'shell', 'curve'] },
  { type: 'blob', name: 'Organic Fluid Blob', category: 'Abstract & Curves', defaultWidth: 130, defaultHeight: 120, tags: ['liquid', 'dynamic', 'modern'] },
  { type: 'infinity', name: 'Infinity Loop', category: 'Abstract & Curves', defaultWidth: 160, defaultHeight: 80, tags: ['loop', 'eternal', 'figure8'] },
  { type: 'orbit', name: 'Planetary Elliptical Orbit', category: 'Abstract & Curves', defaultWidth: 160, defaultHeight: 80, tags: ['space', 'ring', 'electron'] },

  // --- ARROWS & LINES ---
  { type: 'arrow', name: 'Block Right Arrow', category: 'Arrows & Lines', defaultWidth: 150, defaultHeight: 80, tags: ['direction', 'forward', 'pointer'] },
  { type: 'double-arrow', name: 'Bi-Directional Arrow', category: 'Arrows & Lines', defaultWidth: 160, defaultHeight: 70, tags: ['exchange', 'sync', 'transfer'] },
  { type: 'curved-arrow', name: 'Curved Return Arrow', category: 'Arrows & Lines', defaultWidth: 120, defaultHeight: 120, tags: ['loop', 'cycle', 'refresh'] },
  { type: 'chevron', name: 'Chevron Sergeant', category: 'Arrows & Lines', defaultWidth: 140, defaultHeight: 80, tags: ['military', 'rank', 'v'] },
  { type: 'pointer', name: 'Precision Pointer', category: 'Arrows & Lines', defaultWidth: 120, defaultHeight: 120, tags: ['mouse', 'cursor', 'aim'] },
  { type: 'line', name: 'Divider Stroke', category: 'Arrows & Lines', defaultWidth: 160, defaultHeight: 6, tags: ['separator', 'rule'] },
  { type: 'speech-bubble', name: 'Callout Speech Bubble', category: 'Arrows & Lines', defaultWidth: 150, defaultHeight: 100, tags: ['message', 'chat', 'talk'] },

  // --- DECORATIVE ---
  { type: 'heart', name: 'Romantic Heart', category: 'Decorative', defaultWidth: 120, defaultHeight: 110, tags: ['love', 'care', 'health'] },
  { type: 'sun', name: 'Solar Crest Radiance', category: 'Decorative', defaultWidth: 130, defaultHeight: 130, tags: ['sun', 'day', 'warmth'] },
  { type: 'burst', name: 'Explosive Impact Burst', category: 'Decorative', defaultWidth: 130, defaultHeight: 130, tags: ['boom', 'new', 'offer', 'pop'] },
  { type: 'flower', name: 'Lotus Petal Flower', category: 'Decorative', defaultWidth: 130, defaultHeight: 130, tags: ['botanical', 'wellness', 'petal'] },
  { type: 'gear', name: 'Mechanical Cog Gear', category: 'Decorative', defaultWidth: 120, defaultHeight: 120, tags: ['industry', 'engine', 'machine'] },
  { type: 'hex-grid', name: 'Honeycomb Hex Matrix', category: 'Decorative', defaultWidth: 140, defaultHeight: 120, tags: ['honeycomb', 'hive', 'tech'] },
  { type: 'divider-diamond', name: 'Diamond Crest Divider', category: 'Decorative', defaultWidth: 180, defaultHeight: 30, tags: ['ornament', 'flourish', 'vintage'] },
];

export const SHAPE_CATEGORIES = [
  'All',
  'Basic',
  'Polygons',
  'Stars & Bursts',
  'Shields & Badges',
  'Abstract & Curves',
  'Arrows & Lines',
  'Decorative',
] as const;

/**
 * Creates SVG path data (d attribute) for any given shape type and dimensions
 */
export function getShapeSvgPath(
  shapeType: ShapeType,
  width: number,
  height: number,
  options?: { borderRadius?: number; points?: number; innerRadiusRatio?: number }
): string {
  const w = width;
  const h = height;
  const hw = w / 2;
  const hh = h / 2;
  const r = options?.borderRadius ?? Math.min(w, h) * 0.1;

  switch (shapeType) {
    case 'rect':
    case 'square':
      return `M 0 0 H ${w} V ${h} H 0 Z`;

    case 'rounded-rect': {
      const cr = Math.min(r, hw, hh);
      return `M ${cr} 0 H ${w - cr} Q ${w} 0 ${w} ${cr} V ${h - cr} Q ${w} ${h} ${w - cr} ${h} H ${cr} Q 0 ${h} 0 ${h - cr} V ${cr} Q 0 0 ${cr} 0 Z`;
    }

    case 'circle': {
      const radius = Math.min(hw, hh);
      return `M ${hw} ${hh - radius} A ${radius} ${radius} 0 1 0 ${hw} ${hh + radius} A ${radius} ${radius} 0 1 0 ${hw} ${hh - radius} Z`;
    }

    case 'ellipse':
      return `M ${hw} 0 A ${hw} ${hh} 0 1 0 ${hw} ${h} A ${hw} ${hh} 0 1 0 ${hw} 0 Z`;

    case 'triangle':
      return `M ${hw} 0 L ${w} ${h} L 0 ${h} Z`;

    case 'diamond':
      return `M ${hw} 0 L ${w} ${hh} L ${hw} ${h} L 0 ${hh} Z`;

    case 'rhombus':
    case 'parallelogram': {
      const skew = w * 0.22;
      return `M ${skew} 0 L ${w} 0 L ${w - skew} ${h} L 0 ${h} Z`;
    }

    case 'trapezoid': {
      const indent = w * 0.2;
      return `M ${indent} 0 L ${w - indent} 0 L ${w} ${h} L 0 ${h} Z`;
    }

    case 'pentagon': {
      return buildRegularPolygonPath(5, hw, hh, Math.min(hw, hh));
    }

    case 'hexagon': {
      const p1 = w * 0.25;
      const p2 = w * 0.75;
      return `M ${p1} 0 L ${p2} 0 L ${w} ${hh} L ${p2} ${h} L ${p1} ${h} L 0 ${hh} Z`;
    }

    case 'heptagon':
      return buildRegularPolygonPath(7, hw, hh, Math.min(hw, hh));

    case 'octagon':
    case 'badge': {
      const c = Math.min(w, h) * 0.28;
      return `M ${c} 0 L ${w - c} 0 L ${w} ${c} L ${w} ${h - c} L ${w - c} ${h} L ${c} ${h} L 0 ${h - c} L 0 ${c} Z`;
    }

    case 'decagon':
      return buildRegularPolygonPath(10, hw, hh, Math.min(hw, hh));

    case 'star-4':
      return buildStarPath(4, hw, hh, Math.min(hw, hh), 0.3);

    case 'star':
      return buildStarPath(5, hw, hh, Math.min(hw, hh), 0.45);

    case 'star-6':
      return buildStarPath(6, hw, hh, Math.min(hw, hh), 0.5);

    case 'star-8':
      return buildStarPath(8, hw, hh, Math.min(hw, hh), 0.48);

    case 'star-10':
      return buildStarPath(10, hw, hh, Math.min(hw, hh), 0.58);

    case 'starburst':
      return buildStarPath(16, hw, hh, Math.min(hw, hh), 0.82);

    case 'shield':
      return `M 0 0 H ${w} V ${hh} C ${w} ${h * 0.85} ${hw} ${h} ${hw} ${h} C ${hw} ${h} 0 ${h * 0.85} 0 ${hh} Z`;

    case 'gothic-shield':
      return `M 0 0 C ${w * 0.25} ${h * 0.08} ${w * 0.75} ${h * 0.08} ${w} 0 V ${h * 0.55} C ${w} ${h * 0.88} ${hw} ${h} ${hw} ${h} C ${hw} ${h} 0 ${h * 0.88} 0 ${h * 0.55} Z`;

    case 'crest':
      return `M ${hw} 0 C ${w * 0.8} 0 ${w} ${h * 0.2} ${w} ${hh} C ${w} ${h * 0.8} ${hw} ${h} ${hw} ${h} C ${hw} ${h} 0 ${h * 0.8} 0 ${hh} C 0 ${h * 0.2} ${w * 0.2} 0 ${hw} 0 Z`;

    case 'circle-badge':
    case 'seal':
    case 'rosette':
      return buildStarPath(20, hw, hh, Math.min(hw, hh), 0.88);

    case 'emblem':
      return `M ${w * 0.15} 0 H ${w * 0.85} C ${w} ${h * 0.2} ${w} ${h * 0.8} ${w * 0.85} ${h} H ${w * 0.15} C 0 ${h * 0.8} 0 ${h * 0.2} ${w * 0.15} 0 Z`;

    case 'heart': {
      const topH = h * 0.35;
      return `M ${hw} ${h} C ${w * 0.1} ${h * 0.65} 0 ${topH * 1.3} 0 ${topH} C 0 ${topH * 0.3} ${hw * 0.4} 0 ${hw} ${topH * 0.6} C ${w - hw * 0.4} 0 ${w} ${topH * 0.3} ${w} ${topH} C ${w} ${topH * 1.3} ${w * 0.9} ${h * 0.65} ${hw} ${h} Z`;
    }

    case 'ring': {
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.68;
      return `M ${hw} ${hh - outerR} A ${outerR} ${outerR} 0 1 0 ${hw} ${hh + outerR} A ${outerR} ${outerR} 0 1 0 ${hw} ${hh - outerR} M ${hw} ${hh - innerR} A ${innerR} ${innerR} 0 1 1 ${hw} ${hh + innerR} A ${innerR} ${innerR} 0 1 1 ${hw} ${hh - innerR} Z`;
    }

    case 'arc': {
      const radius = Math.min(hw, hh);
      return `M 0 ${hh} A ${radius} ${radius} 0 0 1 ${w} ${hh} A ${radius * 0.75} ${radius * 0.75} 0 0 0 0 ${hh} Z`;
    }

    case 'semicircle':
      return `M 0 ${h} A ${hw} ${h} 0 0 1 ${w} ${h} Z`;

    case 'capsule': {
      const cr = Math.min(hw, hh);
      return `M ${cr} 0 H ${w - cr} A ${cr} ${cr} 0 0 1 ${w} ${cr} V ${h - cr} A ${cr} ${cr} 0 0 1 ${w - cr} ${h} H ${cr} A ${cr} ${cr} 0 0 1 0 ${h - cr} V ${cr} A ${cr} ${cr} 0 0 1 ${cr} 0 Z`;
    }

    case 'chevron': {
      const depth = w * 0.28;
      return `M 0 0 L ${w - depth} 0 L ${w} ${hh} L ${w - depth} ${h} L 0 ${h} L ${depth} ${hh} Z`;
    }

    case 'wave':
      return `M 0 ${hh} Q ${w * 0.25} 0 ${hw} ${hh} T ${w} ${hh} V ${h} H 0 Z`;

    case 'infinity':
      return `M ${w * 0.3} ${hh} C ${w * 0.15} ${h * 0.15} 0 ${h * 0.3} 0 ${hh} C 0 ${h * 0.7} ${w * 0.15} ${h * 0.85} ${w * 0.3} ${hh} L ${w * 0.7} ${hh} C ${w * 0.85} ${h * 0.15} ${w} ${h * 0.3} ${w} ${hh} C ${w} ${h * 0.7} ${w * 0.85} ${h * 0.85} ${w * 0.7} ${hh} Z`;

    case 'arrow': {
      const stemH = h * 0.36;
      const stemTop = (h - stemH) / 2;
      const stemBottom = stemTop + stemH;
      const headLeft = w * 0.6;
      return `M 0 ${stemTop} H ${headLeft} V 0 L ${w} ${hh} L ${headLeft} ${h} V ${stemBottom} H 0 Z`;
    }

    case 'ribbon': {
      const cut = h * 0.25;
      return `M 0 0 H ${w} L ${w - cut} ${hh} L ${w} ${h} H 0 L ${cut} ${hh} Z`;
    }

    case 'banner': {
      return `M 0 ${h * 0.2} Q ${hw} 0 ${w} ${h * 0.2} V ${h * 0.8} Q ${hw} ${h * 0.6} 0 ${h * 0.8} Z`;
    }

    case 'gear':
      return buildGearPath(hw, hh, Math.min(hw, hh), 8);

    case 'divider-diamond':
      return `M 0 ${hh} H ${hw - 20} L ${hw} 0 L ${hw + 20} ${hh} H ${w} H ${hw + 20} L ${hw} ${h} L ${hw - 20} ${hh} H 0 Z`;

    case 'line':
      return `M 0 ${hh} H ${w}`;

    default:
      return `M 0 0 H ${w} V ${h} H 0 Z`;
  }
}

/**
 * Draws shape geometry directly onto CanvasRenderingContext2D (centered at (0, 0))
 */
export function drawShapeOnCanvas(ctx: CanvasRenderingContext2D, el: LogoElement) {
  const shapeType = el.shapeType || 'rect';
  const w = el.width;
  const h = el.height;
  const hw = w / 2;
  const hh = h / 2;

  ctx.beginPath();

  switch (shapeType) {
    case 'rect':
    case 'square':
      ctx.rect(-hw, -hh, w, h);
      break;

    case 'rounded-rect': {
      const cr = Math.min(el.borderRadius || 12, hw, hh);
      fallbackRoundRect(ctx, -hw, -hh, w, h, cr);
      break;
    }

    case 'circle': {
      const r = Math.min(hw, hh);
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;
    }

    case 'ellipse':
      ctx.ellipse(0, 0, hw, hh, 0, 0, Math.PI * 2);
      break;

    case 'triangle':
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, hh);
      ctx.lineTo(-hw, hh);
      ctx.closePath();
      break;

    case 'diamond':
      ctx.moveTo(0, -hh);
      ctx.lineTo(hw, 0);
      ctx.lineTo(0, hh);
      ctx.lineTo(-hw, 0);
      ctx.closePath();
      break;

    case 'hexagon': {
      const r = Math.min(hw, hh);
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 - Math.PI / 6;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }

    case 'shield':
      ctx.moveTo(-hw, -hh);
      ctx.lineTo(hw, -hh);
      ctx.lineTo(hw, 0);
      ctx.bezierCurveTo(hw, hh * 0.7, 0, hh, 0, hh);
      ctx.bezierCurveTo(0, hh, -hw, hh * 0.7, -hw, 0);
      ctx.closePath();
      break;

    case 'star': {
      const outerR = Math.min(hw, hh);
      const innerR = outerR * 0.45;
      for (let i = 0; i < 10; i++) {
        const rad = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = rad * Math.cos(angle);
        const y = rad * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }

    case 'heart': {
      const topH = -hh + h * 0.35;
      ctx.moveTo(0, hh);
      ctx.bezierCurveTo(-hw * 0.8, hh * 0.3, -hw, topH * 1.3, -hw, topH);
      ctx.bezierCurveTo(-hw, -hh, -hw * 0.2, -hh, 0, topH * 0.6);
      ctx.bezierCurveTo(hw * 0.2, -hh, hw, -hh, hw, topH);
      ctx.bezierCurveTo(hw, topH * 1.3, hw * 0.8, hh * 0.3, 0, hh);
      ctx.closePath();
      break;
    }

    default: {
      // Fallback: render using SVG Path2D if available
      const svgPath = getShapeSvgPath(shapeType, w, h);
      const p2d = new Path2D(svgPath);
      ctx.save();
      ctx.translate(-hw, -hh);
      ctx.fill(p2d);
      ctx.restore();
      return;
    }
  }

  ctx.fill();
}

function buildRegularPolygonPath(sides: number, cx: number, cy: number, radius: number): string {
  let path = '';
  const step = (Math.PI * 2) / sides;
  for (let i = 0; i < sides; i++) {
    const angle = i * step - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    path += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path + ' Z';
}

function buildStarPath(points: number, cx: number, cy: number, outerR: number, innerRatio: number): string {
  const innerR = outerR * innerRatio;
  const step = Math.PI / points;
  let path = '';
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2;
    const x = cx + rad * Math.cos(angle);
    const y = cy + rad * Math.sin(angle);
    path += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path + ' Z';
}

function buildGearPath(cx: number, cy: number, radius: number, teeth: number): string {
  const innerR = radius * 0.75;
  const step = (Math.PI * 2) / (teeth * 4);
  let path = '';
  for (let i = 0; i < teeth * 4; i++) {
    const rad = (i % 4 === 1 || i % 4 === 2) ? radius : innerR;
    const angle = i * step;
    const x = cx + rad * Math.cos(angle);
    const y = cy + rad * Math.sin(angle);
    path += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return path + ' Z';
}

function fallbackRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
