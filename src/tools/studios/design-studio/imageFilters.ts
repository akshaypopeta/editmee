import { ImageFilters } from './types';

export interface FilterPresetDef {
  id: string;
  name: string;
  category: 'Cinematic' | 'Vintage' | 'Modern' | 'Artistic' | 'Monochrome';
  description: string;
  filters: Partial<ImageFilters>;
}

export const FILTER_PRESETS: FilterPresetDef[] = [
  {
    id: 'cinematic',
    name: 'Cinematic Teal & Orange',
    category: 'Cinematic',
    description: 'Hollywood blockbuster color grade with deep contrast',
    filters: {
      contrast: 22,
      saturation: 18,
      temperature: 15,
      tint: -10,
      exposure: 4,
    },
  },
  {
    id: 'warm-sunset',
    name: 'Warm Golden Sunset',
    category: 'Cinematic',
    description: 'Golden hour warmth with rich amber highlights',
    filters: {
      temperature: 45,
      saturation: 25,
      brightness: 5,
      contrast: 12,
    },
  },
  {
    id: 'moody-cool',
    name: 'Moody Nordic Cool',
    category: 'Cinematic',
    description: 'Subdued saturation with cold ambient shadows',
    filters: {
      temperature: -35,
      contrast: 18,
      saturation: -15,
      exposure: -5,
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    category: 'Modern',
    description: 'High vibrance with saturated magenta and electric cyan',
    filters: {
      saturation: 55,
      contrast: 35,
      vibrance: 40,
      hueRotate: 25,
    },
  },
  {
    id: 'vintage-70s',
    name: 'Vintage 70s Kodachrome',
    category: 'Vintage',
    description: 'Faded film warmth with slight yellow cast',
    filters: {
      sepia: 28,
      temperature: 30,
      contrast: 15,
      brightness: -4,
      saturation: -10,
    },
  },
  {
    id: 'film-noir',
    name: 'Film Noir Black & White',
    category: 'Monochrome',
    description: 'Dramatic silver-halide monochrome with deep blacks',
    filters: {
      saturation: -100,
      contrast: 40,
      brightness: -5,
      exposure: 6,
    },
  },
  {
    id: 'high-contrast',
    name: 'High Impact Punch',
    category: 'Modern',
    description: 'Razor-sharp clarity with boosted contrast',
    filters: {
      contrast: 45,
      saturation: 20,
      brightness: 2,
    },
  },
  {
    id: 'editorial-vogue',
    name: 'Editorial Vogue',
    category: 'Modern',
    description: 'Clean high-fashion look with luminous highlights',
    filters: {
      contrast: 15,
      brightness: 8,
      vibrance: 12,
      temperature: -8,
    },
  },
  {
    id: 'matte-soft',
    name: 'Matte Pastel Fade',
    category: 'Artistic',
    description: 'Lifted shadows with soft pastel tones',
    filters: {
      contrast: -20,
      brightness: 12,
      saturation: -18,
      temperature: 10,
    },
  },
  {
    id: 'dramatic-fade',
    name: 'Dramatic Shadow Fade',
    category: 'Cinematic',
    description: 'Crushed deep shadows with elevated midtones',
    filters: {
      contrast: 30,
      brightness: -10,
      saturation: 10,
      temperature: -12,
    },
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dreamscape',
    category: 'Artistic',
    description: 'Dreamy soft glow with elevated brightness',
    filters: {
      brightness: 18,
      saturation: -25,
      contrast: -15,
      temperature: 14,
    },
  },
  {
    id: 'forest-crisp',
    name: 'Crisp Emerald Forest',
    category: 'Artistic',
    description: 'Enriched foliage greens with cool clarity',
    filters: {
      saturation: 24,
      vibrance: 30,
      temperature: -14,
      contrast: 16,
    },
  },
  {
    id: 'sepia-classic',
    name: 'Classic Antique Sepia',
    category: 'Vintage',
    description: 'Timeless Victorian archival tone',
    filters: {
      sepia: 75,
      contrast: 10,
      brightness: -8,
      temperature: 20,
    },
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour Magic',
    category: 'Cinematic',
    description: 'Radiant sunset glow with gentle lens warmth',
    filters: {
      temperature: 38,
      saturation: 20,
      contrast: 8,
      brightness: 6,
    },
  },
  {
    id: 'electric-blue',
    name: 'Electric Cobalt',
    category: 'Modern',
    description: 'Deep cobalt blue grading for tech aesthetics',
    filters: {
      temperature: -50,
      saturation: 30,
      contrast: 25,
      hueRotate: 180,
    },
  },
  {
    id: 'silver-chrome',
    name: 'Silver Chrome Metallic',
    category: 'Monochrome',
    description: 'Monochrome with high specular luminance',
    filters: {
      saturation: -100,
      contrast: 50,
      brightness: 12,
    },
  },
  {
    id: 'minimalist',
    name: 'Clean Minimalist',
    category: 'Modern',
    description: 'Neutral, balanced tones with clean whitespace',
    filters: {
      contrast: 8,
      brightness: 4,
      saturation: -8,
    },
  },
];

export const DEFAULT_IMAGE_FILTERS: ImageFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  blur: 0,
  sepia: 0,
  hueRotate: 0,
  invert: 0,
  preset: undefined,
  presetIntensity: 100,
};

export function buildCssFilterString(filters?: ImageFilters): string {
  if (!filters) return 'none';
  const parts: string[] = [];

  const b = 100 + filters.brightness + filters.exposure * 0.5;
  if (b !== 100) parts.push(`brightness(${Math.max(0, b)}%)`);

  const c = 100 + filters.contrast;
  if (c !== 100) parts.push(`contrast(${Math.max(0, c)}%)`);

  const s = 100 + filters.saturation + filters.vibrance * 0.5;
  if (s !== 100) parts.push(`saturate(${Math.max(0, s)}%)`);

  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`);
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);

  return parts.length > 0 ? parts.join(' ') : 'none';
}

/**
 * Applies adjustments and filters directly onto an HTML Canvas context
 */
export function applyCanvasImageFilters(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | HTMLCanvasElement,
  filters: ImageFilters,
  targetWidth: number,
  targetHeight: number
): void {
  ctx.save();
  ctx.filter = buildCssFilterString(filters);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  ctx.restore();
}

/**
 * Client-Side Background Removal Algorithm:
 * Samples edge pixels to detect background color (e.g. solid white/black/green/blue)
 * and applies flood fill / color distance thresholding to make the background transparent.
 */
export function removeImageBackground(
  img: HTMLImageElement,
  tolerance: number = 32
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve(img.src);
      return;
    }

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const w = canvas.width;
    const h = canvas.height;

    // Sample the 4 corner pixels to determine background reference color
    const corners = [
      0, // top-left
      (w - 1) * 4, // top-right
      ((h - 1) * w) * 4, // bottom-left
      ((h - 1) * w + (w - 1)) * 4, // bottom-right
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    for (const c of corners) {
      bgR += data[c];
      bgG += data[c + 1];
      bgB += data[c + 2];
    }
    bgR = Math.round(bgR / corners.length);
    bgG = Math.round(bgG / corners.length);
    bgB = Math.round(bgB / corners.length);

    const tolSquared = tolerance * tolerance * 3;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const diffR = r - bgR;
      const diffG = g - bgG;
      const diffB = b - bgB;
      const distSq = diffR * diffR + diffG * diffG + diffB * diffB;

      if (distSq < tolSquared) {
        // Soft edge feathering
        const factor = Math.sqrt(distSq) / Math.sqrt(tolSquared);
        if (factor < 0.6) {
          data[i + 3] = 0;
        } else {
          data[i + 3] = Math.round(data[i + 3] * ((factor - 0.6) / 0.4));
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    resolve(canvas.toDataURL('image/png'));
  });
}
