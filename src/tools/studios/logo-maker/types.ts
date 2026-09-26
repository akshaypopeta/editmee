export type ElementType = 'text' | 'shape' | 'icon' | 'badge' | 'image' | 'group';

export type ShapeType =
  // Basic
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'ellipse'
  | 'square'
  | 'triangle'
  // Polygons
  | 'polygon'
  | 'diamond'
  | 'rhombus'
  | 'trapezoid'
  | 'parallelogram'
  | 'pentagon'
  | 'hexagon'
  | 'heptagon'
  | 'octagon'
  | 'decagon'
  // Stars & Bursts
  | 'star'
  | 'star-4'
  | 'star-6'
  | 'star-8'
  | 'star-10'
  | 'starburst'
  // Logo Shapes & Heraldry
  | 'heart'
  | 'shield'
  | 'gothic-shield'
  | 'crest'
  | 'seal'
  | 'badge'
  | 'circle-badge'
  | 'emblem'
  | 'ribbon'
  | 'banner'
  | 'rosette'
  // Abstract & Curves
  | 'ring'
  | 'arc'
  | 'semicircle'
  | 'capsule'
  | 'chevron'
  | 'wave'
  | 'swirl'
  | 'spiral'
  | 'blob'
  | 'infinity'
  | 'orbit'
  // Arrows & Lines
  | 'arrow'
  | 'double-arrow'
  | 'curved-arrow'
  | 'pointer'
  | 'line'
  | 'speech-bubble'
  // Decorative
  | 'burst'
  | 'sun'
  | 'flower'
  | 'gear'
  | 'hex-grid'
  | 'divider-diamond';

export type FillType = 'solid' | 'linear' | 'radial';

export type MaterialPreset =
  | 'chrome'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'copper'
  | 'platinum'
  | 'metallic'
  | 'glossy'
  | 'matte'
  | 'glass'
  | 'crystal'
  | 'plastic'
  | 'carbon'
  | 'steel'
  | 'neon'
  | 'holographic'
  | 'rubber'
  | 'ceramic'
  | 'wood'
  | 'stone'
  | 'liquid-metal';

export type LightingPreset =
  | 'soft-studio'
  | 'hard-studio'
  | 'top-light'
  | 'front-light'
  | 'side-light'
  | 'rim-light'
  | 'dramatic'
  | 'cinematic'
  | 'neon'
  | 'ambient'
  | 'glossy-product'
  | 'metallic';

export type BevelStyle = 'soft' | 'sharp' | 'rounded' | 'cut' | 'deep' | 'minimal';

export interface ThreeDOptions {
  enabled: boolean;
  depth: number; // 0 to 120
  perspective: number; // 0 to 1
  rotX: number; // -80 to 80 deg (pitch)
  rotY: number; // -80 to 80 deg (yaw)
  rotZ: number; // -180 to 180 deg (roll)
  lightAngle: number; // 0 to 360 deg
  lightElevation: number; // 10 to 90 deg
  lightIntensity: number; // 0 to 2
  ambientLight: number; // 0 to 1
  specular: number; // 0 to 1
  material: MaterialPreset;
  roughness: number; // 0 to 1
  reflectivity: number; // 0 to 1
  bevelSize: number; // 0 to 16
  bevelStyle: BevelStyle;
  shadowType: 'drop' | 'extrusion' | 'long' | 'directional' | 'soft' | 'none';
  shadowAngle: number; // 0 to 360
  shadowDistance: number; // 0 to 100
  shadowBlur: number; // 0 to 50
  shadowOpacity: number; // 0 to 1
  shadowColor: string;
  lightingPreset?: LightingPreset;
  customGradientStops?: { offset: number; color: string }[];
}

export interface GradientDef {
  type: 'linear' | 'radial';
  startColor: string;
  endColor: string;
  angle: number; // in degrees
}

export interface ShadowDef {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface StrokeDef {
  color: string;
  width: number;
  dash?: number[];
}

export interface LogoElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees 0-360
  opacity: number; // 0-1
  locked: boolean;
  visible: boolean;
  groupId?: string;
  blendMode?: GlobalCompositeOperation;
  zIndex?: number;
  aspectRatioLocked?: boolean;
  
  // Fill & Style
  fillType?: FillType;
  fillColor?: string;
  gradient?: GradientDef;
  stroke?: StrokeDef;
  shadow?: ShadowDef;

  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  uppercase?: boolean;
  letterSpacing?: number;
  lineHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  isCurved?: boolean;
  curveRadius?: number; // e.g. 150
  curveArc?: number; // degrees, e.g. 180
  curveDirection?: 'convex' | 'concave';

  // Shape specific
  shapeType?: ShapeType;
  borderRadius?: number;
  points?: number; // for star/polygon
  innerRadiusRatio?: number; // for star/ring (0.1 - 0.9)

  // Badge specific
  badgeType?: string;
  innerShape?: string;

  // Icon specific
  iconName?: string;
  iconCategory?: string;
  svgPath?: string;
  viewBox?: string;

  // Image specific
  src?: string;
  originalWidth?: number;
  originalHeight?: number;

  // 3D Specific
  threeD?: ThreeDOptions;

  // Group specific
  childrenIds?: string[];
}

export interface CanvasDimensions {
  width: number;
  height: number;
  unit?: 'px' | 'in' | 'cm' | 'mm';
}

export interface CanvasPreset {
  id: string;
  name: string;
  category: 'Social Media' | 'Business' | 'Branding' | 'Custom';
  width: number;
  height: number;
  ratio: string;
  description?: string;
}

export interface BrandKit {
  brandName: string;
  tagline: string;
  description?: string;
  industry?: string;
  personality?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  textColor?: string;
  fontHeading: string;
  fontBody: string;
  fontLogo?: string;
  supportingFont?: string;
  customPalette?: string[];
}

export interface HistorySnapshot {
  elements: LogoElement[];
  canvasSize: CanvasDimensions;
  bgType: 'transparent' | 'solid' | 'gradient';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
}

export interface AlignmentGuide {
  type: 'x' | 'y';
  position: number;
  label?: string;
}

export interface DesignHealthCheck {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  actionLabel?: string;
  actionType?: string;
}

export interface BrandAuditReport {
  overallScore: number;
  compositionScore: number;
  typographyScore: number;
  colorScore: number;
  simplicityScore: number;
  scalabilityScore: number;
  versatilityScore: number;
  brandConsistencyScore: number;
  strengths: string[];
  warnings: string[];
  recommendations: {
    id: string;
    category: string;
    title: string;
    detail: string;
    actionType?: string;
  }[];
}

export type LogoVariationType =
  | 'original'
  | 'full-color'
  | 'monochrome-black'
  | 'monochrome-white'
  | 'icon-only'
  | 'horizontal-lockup'
  | 'vertical-lockup'
  | 'inverted'
  | '3d-variant';
