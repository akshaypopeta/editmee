import React from 'react';
import {
  FileText,
  PenTool,
  GitCompare,
  FormInput,
  Wrench,
  Crop,
  RotateCcw,
  FilePlus,
  ArrowRight,
  BookOpen,
  Bookmark,
  ScanText,
  EyeOff,
  Highlighter,
  Link,
  Layers,
  Paperclip,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCw,
  Scissors,
  FileDigit,
  Palette,
  Shield,
} from 'lucide-react';

interface WorkflowStep {
  title: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
}

interface PdfToolWorkflowDiagramProps {
  toolMode: string;
  toolName: string;
}

export const PdfToolWorkflowDiagram: React.FC<PdfToolWorkflowDiagramProps> = ({ toolMode, toolName }) => {
  const getWorkflowData = (): { title: string; subtitle: string; steps: WorkflowStep[] } => {
    switch (toolMode) {
      case 'sign':
        return {
          title: 'Electronic Signature Lifecycle',
          subtitle: 'Cryptographic signature placement and verification workflow',
          steps: [
            {
              title: '1. Ingestion & Layout',
              description: 'Load PDF pages and detect signature bounding coordinates',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Identity Rendering',
              description: 'Render high-resolution vector pen stroke or cursive identity badge',
              icon: <PenTool className="w-4 h-4 text-red-500" />,
            },
            {
              title: '3. Audit Stamp Embedding',
              description: 'Embed signer credentials, timestamp, and audit trail directly into PDF stream',
              icon: <Shield className="w-4 h-4 text-emerald-500" />,
            },
            {
              title: '4. Verified PDF Export',
              description: 'Generate standard compliance PDF with immutable vector seal',
              icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
            },
          ],
        };

      case 'compare':
        return {
          title: 'Document Diff & Comparison Pipeline',
          subtitle: 'Dual-version stream inspection, visual diff analysis, and audit report generation',
          steps: [
            {
              title: '1. Dual Ingestion',
              description: 'Parse Document A (Base) and Document B (Revision) page trees',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Alignment & Delta',
              description: 'Analyze page count deltas, dimensions, and object streams',
              icon: <GitCompare className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '3. Side-by-Side Synthesis',
              description: 'Generate synchronized dual-panel comparison sheets with header badges',
              icon: <Layers className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '4. Executive Diff PDF',
              description: 'Compile executive cover summary with page-by-page visual audit trail',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'form-filler':
        return {
          title: 'Interactive Form Field & AcroForm Pipeline',
          subtitle: 'Parse widget dictionaries, populate fields, and optionally flatten into static content',
          steps: [
            {
              title: '1. AcroForm Inspection',
              description: 'Extract interactive text fields, checkboxes, dropdowns, and radios',
              icon: <FormInput className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Value Binding',
              description: 'Safely inject sanitized user entries into PDF field dictionaries',
              icon: <PenTool className="w-4 h-4 text-emerald-500" />,
            },
            {
              title: '3. Flattening / Security',
              description: 'Bake field values into immutable page streams to prevent tampering',
              icon: <Lock className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '4. Form Export',
              description: 'Deliver standard interactive or archival-flattened PDF document',
              icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
            },
          ],
        };

      case 'repair':
        return {
          title: 'Deep PDF Stream & XRef Reconstruction',
          subtitle: 'Heuristic binary byte scanner and table rebuilder for corrupted documents',
          steps: [
            {
              title: '1. Magic Byte & Header Check',
              description: 'Strip junk prefix bytes, reconstruct %PDF- header and EOF trailers',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Stream Scan & Object Discovery',
              description: 'Scan raw binary for orphaned page dictionaries and embedded fonts',
              icon: <Wrench className="w-4 h-4 text-red-500" />,
            },
            {
              title: '3. XRef Table Rebuilding',
              description: 'Recompute exact byte offsets and reconstruct Cross-Reference table',
              icon: <RotateCcw className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '4. Validated PDF Generation',
              description: 'Save strictly compliant PDF/A compatible clean stream',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'crop':
        return {
          title: 'Margin Trimming & CropBox Recalculation',
          subtitle: 'Adjust MediaBox and CropBox bounding geometries with point precision',
          steps: [
            {
              title: '1. MediaBox Reading',
              description: 'Extract page width, height, rotation, and current crop boundaries',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Margin Math Offset',
              description: 'Calculate top, bottom, left, and right inset dimensions in points (1" = 72pt)',
              icon: <Crop className="w-4 h-4 text-red-500" />,
            },
            {
              title: '3. Vector Viewport Clipping',
              description: 'Set new CropBox and BleedBox parameters across selected pages',
              icon: <Scissors className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '4. Trimmed PDF Output',
              description: 'Export cleanly framed pages optimized for screen reading and print',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'deskew':
        return {
          title: 'Scanned Document Orientation & Deskewing',
          subtitle: 'Correct scan angle distortions and rotational tilt',
          steps: [
            {
              title: '1. Scanned Image Analysis',
              description: 'Detect current raster orientation and page rotation matrices',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Fine-Grain Angular Matrix',
              description: 'Compute precise degree offset (-15° to +15°) for level alignment',
              icon: <RotateCcw className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '3. Coordinate Transform',
              description: 'Apply affine rotational matrix to level tilted page streams',
              icon: <RotateCw className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '4. Leveled PDF Document',
              description: 'Export straight, level document pages ready for archiving & OCR',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'blank-page':
        return {
          title: 'Blank Page Insertion Flow',
          subtitle: 'Inject standardized blank pages with exact matching aspect ratios',
          steps: [
            {
              title: '1. Page Tree Mapping',
              description: 'Map page indices, dimensions, and target insertion offsets',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Canvas Dimensioning',
              description: 'Generate blank canvas matching document size or standard A4/Letter',
              icon: <FilePlus className="w-4 h-4 text-emerald-500" />,
            },
            {
              title: '3. Page Injection',
              description: 'Insert blank pages before, after, or at custom page sequence points',
              icon: <Layers className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '4. Re-indexed PDF Export',
              description: 'Rebuild document structure and save updated page hierarchy',
              icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
            },
          ],
        };

      case 'reverse':
        return {
          title: 'Page Reversal & Order Inversion',
          subtitle: 'Invert page sequences for reverse scan feeders or back-to-front printing',
          steps: [
            {
              title: '1. Page Index Scanning',
              description: 'Scan document page count from 1 to N',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Index Mapping Reversal',
              description: 'Map original indices to inverted order [N, N-1, ... 2, 1]',
              icon: <RotateCw className="w-4 h-4 text-red-500" />,
            },
            {
              title: '3. Tree Restructuring',
              description: 'Extract and assemble pages in reverse sequence without loss',
              icon: <Layers className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '4. Inverted PDF Export',
              description: 'Export document with inverted page ordering',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'booklet':
        return {
          title: 'Saddle-Stitch Booklet Imposition Flow',
          subtitle: 'Calculate 2-up sheet pairing for double-sided folding and booklet binding',
          steps: [
            {
              title: '1. Page Multiple Check',
              description: 'Calculate saddle-stitch 4-page signatures with blank padding',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. 2-Up Sheet Pairing',
              description: 'Pair Sheet Front [N, 1] and Sheet Back [2, N-1] with center fold margin',
              icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '3. Landscape Imposition',
              description: 'Scale and embed pairs onto landscape sheets with fold marks',
              icon: <Layers className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '4. Print-Ready Booklet',
              description: 'Export booklet PDF ready for duplex printing and central staple binding',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'bookmark':
        return {
          title: 'PDF Outline & Bookmark Indexing',
          subtitle: 'Create hierarchical table-of-contents navigation trees in PDF catalog',
          steps: [
            {
              title: '1. Catalog /Outlines Parse',
              description: 'Inspect existing document bookmarks and outline items',
              icon: <Bookmark className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Hierarchy Construction',
              description: 'Define bookmark titles, destination page numbers, and nesting levels',
              icon: <Layers className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '3. PDF Object Tree Linking',
              description: 'Link First, Last, Prev, and Next pointers with Page Destination vectors',
              icon: <Link className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '4. Indexed PDF Output',
              description: 'Export PDF with functional navigation sidebar bookmarks',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'ocr':
        return {
          title: 'OCR & Invisible Searchable Text Layer',
          subtitle: 'Perform optical text extraction and embed searchable text coordinates',
          steps: [
            {
              title: '1. Raster Page Rendering',
              description: 'Render high-DPI image canvases for each scanned document page',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Text & Coordinate Recognition',
              description: 'Extract words, paragraphs, bounding boxes, and orientation',
              icon: <ScanText className="w-4 h-4 text-purple-500" />,
            },
            {
              title: '3. Invisible Text Injection',
              description: 'Overlay transparent searchable text layer aligned exactly over scanned words',
              icon: <PenTool className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '4. Searchable PDF Archive',
              description: 'Export searchable, selectable, and copyable PDF/A compliant document',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'redact':
        return {
          title: 'Permanent Redaction & Sanitization Pipeline',
          subtitle: 'Permanently destroy confidential data streams and cover with solid vector blocks',
          steps: [
            {
              title: '1. Sensitive Content Detection',
              description: 'Identify target keywords, PII (SSN, Email, Phone), or manual bounding coordinates',
              icon: <EyeOff className="w-4 h-4 text-red-500" />,
            },
            {
              title: '2. True Content Deletion',
              description: 'Purge underlying text strings and graphic vectors from PDF stream',
              icon: <Scissors className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '3. Solid Block Overlay',
              description: 'Draw opaque black or white blackout boxes with optional reason stamps',
              icon: <Shield className="w-4 h-4 text-slate-800" />,
            },
            {
              title: '4. Sanitized PDF Export',
              description: 'Deliver irreversible, leak-proof PDF document ready for public release',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'annotate':
        return {
          title: 'PDF Annotation & Markup Studio',
          subtitle: 'Embed vector highlights, underlines, stamps, shapes, and sticky notes',
          steps: [
            {
              title: '1. Page Geometry Analysis',
              description: 'Map canvas coordinates to PDF point grid (72 DPI baseline)',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Vector Markup Rendering',
              description: 'Calculate opacity, stroke width, color fills, and typography',
              icon: <Highlighter className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '3. /Annots Stream Embedding',
              description: 'Register annotations in PDF page dictionary with interactive properties',
              icon: <PenTool className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '4. Annotated PDF Export',
              description: 'Export document with native PDF comments and markup layers',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'hyperlink':
        return {
          title: 'Hyperlink & Interactive URI Injector',
          subtitle: 'Embed clickable URL links, email actions, and jump-to-page bookmarks',
          steps: [
            {
              title: '1. Hotspot Positioning',
              description: 'Define clickable rectangle bounds [x, y, width, height] on target pages',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Action /URI Association',
              description: 'Construct PDF Action dictionary with web URL or target page destination',
              icon: <Link className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '3. Border & Hotspot Styling',
              description: 'Add subtle interactive highlight border and hover indicators',
              icon: <PenTool className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '4. Interactive PDF Export',
              description: 'Export document with clickable hyperlinks supported across all PDF readers',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'flatten':
        return {
          title: 'Form & Annotation Flattening Pipeline',
          subtitle: 'Convert interactive AcroForm widgets and markups into static page content',
          steps: [
            {
              title: '1. Widget & /Annots Discovery',
              description: 'Locate interactive form fields, buttons, and markup annotations',
              icon: <FormInput className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Appearance Stream Baking',
              description: 'Render widget visual appearances directly onto page content streams',
              icon: <Layers className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '3. Widget Dictionary Removal',
              description: 'Delete AcroForm dictionaries and /Annots arrays from document catalog',
              icon: <Scissors className="w-4 h-4 text-red-500" />,
            },
            {
              title: '4. Immutable PDF Export',
              description: 'Export read-only PDF document safe from form modifications',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'layers':
        return {
          title: 'Optional Content Groups (OCG) Manager',
          subtitle: 'Inspect, toggle, and configure multi-layer CAD & graphics PDF documents',
          steps: [
            {
              title: '1. OCG Dictionary Inspection',
              description: 'Parse /OCProperties and discover all embedded design layers',
              icon: <Layers className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Layer State Configuration',
              description: 'Configure ON/OFF default states and visibility grouping',
              icon: <PenTool className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '3. Stream Order Optimization',
              description: 'Reorder graphics layers and assign layer descriptions',
              icon: <Layers className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '4. Multi-Layer PDF Export',
              description: 'Export PDF with configured layer visibility for CAD & print',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };

      case 'attachments':
        return {
          title: 'Embedded Files & Portfolio Manager',
          subtitle: 'Embed spreadsheets, source files, and portfolios into the PDF document catalog',
          steps: [
            {
              title: '1. /EmbeddedFiles Tree Scan',
              description: 'Inspect existing attachments and portfolio file records',
              icon: <Paperclip className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. File Stream Packaging',
              description: 'Encode attached files with MIME types, creation timestamps, and descriptions',
              icon: <FilePlus className="w-4 h-4 text-emerald-500" />,
            },
            {
              title: '3. Catalog Registration',
              description: 'Register embedded file streams in document Names tree dictionary',
              icon: <Link className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '4. PDF Package Export',
              description: 'Export standalone PDF with all attached files securely bundled inside',
              icon: <CheckCircle2 className="w-4 h-4 text-purple-500" />,
            },
          ],
        };

      default:
        return {
          title: `${toolName} Processing Flow`,
          subtitle: 'Reliable client-side PDF document manipulation',
          steps: [
            {
              title: '1. Document Ingestion',
              description: 'Safely parse PDF binary streams in browser memory',
              icon: <FileText className="w-4 h-4 text-blue-500" />,
            },
            {
              title: '2. Parameter Application',
              description: 'Apply precision transformations, geometry, or metadata',
              icon: <PenTool className="w-4 h-4 text-indigo-500" />,
            },
            {
              title: '3. Integrity Verification',
              description: 'Verify page tree structure, byte offsets, and compliance',
              icon: <Shield className="w-4 h-4 text-amber-500" />,
            },
            {
              title: '4. Validated Export',
              description: 'Generate high-fidelity downloadable PDF output',
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            },
          ],
        };
    }
  };

  const workflow = getWorkflowData();

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            {workflow.title}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{workflow.subtitle}</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 w-fit">
          100% Client-Side Private Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {workflow.steps.map((step, idx) => (
          <div
            key={idx}
            className="relative bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60 rounded-xl p-3 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{step.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
            </div>

            {idx < workflow.steps.length - 1 && (
              <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-slate-300 dark:text-slate-600">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
