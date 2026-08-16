import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { FileEngine } from '../file-engine/FileEngine';

// Safe PDF.js worker setup with local worker and CDN fallback
if (typeof window !== 'undefined') {
  try {
    const origin = window.location.origin || '';
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `${origin}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker setup warning:', e);
  }
}

export interface PdfDocumentInfo {
  numPages: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  fileSize?: number;
  pageSizes: { pageNumber: number; width: number; height: number; rotation: number }[];
}

export interface PdfTextItem {
  id: string;
  str: string;
  x: number; // in PDF points (0 at left)
  y: number; // in PDF points (0 at bottom in PDF, converted to top-left for UI)
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  dir: string;
  transform: number[];
}

export interface PdfPageTextContent {
  pageNumber: number;
  items: PdfTextItem[];
  fullText: string;
}

export interface PdfSearchMatch {
  page: number;
  itemIndex: number;
  matchIndex: number;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AnnotationType =
  | 'text'
  | 'draw'
  | 'highlight'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'image'
  | 'signature'
  | 'stamp'
  | 'redact'
  | 'form-text'
  | 'form-check';

export interface PdfAnnotationObject {
  id: string;
  page: number;
  type: AnnotationType;
  x: number; // in PDF points (top-left origin for easy UI handling)
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  // Text properties
  text?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  fontSize?: number;
  fontFamily?: 'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'TimesRomanBold' | 'Courier' | 'CourierBold';
  fontBold?: boolean;
  fontItalic?: boolean;
  fontUnderline?: boolean;
  fontStrikethrough?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
  // Drawing properties
  points?: { x: number; y: number }[];
  strokeWidth?: number;
  // Media / Stamp properties
  imageDataUrl?: string;
  stampText?: string;
  stampVariant?: 'approved' | 'draft' | 'confidential' | 'urgent' | 'rejected' | 'custom';
  // Form Field properties
  formFieldName?: string;
  formFieldValue?: string | boolean;
  formPlaceholder?: string;
  // Direct text replacement linkage
  originalTextItem?: {
    x: number;
    y: number;
    width: number;
    height: number;
    originalStr: string;
  };
}

export interface PdfWatermarkOptions {
  text?: string;
  opacity?: number;
  fontSize?: number;
  colorHex?: string;
  rotation?: number;
  isDiagonal?: boolean;
  imageDataUrl?: string;
}

export interface PdfExportOptions {
  annotations: PdfAnnotationObject[];
  watermark?: PdfWatermarkOptions;
  pageNumbers?: {
    enabled: boolean;
    format: 'Page {n} of {total}' | '{n} / {total}' | '{n}';
    position: 'bottom-center' | 'bottom-right' | 'top-right';
  };
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creator?: string;
  };
}

export interface PdfPageRenderResult {
  pageNumber: number;
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  scale: number;
}

export class PdfEngine {
  /**
   * Helper to ensure an ArrayBuffer or Uint8Array is safely copied and not detached
   */
  public static toSafeUint8Array(source: ArrayBuffer | Uint8Array | ArrayLike<number>): Uint8Array {
    if (source instanceof Uint8Array) {
      return new Uint8Array(source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength));
    }
    if (source instanceof ArrayBuffer) {
      return new Uint8Array(source.slice(0));
    }
    return new Uint8Array(source as any);
  }

  /**
   * Loads a PDF document using PDF.js for fast high-fidelity rendering
   */
  public static async loadPdfJsDoc(source: File | Blob | ArrayBuffer | Uint8Array | pdfjsLib.PDFDocumentProxy): Promise<pdfjsLib.PDFDocumentProxy> {
    if (source && typeof (source as any).getPage === 'function') {
      return source as pdfjsLib.PDFDocumentProxy;
    }

    let uint8: Uint8Array;
    if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
      uint8 = this.toSafeUint8Array(source);
    } else {
      const arrayBuffer = await FileEngine.readAsArrayBuffer(source as Blob | File);
      uint8 = this.toSafeUint8Array(arrayBuffer);
    }
    
    // Ensure worker is properly set
    if (typeof window !== 'undefined') {
      const origin = window.location.origin || '';
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = `${origin}/pdf.worker.min.mjs`;
    }

    const version = (pdfjsLib as any).version || '6.2.108';
    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      cMapUrl: typeof window !== 'undefined' ? `${window.location.origin}/cmaps/` : `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: typeof window !== 'undefined' ? `${window.location.origin}/standard_fonts/` : `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/standard_fonts/`,
    });
    return loadingTask.promise;
  }

  /**
   * Reads high-level document metadata & page dimensions
   */
  public static async getDocumentInfo(source: File | Blob | ArrayBuffer | Uint8Array | pdfjsLib.PDFDocumentProxy): Promise<PdfDocumentInfo> {
    const pdfDoc = (source && typeof (source as any).getPage === 'function')
      ? (source as pdfjsLib.PDFDocumentProxy)
      : await this.loadPdfJsDoc(source);
    let meta: any = {};
    try {
      meta = await pdfDoc.getMetadata();
    } catch {
      // ignore metadata extraction errors
    }

    const pageSizes: { pageNumber: number; width: number; height: number; rotation: number }[] = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.0 });
      pageSizes.push({
        pageNumber: i,
        width: viewport.width,
        height: viewport.height,
        rotation: viewport.rotation,
      });
    }

    const info = meta?.info || {};
    return {
      numPages: pdfDoc.numPages,
      title: info.Title || '',
      author: info.Author || '',
      subject: info.Subject || '',
      keywords: info.Keywords || '',
      creator: info.Creator || 'EditMee PDF Engine',
      producer: info.Producer || 'pdf-lib / pdf.js',
      creationDate: info.CreationDate || '',
      modificationDate: info.ModDate || '',
      pageSizes,
    };
  }

  /**
   * Renders a specific page of a PDF onto an HTML canvas with crisp Hi-DPI resolution
   */
  public static async renderPageToCanvas(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number,
    scale = 1.0,
    targetCanvas?: HTMLCanvasElement
  ): Promise<PdfPageRenderResult> {
    const page = await pdfDoc.getPage(pageNumber);
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    
    // Effective scale considering device pixel ratio for crystal clear rendering
    const renderScale = scale * pixelRatio;
    const viewport = page.getViewport({ scale: renderScale });

    const canvas = targetCanvas || document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);

    // Set display CSS dimensions to match zoom
    const displayWidth = Math.floor(unscaledViewport.width * scale);
    const displayHeight = Math.floor(unscaledViewport.height * scale);
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('Failed to get 2D canvas context for PDF rendering');

    // Fill clean white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext: any = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    return {
      pageNumber,
      canvas,
      width: displayWidth,
      height: displayHeight,
      originalWidth: unscaledViewport.width,
      originalHeight: unscaledViewport.height,
      scale,
    };
  }

  /**
   * Extracts text items with exact bounding box coordinates (converted to top-left origin)
   */
  public static async extractPageText(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNumber: number
  ): Promise<PdfPageTextContent> {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    const items: PdfTextItem[] = [];

    textContent.items.forEach((item: any, idx: number) => {
      if (!item.str || item.str.trim() === '') return;

      const tx = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
      const fontSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]) || item.height || 12;
      const pdfX = tx[4];
      const pdfY = tx[5];

      // Convert PDF bottom-left coordinate to canvas top-left coordinate
      const x = pdfX;
      const y = viewport.height - pdfY - (item.height || fontSize);
      const width = item.width || item.str.length * (fontSize * 0.55);
      const height = item.height || fontSize * 1.2;

      items.push({
        id: `text_p${pageNumber}_${idx}`,
        str: item.str,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        width: Math.round(width * 10) / 10,
        height: Math.round(height * 10) / 10,
        fontSize: Math.round(fontSize * 10) / 10,
        fontName: item.fontName || 'sans-serif',
        dir: item.dir || 'ltr',
        transform: tx,
      });
    });

    const fullText = items.map((i) => i.str).join(' ');

    return {
      pageNumber,
      items,
      fullText,
    };
  }

  /**
   * Universal text extraction across entire PDF document
   */
  public static async extractText(source: File | Blob | ArrayBuffer): Promise<string> {
    const pdfDoc = await this.loadPdfJsDoc(source);
    const textParts: string[] = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const pageText = await this.extractPageText(pdfDoc, i);
      if (pageText.fullText.trim()) {
        textParts.push(pageText.fullText);
      }
    }
    return textParts.join('\n\n');
  }

  /**
   * Search for text matches across all pages in the PDF document
   */
  public static async searchInPdf(
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    query: string,
    caseSensitive = false
  ): Promise<PdfSearchMatch[]> {
    if (!query.trim()) return [];
    const results: PdfSearchMatch[] = [];
    const target = caseSensitive ? query : query.toLowerCase();

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const pageText = await this.extractPageText(pdfDoc, pageNum);
      pageText.items.forEach((item, itemIdx) => {
        const itemStr = caseSensitive ? item.str : item.str.toLowerCase();
        let startIndex = 0;
        let matchIdx = itemStr.indexOf(target, startIndex);

        while (matchIdx !== -1) {
          // Estimate proportional match box within the text item
          const charWidth = item.width / Math.max(1, item.str.length);
          const matchX = item.x + matchIdx * charWidth;
          const matchW = Math.min(item.width, target.length * charWidth);

          results.push({
            page: pageNum,
            itemIndex: itemIdx,
            matchIndex: matchIdx,
            text: item.str.substr(matchIdx, query.length),
            x: matchX,
            y: item.y,
            width: matchW,
            height: item.height,
          });

          startIndex = matchIdx + target.length;
          matchIdx = itemStr.indexOf(target, startIndex);
        }
      });
    }

    return results;
  }

  /**
   * Creates a clean sample PDF document in memory for immediate interactive testing
   */
  public static async createSamplePdf(): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const courier = await doc.embedFont(StandardFonts.Courier);

    // --- Page 1: Executive Project Brief ---
    const page1 = doc.addPage([595.28, 841.89]); // A4
    const { width: p1W, height: p1H } = page1.getSize();

    // Header Background bar
    page1.drawRectangle({
      x: 0,
      y: p1H - 80,
      width: p1W,
      height: 80,
      color: rgb(0.08, 0.15, 0.3),
    });

    page1.drawText('EDITMEE PRODUCTIVITY SUITE', {
      x: 40,
      y: p1H - 45,
      size: 20,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    page1.drawText('Q3 Engineering & Product Specification Document', {
      x: 40,
      y: p1H - 65,
      size: 11,
      font: helvetica,
      color: rgb(0.8, 0.85, 0.95),
    });

    // Content section
    let y = p1H - 120;
    page1.drawText('1. Executive Overview', {
      x: 40,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    y -= 25;
    const overviewLines = [
      'EditMee is a modern, high-performance client-first productivity workstation.',
      'This document serves as the formal specification for digital document workflows,',
      'interactive PDF editing, client-side cryptographic security, and automated pipeline execution.',
      'All operations execute entirely within the local browser runtime with zero server leakage.',
    ];
    for (const line of overviewLines) {
      page1.drawText(line, { x: 40, y, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      y -= 16;
    }

    y -= 15;
    page1.drawText('2. Core Engine Architecture', {
      x: 40,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    y -= 25;
    page1.drawRectangle({
      x: 40,
      y: y - 80,
      width: p1W - 80,
      height: 95,
      color: rgb(0.96, 0.97, 0.99),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
    });

    page1.drawText('Component', { x: 55, y: y - 5, size: 10, font: helveticaBold, color: rgb(0.1, 0.2, 0.3) });
    page1.drawText('Execution Mode', { x: 200, y: y - 5, size: 10, font: helveticaBold, color: rgb(0.1, 0.2, 0.3) });
    page1.drawText('Throughput / SLA', { x: 380, y: y - 5, size: 10, font: helveticaBold, color: rgb(0.1, 0.2, 0.3) });

    const rows = [
      ['PDF Layout & Vector Engine', 'Web Worker + WASM', '< 12ms per frame'],
      ['Cryptographic Signature Pad', 'Hardware Acceleration', '60 FPS Bezier tracking'],
      ['Structured Reflow Engine', 'Client DOM Virtualization', 'Instantaneous'],
    ];

    rows.forEach((r, idx) => {
      const rowY = y - 28 - idx * 20;
      page1.drawText(r[0], { x: 55, y: rowY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page1.drawText(r[1], { x: 200, y: rowY, size: 9, font: courier, color: rgb(0.1, 0.4, 0.6) });
      page1.drawText(r[2], { x: 380, y: rowY, size: 9, font: helvetica, color: rgb(0.3, 0.6, 0.2) });
    });

    y -= 120;
    page1.drawText('3. Authorization & Sign-off', {
      x: 40,
      y,
      size: 14,
      font: helveticaBold,
      color: rgb(0.1, 0.2, 0.4),
    });

    y -= 25;
    page1.drawText('Prepared By: Alex Vance, Principal Architect', {
      x: 40,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
    page1.drawText('Date: October 24, 2026', {
      x: 350,
      y,
      size: 10,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Signature box placeholder
    page1.drawRectangle({
      x: 40,
      y: y - 70,
      width: 200,
      height: 50,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 1,
    });
    page1.drawText('Authorized Signature', {
      x: 50,
      y: y - 62,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // Footer
    page1.drawText('Page 1 of 2  •  Confidential & Proprietary  •  EditMee', {
      x: 180,
      y: 25,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    // --- Page 2: Commercial Invoice & Billing Record ---
    const page2 = doc.addPage([595.28, 841.89]);
    const { width: p2W, height: p2H } = page2.getSize();

    page2.drawText('COMMERCIAL INVOICE', {
      x: 40,
      y: p2H - 50,
      size: 22,
      font: helveticaBold,
      color: rgb(0.1, 0.15, 0.25),
    });

    page2.drawText('Invoice #: INV-2026-8891', {
      x: 40,
      y: p2H - 70,
      size: 10,
      font: courier,
      color: rgb(0.4, 0.4, 0.4),
    });
    page2.drawText('Issue Date: 2026-10-24', {
      x: 40,
      y: p2H - 85,
      size: 10,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    page2.drawText('Billed To: Enterprise Partner Technologies Inc.', {
      x: 40,
      y: p2H - 125,
      size: 11,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page2.drawText('100 Silicon Way, Suite 400, San Francisco, CA 94107', {
      x: 40,
      y: p2H - 140,
      size: 10,
      font: helvetica,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Items table
    page2.drawRectangle({
      x: 40,
      y: p2H - 300,
      width: p2W - 80,
      height: 130,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.85, 0.85, 0.88),
      borderWidth: 1,
    });

    page2.drawText('Item Description', { x: 55, y: p2H - 190, size: 10, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    page2.drawText('Hours', { x: 340, y: p2H - 190, size: 10, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    page2.drawText('Rate', { x: 410, y: p2H - 190, size: 10, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
    page2.drawText('Amount', { x: 470, y: p2H - 190, size: 10, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });

    const invoiceItems = [
      ['Core Engine Architecture Consulting', '40', '$225.00', '$9,000.00'],
      ['PDF Rendering Engine Implementation', '60', '$225.00', '$13,500.00'],
      ['Security Hardening & WASM Compilation', '25', '$225.00', '$5,625.00'],
    ];

    invoiceItems.forEach((it, idx) => {
      const itY = p2H - 220 - idx * 24;
      page2.drawText(it[0], { x: 55, y: itY, size: 9, font: helvetica, color: rgb(0.2, 0.2, 0.2) });
      page2.drawText(it[1], { x: 345, y: itY, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      page2.drawText(it[2], { x: 410, y: itY, size: 9, font: helvetica, color: rgb(0.3, 0.3, 0.3) });
      page2.drawText(it[3], { x: 470, y: itY, size: 9, font: courier, color: rgb(0.1, 0.1, 0.1) });
    });

    page2.drawText('Total Balance Due: $28,125.00 USD', {
      x: 310,
      y: p2H - 330,
      size: 13,
      font: helveticaBold,
      color: rgb(0.08, 0.45, 0.2),
    });

    // Footer
    page2.drawText('Page 2 of 2  •  Thank you for your business  •  EditMee', {
      x: 180,
      y: 25,
      size: 8,
      font: helvetica,
      color: rgb(0.6, 0.6, 0.6),
    });

    return await doc.save();
  }

  /**
   * Creates a blank new PDF document with given settings
   */
  public static async createBlankPdf(options: {
    pageSize?: 'A4' | 'Letter';
    orientation?: 'portrait' | 'landscape';
    pageCount?: number;
  } = {}): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const isLetter = options.pageSize === 'Letter';
    const isLandscape = options.orientation === 'landscape';

    let width = isLetter ? 612 : 595.28;
    let height = isLetter ? 792 : 841.89;

    if (isLandscape) {
      const temp = width;
      width = height;
      height = temp;
    }

    const count = options.pageCount || 1;
    for (let i = 0; i < count; i++) {
      doc.addPage([width, height]);
    }

    return await doc.save();
  }

  /**
   * Reorders pages in a PDF document based on an array of 0-indexed page indices
   */
  public static async reorderPages(
    pdfBuffer: ArrayBuffer | Uint8Array,
    newOrder: number[] // e.g. [2, 0, 1]
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(this.toSafeUint8Array(pdfBuffer), { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
    copiedPages.forEach((p) => newDoc.addPage(p));
    return await newDoc.save();
  }

  /**
   * Duplicates a specific page in a PDF document
   */
  public static async duplicatePage(pdfBuffer: ArrayBuffer | Uint8Array, pageIndex: number): Promise<Uint8Array> {
    const doc = await PDFDocument.load(this.toSafeUint8Array(pdfBuffer), { ignoreEncryption: true });
    const [copiedPage] = await doc.copyPages(doc, [pageIndex]);
    doc.insertPage(pageIndex + 1, copiedPage);
    return await doc.save();
  }

  /**
   * Deletes a specific page in a PDF document
   */
  public static async deletePage(pdfBuffer: ArrayBuffer | Uint8Array, pageIndex: number): Promise<Uint8Array> {
    const doc = await PDFDocument.load(this.toSafeUint8Array(pdfBuffer), { ignoreEncryption: true });
    if (doc.getPageCount() <= 1) {
      throw new Error('Cannot delete the only page in the document');
    }
    doc.removePage(pageIndex);
    return await doc.save();
  }

  /**
   * Rotates pages in a PDF (e.g. 90, 180, 270)
   */
  public static async rotatePages(
    pdfBuffer: ArrayBuffer | Uint8Array,
    rotationAngle: number,
    pageIndices?: number[]
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(this.toSafeUint8Array(pdfBuffer), { ignoreEncryption: true });
    const totalPages = doc.getPageCount();
    const targetPages = pageIndices || Array.from({ length: totalPages }, (_, i) => i);

    for (const idx of targetPages) {
      if (idx >= 0 && idx < totalPages) {
        const page = doc.getPage(idx);
        const currentRot = page.getRotation().angle;
        page.setRotation(degrees((currentRot + rotationAngle) % 360));
      }
    }

    return await doc.save();
  }

  /**
   * Merges multiple PDF files into one
   */
  public static async mergePdfs(pdfBuffers: (ArrayBuffer | Uint8Array)[]): Promise<Uint8Array> {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
      const doc = await PDFDocument.load(this.toSafeUint8Array(buffer), { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    return await mergedPdf.save();
  }

  /**
   * Helper to parse hex colors to pdf-lib RGB values
   */
  public static hexToRgb(hex?: string): { r: number; g: number; b: number } {
    if (!hex || !hex.startsWith('#')) return { r: 0.1, g: 0.1, b: 0.1 };
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean
        .split('')
        .map((c) => c + c)
        .join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255,
    };
  }

  /**
   * Helper to wrap text into multiple lines given a max width in points
   */
  public static wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
    const paragraphs = text.split('\n');
    const allLines: string[] = [];

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        allLines.push('');
        continue;
      }
      const words = paragraph.split(' ');
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = `${currentLine} ${word}`;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width < maxWidth) {
          currentLine = testLine;
        } else {
          allLines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) {
        allLines.push(currentLine);
      }
    }

    return allLines;
  }

  /**
   * Master Export Function: Renders all text edits, annotations, stamps, signatures, images, watermarks,
   * form fields, and metadata into a valid, standard PDF file.
   */
  public static async exportDocument(
    originalPdfBuffer: ArrayBuffer | Uint8Array,
    options: PdfExportOptions
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(this.toSafeUint8Array(originalPdfBuffer), { ignoreEncryption: true });
    
    // Embed Standard Fonts
    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const times = await doc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
    const courier = await doc.embedFont(StandardFonts.Courier);
    const courierBold = await doc.embedFont(StandardFonts.CourierBold);

    const getFont = (family?: string, isBold?: boolean) => {
      if (family === 'Courier' || family === 'CourierBold') return isBold ? courierBold : courier;
      if (family === 'TimesRoman' || family === 'TimesRomanBold') return isBold ? timesBold : times;
      return isBold ? helveticaBold : helvetica;
    };

    const pages = doc.getPages();
    const totalPages = pages.length;

    // Apply Document Metadata if provided
    if (options.metadata) {
      if (options.metadata.title) doc.setTitle(options.metadata.title);
      if (options.metadata.author) doc.setAuthor(options.metadata.author);
      if (options.metadata.subject) doc.setSubject(options.metadata.subject);
      if (options.metadata.keywords) doc.setKeywords([options.metadata.keywords]);
      if (options.metadata.creator) doc.setCreator(options.metadata.creator);
      doc.setModificationDate(new Date());
    }

    // 1. Process Annotations & In-place Text Edits
    for (const ann of options.annotations) {
      const pageIdx = ann.page - 1;
      if (pageIdx < 0 || pageIdx >= pages.length) continue;
      const page = pages[pageIdx];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      // Convert UI top-left coordinate to PDF bottom-left coordinate
      const pdfY = pageHeight - ann.y;

      const annColor = this.hexToRgb(ann.color || '#000000');
      const opacity = ann.opacity !== undefined ? ann.opacity : 1.0;

      // If this was an in-place text replacement, white out the original text area cleanly!
      if (ann.originalTextItem) {
        const orig = ann.originalTextItem;
        const origPdfY = pageHeight - orig.y - orig.height;
        page.drawRectangle({
          x: orig.x - 2,
          y: origPdfY - 2,
          width: Math.max(orig.width, ann.width || 0) + 4,
          height: Math.max(orig.height, ann.height || 0) + 4,
          color: rgb(1, 1, 1),
          opacity: 1.0,
        });
      }

      switch (ann.type) {
        case 'text': {
          if (!ann.text) break;
          const font = getFont(ann.fontFamily, ann.fontBold);
          const fontSize = ann.fontSize || 14;
          const lineHeight = ann.lineHeight || fontSize * 1.25;
          const maxW = ann.width || pageWidth - ann.x - 40;

          // If background color is specified, draw background box
          if (ann.backgroundColor && ann.backgroundColor !== 'transparent') {
            const bg = this.hexToRgb(ann.backgroundColor);
            page.drawRectangle({
              x: ann.x - 4,
              y: pdfY - (ann.height || fontSize * 1.5),
              width: (ann.width || 120) + 8,
              height: (ann.height || fontSize * 1.5) + 4,
              color: rgb(bg.r, bg.g, bg.b),
              opacity: 0.9,
            });
          }

          const lines = this.wrapText(ann.text, font, fontSize, maxW);
          lines.forEach((line, lIdx) => {
            const lineY = pdfY - fontSize - lIdx * lineHeight;
            let lineX = ann.x;
            const textW = font.widthOfTextAtSize(line, fontSize);
            if (ann.textAlign === 'center') {
              lineX = ann.x + ((ann.width || maxW) - textW) / 2;
            } else if (ann.textAlign === 'right') {
              lineX = ann.x + (ann.width || maxW) - textW;
            }

            page.drawText(line, {
              x: lineX,
              y: lineY,
              size: fontSize,
              font,
              color: rgb(annColor.r, annColor.g, annColor.b),
              opacity,
            });

            // Underline support
            if (ann.fontUnderline) {
              page.drawLine({
                start: { x: lineX, y: lineY - 1.5 },
                end: { x: lineX + textW, y: lineY - 1.5 },
                thickness: Math.max(1, fontSize / 14),
                color: rgb(annColor.r, annColor.g, annColor.b),
                opacity,
              });
            }

            // Strikethrough support
            if (ann.fontStrikethrough) {
              page.drawLine({
                start: { x: lineX, y: lineY + fontSize * 0.35 },
                end: { x: lineX + textW, y: lineY + fontSize * 0.35 },
                thickness: Math.max(1, fontSize / 14),
                color: rgb(annColor.r, annColor.g, annColor.b),
                opacity,
              });
            }
          });
          break;
        }

        case 'line': {
          const w = ann.width || 120;
          const h = ann.height || 0;
          const strokeW = ann.strokeWidth || ann.borderWidth || 2;
          page.drawLine({
            start: { x: ann.x, y: pdfY },
            end: { x: ann.x + w, y: pdfY - h },
            thickness: strokeW,
            color: rgb(annColor.r, annColor.g, annColor.b),
            opacity,
          });
          break;
        }

        case 'arrow': {
          const w = ann.width || 120;
          const h = ann.height || 0;
          const strokeW = ann.strokeWidth || ann.borderWidth || 2;
          const startX = ann.x;
          const startY = pdfY;
          const endX = ann.x + w;
          const endY = pdfY - h;

          page.drawLine({
            start: { x: startX, y: startY },
            end: { x: endX, y: endY },
            thickness: strokeW,
            color: rgb(annColor.r, annColor.g, annColor.b),
            opacity,
          });

          // Draw arrowhead at end
          const angle = Math.atan2(endY - startY, endX - startX);
          const headLen = 10;
          page.drawLine({
            start: { x: endX, y: endY },
            end: {
              x: endX - headLen * Math.cos(angle - Math.PI / 6),
              y: endY - headLen * Math.sin(angle - Math.PI / 6),
            },
            thickness: strokeW,
            color: rgb(annColor.r, annColor.g, annColor.b),
            opacity,
          });
          page.drawLine({
            start: { x: endX, y: endY },
            end: {
              x: endX - headLen * Math.cos(angle + Math.PI / 6),
              y: endY - headLen * Math.sin(angle + Math.PI / 6),
            },
            thickness: strokeW,
            color: rgb(annColor.r, annColor.g, annColor.b),
            opacity,
          });
          break;
        }

        case 'highlight': {
          const w = ann.width || 140;
          const h = ann.height || 18;
          page.drawRectangle({
            x: ann.x,
            y: pdfY - h,
            width: w,
            height: h,
            color: rgb(annColor.r, annColor.g, annColor.b),
            opacity: ann.opacity || 0.4,
          });
          break;
        }

        case 'redact': {
          const w = ann.width || 120;
          const h = ann.height || 20;
          page.drawRectangle({
            x: ann.x,
            y: pdfY - h,
            width: w,
            height: h,
            color: rgb(0, 0, 0),
            opacity: 1.0,
          });
          break;
        }

        case 'rect': {
          const w = ann.width || 100;
          const h = ann.height || 60;
          const borderC = this.hexToRgb(ann.borderColor || ann.color || '#ef4444');
          page.drawRectangle({
            x: ann.x,
            y: pdfY - h,
            width: w,
            height: h,
            borderColor: rgb(borderC.r, borderC.g, borderC.b),
            borderWidth: ann.borderWidth || 2,
            opacity,
          });
          break;
        }

        case 'circle': {
          const w = ann.width || 80;
          const h = ann.height || 80;
          const borderC = this.hexToRgb(ann.borderColor || ann.color || '#ef4444');
          page.drawEllipse({
            x: ann.x + w / 2,
            y: pdfY - h / 2,
            xScale: w / 2,
            yScale: h / 2,
            borderColor: rgb(borderC.r, borderC.g, borderC.b),
            borderWidth: ann.borderWidth || 2,
            opacity,
          });
          break;
        }

        case 'stamp': {
          const w = ann.width || 130;
          const h = ann.height || 42;
          const stampC = this.hexToRgb(ann.color || '#dc2626');
          page.drawRectangle({
            x: ann.x,
            y: pdfY - h,
            width: w,
            height: h,
            borderColor: rgb(stampC.r, stampC.g, stampC.b),
            borderWidth: 2.5,
            opacity: 0.85,
          });
          const text = ann.stampText || 'APPROVED';
          const textW = helveticaBold.widthOfTextAtSize(text, 14);
          page.drawText(text, {
            x: ann.x + (w - textW) / 2,
            y: pdfY - h + 13,
            size: 14,
            font: helveticaBold,
            color: rgb(stampC.r, stampC.g, stampC.b),
            opacity: 0.9,
          });
          break;
        }

        case 'signature': {
          if (!ann.imageDataUrl) break;
          const sigRes = await fetch(ann.imageDataUrl);
          const sigBuf = await sigRes.arrayBuffer();
          const embeddedSig = await doc.embedPng(sigBuf);
          const w = ann.width || 160;
          const h = ann.height || 60;
          page.drawImage(embeddedSig, {
            x: ann.x,
            y: pdfY - h,
            width: w,
            height: h,
            opacity,
          });
          break;
        }

        case 'image': {
          if (!ann.imageDataUrl) break;
          const isPng = ann.imageDataUrl.startsWith('data:image/png');
          const imgRes = await fetch(ann.imageDataUrl);
          const imgBuf = await imgRes.arrayBuffer();
          const embeddedImg = isPng ? await doc.embedPng(imgBuf) : await doc.embedJpg(imgBuf);
          const w = ann.width || 180;
          const h = ann.height || 120;
          page.drawImage(embeddedImg, {
            x: ann.x,
            y: pdfY - h,
            width: w,
            height: h,
            opacity,
          });
          break;
        }

        case 'draw': {
          if (!ann.points || ann.points.length < 2) break;
          // Render freehand stroke as connected line segments
          const drawC = this.hexToRgb(ann.color || '#2563eb');
          const strokeW = ann.strokeWidth || 2.5;

          for (let i = 0; i < ann.points.length - 1; i++) {
            const p1 = ann.points[i];
            const p2 = ann.points[i + 1];
            page.drawLine({
              start: { x: p1.x, y: pageHeight - p1.y },
              end: { x: p2.x, y: pageHeight - p2.y },
              thickness: strokeW,
              color: rgb(drawC.r, drawC.g, drawC.b),
              opacity,
            });
          }
          break;
        }

        case 'form-text': {
          const w = ann.width || 180;
          const h = ann.height || 26;
          // Draw form text box frame
          page.drawRectangle({
            x: ann.x,
            y: pdfY - h,
            width: w,
            height: h,
            color: rgb(0.97, 0.98, 1.0),
            borderColor: rgb(0.6, 0.7, 0.9),
            borderWidth: 1,
          });
          const val = String(ann.formFieldValue || ann.formPlaceholder || '');
          if (val) {
            page.drawText(val, {
              x: ann.x + 6,
              y: pdfY - h + 7,
              size: 10,
              font: helvetica,
              color: rgb(0.1, 0.1, 0.1),
            });
          }
          break;
        }

        case 'form-check': {
          const size = ann.width || 18;
          page.drawRectangle({
            x: ann.x,
            y: pdfY - size,
            width: size,
            height: size,
            borderColor: rgb(0.3, 0.4, 0.6),
            borderWidth: 1.5,
          });
          if (ann.formFieldValue === true || ann.formFieldValue === 'true') {
            // Draw checkmark symbol
            page.drawLine({
              start: { x: ann.x + 3, y: pdfY - size / 2 },
              end: { x: ann.x + size / 2, y: pdfY - size + 3 },
              thickness: 2,
              color: rgb(0.1, 0.5, 0.2),
            });
            page.drawLine({
              start: { x: ann.x + size / 2, y: pdfY - size + 3 },
              end: { x: ann.x + size - 3, y: pdfY - 4 },
              thickness: 2,
              color: rgb(0.1, 0.5, 0.2),
            });
          }
          break;
        }
      }
    }

    // 2. Apply Watermark across all pages if requested
    if (options.watermark && (options.watermark.text || options.watermark.imageDataUrl)) {
      const wm = options.watermark;
      const wmColor = this.hexToRgb(wm.colorHex || '#64748b');
      const wmOpacity = wm.opacity !== undefined ? wm.opacity : 0.25;
      const wmFontSize = wm.fontSize || 48;
      const wmRotation = wm.rotation !== undefined ? wm.rotation : (wm.isDiagonal !== false ? 45 : 0);

      for (const page of pages) {
        const { width: pw, height: ph } = page.getSize();
        if (wm.text) {
          const textW = helveticaBold.widthOfTextAtSize(wm.text, wmFontSize);
          page.drawText(wm.text, {
            x: (pw - textW) / 2,
            y: ph / 2,
            size: wmFontSize,
            font: helveticaBold,
            color: rgb(wmColor.r, wmColor.g, wmColor.b),
            opacity: wmOpacity,
            rotate: degrees(wmRotation),
          });
        }
      }
    }

    // 3. Apply Page Numbers if enabled
    if (options.pageNumbers && options.pageNumbers.enabled) {
      const { format, position } = options.pageNumbers;
      for (let i = 0; i < totalPages; i++) {
        const page = pages[i];
        const { width: pw, height: ph } = page.getSize();
        const text = format.replace('{n}', String(i + 1)).replace('{total}', String(totalPages));
        const fontSize = 10;
        const textW = helvetica.widthOfTextAtSize(text, fontSize);

        let x = (pw - textW) / 2;
        let y = 25;

        if (position === 'bottom-right') {
          x = pw - textW - 35;
        } else if (position === 'top-right') {
          x = pw - textW - 35;
          y = ph - 30;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4),
        });
      }
    }

    return await doc.save();
  }

  /**
   * Generates a complete, beautiful multi-page Resume PDF using pdf-lib
   */
  public static async generateResumePdf(
    resumeData: any,
    template: 'modern' | 'minimal' | 'executive' = 'modern',
    accentHex = '#2563eb'
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const times = await doc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);

    const primaryFont = template === 'executive' ? timesBold : helveticaBold;
    const bodyFont = template === 'executive' ? times : helvetica;
    const accentRgb = this.hexToRgb(accentHex);

    const p = resumeData.personal || {};

    if (template === 'modern') {
      // Modern Top Banner Header
      page.drawRectangle({
        x: 0,
        y: height - 110,
        width,
        height: 110,
        color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
      });

      page.drawText(p.fullName || 'Candidate Name', {
        x: 40,
        y: height - 55,
        size: 24,
        font: primaryFont,
        color: rgb(1, 1, 1),
      });

      page.drawText(p.jobTitle || 'Professional Title', {
        x: 40,
        y: height - 78,
        size: 13,
        font: bodyFont,
        color: rgb(0.9, 0.95, 1),
      });

      const contactItems = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join('  |  ');
      page.drawText(contactItems, {
        x: 40,
        y: height - 98,
        size: 9,
        font: bodyFont,
        color: rgb(0.85, 0.9, 0.98),
      });
    } else {
      // Clean Executive / Minimal Header
      page.drawText(p.fullName || 'Candidate Name', {
        x: 40,
        y: height - 50,
        size: 22,
        font: primaryFont,
        color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
      });

      page.drawText(p.jobTitle || 'Professional Title', {
        x: 40,
        y: height - 70,
        size: 12,
        font: bodyFont,
        color: rgb(0.3, 0.3, 0.3),
      });

      const contactItems = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join('  •  ');
      page.drawText(contactItems, {
        x: 40,
        y: height - 88,
        size: 9,
        font: bodyFont,
        color: rgb(0.4, 0.4, 0.4),
      });

      page.drawLine({
        start: { x: 40, y: height - 98 },
        end: { x: width - 40, y: height - 98 },
        thickness: 1.5,
        color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
      });
    }

    let cursorY = height - 135;

    // Helper for Section Titles
    const drawSectionHeader = (title: string) => {
      page.drawText(title.toUpperCase(), {
        x: 40,
        y: cursorY,
        size: 11,
        font: primaryFont,
        color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
      });

      page.drawLine({
        start: { x: 40, y: cursorY - 4 },
        end: { x: width - 40, y: cursorY - 4 },
        thickness: 0.75,
        color: rgb(0.8, 0.8, 0.8),
      });

      cursorY -= 18;
    };

    // Summary Section
    if (resumeData.summary) {
      drawSectionHeader('Professional Summary');
      const lines = this.wrapText(resumeData.summary, bodyFont, 9.5, width - 80);
      lines.forEach((l) => {
        page.drawText(l, { x: 40, y: cursorY, size: 9.5, font: bodyFont, color: rgb(0.2, 0.2, 0.2) });
        cursorY -= 14;
      });
      cursorY -= 10;
    }

    // Experience Section
    if (resumeData.experience && resumeData.experience.length > 0) {
      drawSectionHeader('Work Experience');
      resumeData.experience.forEach((exp: any) => {
        page.drawText(exp.position || 'Position', {
          x: 40,
          y: cursorY,
          size: 10.5,
          font: primaryFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        const dates = `${exp.startDate || ''} - ${exp.endDate || ''}`;
        const dateW = bodyFont.widthOfTextAtSize(dates, 9);
        page.drawText(dates, {
          x: width - 40 - dateW,
          y: cursorY,
          size: 9,
          font: bodyFont,
          color: rgb(0.5, 0.5, 0.5),
        });

        cursorY -= 13;
        page.drawText(exp.company || 'Company Name', {
          x: 40,
          y: cursorY,
          size: 9.5,
          font: primaryFont,
          color: rgb(accentRgb.r, accentRgb.g, accentRgb.b),
        });

        cursorY -= 14;
        if (exp.description) {
          const descLines = this.wrapText(exp.description, bodyFont, 9, width - 80);
          descLines.forEach((dl) => {
            page.drawText(dl, { x: 40, y: cursorY, size: 9, font: bodyFont, color: rgb(0.25, 0.25, 0.25) });
            cursorY -= 13;
          });
        }
        cursorY -= 8;
      });
    }

    // Education Section
    if (resumeData.education && resumeData.education.length > 0) {
      drawSectionHeader('Education');
      resumeData.education.forEach((edu: any) => {
        page.drawText(edu.degree || 'Degree', {
          x: 40,
          y: cursorY,
          size: 10,
          font: primaryFont,
          color: rgb(0.1, 0.1, 0.1),
        });

        if (edu.gradYear) {
          const yearW = bodyFont.widthOfTextAtSize(edu.gradYear, 9);
          page.drawText(edu.gradYear, {
            x: width - 40 - yearW,
            y: cursorY,
            size: 9,
            font: bodyFont,
            color: rgb(0.5, 0.5, 0.5),
          });
        }

        cursorY -= 13;
        page.drawText(edu.school || 'University', {
          x: 40,
          y: cursorY,
          size: 9,
          font: bodyFont,
          color: rgb(0.3, 0.3, 0.3),
        });
        cursorY -= 15;
      });
    }

    // Skills Section
    if (resumeData.skills && resumeData.skills.length > 0) {
      drawSectionHeader('Skills & Competencies');
      const skillsStr = Array.isArray(resumeData.skills) ? resumeData.skills.join('  •  ') : String(resumeData.skills);
      const skillLines = this.wrapText(skillsStr, bodyFont, 9, width - 80);
      skillLines.forEach((sl) => {
        page.drawText(sl, { x: 40, y: cursorY, size: 9, font: bodyFont, color: rgb(0.2, 0.2, 0.2) });
        cursorY -= 13;
      });
    }

    return await doc.save();
  }

  /**
   * Extract specific pages from a PDF
   */
  public static async extractPages(
    pdfData: ArrayBuffer | Uint8Array,
    pageIndices: number[]
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));
    return await newDoc.save();
  }

  /**
   * Convert image files to a single PDF document
   */
  public static async imagesToPdf(imageFiles: File[]): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (const file of imageFiles) {
      const buffer = await file.arrayBuffer();
      let image;
      if (file.type.includes('png')) {
        image = await doc.embedPng(buffer);
      } else {
        image = await doc.embedJpg(buffer);
      }
      const page = doc.addPage([image.width, image.height]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: image.width,
        height: image.height,
      });
    }
    return await doc.save();
  }

  /**
   * Add text watermark across all pages
   */
  public static async addWatermark(
    pdfData: ArrayBuffer | Uint8Array,
    watermarkText: string,
    options?: { opacity?: number; color?: { r: number; g: number; b: number }; size?: number; rotation?: number }
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const pages = doc.getPages();
    const opacity = options?.opacity ?? 0.3;
    const size = options?.size ?? 48;
    const rotation = options?.rotation ?? 45;
    const color = options?.color ? rgb(options.color.r, options.color.g, options.color.b) : rgb(0.7, 0.7, 0.7);

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(watermarkText, size);
      const textHeight = font.heightAtSize(size);

      page.drawText(watermarkText, {
        x: width / 2 - textWidth / 2 + 20,
        y: height / 2 - textHeight / 2,
        size,
        font,
        color,
        opacity,
        rotate: degrees(rotation),
      });
    });

    return await doc.save();
  }

  /**
   * Add page numbers across all pages
   */
  public static async addPageNumbers(
    pdfData: ArrayBuffer | Uint8Array,
    format: string = 'Page {n} of {total}',
    position: string = 'bottom-center'
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(pdfData, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;

    pages.forEach((page, idx) => {
      const pageNum = idx + 1;
      const text = format.replace('{n}', String(pageNum)).replace('{total}', String(total));
      const { width, height } = page.getSize();
      const textSize = 9;
      const textWidth = font.widthOfTextAtSize(text, textSize);

      let x = width / 2 - textWidth / 2;
      let y = 25;

      if (position === 'bottom-right') {
        x = width - textWidth - 30;
      } else if (position === 'top-right') {
        x = width - textWidth - 30;
        y = height - 25;
      }

      page.drawText(text, {
        x,
        y,
        size: textSize,
        font,
        color: rgb(0.4, 0.4, 0.4),
      });
    });

    return await doc.save();
  }

  /**
   * Genuine Client-Side AES-256 PDF Password Encryption
   */
  public static async encryptPdf(
    pdfData: ArrayBuffer | Uint8Array,
    userPassword: string,
    options?: {
      ownerPassword?: string;
      algorithm?: 'AES-256' | 'RC4-128';
      permissions?: {
        printing?: 'highResolution' | 'lowResolution' | 'none';
        modifying?: boolean;
        copying?: boolean;
        annotating?: boolean;
        fillingForms?: boolean;
        contentAccessibility?: boolean;
        documentAssembly?: boolean;
      };
    }
  ): Promise<Uint8Array> {
    if (!userPassword || userPassword.trim().length === 0) {
      throw new Error('Password is required to encrypt the PDF document.');
    }
    const safeData = this.toSafeUint8Array(pdfData);
    // Verify it is a valid PDF
    try {
      await PDFDocument.load(safeData, { ignoreEncryption: true });
    } catch {
      throw new Error('Invalid PDF document provided.');
    }

    const { encryptPDF } = await import('@pdfsmaller/pdf-encrypt');
    const encryptOptions: Record<string, any> = {
      algorithm: options?.algorithm === 'RC4-128' ? 'RC4' : options?.algorithm || 'AES-256',
      ownerPassword: options?.ownerPassword || userPassword,
    };
    if (options?.permissions) {
      encryptOptions.permissions = options.permissions;
    }
    const encrypted = await encryptPDF(safeData, userPassword, encryptOptions as any);

    return encrypted;
  }

  /**
   * Genuine PDF Compression with Multi-Tier presets
   */
  public static async compressPdf(
    pdfData: ArrayBuffer | Uint8Array,
    preset: 'recommended' | 'extreme' | 'high' = 'recommended'
  ): Promise<{
    compressedBytes: Uint8Array;
    originalSize: number;
    compressedSize: number;
    reductionPercentage: number;
    isReduced: boolean;
  }> {
    const safeData = this.toSafeUint8Array(pdfData);
    const originalSize = safeData.length;

    if (preset === 'extreme' && typeof document !== 'undefined') {
      try {
        const loadingTask = pdfjsLib.getDocument({ data: safeData });
        const pdfDoc = await loadingTask.promise;
        const totalPages = pdfDoc.numPages;

        const newDoc = await PDFDocument.create();

        for (let i = 1; i <= totalPages; i++) {
          const page = await pdfDoc.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            await (page.render({ canvasContext: ctx, viewport } as any) as any).promise;
            const dataUrl = canvas.toDataURL('image/jpeg', 0.55);
            const base64Data = dataUrl.split(',')[1];
            const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
            const embeddedImage = await newDoc.embedJpg(imageBytes);
            const newPage = newDoc.addPage([viewport.width, viewport.height]);
            newPage.drawImage(embeddedImage, {
              x: 0,
              y: 0,
              width: viewport.width,
              height: viewport.height,
            });
          }
        }

        const extremeBytes = await newDoc.save({ useObjectStreams: true });
        const compressedSize = extremeBytes.length;
        const isReduced = compressedSize < originalSize;
        const reductionPercentage = isReduced
          ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
          : 0;

        return {
          compressedBytes: isReduced ? extremeBytes : safeData,
          originalSize,
          compressedSize: isReduced ? compressedSize : originalSize,
          reductionPercentage,
          isReduced,
        };
      } catch (err) {
        console.warn('Canvas extreme compression fallback to structural compression:', err);
      }
    }

    // Default & High Quality structural & stream compression
    const doc = await PDFDocument.load(safeData, { ignoreEncryption: true });

    if (preset === 'recommended') {
      doc.setProducer('EditMee PDF Optimizer');
      doc.setCreator('EditMee');
    }

    const compressedBytes = await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const compressedSize = compressedBytes.length;
    const isReduced = compressedSize < originalSize;
    const reductionPercentage = isReduced
      ? Math.round(((originalSize - compressedSize) / originalSize) * 100)
      : 0;

    return {
      compressedBytes: isReduced ? compressedBytes : safeData,
      originalSize,
      compressedSize: isReduced ? compressedSize : originalSize,
      reductionPercentage,
      isReduced,
    };
  }
}
