import { ShapeType } from './types';

export interface VectorShapeItem {
  id: string;
  name: string;
  type: ShapeType;
  category: 'Basic' | 'Badges & Crests' | 'Symbols' | 'Callouts';
}

export const VECTOR_SHAPES: VectorShapeItem[] = [
  { id: 'rect', name: 'Rectangle', type: 'rect', category: 'Basic' },
  { id: 'rounded-rect', name: 'Rounded Rectangle', type: 'rounded-rect', category: 'Basic' },
  { id: 'circle', name: 'Circle', type: 'circle', category: 'Basic' },
  { id: 'ellipse', name: 'Ellipse', type: 'ellipse', category: 'Basic' },
  { id: 'triangle', name: 'Triangle', type: 'triangle', category: 'Basic' },
  { id: 'polygon', name: 'Hexagon', type: 'polygon', category: 'Basic' },
  { id: 'diamond', name: 'Diamond', type: 'diamond', category: 'Basic' },
  { id: 'star', name: '5-Point Star', type: 'star', category: 'Symbols' },
  { id: 'heart', name: 'Heart', type: 'heart', category: 'Symbols' },
  { id: 'arrow', name: 'Right Arrow', type: 'arrow', category: 'Symbols' },
  { id: 'shield', name: 'Heraldic Shield', type: 'shield', category: 'Badges & Crests' },
  { id: 'badge', name: 'Rosette Badge', type: 'badge', category: 'Badges & Crests' },
  { id: 'speech', name: 'Speech Bubble', type: 'speech', category: 'Callouts' },
  { id: 'line', name: 'Straight Line', type: 'line', category: 'Basic' },
];

export interface IconItem {
  name: string;
  category: 'Action' | 'Business' | 'Social' | 'Creative' | 'Nature';
  path: string;
}

export const VECTOR_ICONS: IconItem[] = [
  {
    name: 'Sparkles',
    category: 'Creative',
    path: 'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z',
  },
  {
    name: 'Crown',
    category: 'Business',
    path: 'M2 4l3 12h14l3-12-5 6-5-8-5 8z M4 18h16v2H4z',
  },
  {
    name: 'Star',
    category: 'Creative',
    path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    name: 'Shield',
    category: 'Business',
    path: 'M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z',
  },
  {
    name: 'Heart',
    category: 'Creative',
    path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z',
  },
  {
    name: 'Trophy',
    category: 'Business',
    path: 'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  },
  {
    name: 'Rocket',
    category: 'Action',
    path: 'M13.13 2.18l-1.45 3.79 3.03 3.03 3.79-1.45c.87-2.61-2.76-6.24-5.37-5.37zM4.5 16.5l3-3 3 3-3 3-3-3zm9.24-4.88l-2.86-2.86L3 16.64V21h4.36l7.88-7.88-1.5-1.5z',
  },
  {
    name: 'Flame',
    category: 'Creative',
    path: 'M13.5 5.5c-.3 1.2-1.2 2.3-2.1 3.2-1.5 1.5-2.4 3-2.4 5.3 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.8-2.6-6.3-4.5-8.5-.7-.8-1.5-1.8-2-2.8-.4-.9-.8-2-1-3.2 0 0-1.5 1.8-2 3.5-.7 2.3-2 4.1-3.5 5.5-1 1-1.5 2.2-1.5 3.5 0 2.2 1.8 4 4 4 .4 0 .8-.1 1.2-.2-.2-.5-.2-1-.2-1.5 0-2.2 1.3-4 3.1-4.8.4-.2.9-.3 1.4-.3.5 0 1 .1 1.5.3-.2-.5-.4-1-.4-1.7 0-1 .4-1.9 1-2.7.3-.4.6-.9.8-1.4.1-.3.1-.6.1-.9z',
  },
  {
    name: 'Megaphone',
    category: 'Business',
    path: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z',
  },
  {
    name: 'Diamond',
    category: 'Creative',
    path: 'M12 2L2 9l10 13 10-13L12 2zm0 3.2l5.7 4-5.7 7.4-5.7-7.4 5.7-4z',
  },
  {
    name: 'Shopping Bag',
    category: 'Business',
    path: 'M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z',
  },
  {
    name: 'Globe',
    category: 'Business',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z',
  },
  {
    name: 'Target',
    category: 'Action',
    path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  },
  {
    name: 'Camera',
    category: 'Creative',
    path: 'M12 12c1.65 0 3 1.35 3 3s-1.35 3-3 3-3-1.35-3-3 1.35-3 3-3m0-2c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm8-3h-3.17l-1.83-2H9L7.17 7H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z',
  },
  {
    name: 'Smile',
    category: 'Social',
    path: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z',
  },
];

/**
 * Returns an SVG path string for a given shape type scaled to width/height
 */
export function getShapeSvgPath(shapeType: ShapeType, w: number, h: number): string {
  switch (shapeType) {
    case 'circle': {
      const rx = w / 2;
      const ry = h / 2;
      return `M ${rx} 0 A ${rx} ${ry} 0 1 0 ${rx} ${h} A ${rx} ${ry} 0 1 0 ${rx} 0 Z`;
    }
    case 'triangle':
      return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`;
    case 'polygon': {
      // Hexagon
      const points = [
        [w * 0.5, 0],
        [w, h * 0.25],
        [w, h * 0.75],
        [w * 0.5, h],
        [0, h * 0.75],
        [0, h * 0.25],
      ];
      return `M ${points[0][0]} ${points[0][1]} ${points.slice(1).map((p) => `L ${p[0]} ${p[1]}`).join(' ')} Z`;
    }
    case 'diamond':
      return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`;
    case 'star': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 5;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.42;
      let path = '';
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      for (let i = 0; i < spikes; i++) {
        const x1 = cx + Math.cos(rot) * outerR;
        const y1 = cy + Math.sin(rot) * outerR;
        path += (i === 0 ? `M ${x1} ${y1}` : ` L ${x1} ${y1}`);
        rot += step;

        const x2 = cx + Math.cos(rot) * innerR;
        const y2 = cy + Math.sin(rot) * innerR;
        path += ` L ${x2} ${y2}`;
        rot += step;
      }
      return path + ' Z';
    }
    case 'heart': {
      return `M ${w * 0.5} ${h * 0.8}
        C ${w * 0.15} ${h * 0.5} 0 ${h * 0.3} 0 ${h * 0.18}
        C 0 0 ${w * 0.35} 0 ${w * 0.5} ${h * 0.22}
        C ${w * 0.65} 0 ${w} 0 ${w} ${h * 0.18}
        C ${w} ${h * 0.3} ${w * 0.85} ${h * 0.5} ${w * 0.5} ${h * 0.8} Z`;
    }
    case 'shield': {
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.55} C ${w} ${h * 0.85} ${w * 0.6} ${h} ${w * 0.5} ${h} C ${w * 0.4} ${h} 0 ${h * 0.85} 0 ${h * 0.55} Z`;
    }
    case 'badge': {
      const cx = w / 2;
      const cy = h / 2;
      const points = 12;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.84;
      let path = '';
      const step = Math.PI / points;
      let rot = 0;

      for (let i = 0; i < points; i++) {
        const x1 = cx + Math.cos(rot) * outerR;
        const y1 = cy + Math.sin(rot) * outerR;
        path += (i === 0 ? `M ${x1} ${y1}` : ` L ${x1} ${y1}`);
        rot += step;
        const x2 = cx + Math.cos(rot) * innerR;
        const y2 = cy + Math.sin(rot) * innerR;
        path += ` L ${x2} ${y2}`;
        rot += step;
      }
      return path + ' Z';
    }
    case 'arrow': {
      return `M 0 ${h * 0.35} L ${w * 0.6} ${h * 0.35} L ${w * 0.6} 0 L ${w} ${h * 0.5} L ${w * 0.6} ${h} L ${w * 0.6} ${h * 0.65} L 0 ${h * 0.65} Z`;
    }
    case 'speech': {
      return `M 0 0 L ${w} 0 L ${w} ${h * 0.75} L ${w * 0.4} ${h * 0.75} L ${w * 0.25} ${h} L ${w * 0.25} ${h * 0.75} L 0 ${h * 0.75} Z`;
    }
    case 'line': {
      return `M 0 ${h / 2} L ${w} ${h / 2}`;
    }
    case 'rounded-rect':
    case 'rect':
    default:
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
  }
}
