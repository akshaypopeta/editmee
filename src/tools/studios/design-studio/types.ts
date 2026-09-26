export type ElementType =
  | 'text'
  | 'shape'
  | 'image'
  | 'drawing'
  | 'qr'
  | 'icon'
  | 'frame'
  | 'group';

export type ShapeType =
  | 'rect'
  | 'rounded-rect'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'heart'
  | 'arrow'
  | 'speech'
  | 'shield'
  | 'badge'
  | 'diamond'
  | 'line';

export type FrameType =
  | 'circle'
  | 'rounded'
  | 'polaroid'
  | 'heart'
  | 'star'
  | 'badge';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export interface ImageFilters {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  vibrance: number; // -100 to 100
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100 (cool to warm)
  tint: number; // -100 to 100
  blur: number; // 0 to 50 px
  sepia: number; // 0 to 100 %
  hueRotate: number; // 0 to 360 deg
  invert: number; // 0 to 100 %
  preset?: string;
  presetIntensity?: number; // 0 to 100 %
}

export interface DrawingPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface DrawingPath {
  points: DrawingPoint[];
  color: string;
  width: number;
  tool: 'brush' | 'pencil' | 'highlighter' | 'eraser';
  opacity: number;
}

export interface DesignElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
  opacity: number; // 0 to 1
  visible: boolean;
  locked: boolean;
  zIndex: number;
  blendMode: BlendMode;
  shadow?: {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
  };
  groupId?: string;

  // Text properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textColor?: string;
  textGradient?: {
    enabled: boolean;
    start: string;
    end: string;
    angle: number;
  };
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing?: number; // em
  lineHeight?: number; // multiplier
  textOutline?: {
    color: string;
    width: number;
  };
  textBackground?: {
    enabled: boolean;
    color: string;
    padding: number;
    radius: number;
  };
  curvedText?: {
    enabled: boolean;
    radius: number;
    reverse: boolean;
  };

  // Shape properties
  shapeType?: ShapeType;
  fillColor?: string;
  fillGradient?: {
    enabled: boolean;
    type: 'linear' | 'radial';
    start: string;
    end: string;
    angle: number;
  };
  strokeColor?: string;
  strokeWidth?: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;

  // Image properties
  imageSrc?: string;
  intrinsicWidth?: number;
  intrinsicHeight?: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  flipH?: boolean;
  flipV?: boolean;
  filters?: ImageFilters;

  // Drawing properties
  drawingPaths?: DrawingPath[];

  // QR Code properties
  qrText?: string;
  qrColor?: string;
  qrBgColor?: string;

  // Icon properties
  iconName?: string;
  iconPath?: string;

  // Frame properties
  frameType?: FrameType;
}

export type UnitType = 'px' | 'in' | 'cm' | 'mm';

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface CanvasSettings {
  name: string;
  width: number;
  height: number;
  unit: UnitType;
  dpi: number;
  bgType: 'solid' | 'gradient' | 'transparent' | 'pattern';
  bgColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showSafeArea: boolean;
  safeAreaMargin: number; // percentage, e.g. 0.05 = 5%
  enableSnapping: boolean;
  bleed: number; // in pixels
}

export interface DocumentPreset {
  id: string;
  name: string;
  category: 'Social' | 'Print' | 'Digital' | 'Video' | 'Branding';
  width: number;
  height: number;
  unit: UnitType;
  dpi: number;
  description: string;
  aspectRatio: string;
}

export interface BrandKit {
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  neutralLight: string;
  neutralDark: string;
  headingFont: string;
  bodyFont: string;
}

export interface DesignAuditCheck {
  id: string;
  type: 'error' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  affectedElementIds?: string[];
}

export interface DesignAuditReport {
  overallScore: number;
  checks: DesignAuditCheck[];
  timestamp: number;
}

export interface HistoryState {
  elements: DesignElement[];
  canvasSettings: {
    width: number;
    height: number;
    bgType: CanvasSettings['bgType'];
    bgColor: string;
    gradientStart: string;
    gradientEnd: string;
    gradientAngle: number;
  };
}

export type ActiveSidebarTab =
  | 'templates'
  | 'shapes'
  | 'text'
  | 'images'
  | 'ai'
  | 'draw'
  | 'brand'
  | 'background'
  | 'filters'
  | 'qr'
  | 'mockups';
