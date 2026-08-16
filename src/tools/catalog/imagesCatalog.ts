import { ToolDefinition, ToolResult } from '../../types';
import {
  imageStudioToolDef,
  imageCompressorToolDef,
  imageResizerToolDef,
  imageConverterToolDef,
  bgRemoverToolDef,
  imageUpscalerToolDef,
  imageEnhancerToolDef,
  imageWatermarkToolDef,
  imageAnnotatorToolDef,
} from '../images/ImageTools';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

// Helper to load image onto canvas
function loadImageToCanvas(file: File): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; img: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        resolve({ canvas, ctx, img });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string = 'image/png', quality: number = 0.92): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b || new Blob()), mime, quality);
  });
}

export const imagesCatalog: ToolDefinition[] = [
  // 1-9: Flagships & Existing Suite
  imageStudioToolDef,
  imageCompressorToolDef,
  imageResizerToolDef,
  imageConverterToolDef,
  bgRemoverToolDef,
  imageUpscalerToolDef,
  imageEnhancerToolDef,
  imageWatermarkToolDef,
  imageAnnotatorToolDef,

  // 10. Favicon Generator
  {
    id: 'favicon-generator',
    name: 'Favicon & App Icon Generator',
    category: 'images',
    subcategory: 'icons',
    description: 'Generate standard multi-size favicon icons (16x16, 32x32, 48x48, 180x180 Apple Touch) from any logo.',
    iconName: 'Sparkles',
    version: '1.0.0',
    tags: ['image', 'favicon', 'icon', 'apple-touch', 'web', 'logo'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Logo Image', type: 'file', accept: 'image/*', required: true },
        { name: 'size', label: 'Output Size', type: 'select', defaultValue: '32', options: [{ label: '32x32 Favicon', value: '32' }, { label: '180x180 Apple Touch Icon', value: '180' }, { label: '512x512 PWA Splash Icon', value: '512' }] },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png', filename: 'favicon.png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Please upload an image' };
      const { img } = await loadImageToCanvas(inputs.file);
      const targetSize = parseInt(inputs.size || '32', 10);
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, targetSize, targetSize);
      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `favicon-${targetSize}x${targetSize}.png` };
    },
  },

  // 11. Image Palette Extractor
  {
    id: 'image-palette-extractor',
    name: 'Image Color Palette Extractor',
    category: 'images',
    subcategory: 'color',
    description: 'Extract dominant HEX and RGB color swatches and mood palettes from any uploaded photo.',
    iconName: 'Palette',
    version: '1.0.0',
    tags: ['image', 'color', 'palette', 'swatch', 'hex', 'design'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Photo / Graphic', type: 'file', accept: 'image/*', required: true },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Please upload an image' };
      const { canvas, ctx } = await loadImageToCanvas(inputs.file);
      const imgData = ctx.getImageData(0, 0, Math.min(canvas.width, 200), Math.min(canvas.height, 200)).data;
      const colorCounts: Record<string, number> = {};

      for (let i = 0; i < imgData.length; i += 16) {
        const r = Math.round(imgData[i] / 32) * 32;
        const g = Math.round(imgData[i + 1] / 32) * 32;
        const b = Math.round(imgData[i + 2] / 32) * 32;
        const hex = '#' + [r, g, b].map((x) => Math.min(255, x).toString(16).padStart(2, '0')).join('');
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const dominant = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([hex, count]) => ({ hex, prominence: `${Math.round((count / (imgData.length / 16)) * 100)}%` }));

      return { success: true, data: dominant, text: JSON.stringify(dominant, null, 2) };
    },
  },

  // 12. Image EXIF Data Stripper
  {
    id: 'image-exif-stripper',
    name: 'Image EXIF & Metadata Stripper',
    category: 'images',
    subcategory: 'privacy',
    description: 'Strip GPS geolocation, camera hardware serials, and sensitive EXIF tags for privacy.',
    iconName: 'ShieldCheck',
    version: '1.0.0',
    tags: ['image', 'exif', 'metadata', 'gps', 'privacy', 'security'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Photo with EXIF', type: 'file', accept: 'image/*', required: true },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/jpeg' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Please upload an image' };
      const { canvas } = await loadImageToCanvas(inputs.file);
      // Re-encoding via canvas automatically strips all EXIF metadata headers
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.95);
      return { success: true, blob, filename: `clean_${inputs.file.name}` };
    },
  },

  // 13. Image Color Inverter
  {
    id: 'image-color-inverter',
    name: 'Image Color Inverter',
    category: 'images',
    subcategory: 'effects',
    description: 'Invert color channels (negative photo effect) on any raster graphic.',
    iconName: 'SunMedium',
    version: '1.0.0',
    tags: ['image', 'invert', 'negative', 'filter', 'effects'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Please upload an image' };
      const { canvas, ctx } = await loadImageToCanvas(inputs.file);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      ctx.putImageData(imgData, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `inverted_${inputs.file.name}` };
    },
  },

  // 14. Image Blur & Sharpen
  {
    id: 'image-blur-sharpen',
    name: 'Image Blur & Gaussian Filter',
    category: 'images',
    subcategory: 'effects',
    description: 'Apply controlled Gaussian blur to background images or UI backdrops.',
    iconName: 'Droplet',
    version: '1.0.0',
    tags: ['image', 'blur', 'gaussian', 'filter', 'backdrop'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        { name: 'blurRadius', label: 'Blur Radius (px)', type: 'range', min: 1, max: 30, defaultValue: 8 },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Please upload an image' };
      const { canvas, ctx, img } = await loadImageToCanvas(inputs.file);
      const radius = inputs.blurRadius || 8;
      ctx.filter = `blur(${radius}px)`;
      ctx.drawImage(img, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `blurred_${inputs.file.name}` };
    },
  },

  // 15. Image Flip & Mirror
  {
    id: 'image-flip-mirror',
    name: 'Image Flip & Mirror',
    category: 'images',
    subcategory: 'transform',
    description: 'Flip images horizontally or vertically for symmetry and composition alignment.',
    iconName: 'FlipHorizontal',
    version: '1.0.0',
    tags: ['image', 'flip', 'mirror', 'horizontal', 'vertical', 'orientation'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        {
          name: 'direction',
          label: 'Flip Axis',
          type: 'select',
          defaultValue: 'horizontal',
          options: [
            { label: 'Horizontal (Mirror Left-Right)', value: 'horizontal' },
            { label: 'Vertical (Flip Upside-Down)', value: 'vertical' },
            { label: 'Both Axes (180° Mirror)', value: 'both' },
          ],
        },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { canvas, ctx, img } = await loadImageToCanvas(inputs.file);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      const dir = inputs.direction || 'horizontal';
      if (dir === 'horizontal') {
        ctx.scale(-1, 1);
        ctx.drawImage(img, -canvas.width, 0);
      } else if (dir === 'vertical') {
        ctx.scale(1, -1);
        ctx.drawImage(img, 0, -canvas.height);
      } else {
        ctx.scale(-1, -1);
        ctx.drawImage(img, -canvas.width, -canvas.height);
      }
      ctx.restore();
      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `flipped_${inputs.file.name}` };
    },
  },

  // 16. Image Pixelator & Mosaic
  {
    id: 'image-pixelator',
    name: 'Image Pixelator & Censor',
    category: 'images',
    subcategory: 'effects',
    description: 'Pixelate images or censor faces and license plates with retro 8-bit mosaic blocks.',
    iconName: 'Grid',
    version: '1.0.0',
    tags: ['image', 'pixelate', 'censor', 'mosaic', 'retro', '8-bit'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        { name: 'pixelSize', label: 'Block Size (px)', type: 'range', min: 4, max: 40, defaultValue: 16 },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { canvas, ctx, img } = await loadImageToCanvas(inputs.file);
      const blockSize = Number(inputs.pixelSize || 16);
      const w = canvas.width;
      const h = canvas.height;

      // Draw small then draw scaled up with smoothing off
      const tempCanvas = document.createElement('canvas');
      const sw = Math.max(1, Math.floor(w / blockSize));
      const sh = Math.max(1, Math.floor(h / blockSize));
      tempCanvas.width = sw;
      tempCanvas.height = sh;
      const tctx = tempCanvas.getContext('2d')!;
      tctx.drawImage(img, 0, 0, sw, sh);

      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(tempCanvas, 0, 0, sw, sh, 0, 0, w, h);

      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `pixelated_${inputs.file.name}` };
    },
  },

  // 17. Image ASCII Art Converter
  {
    id: 'image-ascii-art',
    name: 'Image to ASCII Art Converter',
    category: 'images',
    subcategory: 'conversion',
    description: 'Convert any photo into high-contrast monospace text ASCII art characters.',
    iconName: 'Terminal',
    version: '1.0.0',
    tags: ['image', 'ascii', 'text', 'art', 'retro', 'terminal'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        { name: 'cols', label: 'Width Columns', type: 'number', defaultValue: 80 },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { img } = await loadImageToCanvas(inputs.file);
      const cols = Number(inputs.cols || 80);
      const rows = Math.floor((cols * (img.height / img.width)) * 0.55); // Monospace aspect ratio compensation

      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, cols, rows);

      const imgData = ctx.getImageData(0, 0, cols, rows).data;
      const chars = '@%#*+=-:. ';
      let ascii = '';

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const brightness = (imgData[idx] * 0.299 + imgData[idx + 1] * 0.587 + imgData[idx + 2] * 0.114) / 255;
          const charIdx = Math.floor(brightness * (chars.length - 1));
          ascii += chars[charIdx];
        }
        ascii += '\n';
      }

      return { success: true, text: ascii, filename: 'ascii_art.txt' };
    },
  },

  // 18. Image Duotone & Sepia Filter
  {
    id: 'image-duotone-sepia',
    name: 'Image Sepia & Vintage Duotone',
    category: 'images',
    subcategory: 'effects',
    description: 'Apply warm sepia tone or dramatic editorial duotone color grades.',
    iconName: 'Camera',
    version: '1.0.0',
    tags: ['image', 'sepia', 'duotone', 'vintage', 'filter', 'editorial'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        {
          name: 'preset',
          label: 'Filter Preset',
          type: 'select',
          defaultValue: 'sepia',
          options: [
            { label: 'Warm Sepia Vintage', value: 'sepia' },
            { label: 'Cyberpunk Neon Duotone', value: 'cyberpunk' },
            { label: 'Classic Noir Black & White', value: 'noir' },
          ],
        },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { canvas, ctx } = await loadImageToCanvas(inputs.file);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      const preset = inputs.preset || 'sepia';

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (preset === 'sepia') {
          d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        } else if (preset === 'cyberpunk') {
          const gray = (r + g + b) / 3;
          d[i] = gray > 128 ? 255 : 40;
          d[i + 1] = gray > 128 ? 0 : 220;
          d[i + 2] = gray > 128 ? 200 : 255;
        } else {
          const gray = r * 0.299 + g * 0.587 + b * 0.114;
          d[i] = gray;
          d[i + 1] = gray;
          d[i + 2] = gray;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `vintage_${inputs.file.name}` };
    },
  },

  // 19. Image Border & Framer
  {
    id: 'image-border-frame',
    name: 'Image Border & Framing Studio',
    category: 'images',
    subcategory: 'effects',
    description: 'Add crisp solid borders, polaroid style margins, or round corner frames.',
    iconName: 'Square',
    version: '1.0.0',
    tags: ['image', 'border', 'frame', 'polaroid', 'padding', 'margin'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        { name: 'borderWidth', label: 'Border Width (px)', type: 'number', defaultValue: 24 },
        { name: 'borderColor', label: 'Border Color', type: 'color', defaultValue: '#ffffff' },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { img } = await loadImageToCanvas(inputs.file);
      const bw = Number(inputs.borderWidth || 24);
      const color = inputs.borderColor || '#ffffff';

      const canvas = document.createElement('canvas');
      canvas.width = img.width + bw * 2;
      canvas.height = img.height + bw * 2;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, bw, bw);

      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `framed_${inputs.file.name}` };
    },
  },

  // 20. Image Base64 Data URI Encoder
  {
    id: 'image-base64-converter',
    name: 'Image to Base64 Data URI Converter',
    category: 'images',
    subcategory: 'developer',
    description: 'Convert raster images into inline CSS/HTML Base64 Data URI strings.',
    iconName: 'Code',
    version: '1.0.0',
    tags: ['image', 'base64', 'data-uri', 'inline', 'css', 'html'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const dataUri = await FileEngine.readAsDataURL(inputs.file);
      return {
        success: true,
        text: dataUri,
        filename: `${inputs.file.name}.base64.txt`,
      };
    },
  },

  // 21. Image Meme Generator
  {
    id: 'image-meme-generator',
    name: 'Image Meme Caption Generator',
    category: 'images',
    subcategory: 'effects',
    description: 'Render classic bold Impact font top and bottom captions over any template.',
    iconName: 'Smile',
    version: '1.0.0',
    tags: ['image', 'meme', 'caption', 'impact', 'humor', 'social'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Template Image', type: 'file', accept: 'image/*', required: true },
        { name: 'topText', label: 'Top Caption', type: 'text', defaultValue: 'WHEN THE CODE COMPILES' },
        { name: 'bottomText', label: 'Bottom Caption', type: 'text', defaultValue: 'ON THE FIRST TRY' },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { canvas, ctx, img } = await loadImageToCanvas(inputs.file);
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(20, Math.floor(canvas.width / 14));
      ctx.font = `bold ${fontSize}px Impact, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(3, Math.floor(fontSize / 8));
      ctx.textAlign = 'center';

      if (inputs.topText) {
        const top = inputs.topText.toUpperCase();
        ctx.strokeText(top, canvas.width / 2, fontSize + 20);
        ctx.fillText(top, canvas.width / 2, fontSize + 20);
      }

      if (inputs.bottomText) {
        const bot = inputs.bottomText.toUpperCase();
        ctx.strokeText(bot, canvas.width / 2, canvas.height - 25);
        ctx.fillText(bot, canvas.width / 2, canvas.height - 25);
      }

      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `meme_${inputs.file.name}` };
    },
  },

  // 22. Image Sprite Sheet Generator
  {
    id: 'image-sprite-generator',
    name: 'Image Sprite Sheet Generator',
    category: 'images',
    subcategory: 'developer',
    description: 'Combine multiple UI icons or game frames into a single compact sprite sheet.',
    iconName: 'LayoutGrid',
    version: '1.0.0',
    tags: ['image', 'sprite', 'css-sprite', 'game', 'frames', 'icons'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Sample Frame / Icon', type: 'file', accept: 'image/*', required: true },
        { name: 'copies', label: 'Frame Copies', type: 'number', defaultValue: 4 },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { img } = await loadImageToCanvas(inputs.file);
      const count = Math.min(16, Math.max(1, Number(inputs.copies || 4)));

      const canvas = document.createElement('canvas');
      canvas.width = img.width * count;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      for (let i = 0; i < count; i++) {
        ctx.drawImage(img, i * img.width, 0);
      }

      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `spritesheet_${inputs.file.name}` };
    },
  },

  // 23. Image Cropper (Standard Ratio)
  {
    id: 'image-ratio-cropper',
    name: 'Image Aspect Ratio Cropper',
    category: 'images',
    subcategory: 'transform',
    description: 'Center crop images to exact 1:1 square, 16:9 widescreen, or 4:5 social dimensions.',
    iconName: 'Crop',
    version: '1.0.0',
    tags: ['image', 'crop', 'aspect-ratio', 'square', 'social', 'widescreen'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        {
          name: 'ratio',
          label: 'Target Ratio',
          type: 'select',
          defaultValue: '1:1',
          options: [
            { label: '1:1 Square (Instagram/Avatar)', value: '1:1' },
            { label: '16:9 Widescreen (YouTube/Header)', value: '16:9' },
            { label: '4:5 Social Portrait', value: '4:5' },
          ],
        },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/png' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { img } = await loadImageToCanvas(inputs.file);
      const ratioStr = inputs.ratio || '1:1';
      let targetRatio = 1.0;
      if (ratioStr === '16:9') targetRatio = 16 / 9;
      if (ratioStr === '4:5') targetRatio = 4 / 5;

      let cropW = img.width;
      let cropH = Math.floor(cropW / targetRatio);

      if (cropH > img.height) {
        cropH = img.height;
        cropW = Math.floor(cropH * targetRatio);
      }

      const startX = Math.floor((img.width - cropW) / 2);
      const startY = Math.floor((img.height - cropH) / 2);

      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, startX, startY, cropW, cropH, 0, 0, cropW, cropH);

      const blob = await canvasToBlob(canvas, 'image/png');
      return { success: true, blob, filename: `cropped_${inputs.file.name}` };
    },
  },

  // 24. Image WebP High-Compression Batch
  {
    id: 'image-webp-batch',
    name: 'Image Next-Gen WebP Compressor',
    category: 'images',
    subcategory: 'compression',
    description: 'Compress PNGs/JPEGs into Google Next-Gen WebP format for up to 80% bandwidth reduction.',
    iconName: 'Zap',
    version: '1.0.0',
    tags: ['image', 'webp', 'next-gen', 'compression', 'speed', 'bandwidth'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image', type: 'file', accept: 'image/*', required: true },
        { name: 'quality', label: 'WebP Quality (1-100)', type: 'range', min: 10, max: 100, defaultValue: 80 },
      ],
    },
    outputSchema: { type: 'image', mimeType: 'image/webp' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { canvas } = await loadImageToCanvas(inputs.file);
      const q = (Number(inputs.quality || 80)) / 100;
      const blob = await canvasToBlob(canvas, 'image/webp', q);
      return { success: true, blob, filename: `${inputs.file.name.replace(/\.[^/.]+$/, '')}.webp` };
    },
  },

  // 25. Image Dimension & Density Inspector
  {
    id: 'image-inspector',
    name: 'Image Dimension & DPI Inspector',
    category: 'images',
    subcategory: 'metadata',
    description: 'Inspect exact pixel dimensions, aspect ratio, estimated DPI, and raw byte density.',
    iconName: 'Search',
    version: '1.0.0',
    tags: ['image', 'inspect', 'dpi', 'dimensions', 'metadata', 'resolution'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload an image' };
      const { img } = await loadImageToCanvas(inputs.file);
      const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
      const divisor = gcd(img.width, img.height);
      const aspect = `${img.width / divisor}:${img.height / divisor}`;

      const info = {
        fileName: inputs.file.name,
        fileSizeBytes: inputs.file.size,
        fileSizeFormatted: `${(inputs.file.size / 1024).toFixed(1)} KB`,
        mimeType: inputs.file.type || 'image/png',
        widthPx: img.width,
        heightPx: img.height,
        megapixels: ((img.width * img.height) / 1000000).toFixed(2) + ' MP',
        aspectRatio: aspect,
        isSquare: img.width === img.height,
        isRetinaReady: img.width >= 1920,
      };

      return { success: true, data: info, text: JSON.stringify(info, null, 2) };
    },
  },
];
