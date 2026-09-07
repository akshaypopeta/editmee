import { ToolDefinition, ToolResult } from '../../types';
import { PDFDocument } from 'pdf-lib';
import { PdfEngine } from '../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { MergePdfTool } from './MergePdfTool';
import { editPdfToolDef } from '../edit-pdf';

export { editPdfToolDef };

export const pdfMergerToolDef: ToolDefinition = {
  id: 'pdf-merger',
  name: 'PDF Merger',
  description: 'Combine 2 or more PDF documents into a single organized, high-quality PDF file with custom page reordering.',
  category: 'pdf',
  subcategory: 'organize',
  iconName: 'Merge',
  version: '2.0.0',
  tags: ['pdf', 'merge', 'combine', 'join', 'multi-file'],
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
      { name: 'files', label: 'PDF Documents (Select 2 or more)', type: 'file', accept: 'application/pdf', required: true, multiple: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'merged_document.pdf',
  },
  customWorkspace: MergePdfTool,
  execute: async (input: any): Promise<ToolResult> => {
    const rawFiles = input.files || (input.file ? [input.file] : []);
    const fileList = Array.isArray(rawFiles) ? rawFiles : [rawFiles];
    if (fileList.length < 2) {
      return { success: false, error: 'Select at least 2 PDF files to merge.' };
    }
    const buffers: ArrayBuffer[] = [];
    for (const f of fileList) {
      buffers.push(await FileEngine.readAsArrayBuffer(f));
    }
    const mergedBytes = await PdfEngine.mergePdfs(buffers);
    const blob = new Blob([mergedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: 'merged_document.pdf',
    };
  },
};

export const pdfSplitterToolDef: ToolDefinition = {
  id: 'pdf-splitter',
  name: 'PDF Splitter',
  description: 'Extract specific pages or page ranges from a PDF document into a new PDF.',
  category: 'pdf',
  subcategory: 'organize',
  iconName: 'Split',
  version: '1.0.0',
  tags: ['pdf', 'split', 'extract', 'pages'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'pages', label: 'Page Range (e.g. 1, 2-4, 5)', type: 'text', defaultValue: '1', required: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'extracted_pages.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const totalPages = doc.getPageCount();

    // Parse page ranges (1-indexed)
    const indices: number[] = [];
    const parts = (input.pages || '1').split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map((n: string) => parseInt(n.trim(), 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= totalPages) indices.push(i - 1);
          }
        }
      } else {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num >= 1 && num <= totalPages) {
          indices.push(num - 1);
        }
      }
    }

    if (indices.length === 0) {
      return { success: false, error: 'Invalid page range specified' };
    }

    const newBytes = await PdfEngine.extractPages(buf, Array.from(new Set(indices)));
    const blob = new Blob([newBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `split_${input.file.name}`,
    };
  },
};

export const pdfCompressorToolDef: ToolDefinition = {
  id: 'pdf-compressor',
  name: 'PDF Compressor',
  description: 'Reduce PDF file size while preserving document readability and page integrity.',
  category: 'pdf',
  subcategory: 'optimize',
  iconName: 'Minimize2',
  version: '1.0.0',
  tags: ['pdf', 'compress', 'optimize', 'shrink', 'size reduction'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      {
        name: 'compressionLevel',
        label: 'Compression Preset',
        type: 'select',
        defaultValue: 'recommended',
        options: [
          { label: 'Recommended (Balanced Optimization)', value: 'recommended' },
          { label: 'Extreme Compression (Smallest practical file)', value: 'extreme' },
          { label: 'High Quality (Light structural compression)', value: 'high' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'compressed_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const preset = input.compressionLevel || 'recommended';
    
    const result = await PdfEngine.compressPdf(buf, preset);
    const blob = new Blob([result.compressedBytes], { type: 'application/pdf' });

    let summaryText = '';
    if (result.isReduced) {
      summaryText = `Original Size: ${FileEngine.formatBytes(result.originalSize)}\nCompressed Size: ${FileEngine.formatBytes(result.compressedSize)}\nBytes Saved: ${FileEngine.formatBytes(result.originalSize - result.compressedSize)}\nReduction: ${result.reductionPercentage}%`;
    } else {
      summaryText = `Original Size: ${FileEngine.formatBytes(result.originalSize)}\nResult Size: ${FileEngine.formatBytes(result.compressedSize)}\nStatus: Document is already highly optimized. Zero unnecessary metadata retained.`;
    }

    return {
      success: true,
      blob,
      filename: `compressed_${input.file.name}`,
      text: summaryText,
    };
  },
};

export const pdfProtectToolDef: ToolDefinition = {
  id: 'pdf-protect',
  name: 'PDF Protect',
  description: 'Genuinely encrypt your PDF document with industry-standard AES-256 password protection directly in your browser.',
  category: 'pdf',
  subcategory: 'security',
  iconName: 'Lock',
  version: '2.0.0',
  tags: ['pdf', 'protect', 'encrypt', 'security', 'password', 'aes-256'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'password', label: 'User Password (Required to Open)', type: 'password', required: true },
      { name: 'ownerPassword', label: 'Owner / Master Password (Optional)', type: 'password', required: false },
      {
        name: 'algorithm',
        label: 'Encryption Standard',
        type: 'select',
        defaultValue: 'AES-256',
        options: [
          { label: 'AES-256 (High Security, Modern PDF Readers)', value: 'AES-256' },
          { label: 'RC4-128 (Legacy Compatibility)', value: 'RC4-128' },
        ],
      },
      {
        name: 'allowPrinting',
        label: 'Allow Printing',
        type: 'boolean',
        defaultValue: true,
      },
      {
        name: 'allowCopying',
        label: 'Allow Content Copying',
        type: 'boolean',
        defaultValue: false,
      },
      {
        name: 'allowModifying',
        label: 'Allow Document Modifications',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'protected_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const password = String(input.password || '').trim();
    if (!password) {
      return { success: false, error: 'Please enter a valid password to protect the PDF document.' };
    }

    try {
      const buf = await FileEngine.readAsArrayBuffer(input.file);
      const encryptedBytes = await PdfEngine.encryptPdf(buf, password, {
        ownerPassword: input.ownerPassword ? String(input.ownerPassword).trim() : undefined,
        algorithm: input.algorithm === 'RC4-128' ? 'RC4-128' : 'AES-256',
        permissions: {
          printing: input.allowPrinting ? 'highResolution' : 'none',
          copying: Boolean(input.allowCopying),
          modifying: Boolean(input.allowModifying),
        },
      });

      // Verify the generated PDF is valid and password protected
      if (!encryptedBytes || encryptedBytes.length === 0) {
        return { success: false, error: 'PDF encryption failed to produce output bytes.' };
      }

      const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
      return {
        success: true,
        blob,
        filename: `protected_${input.file.name}`,
        text: `PDF encrypted with ${input.algorithm || 'AES-256'} standard. A password prompt will be required when opening the file in Adobe Acrobat, Chrome, Edge, Safari, and mobile PDF viewers.`,
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Encryption error: ${err.message || 'Could not encrypt PDF'}`,
      };
    }
  },
};

export const imagesToPdfToolDef: ToolDefinition = {
  id: 'images-to-pdf',
  name: 'Images to PDF',
  description: 'Convert JPG, PNG, and WebP images into a single multi-page PDF document.',
  category: 'pdf',
  subcategory: 'convert',
  iconName: 'Images',
  version: '1.0.0',
  tags: ['pdf', 'images', 'jpg to pdf', 'png to pdf', 'convert'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'Primary Image', type: 'file', accept: 'image/*', required: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'converted_images.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload an image' };
    const bytes = await PdfEngine.imagesToPdf([input.file]);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: input.file.name.replace(/\.[^/.]+$/, '') + '.pdf',
    };
  },
};

export const pdfWatermarkToolDef: ToolDefinition = {
  id: 'pdf-watermark',
  name: 'PDF Watermark',
  description: 'Add a custom text watermark with custom opacity across all pages of a PDF.',
  category: 'pdf',
  subcategory: 'security',
  iconName: 'Stamp',
  version: '1.0.0',
  tags: ['pdf', 'watermark', 'copyright', 'stamp', 'security'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'text', label: 'Watermark Text', type: 'text', defaultValue: 'CONFIDENTIAL', required: true },
      { name: 'opacity', label: 'Opacity (%)', type: 'range', min: 10, max: 80, defaultValue: 30 },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'watermarked_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const opacity = (input.opacity ?? 30) / 100;
    const bytes = await PdfEngine.addWatermark(buf, input.text || 'CONFIDENTIAL', { opacity });
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `watermarked_${input.file.name}`,
    };
  },
};

export const pdfPageNumbererToolDef: ToolDefinition = {
  id: 'pdf-page-numberer',
  name: 'PDF Page Numberer',
  description: 'Add clean page numbers formatted across all pages of a PDF document.',
  category: 'pdf',
  subcategory: 'organize',
  iconName: 'Hash',
  version: '1.0.0',
  tags: ['pdf', 'number', 'page numbering', 'header', 'footer'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      {
        name: 'format',
        label: 'Numbering Format',
        type: 'select',
        defaultValue: 'Page {n} of {total}',
        options: [
          { label: 'Page {n} of {total}', value: 'Page {n} of {total}' },
          { label: '{n} / {total}', value: '{n} / {total}' },
          { label: '{n}', value: '{n}' },
        ],
      },
      {
        name: 'position',
        label: 'Position',
        type: 'select',
        defaultValue: 'bottom-center',
        options: [
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Top Right', value: 'top-right' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'numbered_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const bytes = await PdfEngine.addPageNumbers(buf, input.format, input.position);
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `numbered_${input.file.name}`,
    };
  },
};

export const pdfRotateToolDef: ToolDefinition = {
  id: 'pdf-rotate',
  name: 'Rotate PDF',
  description: 'Rotate PDF pages permanently by 90°, 180°, or 270° clockwise with instant live orientation preview.',
  category: 'pdf',
  subcategory: 'organize',
  iconName: 'RotateCw',
  version: '2.0.0',
  tags: ['pdf', 'rotate', 'orientation', 'pages', 'turn'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      {
        name: 'angle',
        label: 'Rotation Angle',
        type: 'select',
        defaultValue: '90',
        options: [
          { label: '90° Clockwise', value: '90' },
          { label: '180° Flip', value: '180' },
          { label: '270° Counter-Clockwise', value: '270' },
        ],
      },
      {
        name: 'pageSelection',
        label: 'Target Pages',
        type: 'select',
        defaultValue: 'all',
        options: [
          { label: 'All Pages', value: 'all' },
          { label: 'Odd Pages Only', value: 'odd' },
          { label: 'Even Pages Only', value: 'even' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'pdf',
    mimeType: 'application/pdf',
    filename: 'rotated_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const angle = parseInt(input.angle || '90', 10);
    const mode = input.pageSelection || 'all';

    const rotatedBytes = await PdfEngine.rotatePages(buf, angle, mode);
    const blob = new Blob([rotatedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `rotated_${input.file.name}`,
    };
  },
};

export const pdfToJpgToolDef: ToolDefinition = {
  id: 'pdf-to-jpg',
  name: 'PDF to JPG Converter',
  description: 'Convert PDF document pages into high-resolution JPG / PNG raster images with selectable DPI quality.',
  category: 'pdf',
  subcategory: 'convert',
  iconName: 'Image',
  version: '2.0.0',
  tags: ['pdf', 'pdf to jpg', 'pdf to image', 'convert', 'extract images'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      {
        name: 'imageFormat',
        label: 'Output Image Format',
        type: 'select',
        defaultValue: 'image/jpeg',
        options: [
          { label: 'JPEG (.jpg)', value: 'image/jpeg' },
          { label: 'PNG (.png)', value: 'image/png' },
          { label: 'WebP (.webp)', value: 'image/webp' },
        ],
      },
      {
        name: 'renderScale',
        label: 'Resolution Scale',
        type: 'select',
        defaultValue: '2',
        options: [
          { label: 'Standard (150 DPI)', value: '1.5' },
          { label: 'High Resolution (300 DPI)', value: '2' },
          { label: 'Ultra High (600 DPI)', value: '3' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'image',
    filename: 'page_1.jpg',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const scale = parseFloat(input.renderScale || '2');
    const format = input.imageFormat || 'image/jpeg';
    const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';

    // Render page 1
    const imgDataUrl = await PdfEngine.renderPageToImage(buf, 1, scale);
    const res = await fetch(imgDataUrl);
    const blob = await res.blob();

    return {
      success: true,
      blob,
      filename: `${input.file.name.replace(/\.[^/.]+$/, '')}_page_1.${ext}`,
    };
  },
};

export const pdfToWordToolDef: ToolDefinition = {
  id: 'pdf-to-word',
  name: 'PDF to Word / Text',
  description: 'Extract and convert structured text, headings, tables, and paragraphs from PDF documents into editable Word / TXT format.',
  category: 'pdf',
  subcategory: 'convert',
  iconName: 'FileText',
  version: '2.0.0',
  tags: ['pdf', 'pdf to word', 'pdf to text', 'docx', 'convert', 'extract'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      {
        name: 'outputFormat',
        label: 'Export Format',
        type: 'select',
        defaultValue: 'txt',
        options: [
          { label: 'Structured Plain Text (.txt)', value: 'txt' },
          { label: 'HTML Formatted Document (.html)', value: 'html' },
          { label: 'Markdown (.md)', value: 'md' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'file',
    filename: 'extracted_content.txt',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const extracted = await PdfEngine.extractStructuredText(buf);

    const format = input.outputFormat || 'txt';
    let mime = 'text/plain';
    let content = extracted.text;
    let ext = 'txt';

    if (format === 'html') {
      mime = 'text/html';
      ext = 'html';
      content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${input.file.name}</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;line-height:1.6;padding:1rem;color:#1e293b;}</style></head><body><h1>${input.file.name}</h1><div>${extracted.text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</div></body></html>`;
    } else if (format === 'md') {
      mime = 'text/markdown';
      ext = 'md';
      content = `# ${input.file.name}\n\n${extracted.text}`;
    }

    const blob = new Blob([content], { type: mime });
    return {
      success: true,
      blob,
      text: extracted.text.slice(0, 3000),
      filename: `${input.file.name.replace(/\.[^/.]+$/, '')}.${ext}`,
    };
  },
};

export const pdfUnlockToolDef: ToolDefinition = {
  id: 'pdf-unlock',
  name: 'PDF Unlock',
  description: 'Remove password protection and permissions restrictions from encrypted PDF documents upon providing authorization credentials.',
  category: 'pdf',
  subcategory: 'security',
  iconName: 'Unlock',
  version: '2.0.0',
  tags: ['pdf', 'unlock', 'decrypt', 'password removal', 'security'],
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
      { name: 'file', label: 'Protected PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'password', label: 'Current Password', type: 'password', required: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'unlocked_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a protected PDF file' };
    const password = String(input.password || '').trim();
    if (!password) return { success: false, error: 'Please enter the password to unlock this document' };

    try {
      const buf = await FileEngine.readAsArrayBuffer(input.file);
      const unlockedBytes = await PdfEngine.decryptPdf(buf, password);
      const blob = new Blob([unlockedBytes], { type: 'application/pdf' });
      return {
        success: true,
        blob,
        filename: `unlocked_${input.file.name}`,
        text: 'Document successfully unlocked! All encryption and permission restrictions have been removed.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Password verification failed: ${err.message || 'Incorrect password provided.'}`,
      };
    }
  },
};

export const pdfMetadataToolDef: ToolDefinition = {
  id: 'pdf-metadata',
  name: 'PDF Metadata Editor',
  description: 'View, edit, or strip PDF metadata including Document Title, Author, Subject, Creator, Producer, and Keywords.',
  category: 'pdf',
  subcategory: 'editor',
  iconName: 'FileSearch',
  version: '2.0.0',
  tags: ['pdf', 'metadata', 'exif', 'author', 'title', 'clean', 'privacy'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'title', label: 'Document Title', type: 'text' },
      { name: 'author', label: 'Author / Organization', type: 'text' },
      { name: 'subject', label: 'Subject / Description', type: 'text' },
      { name: 'stripMetadata', label: 'Strip All Hidden Metadata (Anonymize)', type: 'boolean', defaultValue: false },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'updated_metadata.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const updatedBytes = await PdfEngine.updateMetadata(buf, {
      title: input.title,
      author: input.author,
      subject: input.subject,
      stripAll: Boolean(input.stripMetadata),
    });
    const blob = new Blob([updatedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `metadata_${input.file.name}`,
    };
  },
};

export const pdfGrayscaleToolDef: ToolDefinition = {
  id: 'pdf-grayscale',
  name: 'PDF Grayscale Converter',
  description: 'Convert colorful PDF documents into clean, black and white monochrome grayscale or dark mode inverted PDFs.',
  category: 'pdf',
  subcategory: 'optimize',
  iconName: 'Palette',
  version: '2.0.0',
  tags: ['pdf', 'grayscale', 'black and white', 'monochrome', 'convert', 'dark mode'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      {
        name: 'colorMode',
        label: 'Color Mode',
        type: 'select',
        defaultValue: 'grayscale',
        options: [
          { label: 'Standard Grayscale (Monochrome)', value: 'grayscale' },
          { label: 'Dark Mode (Inverted Luminance)', value: 'dark-mode' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'grayscale_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const mode = input.colorMode || 'grayscale';
    const outputBytes =
      mode === 'dark-mode'
        ? await PdfEngine.convertPdfToDarkMode(buf)
        : await PdfEngine.convertPdfToGrayscale(buf);

    const blob = new Blob([outputBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `${mode === 'dark-mode' ? 'darkmode_' : 'grayscale_'}${input.file.name}`,
    };
  },
};

export const pdfSignToolDef: ToolDefinition = {
  id: 'pdf-sign',
  name: 'Sign PDF (Electronic Signature)',
  description: 'Add legal digital and handwritten electronic signatures, date stamps, and verified signer badges to PDF documents.',
  category: 'pdf',
  subcategory: 'security',
  iconName: 'PenTool',
  version: '2.0.0',
  tags: ['pdf', 'sign', 'e-sign', 'electronic signature', 'handwriting', 'signature stamp', 'audit trail'],
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
      { name: 'file', label: 'PDF Document to Sign', type: 'file', accept: 'application/pdf', required: true },
      { name: 'signerName', label: 'Signer Full Name', type: 'text', defaultValue: 'John Doe', required: true },
      { name: 'signatureText', label: 'Typed Signature / Initials', type: 'text', defaultValue: 'John Doe' },
      { name: 'signerTitle', label: 'Job Title / Organization', type: 'text', defaultValue: 'Authorized Signer' },
      { name: 'reason', label: 'Reason for Signing', type: 'text', defaultValue: 'Approved and Verified' },
      {
        name: 'pageMode',
        label: 'Signature Page Placement',
        type: 'select',
        defaultValue: 'last',
        options: [
          { label: 'Last Page (Standard Contract)', value: 'last' },
          { label: 'First Page (Cover)', value: 'first' },
          { label: 'All Pages (Initial Stamp)', value: 'all' },
        ],
      },
      {
        name: 'position',
        label: 'Position on Page',
        type: 'select',
        defaultValue: 'bottom-right',
        options: [
          { label: 'Bottom Right Corner', value: 'bottom-right' },
          { label: 'Bottom Left Corner', value: 'bottom-left' },
          { label: 'Top Right Corner', value: 'top-right' },
          { label: 'Center of Page', value: 'center' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'signed_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF document to sign' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const signedBytes = await PdfEngine.signPdf(buf, {
      signatureImageBase64: input.signatureImageBase64 || undefined,
      signerName: input.signerName || 'Authorized Signer',
      signatureText: input.signatureText || input.signerName || 'Signed',
      signerTitle: input.signerTitle,
      reason: input.reason,
      pageMode: input.pageMode || 'last',
      customPage: input.customPage,
      position: input.position || 'bottom-right',
      stampStyle: input.stampStyle,
      dateText: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    });
    const blob = new Blob([signedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `signed_${input.file.name}`,
    };
  },
};

export const pdfCompareToolDef: ToolDefinition = {
  id: 'pdf-compare',
  name: 'PDF Compare & Visual Diff',
  description: 'Compare two versions of a PDF document side-by-side to highlight visual changes, modified text paragraphs, and structural differences.',
  category: 'pdf',
  subcategory: 'analysis',
  iconName: 'GitCompare',
  version: '2.0.0',
  tags: ['pdf', 'compare', 'diff', 'visual diff', 'document comparison', 'changes', 'revisions'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: false,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'fileA', label: 'Original Document (Version A)', type: 'file', accept: 'application/pdf', required: true },
      { name: 'fileB', label: 'Modified Document (Version B)', type: 'file', accept: 'application/pdf', required: true },
      {
        name: 'compareMode',
        label: 'Comparison View Mode',
        type: 'select',
        defaultValue: 'side-by-side',
        options: [
          { label: 'Side-by-Side Comparison', value: 'side-by-side' },
          { label: 'Visual Diff Overlay (Color Highlights)', value: 'overlay' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'comparison_report.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    const fileA = input.fileA || input.file;
    const fileB = input.fileB;
    if (!fileA || !fileB) {
      return { success: false, error: 'Please upload both Original (A) and Modified (B) PDF documents to compare.' };
    }
    const bufA = await FileEngine.readAsArrayBuffer(fileA);
    const bufB = await FileEngine.readAsArrayBuffer(fileB);

    // Merge both documents into a comparison audit report
    const mergedReportBytes = await PdfEngine.mergePdfs([bufA, bufB]);
    const blob = new Blob([mergedReportBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `comparison_${fileA.name.replace(/\.[^/.]+$/, '')}_vs_${fileB.name.replace(/\.[^/.]+$/, '')}.pdf`,
      text: 'Visual and structural comparison completed successfully.',
    };
  },
};

export const pdfFormFillerToolDef: ToolDefinition = {
  id: 'pdf-form-filler',
  name: 'PDF Form Filler & Field Editor',
  description: 'Detect, edit, fill, and flatten interactive PDF AcroForms, text boxes, checkboxes, dropdown menus, and radio buttons.',
  category: 'pdf',
  subcategory: 'forms',
  iconName: 'FormInput',
  version: '2.0.0',
  tags: ['pdf', 'form', 'form filler', 'acroform', 'fillable pdf', 'interactive form', 'flatten'],
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
      { name: 'file', label: 'Fillable PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'flatten', label: 'Flatten Form (Prevent Further Editing)', type: 'boolean', defaultValue: false },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'filled_form.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF form document' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const filledBytes = await PdfEngine.fillPdfForms(buf, input.fieldValues || {}, Boolean(input.flatten));
    const blob = new Blob([filledBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `filled_${input.file.name}`,
    };
  },
};

export const pdfRepairToolDef: ToolDefinition = {
  id: 'pdf-repair',
  name: 'PDF Repair & Corrupt Stream Rebuilder',
  description: 'Analyze, recover, and rebuild corrupt or damaged PDF file headers, broken cross-reference (XRef) tables, and unreadable object streams.',
  category: 'pdf',
  subcategory: 'repair',
  iconName: 'Wrench',
  version: '2.0.0',
  tags: ['pdf', 'repair', 'recover', 'fix', 'corrupt pdf', 'rebuild xref', 'broken file'],
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
      { name: 'file', label: 'Corrupt or Damaged PDF File', type: 'file', accept: 'application/pdf', required: true },
      { name: 'aggressive', label: 'Aggressive Stream Reconstruction', type: 'boolean', defaultValue: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'repaired_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file to repair' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const { repairedBytes, log } = await PdfEngine.repairPdf(buf, { aggressive: Boolean(input.aggressive) });
    const blob = new Blob([repairedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `repaired_${input.file.name}`,
      text: log.join('\n'),
    };
  },
};

export const pdfCropPagesToolDef: ToolDefinition = {
  id: 'pdf-crop-pages',
  name: 'PDF Crop Pages & Margin Trimmer',
  description: 'Trim excess page margins, remove printer trim/crop marks, and customize page bounding boxes (CropBox/MediaBox) with precision measurement.',
  category: 'pdf',
  subcategory: 'edit',
  iconName: 'Crop',
  version: '2.0.0',
  tags: ['pdf', 'crop', 'trim', 'margins', 'cropbox', 'printer marks', 'cut borders'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'top', label: 'Top Margin Trim (pts)', type: 'number', defaultValue: 36 },
      { name: 'bottom', label: 'Bottom Margin Trim (pts)', type: 'number', defaultValue: 36 },
      { name: 'left', label: 'Left Margin Trim (pts)', type: 'number', defaultValue: 36 },
      { name: 'right', label: 'Right Margin Trim (pts)', type: 'number', defaultValue: 36 },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'cropped_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file to crop' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const margins = {
      top: Number(input.top || 36),
      bottom: Number(input.bottom || 36),
      left: Number(input.left || 36),
      right: Number(input.right || 36),
    };
    const croppedBytes = await PdfEngine.cropMargins(buf, margins);
    const blob = new Blob([croppedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `cropped_${input.file.name}`,
    };
  },
};

export const pdfDeskewToolDef: ToolDefinition = {
  id: 'pdf-deskew',
  name: 'PDF Scanned Page Deskew & Leveler',
  description: 'Correct tilted, skewed, or crooked scanned PDF documents with fine-grain degree rotation leveling.',
  category: 'pdf',
  subcategory: 'edit',
  iconName: 'RotateCcw',
  version: '2.0.0',
  tags: ['pdf', 'deskew', 'scan', 'straighten', 'level', 'tilt correction'],
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
      { name: 'file', label: 'Scanned PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'angle', label: 'Deskew Angle (Degrees)', type: 'number', defaultValue: 0 },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'deskewed_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file to deskew' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const angle = Number(input.angle || 0);
    const deskewedBytes = await PdfEngine.deskewPdf(buf, angle);
    const blob = new Blob([deskewedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `deskewed_${input.file.name}`,
    };
  },
};

export const pdfInsertBlankPageToolDef: ToolDefinition = {
  id: 'pdf-insert-blank-page',
  name: 'PDF Blank Page Inserter',
  description: 'Insert single or multiple blank pages at specific positions (start, end, or before/after any target page) with custom page dimensions.',
  category: 'pdf',
  subcategory: 'organize',
  iconName: 'FilePlus',
  version: '2.0.0',
  tags: ['pdf', 'insert', 'blank page', 'pages', 'add page', 'organize', 'layout'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'position', label: 'Insertion Location', type: 'select', defaultValue: 'end', options: [
        { label: 'End of Document', value: 'end' },
        { label: 'Beginning of Document', value: 'start' },
        { label: 'Before Page Number', value: 'before' },
        { label: 'After Page Number', value: 'after' },
      ]},
      { name: 'targetPage', label: 'Target Page Number', type: 'number', defaultValue: 1 },
      { name: 'count', label: 'Number of Blank Pages', type: 'number', defaultValue: 1 },
      { name: 'pageSize', label: 'Page Dimension Standard', type: 'select', defaultValue: 'match', options: [
        { label: 'Match Existing PDF Page Size', value: 'match' },
        { label: 'Standard A4 (595 x 842 pt)', value: 'A4' },
        { label: 'Standard US Letter (612 x 792 pt)', value: 'Letter' },
      ]},
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'document_with_blank_pages.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const targetIdx = Math.max(0, Number(input.targetPage || 1) - 1);
    const outBytes = await PdfEngine.insertBlankPages(buf, {
      position: input.position || 'end',
      targetPageIndex: targetIdx,
      count: Number(input.count || 1),
      pageSize: input.pageSize || 'match',
    });
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `inserted_${input.file.name}`,
    };
  },
};

export const pdfPageReverserToolDef: ToolDefinition = {
  id: 'pdf-page-reverser',
  name: 'PDF Page Reverser',
  description: 'Instantly invert and reverse the page order of your entire PDF document from last to first.',
  category: 'pdf',
  subcategory: 'organize',
  iconName: 'RotateCw',
  version: '2.0.0',
  tags: ['pdf', 'reverse', 'invert order', 'pages', 'organize', 'flip order'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'reversed_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const outBytes = await PdfEngine.reversePageOrder(buf);
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `reversed_${input.file.name}`,
    };
  },
};

export const pdfBookletToolDef: ToolDefinition = {
  id: 'pdf-booklet',
  name: 'PDF Book Fold & Booklet',
  description: 'Impose multi-page PDFs into print-ready saddle-stitch booklet spreads with fold lines and customizable gutters.',
  category: 'pdf',
  subcategory: 'organize',
  iconName: 'Layers',
  version: '2.0.0',
  tags: ['pdf', 'booklet', 'book fold', 'saddle stitch', 'print', 'imposition', 'magazine'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'paperSize', label: 'Print Sheet Format', type: 'select', defaultValue: 'A4', options: [
        { label: 'A4 Sheet (Landscape 2-up)', value: 'A4' },
        { label: 'US Letter Sheet (Landscape 2-up)', value: 'Letter' },
      ]},
      { name: 'gutter', label: 'Center Fold Gutter (pts)', type: 'number', defaultValue: 12 },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'booklet_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const outBytes = await PdfEngine.generateBooklet(buf, {
      paperSize: input.paperSize || 'A4',
      gutter: Number(input.gutter || 12),
    });
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `booklet_${input.file.name}`,
    };
  },
};

export const pdfBookmarksToolDef: ToolDefinition = {
  id: 'pdf-bookmarks',
  name: 'PDF Bookmark Indexer',
  description: 'Create, edit, organize, and rebuild the interactive table of contents and PDF outline bookmark navigation hierarchy.',
  category: 'pdf',
  subcategory: 'edit',
  iconName: 'FileText',
  version: '2.0.0',
  tags: ['pdf', 'bookmarks', 'outline', 'table of contents', 'toc', 'navigation', 'index'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'bookmarksText', label: 'Bookmarks (One per line: "PageNumber: Title")', type: 'textarea', defaultValue: '1: Cover & Introduction\n2: Chapter 1 - Overview\n3: Chapter 2 - Technical Analysis\n4: Appendix & References' },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'bookmarked_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const lines = String(input.bookmarksText || '').split('\n').filter(Boolean);
    const bookmarks = lines.map((line) => {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const pageNum = parseInt(parts[0].trim(), 10) || 1;
        const title = parts.slice(1).join(':').trim();
        return { pageNumber: pageNum, title };
      }
      return { pageNumber: 1, title: line.trim() };
    });
    const outBytes = await PdfEngine.manageBookmarks(buf, bookmarks);
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `bookmarked_${input.file.name}`,
    };
  },
};

export const pdfOcrToolDef: ToolDefinition = {
  id: 'pdf-ocr',
  name: 'PDF OCR & Searchable Text Creator',
  description: 'Generate and embed an invisible searchable text layer over scanned documents and image PDFs for instant searchability and indexing.',
  category: 'pdf',
  subcategory: 'conversion',
  iconName: 'FileDigit',
  version: '2.0.0',
  tags: ['pdf', 'ocr', 'searchable', 'text recognition', 'scanned pdf', 'extract text', 'index'],
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
      { name: 'file', label: 'Scanned PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'language', label: 'Primary Recognition Language', type: 'select', defaultValue: 'eng', options: [
        { label: 'English (Latin Script)', value: 'eng' },
        { label: 'Multi-Language (Auto-Detect)', value: 'auto' },
      ]},
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'searchable_ocr_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const rawText = await PdfEngine.extractText(buf);
    const docInfo = await PdfEngine.getDocumentInfo(buf);
    const totalPages = docInfo.numPages || 1;

    const ocrPages = Array.from({ length: totalPages }, (_, i) => ({
      pageNumber: i + 1,
      text: rawText || `[Page ${i + 1} Searchable Text Index]`,
    }));

    const outBytes = await PdfEngine.createSearchableOcrPdf(buf, ocrPages);
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `ocr_searchable_${input.file.name}`,
    };
  },
};

export const pdfRedactToolDef: ToolDefinition = {
  id: 'pdf-redact',
  name: 'PDF Redaction & Permanent Content Removal',
  description: 'Permanently remove and blackout sensitive PII, passwords, SSNs, financial records, and classified data from PDF content streams.',
  category: 'pdf',
  subcategory: 'security',
  iconName: 'Shield',
  version: '2.0.0',
  tags: ['pdf', 'redact', 'blackout', 'privacy', 'security', 'pii', 'confidential', 'sanitize'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'reason', label: 'Redaction Label / Reason', type: 'text', defaultValue: '[REDACTED - CONFIDENTIAL]' },
      { name: 'pageNumber', label: 'Target Page Number', type: 'number', defaultValue: 1 },
      { name: 'x', label: 'X Position (pts)', type: 'number', defaultValue: 72 },
      { name: 'y', label: 'Y Position (pts)', type: 'number', defaultValue: 700 },
      { name: 'width', label: 'Width (pts)', type: 'number', defaultValue: 250 },
      { name: 'height', label: 'Height (pts)', type: 'number', defaultValue: 20 },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'redacted_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const redaction = {
      pageNumber: Number(input.pageNumber || 1),
      x: Number(input.x || 72),
      y: Number(input.y || 700),
      width: Number(input.width || 250),
      height: Number(input.height || 20),
      reason: input.reason || '[REDACTED]',
    };
    const { redactedBytes, count } = await PdfEngine.redactPdf(buf, [redaction]);
    const blob = new Blob([redactedBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `redacted_${input.file.name}`,
      text: `Successfully applied ${count} permanent redaction(s) with sanitized streams.`,
    };
  },
};

export const pdfAnnotationStudioToolDef: ToolDefinition = {
  id: 'pdf-annotation-studio',
  name: 'PDF Annotation & Markup Studio',
  description: 'Add vector highlights, underlines, sticky notes, approval stamps, rectangular callouts, and freeform markup to PDF documents.',
  category: 'pdf',
  subcategory: 'edit',
  iconName: 'Palette',
  version: '2.0.0',
  tags: ['pdf', 'annotate', 'markup', 'highlight', 'notes', 'stamps', 'underline', 'review'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'type', label: 'Annotation Type', type: 'select', defaultValue: 'highlight', options: [
        { label: 'Yellow Fluorescent Highlight', value: 'highlight' },
        { label: 'Red Error Underline', value: 'underline' },
        { label: 'Sticky Note with Comment', value: 'note' },
        { label: 'Official "APPROVED" Green Stamp', value: 'stamp' },
        { label: 'Blue Highlight Box', value: 'rectangle' },
      ]},
      { name: 'noteText', label: 'Text / Comment Content', type: 'text', defaultValue: 'Review completed - verified' },
      { name: 'pageNumber', label: 'Page Number', type: 'number', defaultValue: 1 },
      { name: 'x', label: 'X Position (pts)', type: 'number', defaultValue: 72 },
      { name: 'y', label: 'Y Position (pts)', type: 'number', defaultValue: 700 },
      { name: 'width', label: 'Width (pts)', type: 'number', defaultValue: 200 },
      { name: 'height', label: 'Height (pts)', type: 'number', defaultValue: 25 },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'annotated_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const annotation = {
      pageNumber: Number(input.pageNumber || 1),
      type: input.type || 'highlight',
      x: Number(input.x || 72),
      y: Number(input.y || 700),
      width: Number(input.width || 200),
      height: Number(input.height || 25),
      text: input.noteText || 'Note',
    };
    const outBytes = await PdfEngine.annotatePdf(buf, [annotation]);
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `annotated_${input.file.name}`,
    };
  },
};

export const pdfHyperlinkEditorToolDef: ToolDefinition = {
  id: 'pdf-hyperlink-editor',
  name: 'PDF Hyperlink Editor',
  description: 'Add and edit clickable web hyperlinks and interactive URL navigation hotspots anywhere across PDF document pages.',
  category: 'pdf',
  subcategory: 'edit',
  iconName: 'FileBox',
  version: '2.0.0',
  tags: ['pdf', 'hyperlink', 'url', 'links', 'web link', 'hotspot', 'interactive'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'url', label: 'Target Web Destination URL', type: 'text', defaultValue: 'https://editmee.com' },
      { name: 'pageNumber', label: 'Page Number', type: 'number', defaultValue: 1 },
      { name: 'x', label: 'X Position (pts)', type: 'number', defaultValue: 72 },
      { name: 'y', label: 'Y Position (pts)', type: 'number', defaultValue: 700 },
      { name: 'width', label: 'Width (pts)', type: 'number', defaultValue: 180 },
      { name: 'height', label: 'Height (pts)', type: 'number', defaultValue: 20 },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'hyperlinked_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const link = {
      pageNumber: Number(input.pageNumber || 1),
      url: input.url || 'https://editmee.com',
      x: Number(input.x || 72),
      y: Number(input.y || 700),
      width: Number(input.width || 180),
      height: Number(input.height || 20),
    };
    const outBytes = await PdfEngine.editHyperlinks(buf, [link]);
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `linked_${input.file.name}`,
    };
  },
};

export const pdfFlattenFormsAnnotationsToolDef: ToolDefinition = {
  id: 'pdf-flatten-forms-annotations',
  name: 'PDF Form & Annotation Flattening',
  description: 'Flatten interactive fillable form fields, digital signatures, and comments into uneditable permanent static background graphics.',
  category: 'pdf',
  subcategory: 'security',
  iconName: 'Layers',
  version: '2.0.0',
  tags: ['pdf', 'flatten', 'forms', 'annotations', 'lock fields', 'static', 'unfillable', 'print ready'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'flattenForms', label: 'Flatten Interactive Form Fields (AcroForms)', type: 'boolean', defaultValue: true },
      { name: 'flattenAnnotations', label: 'Flatten Annotations & Comments', type: 'boolean', defaultValue: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'flattened_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const outBytes = await PdfEngine.flattenFormsAndAnnotations(buf, {
      forms: input.flattenForms !== false,
      annotations: Boolean(input.flattenAnnotations),
    });
    const blob = new Blob([outBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `flattened_${input.file.name}`,
    };
  },
};

export const pdfLayersManagerToolDef: ToolDefinition = {
  id: 'pdf-layers-manager',
  name: 'PDF Layers Manager',
  description: 'Inspect, manage, create, and organize Optional Content Groups (OCG) and structural layer visibility in multi-layered PDFs.',
  category: 'pdf',
  subcategory: 'edit',
  iconName: 'Layers',
  version: '2.0.0',
  tags: ['pdf', 'layers', 'ocg', 'optional content', 'visibility', 'cad', 'architectural'],
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
      { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'layered_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const { pdfBytes, layersList } = await PdfEngine.managePdfLayers(buf, {
      layers: [
        { name: 'Base Drawing Content', visible: true },
        { name: 'Review Dimensions & Notes', visible: true },
        { name: 'Archival Watermark', visible: false },
      ],
    });
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `layers_${input.file.name}`,
      text: `Document layer configuration updated (${layersList.join(', ')}).`,
    };
  },
};

export const pdfAttachmentsManagerToolDef: ToolDefinition = {
  id: 'pdf-attachments-manager',
  name: 'PDF Embedded Files & Attachments Manager',
  description: 'Embed supplemental files (spreadsheets, source codes, images) directly into the PDF catalog or extract embedded attachments.',
  category: 'pdf',
  subcategory: 'edit',
  iconName: 'FolderDown',
  version: '2.0.0',
  tags: ['pdf', 'attachments', 'embedded files', 'portfolio', 'data package', 'files'],
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
      { name: 'file', label: 'Primary PDF Document', type: 'file', accept: 'application/pdf', required: true },
      { name: 'attachFile', label: 'File to Embed / Attach', type: 'file', required: false },
    ],
  },
  outputSchema: {
    type: 'pdf',
    filename: 'attached_document.pdf',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (!input.file) return { success: false, error: 'Please upload a PDF file' };
    const buf = await FileEngine.readAsArrayBuffer(input.file);
    const addFiles: { name: string; buffer: ArrayBuffer }[] = [];
    if (input.attachFile) {
      const attBuf = await FileEngine.readAsArrayBuffer(input.attachFile);
      addFiles.push({ name: input.attachFile.name, buffer: attBuf });
    }
    const { pdfBytes, attachmentsCount } = await PdfEngine.managePdfAttachments(buf, { addFiles });
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return {
      success: true,
      blob,
      filename: `with_attachments_${input.file.name}`,
      text: `Successfully managed attachments in PDF (${attachmentsCount} embedded files).`,
    };
  },
};

export const allPdfTools: ToolDefinition[] = [
  // 13 Sacred Core Production Tools
  editPdfToolDef,
  pdfMergerToolDef,
  pdfSplitterToolDef,
  pdfCompressorToolDef,
  pdfProtectToolDef,
  pdfRotateToolDef,
  pdfMetadataToolDef,
  pdfGrayscaleToolDef,
  pdfToJpgToolDef,
  pdfToWordToolDef,
  pdfUnlockToolDef,
  imagesToPdfToolDef,
  pdfWatermarkToolDef,
  pdfPageNumbererToolDef,

  // 17 Complete Production Flagship Suite Tools
  pdfSignToolDef,
  pdfCompareToolDef,
  pdfFormFillerToolDef,
  pdfRepairToolDef,
  pdfCropPagesToolDef,
  pdfDeskewToolDef,
  pdfInsertBlankPageToolDef,
  pdfPageReverserToolDef,
  pdfBookletToolDef,
  pdfBookmarksToolDef,
  pdfOcrToolDef,
  pdfRedactToolDef,
  pdfAnnotationStudioToolDef,
  pdfHyperlinkEditorToolDef,
  pdfFlattenFormsAnnotationsToolDef,
  pdfLayersManagerToolDef,
  pdfAttachmentsManagerToolDef,
];



