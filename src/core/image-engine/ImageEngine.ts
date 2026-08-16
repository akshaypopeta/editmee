import { FileEngine } from '../file-engine/FileEngine';

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  temperature: number; // -100 to 100 (warm / cool)
  tint: number; // -100 to 100 (green / magenta)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  vibrance: number; // -100 to 100
  hueRotate: number; // 0 to 360
  blur: number; // 0 to 40
  sharpen: number; // 0 to 10
  noise: number; // 0 to 100
  vignette: number; // 0 to 100
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  solarize?: boolean;
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  vibrance: 0,
  hueRotate: 0,
  blur: 0,
  sharpen: 0,
  noise: 0,
  vignette: 0,
  grayscale: false,
  sepia: false,
  invert: false,
  solarize: false,
};

export type FilterPreset =
  | 'none'
  | 'vintage'
  | 'cyberpunk'
  | 'noir'
  | 'warm_sun'
  | 'cool_slate'
  | 'emerald'
  | 'vivid_hdr'
  | 'moody_teal'
  | 'dramatic'
  | 'faded'
  | 'sunset';

export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  font?: string;
  fontSize?: number;
  color?: string;
  opacity?: number;
  rotation?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'center-left'
    | 'center'
    | 'center-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'tile'
    | 'custom';
  customX?: number;
  customY?: number;
  imageSource?: HTMLImageElement | File | Blob;
  imageWidth?: number;
  imageHeight?: number;
}

export interface AnnotationItem {
  id: string;
  type: 'arrow' | 'rect' | 'circle' | 'text' | 'brush' | 'step_badge' | 'blur_redaction' | 'pixelate_redaction';
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  opacity?: number;
  text?: string;
  fontSize?: number;
  stepNumber?: number;
  points?: { x: number; y: number }[];
  mosaicSize?: number;
}

export interface ResizePreset {
  name: string;
  category: string;
  width: number;
  height: number;
  aspect: string;
}

export const POPULAR_RESIZE_PRESETS: ResizePreset[] = [
  // Social Media
  { name: 'Instagram Square', category: 'Social', width: 1080, height: 1080, aspect: '1:1' },
  { name: 'Instagram Portrait', category: 'Social', width: 1080, height: 1350, aspect: '4:5' },
  { name: 'Instagram Story / Reel', category: 'Social', width: 1080, height: 1920, aspect: '9:16' },
  { name: 'YouTube Thumbnail', category: 'Social', width: 1280, height: 720, aspect: '16:9' },
  { name: 'Twitter / X Post', category: 'Social', width: 1200, height: 675, aspect: '16:9' },
  { name: 'Twitter / X Header', category: 'Social', width: 1500, height: 500, aspect: '3:1' },
  { name: 'LinkedIn Banner', category: 'Social', width: 1584, height: 396, aspect: '4:1' },
  { name: 'Facebook Post', category: 'Social', width: 1200, height: 630, aspect: '1.91:1' },
  // Display & Video
  { name: '4K Ultra HD', category: 'Display', width: 3840, height: 2160, aspect: '16:9' },
  { name: 'Full HD 1080p', category: 'Display', width: 1920, height: 1080, aspect: '16:9' },
  { name: 'HD 720p', category: 'Display', width: 1280, height: 720, aspect: '16:9' },
  { name: 'Standard SVGA', category: 'Display', width: 800, height: 600, aspect: '4:3' },
  // Icons & Avatars
  { name: 'App Icon / Favicon 512', category: 'Icons', width: 512, height: 512, aspect: '1:1' },
  { name: 'App Icon 256', category: 'Icons', width: 256, height: 256, aspect: '1:1' },
  { name: 'Favicon 64', category: 'Icons', width: 64, height: 64, aspect: '1:1' },
  { name: 'Favicon 32', category: 'Icons', width: 32, height: 32, aspect: '1:1' },
];

export class ImageEngine {
  /**
   * Main image processing pipeline
   */
  public static async processImage(
    source: HTMLImageElement | File | Blob | string,
    options: {
      width?: number;
      height?: number;
      crop?: { x: number; y: number; width: number; height: number };
      rotation?: number; // degrees (e.g. 0, 90, 180, 270)
      flipH?: boolean;
      flipV?: boolean;
      adjustments?: Partial<ImageAdjustments>;
      presetFilter?: FilterPreset;
      watermark?: WatermarkOptions;
      annotations?: AnnotationItem[];
      backgroundColor?: string;
    } = {}
  ): Promise<HTMLCanvasElement> {
    const img = source instanceof HTMLImageElement ? source : await FileEngine.loadImage(source);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not obtain canvas 2D context');

    // Crop box source coordinates
    const srcX = options.crop ? options.crop.x : 0;
    const srcY = options.crop ? options.crop.y : 0;
    const srcW = options.crop ? options.crop.width : img.naturalWidth;
    const srcH = options.crop ? options.crop.height : img.naturalHeight;

    const targetW = Math.max(1, Math.round(options.width || srcW));
    const targetH = Math.max(1, Math.round(options.height || srcH));

    const rot = ((options.rotation || 0) % 360 + 360) % 360;
    const isRotated90or270 = rot === 90 || rot === 270;

    canvas.width = isRotated90or270 ? targetH : targetW;
    canvas.height = isRotated90or270 ? targetW : targetH;

    // Optional background fill
    if (options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // High quality scaling settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    // Translate and rotate around canvas center
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rot !== 0) ctx.rotate((rot * Math.PI) / 180);
    if (options.flipH) ctx.scale(-1, 1);
    if (options.flipV) ctx.scale(1, -1);

    // Multi-step high-quality downsampling if target is significantly smaller than source (> 2x)
    if (targetW < srcW / 2 && targetH < srcH / 2) {
      const steppedCanvas = this.renderSteppedDownscale(img, srcX, srcY, srcW, srcH, targetW, targetH);
      ctx.drawImage(steppedCanvas, -targetW / 2, -targetH / 2, targetW, targetH);
    } else {
      ctx.drawImage(img, srcX, srcY, srcW, srcH, -targetW / 2, -targetH / 2, targetW, targetH);
    }
    ctx.restore();

    // Apply color grading and pixel filters
    const adj = { ...DEFAULT_ADJUSTMENTS, ...options.adjustments };
    if (options.presetFilter && options.presetFilter !== 'none') {
      this.applyPresetFilterValues(adj, options.presetFilter);
    }

    this.applyPixelFilters(ctx, canvas.width, canvas.height, adj);

    // Apply Annotations if any
    if (options.annotations && options.annotations.length > 0) {
      this.renderAnnotations(ctx, options.annotations, canvas.width, canvas.height);
    }

    // Apply Watermark if any
    if (options.watermark) {
      await this.renderWatermark(ctx, options.watermark, canvas.width, canvas.height);
    }

    return canvas;
  }

  /**
   * Stepped canvas downscaling to avoid aliasing artifacts on large images
   */
  private static renderSteppedDownscale(
    img: HTMLImageElement,
    srcX: number,
    srcY: number,
    srcW: number,
    srcH: number,
    targetW: number,
    targetH: number
  ): HTMLCanvasElement {
    let curCanvas = document.createElement('canvas');
    let curCtx = curCanvas.getContext('2d')!;
    curCanvas.width = srcW;
    curCanvas.height = srcH;
    curCtx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

    let curW = srcW;
    let curH = srcH;

    while (curW / 2 > targetW && curH / 2 > targetH) {
      const nextCanvas = document.createElement('canvas');
      const nextCtx = nextCanvas.getContext('2d')!;
      nextCanvas.width = Math.floor(curW / 2);
      nextCanvas.height = Math.floor(curH / 2);
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(curCanvas, 0, 0, nextCanvas.width, nextCanvas.height);
      curCanvas = nextCanvas;
      curW = nextCanvas.width;
      curH = nextCanvas.height;
    }

    return curCanvas;
  }

  /**
   * Apply preset color styles to adjustments object
   */
  private static applyPresetFilterValues(adj: ImageAdjustments, preset: FilterPreset) {
    switch (preset) {
      case 'vintage':
        adj.sepia = true;
        adj.contrast += 15;
        adj.brightness += 5;
        adj.temperature += 25;
        adj.vignette = Math.max(adj.vignette, 30);
        break;
      case 'cyberpunk':
        adj.contrast += 35;
        adj.saturation += 40;
        adj.tint += 30;
        adj.highlights += 20;
        adj.shadows -= 15;
        break;
      case 'noir':
        adj.grayscale = true;
        adj.contrast += 45;
        adj.brightness -= 10;
        adj.vignette = Math.max(adj.vignette, 40);
        break;
      case 'warm_sun':
        adj.temperature += 40;
        adj.saturation += 15;
        adj.exposure += 10;
        break;
      case 'cool_slate':
        adj.temperature -= 35;
        adj.saturation -= 15;
        adj.contrast += 15;
        break;
      case 'emerald':
        adj.tint -= 35;
        adj.saturation += 20;
        adj.contrast += 20;
        break;
      case 'vivid_hdr':
        adj.contrast += 30;
        adj.saturation += 35;
        adj.vibrance += 40;
        adj.highlights -= 20;
        adj.shadows += 30;
        adj.sharpen = Math.max(adj.sharpen, 2);
        break;
      case 'moody_teal':
        adj.temperature -= 20;
        adj.tint -= 15;
        adj.contrast += 25;
        adj.shadows -= 20;
        break;
      case 'dramatic':
        adj.contrast += 50;
        adj.exposure -= 10;
        adj.vignette = Math.max(adj.vignette, 45);
        adj.sharpen = Math.max(adj.sharpen, 2);
        break;
      case 'faded':
        adj.contrast -= 20;
        adj.shadows += 35;
        adj.saturation -= 15;
        break;
      case 'sunset':
        adj.temperature += 45;
        adj.tint += 15;
        adj.saturation += 25;
        adj.vignette = Math.max(adj.vignette, 20);
        break;
    }
  }

  /**
   * Fast, comprehensive pixel filter application on ImageData
   */
  private static applyPixelFilters(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    adj: ImageAdjustments
  ) {
    const hasAdjustment =
      adj.brightness !== 0 ||
      adj.contrast !== 0 ||
      adj.saturation !== 0 ||
      adj.exposure !== 0 ||
      adj.temperature !== 0 ||
      adj.tint !== 0 ||
      adj.highlights !== 0 ||
      adj.shadows !== 0 ||
      adj.vibrance !== 0 ||
      adj.hueRotate !== 0 ||
      adj.noise > 0 ||
      adj.vignette > 0 ||
      adj.grayscale ||
      adj.sepia ||
      adj.invert ||
      adj.solarize ||
      adj.sharpen > 0 ||
      adj.blur > 0;

    if (!hasAdjustment) return;

    // Convolution sharpen first if requested
    if (adj.sharpen > 0) {
      this.applyConvolutionSharpen(ctx, width, height, adj.sharpen);
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Pre-calculate adjustment lookup factors
    const bFactor = adj.brightness * 2.55; // -255 to 255
    const cFactor = (259 * (adj.contrast + 255)) / (255 * (259 - adj.contrast)); // Contrast factor
    const expFactor = Math.pow(2, adj.exposure / 50);

    const tempR = adj.temperature > 0 ? (adj.temperature * 0.8) : 0;
    const tempB = adj.temperature < 0 ? (Math.abs(adj.temperature) * 0.8) : 0;
    const tintG = adj.tint < 0 ? (Math.abs(adj.tint) * 0.6) : 0;
    const tintM = adj.tint > 0 ? (adj.tint * 0.6) : 0;

    const satFactor = 1 + adj.saturation / 100;
    const vibFactor = 1 + adj.vibrance / 100;
    const hlFactor = adj.highlights / 100;
    const shFactor = adj.shadows / 100;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Exposure & Brightness
      r = r * expFactor + bFactor;
      g = g * expFactor + bFactor;
      b = b * expFactor + bFactor;

      // Contrast
      r = cFactor * (r - 128) + 128;
      g = cFactor * (g - 128) + 128;
      b = cFactor * (b - 128) + 128;

      // White Balance: Temperature & Tint
      r = r + tempR + tintM;
      g = g + tintG;
      b = b + tempB + (tintM * 0.5);

      // Highlights & Shadows
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (hlFactor !== 0 && lum > 128) {
        const hAmt = ((lum - 128) / 127) * hlFactor * 40;
        r += hAmt;
        g += hAmt;
        b += hAmt;
      }
      if (shFactor !== 0 && lum < 128) {
        const sAmt = ((128 - lum) / 128) * shFactor * 40;
        r += sAmt;
        g += sAmt;
        b += sAmt;
      }

      // Saturation & Vibrance
      if (satFactor !== 1 || vibFactor !== 1) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const maxVal = Math.max(r, Math.max(g, b));
        const minVal = Math.min(r, Math.min(g, b));
        const currentSat = maxVal > 0 ? (maxVal - minVal) / maxVal : 0;
        const effectiveVib = 1 + (vibFactor - 1) * (1 - currentSat);

        r = gray + (r - gray) * satFactor * effectiveVib;
        g = gray + (g - gray) * satFactor * effectiveVib;
        b = gray + (b - gray) * satFactor * effectiveVib;
      }

      // Grayscale
      if (adj.grayscale) {
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;
        r = avg;
        g = avg;
        b = avg;
      }

      // Sepia
      if (adj.sepia) {
        const tr = 0.393 * r + 0.769 * g + 0.189 * b;
        const tg = 0.349 * r + 0.686 * g + 0.168 * b;
        const tb = 0.272 * r + 0.534 * g + 0.131 * b;
        r = tr;
        g = tg;
        b = tb;
      }

      // Invert
      if (adj.invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }

      // Solarize
      if (adj.solarize) {
        r = r < 128 ? 255 - r : r;
        g = g < 128 ? 255 - g : g;
        b = b < 128 ? 255 - b : b;
      }

      // Film Grain / Noise
      if (adj.noise > 0) {
        const noiseAmt = (Math.random() - 0.5) * (adj.noise * 1.5);
        r += noiseAmt;
        g += noiseAmt;
        b += noiseAmt;
      }

      // Vignette effect
      if (adj.vignette > 0) {
        const pixelIdx = i / 4;
        const px = pixelIdx % width;
        const py = Math.floor(pixelIdx / width);
        const dist = Math.sqrt((px - centerX) * (px - centerX) + (py - centerY) * (py - centerY));
        const vigFactor = Math.max(0, 1 - (dist / maxDist) * (adj.vignette / 100) * 1.2);
        r *= vigFactor;
        g *= vigFactor;
        b *= vigFactor;
      }

      data[i] = Math.min(255, Math.max(0, Math.round(r)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
    }

    ctx.putImageData(imgData, 0, 0);

    // Box blur if requested
    if (adj.blur > 0) {
      this.applyCanvasBlur(ctx, width, height, adj.blur);
    }
  }

  /**
   * 3x3 Convolution Sharpen Kernel
   */
  private static applyConvolutionSharpen(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    strength: number
  ) {
    const src = ctx.getImageData(0, 0, width, height);
    const output = ctx.createImageData(width, height);
    const srcData = src.data;
    const dstData = output.data;

    // Convolution weight
    const amount = strength * 0.5;
    const center = 1 + 4 * amount;
    const edge = -amount;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          const top = ((y - 1) * width + x) * 4 + c;
          const bottom = ((y + 1) * width + x) * 4 + c;
          const left = (y * width + (x - 1)) * 4 + c;
          const right = (y * width + (x + 1)) * 4 + c;
          const curr = idx + c;

          const val =
            srcData[curr] * center +
            srcData[top] * edge +
            srcData[bottom] * edge +
            srcData[left] * edge +
            srcData[right] * edge;

          dstData[curr] = Math.min(255, Math.max(0, val));
        }
        dstData[idx + 3] = srcData[idx + 3];
      }
    }

    ctx.putImageData(output, 0, 0);
  }

  /**
   * Fast canvas blur
   */
  private static applyCanvasBlur(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    radius: number
  ) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.filter = `blur(${Math.min(20, radius)}px)`;
    tempCtx.drawImage(ctx.canvas, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  /**
   * Smart client-side background removal algorithm
   */
  public static async removeBackground(
    source: HTMLImageElement | File | Blob | string,
    options: {
      tolerance?: number;
      edgeFeather?: boolean;
      contiguous?: boolean;
      replaceColor?: string; // 'transparent', '#ffffff', etc.
      replaceGradient?: { from: string; to: string; direction?: 'vertical' | 'horizontal' | 'diagonal' };
    } = {}
  ): Promise<HTMLCanvasElement> {
    const img = source instanceof HTMLImageElement ? source : await FileEngine.loadImage(source);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas context not available');

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Sample border pixels (corners + edge centers) to compute dominant background color
    const w = canvas.width;
    const h = canvas.height;
    const sampleIndices = [
      0, // top-left
      (w - 1) * 4, // top-right
      ((h - 1) * w) * 4, // bottom-left
      (w * h - 1) * 4, // bottom-right
      Math.floor(w / 2) * 4, // top-middle
      ((h - 1) * w + Math.floor(w / 2)) * 4, // bottom-middle
      (Math.floor(h / 2) * w) * 4, // left-middle
      (Math.floor(h / 2) * w + (w - 1)) * 4, // right-middle
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    for (const c of sampleIndices) {
      bgR += data[c];
      bgG += data[c + 1];
      bgB += data[c + 2];
    }
    bgR /= sampleIndices.length;
    bgG /= sampleIndices.length;
    bgB /= sampleIndices.length;

    const tolerance = options.tolerance !== undefined ? options.tolerance : 38;
    const featherRange = options.edgeFeather ? 16 : 1;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const diff = Math.sqrt(
        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
      );

      if (diff < tolerance) {
        data[i + 3] = 0;
      } else if (diff < tolerance + featherRange && options.edgeFeather) {
        data[i + 3] = Math.round(((diff - tolerance) / featherRange) * 255);
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // If replacement background color or gradient requested
    if (options.replaceColor && options.replaceColor !== 'transparent') {
      const outCanvas = document.createElement('canvas');
      outCanvas.width = canvas.width;
      outCanvas.height = canvas.height;
      const outCtx = outCanvas.getContext('2d')!;

      outCtx.fillStyle = options.replaceColor;
      outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      outCtx.drawImage(canvas, 0, 0);
      return outCanvas;
    }

    if (options.replaceGradient) {
      const outCanvas = document.createElement('canvas');
      outCanvas.width = canvas.width;
      outCanvas.height = canvas.height;
      const outCtx = outCanvas.getContext('2d')!;

      const grad = options.replaceGradient.direction === 'horizontal'
        ? outCtx.createLinearGradient(0, 0, outCanvas.width, 0)
        : outCtx.createLinearGradient(0, 0, 0, outCanvas.height);

      grad.addColorStop(0, options.replaceGradient.from);
      grad.addColorStop(1, options.replaceGradient.to);

      outCtx.fillStyle = grad;
      outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      outCtx.drawImage(canvas, 0, 0);
      return outCanvas;
    }

    return canvas;
  }

  /**
   * Auto Enhance Image: Automatic histogram stretch, white balance, tone leveling, and sharpness
   */
  public static async autoEnhance(
    source: HTMLImageElement | File | Blob | string,
    options: {
      strength?: number; // 0..100
      boostVibrance?: boolean;
      denoise?: boolean;
    } = {}
  ): Promise<HTMLCanvasElement> {
    const img = source instanceof HTMLImageElement ? source : await FileEngine.loadImage(source);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas 2D context error');

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // 1. Calculate histograms for R, G, B
    const histR = new Uint32Array(256);
    const histG = new Uint32Array(256);
    const histB = new Uint32Array(256);
    const totalPixels = canvas.width * canvas.height;

    for (let i = 0; i < data.length; i += 4) {
      histR[data[i]]++;
      histG[data[i + 1]]++;
      histB[data[i + 2]]++;
    }

    // 2. Find 1% and 99% clip percentiles for optimal contrast stretching
    const clipLow = totalPixels * 0.01;
    const clipHigh = totalPixels * 0.99;

    const findCutoffs = (hist: Uint32Array) => {
      let acc = 0;
      let min = 0;
      let max = 255;
      for (let i = 0; i < 256; i++) {
        acc += hist[i];
        if (acc >= clipLow) {
          min = i;
          break;
        }
      }
      acc = 0;
      for (let i = 255; i >= 0; i--) {
        acc += hist[i];
        if (acc >= clipLow) {
          max = i;
          break;
        }
      }
      return { min, max: Math.max(min + 1, max) };
    };

    const cutR = findCutoffs(histR);
    const cutG = findCutoffs(histG);
    const cutB = findCutoffs(histB);

    const strength = (options.strength ?? 85) / 100;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // Auto-stretch per channel
      const targetR = ((r - cutR.min) / (cutR.max - cutR.min)) * 255;
      const targetG = ((g - cutG.min) / (cutG.max - cutG.min)) * 255;
      const targetB = ((b - cutB.min) / (cutB.max - cutB.min)) * 255;

      r = r + (targetR - r) * strength;
      g = g + (targetG - g) * strength;
      b = b + (targetB - b) * strength;

      // Vibrance boost for dull regions
      if (options.boostVibrance !== false) {
        const maxVal = Math.max(r, Math.max(g, b));
        const minVal = Math.min(r, Math.min(g, b));
        const currentSat = maxVal > 0 ? (maxVal - minVal) / maxVal : 0;
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;
        const boost = 1 + 0.3 * (1 - currentSat) * strength;
        r = avg + (r - avg) * boost;
        g = avg + (g - avg) * boost;
        b = avg + (b - avg) * boost;
      }

      data[i] = Math.min(255, Math.max(0, Math.round(r)));
      data[i + 1] = Math.min(255, Math.max(0, Math.round(g)));
      data[i + 2] = Math.min(255, Math.max(0, Math.round(b)));
    }

    ctx.putImageData(imgData, 0, 0);

    // Apply micro-sharpening for crisp clarity
    this.applyConvolutionSharpen(ctx, canvas.width, canvas.height, 1.2 * strength);

    return canvas;
  }

  /**
   * Super-Resolution / Edge-Preserving Upscaler (2x, 4x, 8x)
   */
  public static async upscaleImage(
    source: HTMLImageElement | File | Blob | string,
    scaleFactor: 2 | 4 | 8 = 2,
    sharpenStrength = 1.5
  ): Promise<HTMLCanvasElement> {
    const img = source instanceof HTMLImageElement ? source : await FileEngine.loadImage(source);

    const targetW = img.naturalWidth * scaleFactor;
    const targetH = img.naturalHeight * scaleFactor;

    // Multi-pass bicubic upsampling
    let currentCanvas = document.createElement('canvas');
    currentCanvas.width = img.naturalWidth;
    currentCanvas.height = img.naturalHeight;
    let currentCtx = currentCanvas.getContext('2d')!;
    currentCtx.drawImage(img, 0, 0);

    let curW = img.naturalWidth;
    let curH = img.naturalHeight;

    // Double resolution iteratively for high-frequency preservation
    while (curW < targetW) {
      const nextW = Math.min(targetW, curW * 2);
      const nextH = Math.min(targetH, curH * 2);

      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = nextW;
      nextCanvas.height = nextH;
      const nextCtx = nextCanvas.getContext('2d')!;

      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);

      // Apply unsharp mask filter between passes
      this.applyConvolutionSharpen(nextCtx, nextW, nextH, sharpenStrength * 0.7);

      currentCanvas = nextCanvas;
      currentCtx = nextCtx;
      curW = nextW;
      curH = nextH;
    }

    return currentCanvas;
  }

  /**
   * Render Annotations on Canvas
   */
  public static renderAnnotations(
    ctx: CanvasRenderingContext2D,
    annotations: AnnotationItem[],
    width: number,
    height: number
  ) {
    annotations.forEach((ann) => {
      ctx.save();
      ctx.strokeStyle = ann.color || '#ef4444';
      ctx.fillStyle = ann.fill || ann.color || '#ef4444';
      ctx.lineWidth = ann.strokeWidth || 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (ann.type === 'arrow' && ann.endX !== undefined && ann.endY !== undefined) {
        const fromX = ann.x;
        const fromY = ann.y;
        const toX = ann.endX;
        const toY = ann.endY;
        const headLength = 16;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (ann.type === 'rect' && ann.width && ann.height) {
        if (ann.fill && ann.fill !== 'transparent') {
          ctx.fillStyle = ann.fill;
          ctx.fillRect(ann.x, ann.y, ann.width, ann.height);
        }
        ctx.strokeRect(ann.x, ann.y, ann.width, ann.height);
      } else if (ann.type === 'circle' && ann.width && ann.height) {
        ctx.beginPath();
        ctx.ellipse(
          ann.x + ann.width / 2,
          ann.y + ann.height / 2,
          Math.abs(ann.width) / 2,
          Math.abs(ann.height) / 2,
          0,
          0,
          2 * Math.PI
        );
        if (ann.fill && ann.fill !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (ann.type === 'text' && ann.text) {
        const fontSize = ann.fontSize || 24;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        ctx.fillStyle = ann.color || '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 4;
        ctx.fillText(ann.text, ann.x, ann.y);
      } else if (ann.type === 'step_badge') {
        const radius = 16;
        ctx.beginPath();
        ctx.arc(ann.x, ann.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = ann.color || '#2563eb';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(ann.stepNumber || 1), ann.x, ann.y);
      } else if (ann.type === 'brush' && ann.points && ann.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(ann.points[0].x, ann.points[0].y);
        for (let p = 1; p < ann.points.length; p++) {
          ctx.lineTo(ann.points[p].x, ann.points[p].y);
        }
        ctx.stroke();
      } else if (ann.type === 'pixelate_redaction' && ann.width && ann.height) {
        const blockSize = ann.mosaicSize || 12;
        const x = Math.max(0, Math.min(ann.x, width));
        const y = Math.max(0, Math.min(ann.y, height));
        const rw = Math.min(ann.width, width - x);
        const rh = Math.min(ann.height, height - y);

        if (rw > 0 && rh > 0) {
          const imgData = ctx.getImageData(x, y, rw, rh);
          const d = imgData.data;

          for (let by = 0; by < rh; by += blockSize) {
            for (let bx = 0; bx < rw; bx += blockSize) {
              const pIdx = (by * rw + bx) * 4;
              const r = d[pIdx];
              const g = d[pIdx + 1];
              const b = d[pIdx + 2];

              for (let dy = 0; dy < blockSize && by + dy < rh; dy++) {
                for (let dx = 0; dx < blockSize && bx + dx < rw; dx++) {
                  const targetIdx = ((by + dy) * rw + (bx + dx)) * 4;
                  d[targetIdx] = r;
                  d[targetIdx + 1] = g;
                  d[targetIdx + 2] = b;
                }
              }
            }
          }
          ctx.putImageData(imgData, x, y);
        }
      } else if (ann.type === 'blur_redaction' && ann.width && ann.height) {
        const x = Math.max(0, Math.min(ann.x, width));
        const y = Math.max(0, Math.min(ann.y, height));
        const rw = Math.min(ann.width, width - x);
        const rh = Math.min(ann.height, height - y);

        if (rw > 0 && rh > 0) {
          const tempC = document.createElement('canvas');
          tempC.width = rw;
          tempC.height = rh;
          const tCtx = tempC.getContext('2d')!;
          tCtx.filter = 'blur(10px)';
          tCtx.drawImage(ctx.canvas, x, y, rw, rh, 0, 0, rw, rh);
          ctx.drawImage(tempC, x, y);
        }
      }

      ctx.restore();
    });
  }

  /**
   * Render Watermark (Text or Image, Single placement or Full-Canvas Repeating Tile)
   */
  public static async renderWatermark(
    ctx: CanvasRenderingContext2D,
    opt: WatermarkOptions,
    width: number,
    height: number
  ) {
    ctx.save();
    const opacity = opt.opacity ?? 0.35;
    ctx.globalAlpha = opacity;

    if (opt.type === 'text' && opt.text) {
      const text = opt.text;
      const fontSize = opt.fontSize || Math.max(16, Math.floor(width / 30));
      const font = opt.font || `bold ${fontSize}px Inter, sans-serif`;
      const color = opt.color || '#ffffff';
      const rotation = opt.rotation !== undefined ? opt.rotation : -30;

      ctx.font = font;
      ctx.fillStyle = color;

      if (opt.position === 'tile') {
        // Tile repeat diagonally across whole canvas
        const stepX = fontSize * 10;
        const stepY = fontSize * 6;

        ctx.rotate((rotation * Math.PI) / 180);
        const diag = Math.sqrt(width * width + height * height);

        for (let y = -diag; y < diag * 1.5; y += stepY) {
          for (let x = -diag; x < diag * 1.5; x += stepX) {
            ctx.fillText(text, x, y);
          }
        }
      } else {
        // Single placement based on position
        let x = width - 20;
        let y = height - 20;
        let align: CanvasTextAlign = 'right';

        if (opt.position === 'top-left') {
          x = 30;
          y = 40;
          align = 'left';
        } else if (opt.position === 'top-center') {
          x = width / 2;
          y = 40;
          align = 'center';
        } else if (opt.position === 'top-right') {
          x = width - 30;
          y = 40;
          align = 'right';
        } else if (opt.position === 'center') {
          x = width / 2;
          y = height / 2;
          align = 'center';
        } else if (opt.position === 'bottom-left') {
          x = 30;
          y = height - 30;
          align = 'left';
        } else if (opt.position === 'bottom-center') {
          x = width / 2;
          y = height - 30;
          align = 'center';
        } else if (opt.position === 'custom' && opt.customX !== undefined && opt.customY !== undefined) {
          x = opt.customX;
          y = opt.customY;
          align = 'left';
        }

        ctx.textAlign = align;
        if (rotation !== 0) {
          ctx.translate(x, y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(text, 0, 0);
        } else {
          ctx.fillText(text, x, y);
        }
      }
    } else if (opt.type === 'image' && opt.imageSource) {
      const wmImg =
        opt.imageSource instanceof HTMLImageElement
          ? opt.imageSource
          : await FileEngine.loadImage(opt.imageSource);

      const wmWidth = opt.imageWidth || Math.round(width * 0.2);
      const wmHeight = opt.imageHeight || Math.round((wmImg.naturalHeight / wmImg.naturalWidth) * wmWidth);

      let x = width - wmWidth - 20;
      let y = height - wmHeight - 20;

      if (opt.position === 'top-left') {
        x = 20;
        y = 20;
      } else if (opt.position === 'center') {
        x = (width - wmWidth) / 2;
        y = (height - wmHeight) / 2;
      } else if (opt.position === 'top-right') {
        x = width - wmWidth - 20;
        y = 20;
      } else if (opt.position === 'bottom-left') {
        x = 20;
        y = height - wmHeight - 20;
      }

      ctx.drawImage(wmImg, x, y, wmWidth, wmHeight);
    }

    ctx.restore();
  }

  /**
   * Compresses image to target format and quality
   */
  public static async compressImage(
    source: HTMLImageElement | File | Blob | string,
    quality = 0.8,
    format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
    targetDimensions?: { width?: number; height?: number }
  ): Promise<{ blob: Blob; originalSize: number; newSize: number; savingsPercent: number; width: number; height: number }> {
    const originalSize = source instanceof Blob ? source.size : 0;
    const img = source instanceof HTMLImageElement ? source : await FileEngine.loadImage(source);

    const canvas = document.createElement('canvas');
    canvas.width = targetDimensions?.width || img.naturalWidth;
    canvas.height = targetDimensions?.height || img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context error');

    if (format === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), format, quality);
    });

    const newSize = blob.size;
    const savingsPercent =
      originalSize > 0 ? Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100)) : 0;

    return { blob, originalSize, newSize, savingsPercent, width: canvas.width, height: canvas.height };
  }

  /**
   * Binary search compression to meet a specific target file size in KB
   */
  public static async compressToTargetSize(
    source: HTMLImageElement | File | Blob | string,
    targetKb: number,
    format: 'image/jpeg' | 'image/webp' = 'image/jpeg'
  ): Promise<{ blob: Blob; finalQuality: number; finalSizeKb: number }> {
    const targetBytes = targetKb * 1024;
    let minQ = 0.05;
    let maxQ = 0.98;
    let bestBlob: Blob | null = null;
    let bestQ = 0.8;

    for (let iter = 0; iter < 6; iter++) {
      const midQ = (minQ + maxQ) / 2;
      const res = await this.compressImage(source, midQ, format);
      bestBlob = res.blob;
      bestQ = midQ;

      if (res.blob.size > targetBytes) {
        maxQ = midQ;
      } else {
        minQ = midQ;
      }
    }

    const finalSizeKb = Math.round((bestBlob ? bestBlob.size : 0) / 1024);
    return { blob: bestBlob || new Blob(), finalQuality: Math.round(bestQ * 100), finalSizeKb };
  }

  /**
   * Multi-format converter: PNG, JPEG, WebP, BMP, ICO
   */
  public static async convertFormat(
    source: HTMLImageElement | File | Blob | string,
    targetFormat: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp' | 'image/x-icon',
    quality = 0.92,
    icoSizes: number[] = [16, 32, 48, 64]
  ): Promise<{ blob: Blob; extension: string; mimeType: string }> {
    const img = source instanceof HTMLImageElement ? source : await FileEngine.loadImage(source);

    if (targetFormat === 'image/x-icon') {
      const icoBlob = await this.generateIcoFile(img, icoSizes);
      return { blob: icoBlob, extension: 'ico', mimeType: 'image/x-icon' };
    }

    if (targetFormat === 'image/bmp') {
      const bmpBlob = await this.generateBmpFile(img);
      return { blob: bmpBlob, extension: 'bmp', mimeType: 'image/bmp' };
    }

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;

    if (targetFormat === 'image/jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), targetFormat, quality);
    });

    const ext = targetFormat === 'image/jpeg' ? 'jpg' : targetFormat === 'image/webp' ? 'webp' : 'png';
    return { blob, extension: ext, mimeType: targetFormat };
  }

  /**
   * Generates a valid multi-resolution Windows ICO binary file
   */
  public static async generateIcoFile(img: HTMLImageElement, sizes: number[] = [16, 32, 48, 64]): Promise<Blob> {
    const pngBuffers: { size: number; buffer: ArrayBuffer }[] = [];

    for (const s of sizes) {
      const c = document.createElement('canvas');
      c.width = s;
      c.height = s;
      const ctx = c.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, s, s);

      const blob: Blob = await new Promise((r) => c.toBlob((b) => r(b!), 'image/png'));
      const buffer = await blob.arrayBuffer();
      pngBuffers.push({ size: s, buffer });
    }

    // ICO File Header: 6 bytes
    // Directory Entries: 16 bytes each
    const count = pngBuffers.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    const totalDirSize = count * dirEntrySize;

    let totalFileSize = headerSize + totalDirSize;
    for (const p of pngBuffers) {
      totalFileSize += p.buffer.byteLength;
    }

    const icoArray = new Uint8Array(totalFileSize);
    const view = new DataView(icoArray.buffer);

    // 1. Header
    view.setUint16(0, 0, true); // Reserved (0)
    view.setUint16(2, 1, true); // Type 1 = ICO
    view.setUint16(4, count, true); // Image count

    // 2. Directory & Payloads
    let currentOffset = headerSize + totalDirSize;

    for (let i = 0; i < count; i++) {
      const { size, buffer } = pngBuffers[i];
      const entryOffset = headerSize + i * dirEntrySize;

      view.setUint8(entryOffset + 0, size >= 256 ? 0 : size); // Width
      view.setUint8(entryOffset + 1, size >= 256 ? 0 : size); // Height
      view.setUint8(entryOffset + 2, 0); // Palette colors
      view.setUint8(entryOffset + 3, 0); // Reserved
      view.setUint16(entryOffset + 4, 1, true); // Color planes
      view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
      view.setUint32(entryOffset + 8, buffer.byteLength, true); // Image size in bytes
      view.setUint32(entryOffset + 12, currentOffset, true); // Image data offset

      icoArray.set(new Uint8Array(buffer), currentOffset);
      currentOffset += buffer.byteLength;
    }

    return new Blob([icoArray], { type: 'image/x-icon' });
  }

  /**
   * Generates standard 24-bit uncompressed Windows BMP file
   */
  public static async generateBmpFile(img: HTMLImageElement): Promise<Blob> {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    // Row padding (each scanline must be a multiple of 4 bytes)
    const rowSize = Math.floor((24 * w + 31) / 32) * 4;
    const pixelArraySize = rowSize * h;
    const fileSize = 54 + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    const uint8 = new Uint8Array(buffer);

    // BMP Header (14 bytes)
    view.setUint16(0, 0x4d42, false); // "BM"
    view.setUint32(2, fileSize, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint32(10, 54, true); // Data offset

    // DIB Header (BITMAPINFOHEADER - 40 bytes)
    view.setUint32(14, 40, true);
    view.setInt32(18, w, true);
    view.setInt32(22, h, true); // Bottom-up
    view.setUint16(26, 1, true); // Planes
    view.setUint16(28, 24, true); // 24-bit RGB
    view.setUint32(30, 0, true); // BI_RGB (no compression)
    view.setUint32(34, pixelArraySize, true);
    view.setInt32(38, 2835, true); // 72 DPI
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);

    // Pixel data (BGR bottom-up)
    let offset = 54;
    for (let y = h - 1; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        const srcIdx = (y * w + x) * 4;
        uint8[offset++] = data[srcIdx + 2]; // B
        uint8[offset++] = data[srcIdx + 1]; // G
        uint8[offset++] = data[srcIdx]; // R
      }
      // Add row padding
      const pad = rowSize - w * 3;
      for (let p = 0; p < pad; p++) {
        uint8[offset++] = 0;
      }
    }

    return new Blob([buffer], { type: 'image/bmp' });
  }

  /**
   * Creates standard passport / ID photo grid
   */
  public static async createPassportPhotoGrid(
    source: HTMLImageElement | File | Blob | string,
    preset: 'US_2x2' | 'EU_35x45' | 'IN_35x45' | 'CA_50x70' = 'US_2x2',
    copies = 6
  ): Promise<HTMLCanvasElement> {
    const img = source instanceof HTMLImageElement ? source : await FileEngine.loadImage(source);

    // Standard 300 DPI dimensions in px
    let photoW = 600;
    let photoH = 600;

    if (preset === 'EU_35x45' || preset === 'IN_35x45') {
      photoW = 413; // 35mm at 300 dpi
      photoH = 531; // 45mm at 300 dpi
    } else if (preset === 'CA_50x70') {
      photoW = 590; // 50mm
      photoH = 826; // 70mm
    }

    // Printable sheet (4x6 inch = 1800 x 1200 px @ 300 dpi)
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = 1800;
    sheetCanvas.height = 1200;
    const ctx = sheetCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed canvas context');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sheetCanvas.width, sheetCanvas.height);

    // Draw individual photo cropped & centered
    const singleCanvas = document.createElement('canvas');
    singleCanvas.width = photoW;
    singleCanvas.height = photoH;
    const sCtx = singleCanvas.getContext('2d');
    if (!sCtx) throw new Error('Single canvas context error');

    // Cover crop
    const scale = Math.max(photoW / img.naturalWidth, photoH / img.naturalHeight);
    const sw = img.naturalWidth * scale;
    const sh = img.naturalHeight * scale;
    const sx = (photoW - sw) / 2;
    const sy = (photoH - sh) / 2;

    sCtx.drawImage(img, sx, sy, sw, sh);

    // Thin cutting border
    sCtx.strokeStyle = '#cbd5e1';
    sCtx.lineWidth = 2;
    sCtx.strokeRect(0, 0, photoW, photoH);

    // Grid layout
    const cols = Math.min(3, Math.floor((sheetCanvas.width - 60) / (photoW + 30)));
    const rows = Math.min(2, Math.floor((sheetCanvas.height - 60) / (photoH + 30)));
    const marginX = (sheetCanvas.width - cols * photoW) / (cols + 1);
    const marginY = (sheetCanvas.height - rows * photoH) / (rows + 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r * cols + c < copies) {
          const x = marginX + c * (photoW + marginX);
          const y = marginY + r * (photoH + marginY);
          ctx.drawImage(singleCanvas, x, y);
        }
      }
    }

    return sheetCanvas;
  }
}
