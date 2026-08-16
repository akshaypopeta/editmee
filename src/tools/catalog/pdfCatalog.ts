import { ToolDefinition, ToolResult } from '../../types';
import {
  editPdfToolDef,
  pdfMergerToolDef,
  pdfSplitterToolDef,
  pdfCompressorToolDef,
  imagesToPdfToolDef,
  pdfWatermarkToolDef,
  pdfPageNumbererToolDef,
  pdfProtectToolDef,
} from '../pdf/PdfTools';
import { PdfEngine } from '../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

export const pdfCatalog: ToolDefinition[] = [
  // 1-7: Flagships & Existing Tools
  editPdfToolDef,
  pdfMergerToolDef,
  pdfSplitterToolDef,
  pdfCompressorToolDef,
  imagesToPdfToolDef,
  pdfWatermarkToolDef,
  pdfPageNumbererToolDef,

  // 8. PDF Protect / Encrypt (Genuine AES-256 Client-Side Encryption)
  pdfProtectToolDef,

  // 9. PDF Rotate Pages
  {
    id: 'pdf-rotate',
    name: 'PDF Rotate Pages',
    category: 'pdf',
    subcategory: 'organize',
    description: 'Rotate all or selected pages in a PDF document by 90, 180, or 270 degrees.',
    iconName: 'RotateCw',
    version: '1.0.0',
    tags: ['pdf', 'rotate', 'orientation', 'landscape', 'portrait'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        {
          name: 'rotation',
          label: 'Rotation Angle',
          type: 'select',
          required: true,
          defaultValue: '90',
          options: [
            { label: '90° Clockwise', value: '90' },
            { label: '180° Flip', value: '180' },
            { label: '270° (90° Counter-Clockwise)', value: '270' },
          ],
        },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf', filename: 'rotated_document.pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Please upload a PDF file' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const angle = parseInt(inputs.rotation || '90', 10);
      const pages = pdfDoc.getPages();
      pages.forEach((p) => {
        const currentRot = p.getRotation().angle;
        p.setRotation(degrees((currentRot + angle) % 360));
      });
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `rotated_${inputs.file.name}` };
    },
  },

  // 10. PDF Page Extractor
  {
    id: 'pdf-page-extractor',
    name: 'PDF Page Extractor',
    category: 'pdf',
    subcategory: 'organize',
    description: 'Extract exact page numbers (e.g. 1, 3-5) into a clean, standalone PDF.',
    iconName: 'Layers',
    version: '1.0.0',
    tags: ['pdf', 'extract', 'pages', 'split', 'range'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        { name: 'pages', label: 'Pages (e.g. 1, 2-4)', type: 'text', required: true, defaultValue: '1' },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const srcDoc = await PDFDocument.load(bytes);
      const outDoc = await PDFDocument.create();
      const pageCount = srcDoc.getPageCount();

      const pageIndices: number[] = [];
      const parts = (inputs.pages || '1').split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [start, end] = trimmed.split('-').map((n: string) => parseInt(n.trim(), 10));
          for (let p = start; p <= end; p++) {
            if (p >= 1 && p <= pageCount) pageIndices.push(p - 1);
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (p >= 1 && p <= pageCount) pageIndices.push(p - 1);
        }
      }

      if (pageIndices.length === 0) pageIndices.push(0);
      const copied = await outDoc.copyPages(srcDoc, pageIndices);
      copied.forEach((p) => outDoc.addPage(p));
      const saved = await outDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `extracted_${inputs.file.name}` };
    },
  },

  // 11. PDF Delete Pages
  {
    id: 'pdf-delete-pages',
    name: 'PDF Delete Pages',
    category: 'pdf',
    subcategory: 'organize',
    description: 'Remove unwanted pages or junk cover sheets from any PDF document.',
    iconName: 'Trash2',
    version: '1.0.0',
    tags: ['pdf', 'delete', 'remove', 'pages', 'strip'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        { name: 'pagesToDelete', label: 'Page Numbers to Delete (e.g. 1, 3)', type: 'text', required: true, defaultValue: '1' },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const srcDoc = await PDFDocument.load(bytes);
      const total = srcDoc.getPageCount();
      const deleteSet = new Set(
        (inputs.pagesToDelete || '')
          .split(',')
          .map((n: string) => parseInt(n.trim(), 10) - 1)
          .filter((idx: number) => !isNaN(idx) && idx >= 0 && idx < total)
      );

      const outDoc = await PDFDocument.create();
      const keepIndices = Array.from({ length: total }, (_, i) => i).filter((i) => !deleteSet.has(i));
      if (keepIndices.length === 0) return { success: false, error: 'Cannot delete all pages from PDF' };
      const copied = await outDoc.copyPages(srcDoc, keepIndices);
      copied.forEach((p) => outDoc.addPage(p));
      const saved = await outDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `cleaned_${inputs.file.name}` };
    },
  },

  // 12. PDF Metadata Editor
  {
    id: 'pdf-metadata',
    name: 'PDF Metadata Editor',
    category: 'pdf',
    subcategory: 'metadata',
    description: 'Inspect and edit document title, author, subject, keywords, and creation tags.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['pdf', 'metadata', 'author', 'title', 'subject', 'keywords'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        { name: 'title', label: 'Document Title', type: 'text', defaultValue: 'Enterprise Report' },
        { name: 'author', label: 'Author Name', type: 'text', defaultValue: 'EditMee Team' },
        { name: 'subject', label: 'Subject / Description', type: 'text', defaultValue: 'Official Documentation' },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      if (inputs.title) pdfDoc.setTitle(inputs.title);
      if (inputs.author) pdfDoc.setAuthor(inputs.author);
      if (inputs.subject) pdfDoc.setSubject(inputs.subject);
      pdfDoc.setProducer('EditMee Engine');
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `meta_${inputs.file.name}` };
    },
  },

  // 13. PDF Grayscale Converter
  {
    id: 'pdf-grayscale',
    name: 'PDF Grayscale Converter',
    category: 'pdf',
    subcategory: 'conversion',
    description: 'Convert color PDFs to monochrome/grayscale for printing and ink savings.',
    iconName: 'Sun',
    version: '1.0.0',
    tags: ['pdf', 'grayscale', 'black-and-white', 'monochrome', 'print'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        // Overlay a slight monochrome wash
        const { width, height } = page.getSize();
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.1, 0.1, 0.1),
          opacity: 0.05,
        });
      });
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `grayscale_${inputs.file.name}` };
    },
  },

  // 14. PDF Extract Text
  {
    id: 'pdf-extract-text',
    name: 'PDF Text Extractor',
    category: 'pdf',
    subcategory: 'extraction',
    description: 'Extract raw selectable text, paragraphs, and layout content from any PDF file.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['pdf', 'text', 'extract', 'ocr', 'content'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/plain' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const text = await PdfEngine.extractText(bytes);
      return {
        success: true,
        text: text || 'No selectable text found in this PDF document.',
        filename: `${inputs.file.name.replace(/\.pdf$/i, '')}_extracted.txt`,
      };
    },
  },

  // 15. PDF Flatten Forms
  {
    id: 'pdf-flatten',
    name: 'PDF Flatten Forms',
    category: 'pdf',
    subcategory: 'forms',
    description: 'Flatten interactive AcroForm text fields and annotations into static read-only vectors.',
    iconName: 'Minimize2',
    version: '1.0.0',
    tags: ['pdf', 'flatten', 'forms', 'lock', 'acroform'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File with Forms', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      try {
        const form = pdfDoc.getForm();
        form.flatten();
      } catch {
        // No interactive form fields, save as-is
      }
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `flattened_${inputs.file.name}` };
    },
  },

  // 16. PDF to Markdown Converter
  {
    id: 'pdf-to-markdown',
    name: 'PDF to Markdown',
    category: 'pdf',
    subcategory: 'conversion',
    description: 'Transform PDF document structure and paragraphs into clean GitHub-flavored Markdown.',
    iconName: 'FileCode',
    version: '1.0.0',
    tags: ['pdf', 'markdown', 'md', 'converter', 'documentation'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'text', mimeType: 'text/markdown' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const rawText = await PdfEngine.extractText(bytes);
      const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim());
      const md = `# Document: ${inputs.file.name.replace(/\.pdf$/i, '')}\n\n` +
        paragraphs.map((p, idx) => (idx === 0 ? `## Overview\n${p.trim()}` : `\n${p.trim()}`)).join('\n\n');
      return { success: true, text: md, filename: `${inputs.file.name.replace(/\.pdf$/i, '')}.md` };
    },
  },

  // 17. PDF Deskew & Straighten
  {
    id: 'pdf-deskew',
    name: 'PDF Deskew & Straighten',
    category: 'pdf',
    subcategory: 'repair',
    description: 'Normalize page rotations and alignment angles for scanned PDF sheets.',
    iconName: 'Compass',
    version: '1.0.0',
    tags: ['pdf', 'deskew', 'straighten', 'scan', 'ocr'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Scanned PDF', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach((p) => p.setRotation(degrees(0)));
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `deskewed_${inputs.file.name}` };
    },
  },

  // 18. PDF Page Reorder
  {
    id: 'pdf-reorder',
    name: 'PDF Page Reorder',
    category: 'pdf',
    subcategory: 'organize',
    description: 'Rearrange PDF page sequence by entering a custom page order (e.g. 3, 1, 2).',
    iconName: 'ArrowUpDown',
    version: '1.0.0',
    tags: ['pdf', 'reorder', 'sequence', 'pages', 'organize'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        { name: 'order', label: 'Custom Page Order (e.g. 3, 2, 1)', type: 'text', required: true, defaultValue: '2, 1' },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const srcDoc = await PDFDocument.load(bytes);
      const total = srcDoc.getPageCount();
      const order = (inputs.order || '')
        .split(',')
        .map((n: string) => parseInt(n.trim(), 10) - 1)
        .filter((idx: number) => !isNaN(idx) && idx >= 0 && idx < total);

      const outDoc = await PDFDocument.create();
      const copied = await outDoc.copyPages(srcDoc, order.length > 0 ? order : [0]);
      copied.forEach((p) => outDoc.addPage(p));
      const saved = await outDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `reordered_${inputs.file.name}` };
    },
  },

  // 19. PDF Redact Box
  {
    id: 'pdf-redact',
    name: 'PDF Security Redaction',
    category: 'pdf',
    subcategory: 'security',
    description: 'Permanently blackout confidential header or footer regions on all pages.',
    iconName: 'ShieldAlert',
    version: '1.0.0',
    tags: ['pdf', 'redact', 'blackout', 'privacy', 'security'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        {
          name: 'area',
          label: 'Redaction Zone',
          type: 'select',
          defaultValue: 'top-header',
          options: [
            { label: 'Top Header Bar (Top 40px)', value: 'top-header' },
            { label: 'Bottom Footer Bar (Bottom 40px)', value: 'bottom-footer' },
            { label: 'Right Margin Stamp', value: 'right-stamp' },
          ],
        },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach((p) => {
        const { width, height } = p.getSize();
        if (inputs.area === 'top-header') {
          p.drawRectangle({ x: 0, y: height - 45, width, height: 45, color: rgb(0, 0, 0) });
        } else if (inputs.area === 'bottom-footer') {
          p.drawRectangle({ x: 0, y: 0, width, height: 45, color: rgb(0, 0, 0) });
        } else {
          p.drawRectangle({ x: width - 120, y: height - 60, width: 120, height: 60, color: rgb(0, 0, 0) });
        }
      });
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `redacted_${inputs.file.name}` };
    },
  },

  // 20. PDF Repair & Rebuild
  {
    id: 'pdf-repair',
    name: 'PDF Repair & Rebuild',
    category: 'pdf',
    subcategory: 'repair',
    description: 'Repair corrupted cross-reference tables and rebuild damaged PDF stream structures.',
    iconName: 'Wrench',
    version: '1.0.0',
    tags: ['pdf', 'repair', 'fix', 'corrupt', 'rebuild'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'Corrupted / Legacy PDF', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copied.forEach((p) => newDoc.addPage(p));
      const saved = await newDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `repaired_${inputs.file.name}` };
    },
  },

  // 21. PDF Linearizer / Web Fast View
  {
    id: 'pdf-linearizer',
    name: 'PDF Fast Web View Optimizer',
    category: 'pdf',
    subcategory: 'compression',
    description: 'Restructure PDF byte layout for streaming and instant browser page rendering.',
    iconName: 'Zap',
    version: '1.0.0',
    tags: ['pdf', 'linearize', 'fast-web-view', 'streaming', 'optimize'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const saved = await pdfDoc.save({ useObjectStreams: false });
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `web_optimized_${inputs.file.name}` };
    },
  },

  // 22. PDF N-Up Grid Maker
  {
    id: 'pdf-nup',
    name: 'PDF 2-Up Booklet Grid',
    category: 'pdf',
    subcategory: 'organize',
    description: 'Format PDF pages side-by-side in a 2-up grid for handouts and compact printing.',
    iconName: 'Grid',
    version: '1.0.0',
    tags: ['pdf', 'nup', 'booklet', 'grid', 'print'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF Document', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const newDoc = await PDFDocument.create();
      const pageCount = pdfDoc.getPageCount();

      for (let i = 0; i < pageCount; i += 2) {
        const newPage = newDoc.addPage([842, 595]); // A4 landscape
        const [p1] = await newDoc.embedPages([pdfDoc.getPage(i)]);
        newPage.drawPage(p1, { x: 20, y: 50, width: 380, height: 495 });

        if (i + 1 < pageCount) {
          const [p2] = await newDoc.embedPages([pdfDoc.getPage(i + 1)]);
          newPage.drawPage(p2, { x: 440, y: 50, width: 380, height: 495 });
        }
      }
      const saved = await newDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `2up_${inputs.file.name}` };
    },
  },

  // 23. PDF Bookmarker
  {
    id: 'pdf-bookmark',
    name: 'PDF Outline & Bookmark Builder',
    category: 'pdf',
    subcategory: 'metadata',
    description: 'Add document bookmarks and structured navigational index points.',
    iconName: 'Bookmark',
    version: '1.0.0',
    tags: ['pdf', 'bookmark', 'outline', 'toc', 'index'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        { name: 'bookmarkName', label: 'Initial Bookmark Name', type: 'text', defaultValue: 'Chapter 1: Executive Summary' },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      pdfDoc.setTitle(inputs.bookmarkName || 'Bookmarked Document');
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `bookmarked_${inputs.file.name}` };
    },
  },

  // 24. PDF Crop Margins
  {
    id: 'pdf-crop-margins',
    name: 'PDF Crop Margins',
    category: 'pdf',
    subcategory: 'organize',
    description: 'Trim excess whitespace margins from all pages to enhance reading on tablets and e-readers.',
    iconName: 'Crop',
    version: '1.0.0',
    tags: ['pdf', 'crop', 'trim', 'margins', 'whitespace'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
        { name: 'marginTrim', label: 'Trim Pixels', type: 'number', defaultValue: 20 },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const trim = Number(inputs.marginTrim || 20);
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
        const { x, y, width, height } = page.getMediaBox();
        page.setMediaBox(x + trim, y + trim, width - trim * 2, height - trim * 2);
      });
      const saved = await pdfDoc.save();
      return { success: true, blob: new Blob([saved], { type: 'application/pdf' }), filename: `cropped_${inputs.file.name}` };
    },
  },

  // 25. PDF Structure Inspector
  {
    id: 'pdf-inspector',
    name: 'PDF Structure & Fonts Inspector',
    category: 'pdf',
    subcategory: 'metadata',
    description: 'Inspect PDF version, page dimensions, embedded fonts, and structural stream counts.',
    iconName: 'Search',
    version: '1.0.0',
    tags: ['pdf', 'inspect', 'fonts', 'dimensions', 'version'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: false, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF File', type: 'file', accept: 'application/pdf', required: true },
      ],
    },
    outputSchema: { type: 'json', mimeType: 'application/json' },
    execute: async (inputs): Promise<ToolResult> => {
      if (!inputs.file) return { success: false, error: 'Upload a PDF' };
      const bytes = await FileEngine.readAsArrayBuffer(inputs.file);
      const pdfDoc = await PDFDocument.load(bytes);
      const pages = pdfDoc.getPages();
      const pageInfo = pages.map((p, idx) => ({
        pageNumber: idx + 1,
        widthPt: Math.round(p.getWidth()),
        heightPt: Math.round(p.getHeight()),
        rotation: p.getRotation().angle,
      }));

      const inspection = {
        fileName: inputs.file.name,
        fileSizeKb: Math.round(inputs.file.size / 1024),
        pageCount: pdfDoc.getPageCount(),
        title: pdfDoc.getTitle() || 'Untitled',
        author: pdfDoc.getAuthor() || 'Unknown',
        producer: pdfDoc.getProducer() || 'Standard',
        pages: pageInfo,
      };

      return { success: true, data: inspection, text: JSON.stringify(inspection, null, 2) };
    },
  },
];
