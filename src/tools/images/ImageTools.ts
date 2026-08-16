import { ToolDefinition, ToolResult } from '../../types';
import { ImageEngine } from '../../core/image-engine/ImageEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';

// Workspaces
import { ImageStudioTool } from './ImageStudioTool';
import { ImageCompressorWorkspace } from './ImageCompressorWorkspace';
import { ImageResizerWorkspace } from './ImageResizerWorkspace';
import { ImageConverterWorkspace } from './ImageConverterWorkspace';
import { BackgroundRemoverWorkspace } from './BackgroundRemoverWorkspace';
import { ImageUpscalerWorkspace } from './ImageUpscalerWorkspace';
import { ImageEnhancerWorkspace } from './ImageEnhancerWorkspace';
import { ImageWatermarkWorkspace } from './ImageWatermarkWorkspace';
import { ImageAnnotatorWorkspace } from './ImageAnnotatorWorkspace';

// 1. Image Studio Flagship
export const imageStudioToolDef: ToolDefinition = {
  id: 'image-studio',
  name: 'Image Studio',
  description: 'The Flagship image editor: crop, resize, rotate, flip, filters, color grading, background cutout, watermark, and passport photo generator.',
  category: 'images',
  subcategory: 'editor',
  iconName: 'Image',
  version: '2.0.0',
  tags: ['image', 'photo', 'crop', 'filter', 'resize', 'passport', 'flagship', 'editor'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
    ],
  },
  outputSchema: {
    type: 'image',
    mimeType: 'image/png',
    filename: 'edited_image.png',
  },
  customWorkspace: ImageStudioTool,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      filename: input.file?.name || 'image.png',
    };
  },
};

// 2. Image Compressor
export const imageCompressorToolDef: ToolDefinition = {
  id: 'image-compressor',
  name: 'Image Compressor',
  description: 'Compress JPG, PNG, and WebP images to reduce file size with real-time compression savings meter and live quality comparison.',
  category: 'images',
  subcategory: 'optimize',
  iconName: 'Minimize2',
  version: '2.0.0',
  tags: ['image', 'compress', 'optimize', 'shrink', 'tinypng'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      { name: 'quality', label: 'Quality (%)', type: 'range', min: 10, max: 100, defaultValue: 75 },
      {
        name: 'format',
        label: 'Output Format',
        type: 'select',
        defaultValue: 'image/jpeg',
        options: [
          { label: 'JPEG (Best for photos)', value: 'image/jpeg' },
          { label: 'WebP (Modern web format)', value: 'image/webp' },
          { label: 'PNG (Lossless graphics)', value: 'image/png' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'compressed_image.jpg',
  },
  customWorkspace: ImageCompressorWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image file' };
    const quality = (input.quality ?? 75) / 100;
    const format = input.format || 'image/jpeg';

    const { blob, originalSize, newSize, savingsPercent } = await ImageEngine.compressImage(
      input.file,
      quality,
      format
    );

    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
    const baseName = input.file.name.replace(/\.[^/.]+$/, '');
    const filename = `${baseName}_compressed.${ext}`;

    return {
      success: true,
      blob,
      filename,
      text: `Original: ${FileEngine.formatBytes(originalSize)} → Compressed: ${FileEngine.formatBytes(newSize)} (Saved ${savingsPercent}%)`,
    };
  },
};

// 3. Image Resizer
export const imageResizerToolDef: ToolDefinition = {
  id: 'image-resizer',
  name: 'Image Resizer',
  description: 'Resize images to exact pixel dimensions, percentage scaling, or popular social media aspect ratios with bicubic smoothing.',
  category: 'images',
  subcategory: 'editor',
  iconName: 'Maximize2',
  version: '2.0.0',
  tags: ['image', 'resize', 'scale', 'dimensions', 'social media presets'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      { name: 'width', label: 'Target Width (px)', type: 'number', defaultValue: 1200 },
      { name: 'height', label: 'Target Height (px)', type: 'number', defaultValue: 630 },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'resized_image.png',
  },
  customWorkspace: ImageResizerWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image file' };
    const img = await FileEngine.loadImage(input.file);
    const targetW = Number(input.width || img.naturalWidth);
    const targetH = Number(input.height || img.naturalHeight);

    const canvas = await ImageEngine.processImage(img, {
      width: targetW,
      height: targetH,
    });

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const baseName = input.file.name.replace(/\.[^/.]+$/, '');
    return {
      success: true,
      blob,
      filename: `${baseName}_${targetW}x${targetH}.png`,
    };
  },
};

// 4. Image Converter
export const imageConverterToolDef: ToolDefinition = {
  id: 'image-converter',
  name: 'Image Converter',
  description: 'Convert images seamlessly between PNG, JPEG, WebP, BMP, and multi-icon Windows ICO formats in browser.',
  category: 'images',
  subcategory: 'convert',
  iconName: 'RefreshCw',
  version: '2.0.0',
  tags: ['image', 'convert', 'png', 'jpg', 'webp', 'ico', 'bmp'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      {
        name: 'targetFormat',
        label: 'Target Format',
        type: 'select',
        defaultValue: 'image/webp',
        options: [
          { label: 'WebP (Next-Gen Smallest)', value: 'image/webp' },
          { label: 'PNG (Lossless Graphics)', value: 'image/png' },
          { label: 'JPEG (Universal Photo)', value: 'image/jpeg' },
          { label: 'ICO (Favicon Studio)', value: 'image/x-icon' },
          { label: 'BMP (Windows Bitmap)', value: 'image/bmp' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'converted_image.webp',
  },
  customWorkspace: ImageConverterWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image file' };
    const format = input.targetFormat || 'image/webp';
    const res = await ImageEngine.convertFormat(input.file, format, 0.9);
    const baseName = input.file.name.replace(/\.[^/.]+$/, '');

    return {
      success: true,
      blob: res.blob,
      filename: `${baseName}.${res.extension}`,
    };
  },
};

// 5. Background Remover
export const bgRemoverToolDef: ToolDefinition = {
  id: 'bg-remover',
  name: 'Background Remover',
  description: 'Remove background from images instantly with client-side smart color thresholding and anti-aliased edge feathering.',
  category: 'images',
  subcategory: 'ai',
  iconName: 'Wand2',
  version: '2.0.0',
  tags: ['image', 'background', 'transparent', 'cutout', 'remove bg', 'alpha'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      { name: 'tolerance', label: 'Color Tolerance (10 - 70)', type: 'range', min: 10, max: 70, defaultValue: 38 },
      { name: 'edgeFeather', label: 'Smooth Edges (Feathering)', type: 'boolean', defaultValue: true },
    ],
  },
  outputSchema: {
    type: 'image',
    mimeType: 'image/png',
    filename: 'cutout_image.png',
  },
  customWorkspace: BackgroundRemoverWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image' };
    const canvas = await ImageEngine.removeBackground(input.file, {
      tolerance: input.tolerance ?? 38,
      edgeFeather: input.edgeFeather ?? true,
    });

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const baseName = input.file.name.replace(/\.[^/.]+$/, '');
    return {
      success: true,
      blob,
      filename: `${baseName}_transparent.png`,
    };
  },
};

// 6. Super-Resolution Upscaler
export const imageUpscalerToolDef: ToolDefinition = {
  id: 'image-upscaler',
  name: 'Image Upscaler',
  description: 'Upscale images by 2x, 4x, or 8x with multi-pass bicubic upsampling, unsharp masking, and edge preservation.',
  category: 'images',
  subcategory: 'optimize',
  iconName: 'Maximize2',
  version: '2.0.0',
  tags: ['image', 'upscale', 'super resolution', 'bicubic', 'enlarge', 'hd'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      {
        name: 'scaleFactor',
        label: 'Upscaling Factor',
        type: 'select',
        defaultValue: '2',
        options: [
          { label: '2x (Double Resolution)', value: '2' },
          { label: '4x (Ultra HD Quad)', value: '4' },
          { label: '8x (Extreme Super Res)', value: '8' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'upscaled_image.png',
  },
  customWorkspace: ImageUpscalerWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image' };
    const factor = Number(input.scaleFactor || '2') as 2 | 4 | 8;
    const canvas = await ImageEngine.upscaleImage(input.file, factor, 1.5);

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const baseName = input.file.name.replace(/\.[^/.]+$/, '');
    return {
      success: true,
      blob,
      filename: `${baseName}_${factor}x_upscaled.png`,
    };
  },
};

// 7. Auto Enhancer
export const imageEnhancerToolDef: ToolDefinition = {
  id: 'image-enhancer',
  name: 'Image Enhancer',
  description: 'Automatically balance lighting, expand dynamic color contrast, recover shadow detail, and boost vibrance.',
  category: 'images',
  subcategory: 'editor',
  iconName: 'Sparkles',
  version: '2.0.0',
  tags: ['image', 'enhance', 'lighting', 'vivid', 'hdr', 'contrast', 'exposure'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      { name: 'strength', label: 'Equalizer Strength (%)', type: 'range', min: 10, max: 100, defaultValue: 85 },
      { name: 'boostVibrance', label: 'Smart Vibrance Saturation', type: 'boolean', defaultValue: true },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'enhanced_image.png',
  },
  customWorkspace: ImageEnhancerWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image' };
    const canvas = await ImageEngine.autoEnhance(input.file, {
      strength: input.strength ?? 85,
      boostVibrance: input.boostVibrance ?? true,
    });

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const baseName = input.file.name.replace(/\.[^/.]+$/, '');
    return {
      success: true,
      blob,
      filename: `${baseName}_enhanced.png`,
    };
  },
};

// 8. Image Watermark
export const imageWatermarkToolDef: ToolDefinition = {
  id: 'image-watermark',
  name: 'Image Watermark',
  description: 'Add custom text stamps, copyright notices, or logo overlays with diagonal tiling and alpha transparency.',
  category: 'images',
  subcategory: 'editor',
  iconName: 'Type',
  version: '2.0.0',
  tags: ['image', 'watermark', 'copyright', 'stamp', 'branding', 'logo'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
      { name: 'text', label: 'Watermark Text', type: 'text', defaultValue: 'CONFIDENTIAL' },
      { name: 'opacity', label: 'Opacity (0.1 - 1.0)', type: 'range', min: 0.1, max: 1, step: 0.05, defaultValue: 0.4 },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'watermarked_image.png',
  },
  customWorkspace: ImageWatermarkWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image' };
    const canvas = await ImageEngine.processImage(input.file, {
      watermark: {
        type: 'text',
        text: input.text || 'CONFIDENTIAL',
        opacity: Number(input.opacity || 0.4),
        position: 'tile',
      },
    });

    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b || new Blob()), 'image/png');
    });

    const baseName = input.file.name.replace(/\.[^/.]+$/, '');
    return {
      success: true,
      blob,
      filename: `${baseName}_watermarked.png`,
    };
  },
};

// 9. Image Annotator & Redaction
export const imageAnnotatorToolDef: ToolDefinition = {
  id: 'image-annotator',
  name: 'Image Annotator',
  description: 'Draw arrows, shapes, step badges, text labels, and apply censor redactions (pixelation or blur) to photos.',
  category: 'images',
  subcategory: 'editor',
  iconName: 'PenTool',
  version: '2.0.0',
  tags: ['image', 'annotate', 'markup', 'censor', 'redact', 'arrow', 'blur', 'pixelate'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Image File', type: 'file', accept: 'image/*', required: true },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'annotated_image.png',
  },
  customWorkspace: ImageAnnotatorWorkspace,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      filename: input.file?.name || 'annotated.png',
    };
  },
};

export const allImageTools: ToolDefinition[] = [
  imageStudioToolDef,
  imageCompressorToolDef,
  imageResizerToolDef,
  imageConverterToolDef,
  bgRemoverToolDef,
  imageUpscalerToolDef,
  imageEnhancerToolDef,
  imageWatermarkToolDef,
  imageAnnotatorToolDef,
];
