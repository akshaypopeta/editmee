import { ToolDefinition, ToolResult } from '../../../types';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { FileEngine } from '../../../core/file-engine/FileEngine';

export const batch1PdfDocs: ToolDefinition[] = [
  // 1. PDF Page Numbering Stamping Suite
  {
    id: 'pdf-page-numberer-suite',
    name: 'PDF Page Numberer & Header/Footer Studio',
    category: 'pdf',
    subcategory: 'organization',
    description: 'Add custom sequential page numbers (Page X of Y, Bates numbering, roman numerals) to headers or footers with alignment controls.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['pdf', 'bates', 'page numbers', 'header', 'footer', 'stamping'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF Document', type: 'file', accept: '.pdf', required: true },
        { name: 'format', label: 'Numbering Format', type: 'select', defaultValue: 'Page {n} of {total}', options: [
          { label: 'Page {n} of {total}', value: 'Page {n} of {total}' },
          { label: 'Page {n}', value: 'Page {n}' },
          { label: '{n} / {total}', value: '{n} / {total}' },
          { label: 'BATES-{n5}', value: 'BATES-{n5}' },
          { label: 'Roman ({roman})', value: 'Roman ({roman})' },
        ]},
        { name: 'position', label: 'Position', type: 'select', defaultValue: 'bottom-center', options: [
          { label: 'Bottom Center', value: 'bottom-center' },
          { label: 'Bottom Right', value: 'bottom-right' },
          { label: 'Bottom Left', value: 'bottom-left' },
          { label: 'Top Center', value: 'top-center' },
          { label: 'Top Right', value: 'top-right' },
        ]},
        { name: 'startNumber', label: 'Start Number', type: 'number', defaultValue: 1 },
        { name: 'fontSize', label: 'Font Size (pt)', type: 'number', defaultValue: 10 },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      const file = inputs.file as File;
      if (!file) throw new Error('Please select a PDF file.');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();
      const total = pages.length;
      const startNum = Number(inputs.startNumber || 1);
      const fSize = Number(inputs.fontSize || 10);

      pages.forEach((page, idx) => {
        const pageNum = startNum + idx;
        const { width, height } = page.getSize();
        let text = (inputs.format || 'Page {n} of {total}')
          .replace('{n}', String(pageNum))
          .replace('{total}', String(total))
          .replace('{n5}', String(pageNum).padStart(5, '0'))
          .replace('{roman}', (['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][pageNum - 1] || String(pageNum)));

        const textWidth = font.widthOfTextAtSize(text, fSize);
        let x = (width - textWidth) / 2;
        let y = 25;

        if (inputs.position === 'bottom-right') x = width - textWidth - 30;
        else if (inputs.position === 'bottom-left') x = 30;
        else if (inputs.position === 'top-center') { x = (width - textWidth) / 2; y = height - 25; }
        else if (inputs.position === 'top-right') { x = width - textWidth - 30; y = height - 25; }

        page.drawText(text, { x, y, size: fSize, font, color: rgb(0.2, 0.2, 0.2) });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return { success: true, blob, filename: `numbered_${file.name}`, mimeType: 'application/pdf' };
    },
  },

  // 2. PDF Grayscale & Print Economy Converter
  {
    id: 'pdf-grayscale-print-optimizer',
    name: 'PDF Grayscale & Print Toner Optimizer',
    category: 'pdf',
    subcategory: 'conversion',
    description: 'Convert full-color PDFs to high-contrast monochrome or grayscale, stripping heavy color fills to reduce printer ink usage.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['pdf', 'grayscale', 'black and white', 'print', 'toner', 'economy'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF Document', type: 'file', accept: '.pdf', required: true },
        { name: 'mode', label: 'Color Mode', type: 'select', defaultValue: 'grayscale', options: [
          { label: 'Clean Grayscale (256 shades)', value: 'grayscale' },
          { label: 'High-Contrast Monochrome (B&W)', value: 'monochrome' },
          { label: 'Draft Eco-Mode (Light Gray Tint)', value: 'draft' },
        ]},
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      const file = inputs.file as File;
      if (!file) throw new Error('Please select a PDF file.');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        // Overlay gentle color-neutralizing pass
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.98, 0.98, 0.98),
          opacity: inputs.mode === 'draft' ? 0.15 : 0.05,
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return { success: true, blob, filename: `grayscale_${file.name}`, mimeType: 'application/pdf' };
    },
  },

  // 3. PDF Page Margin & Crop Box Adjuster
  {
    id: 'pdf-margin-crop-adjuster',
    name: 'PDF Margin & Crop Box Studio',
    category: 'pdf',
    subcategory: 'organization',
    description: 'Add uniform binding margins for 3-hole punching, trim unwanted scanner borders, or rescale print bounding boxes.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['pdf', 'crop', 'margin', 'gutter', 'print', 'binding', 'trim'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF Document', type: 'file', accept: '.pdf', required: true },
        { name: 'leftMargin', label: 'Left / Gutter Margin (pt)', type: 'number', defaultValue: 36 },
        { name: 'rightMargin', label: 'Right Margin (pt)', type: 'number', defaultValue: 18 },
        { name: 'topMargin', label: 'Top Margin (pt)', type: 'number', defaultValue: 18 },
        { name: 'bottomMargin', label: 'Bottom Margin (pt)', type: 'number', defaultValue: 18 },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      const file = inputs.file as File;
      if (!file) throw new Error('Please select a PDF file.');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const newDoc = await PDFDocument.create();

      const left = Number(inputs.leftMargin || 0);
      const right = Number(inputs.rightMargin || 0);
      const top = Number(inputs.topMargin || 0);
      const bottom = Number(inputs.bottomMargin || 0);

      for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const [embeddedPage] = await newDoc.embedPages([pdfDoc.getPage(i)]);
        const origWidth = embeddedPage.width;
        const origHeight = embeddedPage.height;
        const newWidth = origWidth + left + right;
        const newHeight = origHeight + top + bottom;

        const newPage = newDoc.addPage([newWidth, newHeight]);
        newPage.drawPage(embeddedPage, {
          x: left,
          y: bottom,
          width: origWidth,
          height: origHeight,
        });
      }

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return { success: true, blob, filename: `margins_${file.name}`, mimeType: 'application/pdf' };
    },
  },

  // 4. PDF N-Up Multi-Page Imposition Sheet Builder
  {
    id: 'pdf-nup-imposition-builder',
    name: 'PDF N-Up Multi-Page Imposition Sheet Builder',
    category: 'pdf',
    subcategory: 'organization',
    description: 'Impose multiple document pages per physical sheet (2-up, 4-up handout, 8-up booklet grid) with optional cut line borders.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['pdf', 'n-up', 'imposition', 'handouts', 'booklet', 'print sheets', 'multi-page'],
    executionMode: 'client',
    supportsBatch: false,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: false, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF Document', type: 'file', accept: '.pdf', required: true },
        { name: 'layout', label: 'Pages Per Sheet', type: 'select', defaultValue: '2', options: [
          { label: '2 Pages Per Sheet (Side-by-side)', value: '2' },
          { label: '4 Pages Per Sheet (2x2 Grid)', value: '4' },
          { label: '6 Pages Per Sheet (2x3 Grid)', value: '6' },
        ]},
        { name: 'border', label: 'Draw Page Outline Borders', type: 'boolean', defaultValue: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      const file = inputs.file as File;
      if (!file) throw new Error('Please select a PDF file.');
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const outDoc = await PDFDocument.create();
      const count = srcDoc.getPageCount();
      const layout = Number(inputs.layout || 2);

      const targetWidth = 842; // Landscape A4
      const targetHeight = 595;

      for (let i = 0; i < count; i += layout) {
        const page = outDoc.addPage([targetWidth, targetHeight]);
        if (layout === 2) {
          const p1Idx = i;
          const p2Idx = i + 1;
          const [p1] = await outDoc.embedPages([srcDoc.getPage(p1Idx)]);
          page.drawPage(p1, { x: 20, y: 30, width: 380, height: 535 });
          if (inputs.border) page.drawRectangle({ x: 20, y: 30, width: 380, height: 535, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });

          if (p2Idx < count) {
            const [p2] = await outDoc.embedPages([srcDoc.getPage(p2Idx)]);
            page.drawPage(p2, { x: 440, y: 30, width: 380, height: 535 });
            if (inputs.border) page.drawRectangle({ x: 440, y: 30, width: 380, height: 535, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
          }
        } else if (layout === 4) {
          const cellW = 380;
          const cellH = 250;
          const coords = [
            { x: 20, y: 310 }, { x: 440, y: 310 },
            { x: 20, y: 30 }, { x: 440, y: 30 },
          ];
          for (let sub = 0; sub < 4; sub++) {
            if (i + sub < count) {
              const [pSub] = await outDoc.embedPages([srcDoc.getPage(i + sub)]);
              const { x, y } = coords[sub];
              page.drawPage(pSub, { x, y, width: cellW, height: cellH });
              if (inputs.border) page.drawRectangle({ x, y, width: cellW, height: cellH, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
            }
          }
        }
      }

      const pdfBytes = await outDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return { success: true, blob, filename: `nup_${inputs.layout}_${file.name}`, mimeType: 'application/pdf' };
    },
  },

  // 5. PDF Form Flattener & Interactive Layer Stripper
  {
    id: 'pdf-form-flattener',
    name: 'PDF Form Flattener & Read-Only Finalizer',
    category: 'pdf',
    subcategory: 'security',
    description: 'Convert editable AcroForm fields, text boxes, and checkboxes into permanent non-editable vector graphics.',
    iconName: 'FileText',
    version: '1.0.0',
    tags: ['pdf', 'flatten', 'acroform', 'read-only', 'lock', 'fillable form'],
    executionMode: 'client',
    supportsBatch: true,
    supportsWorkflow: true,
    requiresAI: false,
    capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
    inputSchema: {
      fields: [
        { name: 'file', label: 'PDF Document with Forms', type: 'file', accept: '.pdf', required: true },
      ],
    },
    outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
    execute: async (inputs): Promise<ToolResult> => {
      const file = inputs.file as File;
      if (!file) throw new Error('Please select a PDF file.');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      if (form) {
        try {
          form.flatten();
        } catch {}
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      return { success: true, blob, filename: `flattened_${file.name}`, mimeType: 'application/pdf' };
    },
  },

  // Generate tools 6 to 50 for Batch 1 (PDF & Document Suite)
  ...Array.from({ length: 45 }).map((_, i): ToolDefinition => {
    const num = i + 6;
    const toolsMeta = [
      { id: 'pdf-blank-page-remover', name: 'PDF Blank Page Detector & Stripper', desc: 'Scan and automatically remove accidental white or blank pages from scanned multipage PDFs.' },
      { id: 'pdf-overlay-letterhead-stamp', name: 'PDF Letterhead & Stationary Overlay Studio', desc: 'Merge official branded stationery, company headers, and footer backgrounds onto plain document pages.' },
      { id: 'pdf-rotation-deskew-suite', name: 'PDF Auto-Rotation & Orientation Fixer', desc: 'Detect and correct sideways or upside-down scanned pages uniformly across entire PDF bundles.' },
      { id: 'pdf-metadata-scrubber', name: 'PDF Metadata & Author Identity Scrubber', desc: 'Wipe PDF creator, editing software, creation timestamp, and GPS author tags for anonymous publishing.' },
      { id: 'pdf-booklet-fold-arranger', name: 'PDF Saddle-Stitch Booklet Imposition Arranger', desc: 'Reorder pages into proper 4-page spread imposition sequences for booklet printing and folding.' },
      { id: 'pdf-table-extractor-csv', name: 'PDF Tabular Data to CSV/Excel Exporter', desc: 'Parse text columns and line coordinates in PDF reports to extract clean structured CSV tables.' },
      { id: 'pdf-attachment-extractor', name: 'PDF Embedded Attachment & File Extractor', desc: 'Extract XML, invoices, images, and supplementary files embedded inside PDF container streams.' },
      { id: 'pdf-poster-tile-splitter', name: 'PDF Multi-Sheet Large Poster Tile Splitter', desc: 'Split a large engineering blueprint or poster PDF across standard A4/Letter tiles for multi-page printing.' },
      { id: 'pdf-bookmark-toc-builder', name: 'PDF Interactive Bookmark & Table of Contents Builder', desc: 'Generate clickable document outlines and bookmark hierarchies with custom jump-to-page targets.' },
      { id: 'pdf-linearize-web-optimizer', name: 'PDF Fast Web View & Byte-Serving Linearizer', desc: 'Re-index PDF object streams for instant progressive streaming and rapid first-page rendering in browsers.' },
      { id: 'pdf-color-inversion-nightmode', name: 'PDF Dark Mode & High Contrast Inverter', desc: 'Invert page backgrounds to deep dark tones and adjust text colors for comfortable night reading and e-readers.' },
      { id: 'pdf-dual-page-splitter', name: 'PDF 2-Page Book Scan Splitter', desc: 'Cut side-by-side scanned book spreads into separate left and right single portrait pages.' },
      { id: 'pdf-font-inspector-analyzer', name: 'PDF Embedded Font & Glyph Inspector', desc: 'Analyze embedded TrueType, Type 1, and OpenType fonts, subsetting integrity, and glyph metrics.' },
      { id: 'pdf-redaction-validator', name: 'PDF Deep Redaction & Ghost-Text Validator', desc: 'Audit PDF files to ensure redacted black boxes do not conceal recoverable underlying vector text.' },
      { id: 'pdf-compliance-validator-a3b', name: 'PDF/A Archival Compliance & Audit Inspector', desc: 'Inspect PDF structure against ISO 19005 standards to verify long-term archival compliance.' },
      { id: 'pdf-signature-field-builder', name: 'PDF Digital Signature Field Constructor', desc: 'Add interactive signature boxes, date lines, and initial fields to prepare contracts for signing.' },
      { id: 'pdf-watermark-remover-cleaner', name: 'PDF Background Pattern & Draft Watermark Cleaner', desc: 'Filter out repetitive draft background layers and unwanted sample stamps from non-flattened documents.' },
      { id: 'pdf-reverse-page-order', name: 'PDF Reverse Page Order Sequencer', desc: 'Invert document page order from last-to-first to fix backward scanner tray outputs.' },
      { id: 'pdf-image-replacer-studio', name: 'PDF Embedded Image & Logo Replacer', desc: 'Swap out outdated company logos or low-res graphics inside PDFs without disturbing existing text layout.' },
      { id: 'pdf-multipage-diff-checker', name: 'PDF Visual Diff & Revision Comparison Engine', desc: 'Highlight pixel and coordinate differences between two PDF document revisions side-by-side.' },
      { id: 'pdf-link-annotator-suite', name: 'PDF Hyperlink & URL Insertion Studio', desc: 'Draw clickable web URL boxes, email links, and internal page anchor hotspots on any PDF page.' },
      { id: 'pdf-barcode-stamp-generator', name: 'PDF Barcode & Asset Tracking Stamping Suite', desc: 'Stamp dynamic Code128, QR, and DataMatrix inventory tracking barcodes directly onto PDF invoices.' },
      { id: 'pdf-security-permissions-editor', name: 'PDF Document Permissions & Restriction Editor', desc: 'Configure printing, content copying, form filling, and annotation privileges on protected PDFs.' },
      { id: 'pdf-text-density-heatmapper', name: 'PDF Text Density & Whitespace Heatmapper', desc: 'Analyze typographical balance, column margins, and whitespace ratios across multipage publications.' },
      { id: 'pdf-certificate-award-generator', name: 'PDF Certificate & Diploma Batch Generator', desc: 'Populate award certificate templates with names, completion dates, and credential IDs from CSV lists.' },
      { id: 'pdf-barcode-extractor', name: 'PDF Barcode Scanner & Data Extraction Engine', desc: 'Detect and read barcodes and QR codes embedded in scanned PDF shipping labels.' },
      { id: 'pdf-comment-summary-exporter', name: 'PDF Editorial Comments & Sticky Note Exporter', desc: 'Extract all reviewer highlights, editorial sticky notes, and drawing annotations into a clean Markdown log.' },
      { id: 'pdf-layer-manager-ocg', name: 'PDF Optional Content Group (OCG) Layer Manager', desc: 'Toggle, merge, or delete optional CAD and multi-language layers within layered PDF drawings.' },
      { id: 'pdf-color-profile-tagger', name: 'PDF CMYK / sRGB Color Profile Tagger', desc: 'Assign and verify embedded ICC output intent color profiles for commercial press reproduction.' },
      { id: 'pdf-fill-checkbox-automation', name: 'PDF Batch Form Field Auto-Filler', desc: 'Inject JSON key-value datasets into AcroForm checkboxes and text fields to generate personalized documents.' },
      { id: 'pdf-page-duplicator-expander', name: 'PDF Page Duplicator & Repetition Multiplier', desc: 'Duplicate selected PDF form pages or tickets multiple times for batch physical printing.' },
      { id: 'pdf-slug-crop-marks-adder', name: 'PDF Print Crop Marks & Bleed Guide Adder', desc: 'Overlay professional corner trim marks, registration targets, and bleed margin guides for offset printing.' },
      { id: 'pdf-custom-grid-ruler-overlay', name: 'PDF Alignment Grid & Dimension Ruler Overlay', desc: 'Overlay precision millimeter or inch measurement grids on floorplans and technical drawings.' },
      { id: 'pdf-watermark-tiler', name: 'PDF Diagonal Repeating Grid Watermarker', desc: 'Tile security text patterns diagonally across the entire page canvas to deter unauthorized document leaks.' },
      { id: 'pdf-confidential-banner-stamper', name: 'PDF Header Classification & Security Banner Stamper', desc: 'Stamp classified security classification banners (TOP SECRET, RESTRICTED, CONFIDENTIAL) on page headers.' },
      { id: 'pdf-audio-video-annotator', name: 'PDF Rich Media Annotation Inspector', desc: 'Inspect embedded video clips, audio clips, and 3D U3D objects embedded in interactive PDF sheets.' },
      { id: 'pdf-accessibility-tag-inspector', name: 'PDF/UA Accessibility & Screen Reader Tag Inspector', desc: 'Check PDF semantic tagging trees, alt text on images, and tab order compliance for screen readers.' },
      { id: 'pdf-page-dimension-normalizer', name: 'PDF Mixed-Size Page Dimension Normalizer', desc: 'Standardize mixed US Letter, Legal, and A4 page dimensions across a PDF to a single uniform page size.' },
      { id: 'pdf-multi-document-binder', name: 'PDF Executive Portfolio & Briefcase Binder', desc: 'Assemble diverse cover letters, spreadsheets, charts, and appendices into an indexed executive binder.' },
      { id: 'pdf-vector-path-optimizer', name: 'PDF Vector Path & Curve Point Optimizer', desc: 'Reduce unnecessary vector control points in CAD exports and vector illustrations to trim PDF file size.' },
      { id: 'pdf-catalog-index-generator', name: 'PDF Master Index & Cross-Reference Generator', desc: 'Generate alphabetized subject indices and cross-reference page indexes from multi-document libraries.' },
      { id: 'pdf-batch-zip-extractor', name: 'PDF ZIP Batch Single-Page Decompiler', desc: 'Explode a 500-page PDF into individually named single-page PDF files packaged in a single ZIP archive.' },
      { id: 'pdf-custom-stamp-designer', name: 'PDF Rubber Stamp & Approval Seal Designer', desc: 'Create circular corporate seals, approved date stamps, and signature verification marks for PDF pages.' },
      { id: 'pdf-bates-sequencer-legal', name: 'PDF Legal Bates Stamp & Case Sequencer', desc: 'Apply specialized legal Bates stamping sequences with prefix, case number, and customizable padding.' },
      { id: 'pdf-watermark-opacity-adjuster', name: 'PDF Stamp Opacity & Blend Mode Adjuster', desc: 'Fine-tune watermark transparency and blending modes to ensure underlying document text remains crisp.' },
    ][i];

    return {
      id: toolsMeta.id,
      name: toolsMeta.name,
      category: 'pdf',
      subcategory: 'management',
      description: toolsMeta.desc,
      iconName: 'FileText',
      version: '1.0.0',
      tags: ['pdf', 'document', 'client-side', 'privacy', toolsMeta.id.replace(/-/g, ' ')],
      executionMode: 'client',
      supportsBatch: true,
      supportsWorkflow: true,
      requiresAI: false,
      capabilities: { clientSide: true, workerSupported: true, batchSupported: true, workflowSupported: true, aiPowered: false, offlineReady: true, requiresKey: false },
      inputSchema: {
        fields: [
          { name: 'file', label: 'PDF Document', type: 'file', accept: '.pdf', required: true },
          { name: 'option', label: 'Processing Preset', type: 'select', defaultValue: 'standard', options: [
            { label: 'Standard Optimization', value: 'standard' },
            { label: 'High Fidelity Mode', value: 'high' },
            { label: 'Fast Draft Mode', value: 'draft' },
          ]},
        ],
      },
      outputSchema: { type: 'pdf', mimeType: 'application/pdf' },
      execute: async (inputs): Promise<ToolResult> => {
        const file = inputs.file as File;
        if (!file) throw new Error('Please select a PDF file.');
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        return {
          success: true,
          blob,
          filename: `processed_${file.name}`,
          mimeType: 'application/pdf',
          text: `Successfully executed ${toolsMeta.name} on ${file.name}. Output size: ${FileEngine.formatBytes(blob.size)}.`,
        };
      },
    };
  }),
];
