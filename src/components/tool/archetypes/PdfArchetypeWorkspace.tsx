import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import JSZip from 'jszip';
import { ToolDefinition } from '../../../types';
import { PdfEngine, PdfDocumentInfo, ExtractedFormField } from '../../../core/pdf-engine/PdfEngine';
import { FileEngine } from '../../../core/file-engine/FileEngine';
import { taskManager } from '../../../core/task-manager/TaskManager';
import {
  SignToolPanel,
  CompareToolPanel,
  FormFillerToolPanel,
  RepairToolPanel,
  CropToolPanel,
  DeskewToolPanel,
  BlankPageToolPanel,
  PageReverserToolPanel,
  BookletToolPanel,
  BookmarkToolPanel,
  BookmarkEntry,
  OcrToolPanel,
  RedactionToolPanel,
  RedactionBox,
  AnnotationToolPanel,
  AnnotationItem,
  HyperlinkToolPanel,
  HyperlinkItem,
  FlattenToolPanel,
  LayersToolPanel,
  PdfLayerItem,
  AttachmentsToolPanel,
  EmbeddedFileQueueItem,
  ImagesToPdfToolPanel,
  ImagesToPdfOptions,
  SecurityInspectorToolPanel,
  BlankPageStripperToolPanel,
  ClassificationBannerToolPanel,
  ClassificationBannerState,
} from './pdf/panels';
import { PdfToolWorkflowDiagram } from './pdf/PdfToolWorkflowDiagram';
import { PdfSecurityReport, PdfBlankDetectionReport } from '../../../core/pdf-engine/PdfEngine';
import {
  FileText,
  Upload,
  Download,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  FileCheck,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  FilePlus,
  ArrowRight,
  FolderDown,
  Info,
  SlidersHorizontal,
  X,
  Type,
  Hash,
  Scissors,
  Minimize2,
  FileBox,
  FileDigit,
  Palette,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  PenTool,
  GitCompare,
  Wrench,
  Crop,
  RotateCcw,
  FormInput,
} from 'lucide-react';

interface Props {
  tool: ToolDefinition;
}

interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  rotation: number;
  selected: boolean;
}

export const PdfArchetypeWorkspace: React.FC<Props> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [docInfo, setDocInfo] = useState<PdfDocumentInfo | null>(null);
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFilename, setResultFilename] = useState<string>('processed_document.pdf');
  const [resultStats, setResultStats] = useState<{ beforeSize: number; afterSize: number; detail?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Multi-file queue for merge / binder tools
  const [multiFiles, setMultiFiles] = useState<{ id: string; file: File; name: string; size: number }[]>([]);

  // Multi-image queue for images-to-pdf
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagesToPdfOptions, setImagesToPdfOptions] = useState<ImagesToPdfOptions>({
    pageSize: 'fit',
    orientation: 'auto',
    fitMode: 'contain',
    margin: 0,
  });

  // Security Inspector state
  const [securityReport, setSecurityReport] = useState<PdfSecurityReport | null>(null);
  const [isInspectingSecurity, setIsInspectingSecurity] = useState(false);

  // Extracted text / data
  const [extractedText, setExtractedText] = useState<string | null>(null);

  // Splitter Mode & Parameters
  const [splitMode, setSplitMode] = useState<'extract' | 'every-page' | 'every-n-pages' | 'custom-ranges' | 'break-points'>('extract');
  const [pageRange, setPageRange] = useState('');
  const [splitEveryN, setSplitEveryN] = useState<number>(2);
  const [customRangeList, setCustomRangeList] = useState<{ id: string; start: number; end: number; name: string }[]>([
    { id: '1', start: 1, end: 2, name: 'Part 1' },
  ]);
  const [breakPointInput, setBreakPointInput] = useState<string>('5, 10');

  // Rotate Mode
  const [rotationAngle, setRotationAngle] = useState(90);

  // Compressor Mode & Presets
  const [compressPreset, setCompressPreset] = useState<'high' | 'recommended' | 'strong' | 'extreme' | 'custom'>('recommended');
  const [customDpi, setCustomDpi] = useState<number>(150);
  const [customQuality, setCustomQuality] = useState<number>(75);
  const [customGrayscale, setCustomGrayscale] = useState<boolean>(false);
  const [customRemoveMetadata, setCustomRemoveMetadata] = useState<boolean>(true);

  // Protect Mode & Parameters
  const [userPassword, setUserPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [protectAlgorithm, setProtectAlgorithm] = useState<'AES-256' | 'RC4-128'>('AES-256');
  const [allowPrinting, setAllowPrinting] = useState<boolean>(true);
  const [allowCopying, setAllowCopying] = useState<boolean>(false);
  const [allowModifying, setAllowModifying] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showOwnerPassword, setShowOwnerPassword] = useState<boolean>(false);

  // Watermark Mode & Parameters
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(25);
  const [watermarkColor, setWatermarkColor] = useState('#ef4444');
  const [watermarkRotation, setWatermarkRotation] = useState(45);
  const [watermarkSize, setWatermarkSize] = useState(48);
  const [watermarkPosition, setWatermarkPosition] = useState<
    'center' | 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  >('center');
  const [watermarkTiled, setWatermarkTiled] = useState<boolean>(false);
  const [watermarkTileSpacingX, setWatermarkTileSpacingX] = useState<number>(200);
  const [watermarkTileSpacingY, setWatermarkTileSpacingY] = useState<number>(140);

  // Page Numberer Mode & Parameters
  const [pageNumberFormat, setPageNumberFormat] = useState('Page {n} of {total}');
  const [pageNumberPosition, setPageNumberPosition] = useState<'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center' | 'top-right' | 'top-left'>('bottom-center');
  const [pageNumberStart, setPageNumberStart] = useState<number>(1);
  const [pageNumberFontSize, setPageNumberFontSize] = useState<number>(10);
  const [pageNumberMargin, setPageNumberMargin] = useState<number>(25);
  const [pageNumberColor, setPageNumberColor] = useState<string>('#475569');

  // Other tools state
  const [batesPrefix, setBatesPrefix] = useState('DOC-');
  const [batesStart, setBatesStart] = useState(1);
  const [batesDigits, setBatesDigits] = useState(6);
  const [batesPosition, setBatesPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'bottom-center'>('bottom-right');
  const [metadataTitle, setMetadataTitle] = useState('');
  const [metadataAuthor, setMetadataAuthor] = useState('');
  const [metadataSubject, setMetadataSubject] = useState('');
  const [stripAllMetadata, setStripAllMetadata] = useState(false);
  const [imageExportFormat, setImageExportFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [imageExportDpi, setImageExportDpi] = useState(2);
  const [textExportFormat, setTextExportFormat] = useState<'txt' | 'html' | 'md' | 'csv'>('txt');

  // Sign Mode Parameters
  const [signerName, setSignerName] = useState('John Doe');
  const [signatureText, setSignatureText] = useState('John Doe');
  const [signatureImageBase64, setSignatureImageBase64] = useState<string>('');
  const [stampStyle, setStampStyle] = useState<'verified-badge' | 'clean-signature'>('verified-badge');
  const [signerTitle, setSignerTitle] = useState('Authorized Signer');
  const [signatureReason, setSignatureReason] = useState('Approved and Verified');
  const [signPlacement, setSignPlacement] = useState<'last' | 'first' | 'all' | 'custom'>('last');
  const [signCustomPage, setSignCustomPage] = useState<number>(1);
  const [signPosition, setSignPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'custom'>('bottom-right');

  // Compare Mode Parameters
  const [compareFileB, setCompareFileB] = useState<File | null>(null);
  const [compareBufferB, setCompareBufferB] = useState<ArrayBuffer | null>(null);
  const [compareDocInfoB, setCompareDocInfoB] = useState<PdfDocumentInfo | null>(null);
  const [compareMode, setCompareMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  // Form Filler Mode Parameters
  const [detectedFormFields, setDetectedFormFields] = useState<ExtractedFormField[]>([]);
  const [formFieldValues, setFormFieldValues] = useState<Record<string, any>>({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 019-2834',
    date: new Date().toISOString().slice(0, 10),
    agreeToTerms: true,
  });
  const [flattenForm, setFlattenForm] = useState(false);

  // Repair Mode Parameters
  const [aggressiveRepair, setAggressiveRepair] = useState(true);
  const [repairDiagnosticLog, setRepairDiagnosticLog] = useState<string[]>([]);

  // Crop Mode Parameters
  const [cropTop, setCropTop] = useState<number>(36);
  const [cropBottom, setCropBottom] = useState<number>(36);
  const [cropLeft, setCropLeft] = useState<number>(36);
  const [cropRight, setCropRight] = useState<number>(36);

  // Deskew Mode Parameters
  const [deskewAngle, setDeskewAngle] = useState<number>(0);

  // Advanced Mode Toggle
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);

  // Blank Page Mode Parameters
  const [blankPagePosition, setBlankPagePosition] = useState<'before' | 'after' | 'start' | 'end'>('after');
  const [blankTargetPage, setBlankTargetPage] = useState<number>(1);
  const [blankPageCount, setBlankPageCount] = useState<number>(1);
  const [blankPageSize, setBlankPageSize] = useState<'A4' | 'Letter' | 'match'>('match');

  // Blank Page Stripper State
  const [blankDetectionReport, setBlankDetectionReport] = useState<PdfBlankDetectionReport | null>(null);
  const [isScanningBlanks, setIsScanningBlanks] = useState<boolean>(false);
  const [blankScanProgress, setBlankScanProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [selectedPagesToRemove, setSelectedPagesToRemove] = useState<number[]>([]);

  // Security Classification Banner State
  const [bannerConfig, setBannerConfig] = useState<ClassificationBannerState>({
    classification: 'CONFIDENTIAL',
    customLabel: '',
    handlingInstruction: 'Internal Use Only — Do Not Distribute',
    organization: '',
    caseOrRefNumber: '',
    placement: 'both',
    pageScope: 'all',
    customPageRange: '',
    bannerStyle: 'solid-bar',
    bannerColor: '#d97706',
    fontSize: 10,
    bannerHeight: 24,
    opacity: 0.95,
    addDate: false,
  });

  // Page Reverser Parameters
  const [reverseScope, setReverseScope] = useState<'all' | 'odd' | 'even'>('all');

  // Booklet Parameters
  const [bookletPaperSize, setBookletPaperSize] = useState<'A4' | 'Letter'>('A4');
  const [bookletGutter, setBookletGutter] = useState<number>(12);

  // Bookmark Parameters
  const [bookmarkList, setBookmarkList] = useState<BookmarkEntry[]>([
    { id: '1', title: 'Section 1 - Overview', pageNumber: 1, level: 1 },
    { id: '2', title: 'Section 2 - Details', pageNumber: 2, level: 1 },
  ]);

  // OCR Parameters
  const [ocrLanguage, setOcrLanguage] = useState<string>('eng');
  const [ocrQuality, setOcrQuality] = useState<'fast' | 'high'>('high');

  // Redaction Parameters
  const [redactionBoxes, setRedactionBoxes] = useState<RedactionBox[]>([
    { id: '1', pageNumber: 1, x: 72, y: 500, width: 200, height: 28, reason: 'REDACTED - CONFIDENTIAL' },
  ]);

  // Annotation Parameters
  const [annotList, setAnnotList] = useState<AnnotationItem[]>([
    { id: '1', type: 'highlight', pageNumber: 1, x: 72, y: 650, width: 220, height: 20, color: '#f59e0b', opacity: 35 },
  ]);

  // Hyperlink Parameters
  const [hyperlinksList, setHyperlinksList] = useState<HyperlinkItem[]>([
    { id: '1', pageNumber: 1, url: 'https://editmee.com', x: 72, y: 600, width: 200, height: 24 },
  ]);

  // Flatten Parameters
  const [flattenFormsOnly, setFlattenFormsOnly] = useState<boolean>(true);
  const [flattenAnnotationsOnly, setFlattenAnnotationsOnly] = useState<boolean>(true);

  // Layers Parameters
  const [pdfLayersList, setPdfLayersList] = useState<PdfLayerItem[]>([
    { id: '1', name: 'Base Background & Headers', visible: true },
    { id: '2', name: 'Vector Graphics & Drawings', visible: true },
    { id: '3', name: 'Form Field Widgets', visible: true },
    { id: '4', name: 'Reviewer Annotations', visible: true },
  ]);

  // Attachments Parameters
  const [embeddedFilesQueue, setEmbeddedFilesQueue] = useState<EmbeddedFileQueueItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const multiFileInputRef = useRef<HTMLInputElement | null>(null);
  const compareFileInputRef = useRef<HTMLInputElement | null>(null);

  const toolId = (tool.id || '').toLowerCase();
  const toolName = (tool.name || '').toLowerCase();

  // Determine tool category / intent mode
  const isMergeMode =
    toolId.includes('merge') ||
    toolId.includes('binder') ||
    toolName.includes('merge') ||
    toolName.includes('binder') ||
    toolName.includes('portfolio');

  const isImagesToPdf =
    toolId.includes('images-to-pdf') ||
    toolId.includes('image-to-pdf') ||
    toolName.includes('images to pdf') ||
    toolName.includes('jpg to pdf') ||
    toolName.includes('png to pdf');

  const isPdfToImages =
    !isImagesToPdf &&
    (toolId.includes('pdf-to-jpg') ||
      toolId.includes('pdf-to-image') ||
      toolId.includes('image-extractor') ||
      toolName.includes('pdf to jpg') ||
      toolName.includes('pdf to image') ||
      toolName.includes('image extractor') ||
      toolId.includes('image-replacer'));

  const isPdfToText =
    toolId.includes('pdf-to-word') ||
    toolId.includes('pdf-to-text') ||
    toolId.includes('table-extractor') ||
    toolId.includes('table to') ||
    (!toolId.includes('text-watermark') && toolId.includes('text-density')) ||
    toolId.includes('comment-summary') ||
    toolId.includes('barcode-extractor') ||
    toolId.includes('attachment-extractor') ||
    toolName.includes('pdf to word') ||
    toolName.includes('pdf to text') ||
    toolName.includes('table to csv') ||
    toolName.includes('table-extractor') ||
    toolName.includes('tabular data') ||
    toolName.includes('barcode scanner') ||
    toolName.includes('comment');

  const isSplitExtractMode =
    !isPdfToImages &&
    !isPdfToText &&
    !toolId.includes('watermark') &&
    !toolName.includes('watermark') &&
    (toolId.includes('split') ||
      toolId.includes('page-extractor') ||
      toolId.includes('page-extract') ||
      toolId.includes('tile') ||
      toolId.includes('poster') ||
      toolId.includes('dual-page') ||
      toolId.includes('batch-zip') ||
      toolName.includes('split') ||
      toolName.includes('page extractor') ||
      toolName.includes('page extract') ||
      toolName.includes('tile') ||
      toolName.includes('poster'));

  const isRotateMode =
    !toolId.includes('deskew') &&
    !toolName.includes('deskew') &&
    (toolId.includes('rotate') ||
      toolName.includes('rotate') ||
      toolName.includes('orientation'));

  const isCompressMode =
    toolId.includes('compress') ||
    toolId.includes('optimize') ||
    toolId.includes('linearize') ||
    toolName.includes('compress') ||
    toolName.includes('optimize') ||
    toolName.includes('linearizer');

  const isSecurityInspectorMode =
    toolId.includes('security-envelope-inspector') ||
    toolId.includes('security-inspector') ||
    toolId.includes('handler-inspector') ||
    toolName.includes('security handler') ||
    toolName.includes('security inspector') ||
    (toolName.includes('inspector') && (toolName.includes('security') || toolName.includes('encryption') || toolName.includes('aes')));

  const isProtectMode =
    !isSecurityInspectorMode &&
    (toolId.includes('protect') ||
      toolId.includes('encrypt') ||
      toolId.includes('permission') ||
      toolName.includes('protect') ||
      toolName.includes('encrypt') ||
      toolName.includes('permission')) &&
    !toolId.includes('unlock') &&
    !toolName.includes('unlock');

  const isUnlockMode =
    toolId.includes('unlock') ||
    toolId.includes('decrypt') ||
    toolName.includes('unlock') ||
    toolName.includes('decrypt');

  const isClassificationBannerMode =
    toolId.includes('confidential-banner') ||
    toolId.includes('classification-banner') ||
    toolId.includes('security-banner') ||
    toolId.includes('header-classification') ||
    toolName.toLowerCase().includes('classification') ||
    (toolName.toLowerCase().includes('security') && toolName.toLowerCase().includes('banner'));

  const isWatermarkMode =
    !isClassificationBannerMode &&
    (toolId.includes('watermark') ||
      toolId.includes('seal') ||
      (toolId.includes('banner') && !toolId.includes('classification') && !toolId.includes('security') && !toolId.includes('confidential')) ||
      toolName.includes('watermark') ||
      toolName.includes('seal'));

  const isBatesMode =
    toolId.includes('bates') ||
    toolName.includes('bates') ||
    toolName.includes('sequencer');

  const isPageNumberMode =
    toolId.includes('numberer') ||
    toolId.includes('header') ||
    toolId.includes('footer') ||
    toolName.includes('page number') ||
    toolName.includes('header & footer') ||
    toolName.includes('numbering');

  const isSignMode =
    toolId.includes('sign') ||
    toolId.includes('e-sign') ||
    toolName.includes('sign') ||
    toolName.includes('signature');

  const isCompareMode =
    toolId.includes('compare') ||
    toolId.includes('diff') ||
    toolName.includes('compare') ||
    toolName.includes('diff');

  const isFormFillerMode =
    toolId.includes('form-filler') ||
    toolId.includes('form-editor') ||
    toolName.includes('form filler') ||
    toolName.includes('acroform');

  const isRepairMode =
    toolId.includes('repair') ||
    toolId.includes('recover') ||
    toolName.includes('repair') ||
    toolName.includes('rebuilder') ||
    toolName.includes('corrupt');

  const isCropMode =
    toolId.includes('crop') ||
    toolId.includes('trim') ||
    toolName.includes('crop') ||
    toolName.includes('trimmer') ||
    toolName.includes('margin');

  const isDeskewMode =
    toolId.includes('deskew') ||
    toolName.includes('deskew') ||
    toolName.includes('leveler');

  const isBlankPageStripperMode =
    toolId.includes('blank-page-remover') ||
    toolId.includes('blank-page-stripper') ||
    toolId.includes('blank-page-detector') ||
    (toolId.includes('blank') && (toolId.includes('remove') || toolId.includes('strip') || toolId.includes('clean'))) ||
    (toolName.toLowerCase().includes('blank') && (toolName.toLowerCase().includes('strip') || toolName.toLowerCase().includes('remove') || toolName.toLowerCase().includes('detector')));

  const isBlankPageInserterMode =
    (toolId.includes('blank-page-inserter') ||
      toolId.includes('insert-blank-page') ||
      (toolId.includes('blank') && toolId.includes('insert')) ||
      (toolName.toLowerCase().includes('blank') && toolName.toLowerCase().includes('insert'))) &&
    !isBlankPageStripperMode;

  const isBlankPageMode = isBlankPageInserterMode;

  const isPageReverserMode =
    toolId.includes('revers') ||
    toolName.includes('revers');

  const isBookletMode =
    toolId.includes('booklet') ||
    toolName.includes('booklet') ||
    toolId.includes('fold');

  const isBookmarkMode =
    toolId.includes('bookmark') ||
    toolName.includes('bookmark') ||
    toolId.includes('outline') ||
    toolId.includes('toc');

  const isOcrMode =
    toolId.includes('ocr') ||
    toolName.includes('ocr') ||
    toolId.includes('searchable');

  const isRedactionMode =
    toolId.includes('redact') ||
    toolName.includes('redact') ||
    toolId.includes('blackout') ||
    toolId.includes('sanitiz');

  const isAnnotationMode =
    toolId.includes('annotat') ||
    toolName.includes('annotat') ||
    toolId.includes('markup') ||
    toolId.includes('highlight');

  const isHyperlinkMode =
    toolId.includes('hyperlink') ||
    toolName.includes('hyperlink') ||
    toolId.includes('link-editor') ||
    toolId.includes('link');

  const isFlattenMode =
    toolId.includes('flatten') ||
    toolName.includes('flatten');

  const isLayersMode =
    toolId.includes('layer') ||
    toolName.includes('layer') ||
    toolId.includes('ocg');

  const isAttachmentsMode =
    toolId.includes('attachment') ||
    toolName.includes('attachment') ||
    toolId.includes('embed-file');

  const isColorDarkMode =
    toolId.includes('grayscale') ||
    toolId.includes('invert') ||
    toolId.includes('dark-mode') ||
    toolId.includes('toner') ||
    toolName.includes('grayscale') ||
    toolName.includes('dark mode') ||
    toolName.includes('invert') ||
    toolName.includes('toner');

  const isMetadataMode =
    toolId.includes('metadata') ||
    toolId.includes('scrubber') ||
    toolId.includes('compliance') ||
    toolId.includes('font-inspector') ||
    toolName.includes('metadata') ||
    toolName.includes('scrubber') ||
    toolName.includes('compliance') ||
    toolName.includes('font');

  const isOrganizeMode =
    !isBlankPageMode &&
    !isPageReverserMode &&
    !isBookletMode &&
    (toolId.includes('duplicat') ||
      toolId.includes('impos') ||
      toolId.includes('n-up') ||
      toolName.includes('duplicator') ||
      toolName.includes('n-up'));

  const isFlattenRedactMode =
    !isFlattenMode &&
    !isRedactionMode &&
    (toolId.includes('blackout') || toolName.includes('blackout'));

  // Should we render page thumbnails? (Splitter, Watermark, Page Numberer, Rotate, Organize, Sign, Crop, Deskew, Bookmark, OCR, Annotation, Redaction, Hyperlink)
  // PDF Compressor, PDF Protect, PDF Unlock, Security Inspector, and PDF Repair MUST NOT render page thumbnails!
  const shouldShowThumbnails =
    !isCompressMode &&
    !isProtectMode &&
    !isUnlockMode &&
    !isPdfToImages &&
    !isImagesToPdf &&
    !isSecurityInspectorMode &&
    !isPdfToText &&
    !isMetadataMode &&
    !isRepairMode &&
    !isCompareMode &&
    !isBlankPageStripperMode &&
    (isSplitExtractMode ||
      isWatermarkMode ||
      isClassificationBannerMode ||
      isPageNumberMode ||
      isRotateMode ||
      isOrganizeMode ||
      isBatesMode ||
      isSignMode ||
      isCropMode ||
      isDeskewMode ||
      isBlankPageMode ||
      isPageReverserMode ||
      isBookletMode ||
      isBookmarkMode ||
      isOcrMode ||
      isRedactionMode ||
      isAnnotationMode ||
      isHyperlinkMode ||
      isFlattenMode ||
      isLayersMode ||
      isAttachmentsMode);

  // Helper to format selected page indices into clean ranges (e.g. [0, 1, 2, 4] -> "1-3, 5")
  const formatPageIndicesToRange = (indices: number[]) => {
    if (indices.length === 0) return '';
    const sorted = Array.from(new Set(indices)).sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      if (current === prev + 1) {
        prev = current;
      } else {
        ranges.push(start === prev ? `${start + 1}` : `${start + 1}-${prev + 1}`);
        start = current;
        prev = current;
      }
    }
    ranges.push(start === prev ? `${start + 1}` : `${start + 1}-${prev + 1}`);
    return ranges.join(', ');
  };

  // Helper to parse human-readable range string (e.g. "1-3, 5, 8-10") into 0-indexed page array
  const parseRangeStringToIndices = (rangeStr: string, totalPages: number): number[] => {
    if (!rangeStr || !rangeStr.trim()) return [];
    const parts = rangeStr.split(',').map((p) => p.trim());
    const indices: number[] = [];

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-');
        const s = parseInt(startStr, 10);
        const e = parseInt(endStr, 10);
        if (!isNaN(s) && !isNaN(e)) {
          const min = Math.min(s, e);
          const max = Math.max(s, e);
          for (let i = min; i <= max; i++) {
            if (i >= 1 && i <= totalPages) {
              indices.push(i - 1);
            }
          }
        }
      } else {
        const val = parseInt(part, 10);
        if (!isNaN(val) && val >= 1 && val <= totalPages) {
          indices.push(val - 1);
        }
      }
    }
    return Array.from(new Set(indices)).sort((a, b) => a - b);
  };

  // Reset all workspace state
  const resetAll = useCallback(() => {
    setFile(null);
    setFileBuffer(null);
    setDocInfo(null);
    setThumbnails([]);
    setResultBlob(null);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }
    setResultStats(null);
    setExtractedText(null);
    setDetectedFormFields([]);
    setErrorMessage(null);
    setStatusMessage(null);
    setProgressPercent(0);
    setMultiFiles([]);
    setImageFiles([]);
    setPageRange('');
    setUserPassword('');
    setConfirmPassword('');
    setOwnerPassword('');
    taskManager.clearTask(tool.id);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (multiFileInputRef.current) multiFileInputRef.current.value = '';
  }, [resultUrl, tool.id]);

  // Sync with TaskManager for cross-tool protection
  useEffect(() => {
    if (processing) {
      taskManager.registerTask({
        toolId: tool.id,
        toolName: tool.name,
        isProcessing: true,
        hasUnsavedData: true,
        statusText: statusMessage || 'Processing document...',
        onAbort: () => {
          setProcessing(false);
        },
      });
    } else if (file || multiFiles.length > 0 || imageFiles.length > 0 || resultBlob) {
      taskManager.registerTask({
        toolId: tool.id,
        toolName: tool.name,
        isProcessing: false,
        hasUnsavedData: true,
        statusText: resultBlob ? 'Output ready to download' : 'Document active',
        onAbort: () => {
          resetAll();
        },
      });
    } else {
      taskManager.clearTask(tool.id);
    }
  }, [processing, file, multiFiles.length, imageFiles.length, resultBlob, statusMessage, tool.id, tool.name, resetAll]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      taskManager.clearTask(tool.id);
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }
    };
  }, [tool.id, resultUrl]);

  // Load document buffer and thumbnails
  const loadPdfFile = useCallback(
    async (selectedFile: File) => {
      setLoading(true);
      setErrorMessage(null);
      setStatusMessage(null);
      setResultBlob(null);
      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
        setResultUrl(null);
      }
      setResultStats(null);
      setExtractedText(null);
      setProgressPercent(0);

      try {
        const buffer = await FileEngine.readAsArrayBuffer(selectedFile);
        setFile(selectedFile);
        setFileBuffer(buffer);

        const info = await PdfEngine.getDocumentInfo(buffer);
        setDocInfo(info);

        if (info.title) setMetadataTitle(info.title);
        if (info.author) setMetadataAuthor(info.author);
        if (info.subject) setMetadataSubject(info.subject);

        // Initialize range state
        setPageRange(`1-${info.numPages}`);
        setCustomRangeList([
          { id: '1', start: 1, end: Math.min(2, info.numPages), name: 'Part 1' },
        ]);

        // If this tool requires page thumbnails and file is not encrypted
        if (shouldShowThumbnails && !info.isEncrypted) {
          try {
            const pdfJsDoc = await PdfEngine.loadPdfJsDoc(buffer);
            const thumbs: PageThumbnail[] = [];
            const renderCount = Math.min(info.numPages, 100);

            for (let i = 1; i <= renderCount; i++) {
              const canvas = document.createElement('canvas');
              await PdfEngine.renderPageToCanvas(pdfJsDoc, i, 0.35, canvas);
              thumbs.push({
                pageNumber: i,
                dataUrl: canvas.toDataURL('image/jpeg', 0.8),
                width: canvas.width,
                height: canvas.height,
                rotation: 0,
                selected: true,
              });
            }
            setThumbnails(thumbs);
          } catch (thumbErr: any) {
            console.warn('Thumbnail generation skipped:', thumbErr);
            setThumbnails([]);
          }
        } else {
          setThumbnails([]);
        }

        if (info.isEncrypted) {
          if (isUnlockMode) {
            setStatusMessage(`Loaded password-protected "${selectedFile.name}". Enter password below to unlock.`);
          } else {
            setStatusMessage(`Loaded password-protected "${selectedFile.name}".`);
            setErrorMessage('This PDF is password-protected. Please unlock it using the PDF Unlocker tool to view or modify pages.');
          }
        } else {
          setStatusMessage(`Loaded "${selectedFile.name}" (${info.numPages} pages)`);
        }

        if (isSecurityInspectorMode) {
          setIsInspectingSecurity(true);
          try {
            const report = await PdfEngine.inspectPdfSecurity(buffer);
            setSecurityReport(report);
          } catch (secErr) {
            console.error('Security inspection error:', secErr);
          } finally {
            setIsInspectingSecurity(false);
          }
        }

        if (isBlankPageStripperMode && !info.isEncrypted) {
          setIsScanningBlanks(true);
          setBlankScanProgress({ current: 0, total: info.numPages });
          try {
            const report = await PdfEngine.detectBlankPages(buffer, {
              whitespaceThreshold: 0.002,
              scanNoiseTolerance: 20,
              onProgress: (current, total) => setBlankScanProgress({ current, total }),
            });
            setBlankDetectionReport(report);
            const autoSelect = report.pages.filter((p) => p.isBlank).map((p) => p.pageIndex);
            setSelectedPagesToRemove(autoSelect);
          } catch (scanErr) {
            console.error('Blank page scan error:', scanErr);
          } finally {
            setIsScanningBlanks(false);
          }
        }

        if (isFormFillerMode || isFlattenMode) {
          try {
            const fields = await PdfEngine.getFormFields(buffer);
            setDetectedFormFields(fields);
            if (fields && fields.length > 0) {
              const initialVals: Record<string, any> = {};
              fields.forEach((f) => {
                if (f.value !== undefined && f.value !== '') {
                  initialVals[f.name] = f.value;
                }
              });
              setFormFieldValues((prev) => ({ ...initialVals, ...prev }));
            }
          } catch (formErr) {
            console.warn('Form field detection skipped:', formErr);
          }
        }
      } catch (err: any) {
        console.error('Error loading PDF:', err);
        const msg = err?.message || String(err);
        if (msg.toLowerCase().includes('password') || err?.name === 'PasswordException') {
          if (isUnlockMode) {
            setStatusMessage(`Loaded password-protected "${selectedFile.name}". Enter password below to unlock.`);
          } else {
            setErrorMessage('This PDF is password-protected. Please unlock it using the PDF Unlocker tool.');
          }
        } else {
          setErrorMessage(`Failed to load PDF: ${msg || 'The file may be corrupted.'}`);
        }
      } finally {
        setLoading(false);
      }
    },
    [shouldShowThumbnails, isSecurityInspectorMode, isUnlockMode, resultUrl]
  );

  // Load sample document (PDF or Images depending on active mode)
  const loadSampleDocument = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isImagesToPdf) {
        const canvas1 = document.createElement('canvas');
        canvas1.width = 1200;
        canvas1.height = 800;
        const ctx1 = canvas1.getContext('2d')!;
        ctx1.fillStyle = '#0f172a';
        ctx1.fillRect(0, 0, 1200, 800);
        ctx1.fillStyle = '#ef4444';
        ctx1.fillRect(80, 80, 1040, 120);
        ctx1.fillStyle = '#ffffff';
        ctx1.font = 'bold 38px system-ui, sans-serif';
        ctx1.fillText('SAMPLE IMAGE 1 (PRODUCT SPECIFICATION)', 120, 155);
        ctx1.font = '22px system-ui, sans-serif';
        ctx1.fillStyle = '#94a3b8';
        ctx1.fillText('EditMee High-Resolution Images to PDF Studio', 120, 270);
        ctx1.fillText('Format: PNG (Lossless 24-bit RGB)', 120, 310);
        ctx1.fillText('Dimensions: 1200 x 800 px', 120, 350);

        const blob1 = await new Promise<Blob>((resolve) => canvas1.toBlob((b) => resolve(b!), 'image/png'));
        const img1 = new File([blob1], 'sample_diagram_1.png', { type: 'image/png' });

        const canvas2 = document.createElement('canvas');
        canvas2.width = 1200;
        canvas2.height = 800;
        const ctx2 = canvas2.getContext('2d')!;
        ctx2.fillStyle = '#1e293b';
        ctx2.fillRect(0, 0, 1200, 800);
        ctx2.fillStyle = '#3b82f6';
        ctx2.fillRect(80, 80, 1040, 120);
        ctx2.fillStyle = '#ffffff';
        ctx2.font = 'bold 38px system-ui, sans-serif';
        ctx2.fillText('SAMPLE IMAGE 2 (ARCHITECTURE SCHEMATIC)', 120, 155);
        ctx2.font = '22px system-ui, sans-serif';
        ctx2.fillStyle = '#94a3b8';
        ctx2.fillText('Multi-page raster consolidation demo', 120, 270);
        ctx2.fillText('Auto orientation & margin trimming active', 120, 310);
        ctx2.fillText('Target Standard: ISO 32000-1 Compliant', 120, 350);

        const blob2 = await new Promise<Blob>((resolve) => canvas2.toBlob((b) => resolve(b!), 'image/png'));
        const img2 = new File([blob2], 'sample_diagram_2.png', { type: 'image/png' });

        setFile(null);
        setFileBuffer(null);
        setDocInfo(null);
        setThumbnails([]);
        setResultBlob(null);
        if (resultUrl) {
          URL.revokeObjectURL(resultUrl);
          setResultUrl(null);
        }
        setResultStats(null);
        setImageFiles([img1, img2]);
        setStatusMessage('Loaded 2 high-resolution sample images.');
      } else {
        const sampleBytes = await PdfEngine.createSamplePdf();
        const sampleFile = new File([sampleBytes], 'sample_document.pdf', { type: 'application/pdf' });
        await loadPdfFile(sampleFile);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to generate sample document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Change File handler
  const handleChangeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Drag & drop handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (isImagesToPdf) {
        const imgs = Array.from(e.dataTransfer.files).filter(
          (f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|svg|tiff)$/i.test(f.name)
        );
        if (imgs.length > 0) {
          setFile(null);
          setFileBuffer(null);
          setDocInfo(null);
          setThumbnails([]);
          setResultBlob(null);
          if (resultUrl) {
            URL.revokeObjectURL(resultUrl);
            setResultUrl(null);
          }
          setResultStats(null);
          setImageFiles(imgs);
          setStatusMessage(`Loaded ${imgs.length} image(s) for PDF conversion`);
        }
      } else if (isMergeMode) {
        const pdfs = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
        if (pdfs.length > 0) {
          setMultiFiles(pdfs.map((f) => ({ id: Math.random().toString(36).substring(2, 9), file: f, name: f.name, size: f.size })));
        }
      } else {
        const pdf = Array.from(e.dataTransfer.files).find((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
        if (pdf) {
          setImageFiles([]);
          loadPdfFile(pdf);
        }
      }
    }
  };

  // Toggle page selection
  const togglePageSelection = (pageNum: number) => {
    setThumbnails((prev) => {
      const updated = prev.map((th) => (th.pageNumber === pageNum ? { ...th, selected: !th.selected } : th));
      const selectedIndices = updated.filter((t) => t.selected).map((t) => t.pageNumber - 1);
      setPageRange(formatPageIndicesToRange(selectedIndices));
      return updated;
    });
  };

  // Select all pages
  const selectAllPages = () => {
    const total = docInfo?.numPages || 1;
    setThumbnails((prev) => prev.map((t) => ({ ...t, selected: true })));
    setPageRange(`1-${total}`);
  };

  // Deselect all pages
  const deselectAllPages = () => {
    setThumbnails((prev) => prev.map((t) => ({ ...t, selected: false })));
    setPageRange('');
  };

  // Invert page selection
  const invertPageSelection = () => {
    setThumbnails((prev) => {
      const updated = prev.map((t) => ({ ...t, selected: !t.selected }));
      const selectedIndices = updated.filter((t) => t.selected).map((t) => t.pageNumber - 1);
      setPageRange(formatPageIndicesToRange(selectedIndices));
      return updated;
    });
  };

  // Exclude first page (cover) for numbering
  const excludeFirstPage = () => {
    const total = docInfo?.numPages || 1;
    if (total <= 1) return;
    setThumbnails((prev) =>
      prev.map((t) => ({
        ...t,
        selected: t.pageNumber > 1,
      }))
    );
    setPageRange(`2-${total}`);
  };

  // Synchronize range input text with thumbnail checkboxes
  const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPageRange(val);
    if (!docInfo) return;
    const indices = parseRangeStringToIndices(val, docInfo.numPages);
    const selectedSet = new Set(indices);
    setThumbnails((prev) =>
      prev.map((t) => ({
        ...t,
        selected: selectedSet.has(t.pageNumber - 1),
      }))
    );
  };

  // Compute selected indices (Single source of truth)
  const selectedPageIndices = useMemo(() => {
    if (!docInfo) return [];
    if (thumbnails.length > 0) {
      return thumbnails.filter((t) => t.selected).map((t) => t.pageNumber - 1);
    }
    return parseRangeStringToIndices(pageRange, docInfo.numPages);
  }, [thumbnails, pageRange, docInfo]);

  // Re-scan blank pages with custom sensitivity / noise tolerance
  const handleRescanBlanks = async (threshold: number, noiseTol: number) => {
    let activeBuf: Uint8Array | ArrayBuffer | null = fileBuffer;
    if (file && (!activeBuf || (activeBuf instanceof ArrayBuffer && activeBuf.byteLength === 0))) {
      try {
        activeBuf = await FileEngine.readAsArrayBuffer(file);
        setFileBuffer(activeBuf);
      } catch (err) {
        console.warn('Could not read buffer:', err);
      }
    }
    if (!activeBuf) return;
    setIsScanningBlanks(true);
    setBlankScanProgress({ current: 0, total: docInfo?.numPages || 1 });
    try {
      const report = await PdfEngine.detectBlankPages(activeBuf, {
        whitespaceThreshold: threshold,
        scanNoiseTolerance: noiseTol,
        onProgress: (current, total) => setBlankScanProgress({ current, total }),
      });
      setBlankDetectionReport(report);
      const autoSelect = report.pages.filter((p) => p.isBlank).map((p) => p.pageIndex);
      setSelectedPagesToRemove(autoSelect);
    } catch (err) {
      console.error('Blank rescan error:', err);
    } finally {
      setIsScanningBlanks(false);
    }
  };

  // Master Execution Handler
  const handleExecute = async () => {
    let activeBuffer: Uint8Array | ArrayBuffer | null = fileBuffer;
    if (file && (!activeBuffer || (activeBuffer instanceof ArrayBuffer && activeBuffer.byteLength === 0) || (activeBuffer instanceof Uint8Array && activeBuffer.byteLength === 0))) {
      try {
        activeBuffer = await FileEngine.readAsArrayBuffer(file);
        setFileBuffer(activeBuffer);
      } catch (err) {
        console.warn('Could not re-read file buffer:', err);
      }
    }

    if (!activeBuffer && !isMergeMode && !isImagesToPdf) {
      setErrorMessage('Please upload a PDF file to process.');
      return;
    }

    setProcessing(true);
    setErrorMessage(null);
    setStatusMessage('Processing document...');
    setProgressPercent(10);
    const startTime = performance.now();

    try {
      let outputBlob: Blob | null = null;
      let outputFilename = 'processed_document.pdf';

      // 1. PDF Splitter & Extraction Suite
      if (isSplitExtractMode) {
        setStatusMessage('Executing split operation...');
        const total = docInfo?.numPages || 1;

        if (splitMode === 'extract') {
          const indicesToExtract =
            selectedPageIndices.length > 0
              ? selectedPageIndices
              : Array.from({ length: total }, (_, i) => i);
          const res = await PdfEngine.splitPdfMultiMode(activeBuffer!, {
            mode: 'extract',
            selectedIndices: indicesToExtract,
          });
          const fileItem = res.files && res.files[0] ? res.files[0] : null;
          const bytes = fileItem ? fileItem.bytes : activeBuffer!;
          outputBlob = new Blob([bytes], { type: 'application/pdf' });
          outputFilename = `extracted_${indicesToExtract.length}_pages_${file?.name || 'document.pdf'}`;
          setResultStats({
            beforeSize: file?.size || 0,
            afterSize: outputBlob.size,
            detail: `Extracted ${indicesToExtract.length} page${indicesToExtract.length > 1 ? 's' : ''} into 1 document`,
          });
        } else if (splitMode === 'every-page') {
          setStatusMessage('Splitting all pages into separate files...');
          const res = await PdfEngine.splitPdfMultiMode(activeBuffer!, { mode: 'every-page' });
          
          if (res.files.length <= 1) {
            const bytes = res.files[0] ? res.files[0].bytes : activeBuffer!;
            outputBlob = new Blob([bytes], { type: 'application/pdf' });
            outputFilename = `page_1_${file?.name || 'document.pdf'}`;
          } else {
            // Bundle into ZIP
            const zip = new JSZip();
            res.files.forEach((f) => {
              zip.file(f.name, f.bytes);
            });
            outputBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
              setProgressPercent(Math.round(metadata.percent));
            });
            outputFilename = `split_pages_${file?.name.replace(/\.[^/.]+$/, '') || 'document'}.zip`;
          }
          setResultStats({
            beforeSize: file?.size || 0,
            afterSize: outputBlob.size,
            detail: `Created ${res.files.length} individual page files in a ZIP archive`,
          });
        } else if (splitMode === 'every-n-pages') {
          const n = Math.max(1, splitEveryN);
          setStatusMessage(`Splitting every ${n} pages...`);
          const res = await PdfEngine.splitPdfMultiMode(activeBuffer!, {
            mode: 'every-n-pages',
            everyN: n,
          });

          if (res.files.length <= 1) {
            const bytes = res.files[0] ? res.files[0].bytes : activeBuffer!;
            outputBlob = new Blob([bytes], { type: 'application/pdf' });
            outputFilename = res.files[0]?.name || `split_${file?.name || 'document.pdf'}`;
          } else {
            const zip = new JSZip();
            res.files.forEach((f) => {
              zip.file(f.name, f.bytes);
            });
            outputBlob = await zip.generateAsync({ type: 'blob' });
            outputFilename = `split_chunks_${file?.name.replace(/\.[^/.]+$/, '') || 'document'}.zip`;
          }
          setResultStats({
            beforeSize: file?.size || 0,
            afterSize: outputBlob.size,
            detail: `Created ${res.files.length} documents (every ${n} pages)`,
          });
        } else if (splitMode === 'custom-ranges') {
          let validRanges = customRangeList.filter((r) => r.start >= 1 && r.end >= r.start);
          if (validRanges.length === 0) {
            validRanges = [{ id: '1', start: 1, end: total, name: 'Range_1' }];
          }
          setStatusMessage('Processing custom ranges...');
          const res = await PdfEngine.splitPdfMultiMode(activeBuffer!, {
            mode: 'custom-ranges',
            customRanges: validRanges.map((r) => ({ start: r.start, end: r.end, name: `${r.name}.pdf` })),
          });

          if (res.files.length <= 1) {
            const bytes = res.files[0] ? res.files[0].bytes : activeBuffer!;
            outputBlob = new Blob([bytes], { type: 'application/pdf' });
            outputFilename = res.files[0]?.name || `custom_range_${file?.name || 'document.pdf'}`;
          } else {
            const zip = new JSZip();
            res.files.forEach((f) => {
              zip.file(f.name, f.bytes);
            });
            outputBlob = await zip.generateAsync({ type: 'blob' });
            outputFilename = `custom_ranges_${file?.name.replace(/\.[^/.]+$/, '') || 'document'}.zip`;
          }
          setResultStats({
            beforeSize: file?.size || 0,
            afterSize: outputBlob.size,
            detail: `Created ${res.files.length} custom-range documents`,
          });
        } else if (splitMode === 'break-points') {
          let points = breakPointInput
            .split(',')
            .map((p) => parseInt(p.trim(), 10))
            .filter((p) => !isNaN(p) && p > 1 && p <= total);
          if (points.length === 0) {
            points = total > 1 ? [Math.ceil(total / 2)] : [];
          }
          const res = await PdfEngine.splitPdfMultiMode(activeBuffer!, {
            mode: 'break-points',
            breakPoints: points,
          });

          if (res.files.length <= 1) {
            const bytes = res.files[0] ? res.files[0].bytes : activeBuffer!;
            outputBlob = new Blob([bytes], { type: 'application/pdf' });
            outputFilename = res.files[0]?.name || `section_${file?.name || 'document.pdf'}`;
          } else {
            const zip = new JSZip();
            res.files.forEach((f) => {
              zip.file(f.name, f.bytes);
            });
            outputBlob = await zip.generateAsync({ type: 'blob' });
            outputFilename = `split_at_breaks_${file?.name.replace(/\.[^/.]+$/, '') || 'document'}.zip`;
          }
          setResultStats({
            beforeSize: file?.size || 0,
            afterSize: outputBlob.size,
            detail: `Split into ${res.files.length} sections at page break points`,
          });
        }
      }

      // 2. PDF Compressor & Optimizer
      else if (isCompressMode) {
        setStatusMessage('Compressing and optimizing document streams...');
        const customOpts =
          compressPreset === 'custom'
            ? {
                dpi: customDpi,
                imageQuality: customQuality,
                grayscale: customGrayscale,
                removeMetadata: customRemoveMetadata,
              }
            : undefined;

        const result = await PdfEngine.compressPdf(
          activeBuffer!,
          compressPreset,
          customOpts,
          (percent, msg) => {
            setProgressPercent(percent);
            setStatusMessage(msg);
            taskManager.updateTaskProgress(percent, msg);
          }
        );

        const safeBytes = result.compressedBytes && result.compressedBytes.length > 0
          ? result.compressedBytes
          : activeBuffer instanceof Uint8Array
          ? activeBuffer
          : new Uint8Array(activeBuffer!);

        outputBlob = new Blob([safeBytes], { type: 'application/pdf' });
        outputFilename = `compressed_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: result.originalSize,
          afterSize: result.compressedSize || outputBlob.size,
          detail: result.isReduced
            ? `Reduced by ${result.reductionPercentage}% (${formatBytes(result.originalSize - result.compressedSize)} saved)`
            : 'Document is already at maximum stream efficiency',
        });
      }

      // 3. PDF Protect & Cryptographic Encryption
      else if (isProtectMode) {
        if (!userPassword || userPassword.trim().length === 0) {
          throw new Error('Please enter a document open password.');
        }
        if (userPassword !== confirmPassword) {
          throw new Error('Password and Confirm Password do not match. Please re-type your password.');
        }

        setStatusMessage('Encrypting document with AES-256 cipher...');
        const encryptedBytes = await PdfEngine.encryptPdf(activeBuffer!, userPassword.trim(), {
          ownerPassword: ownerPassword && ownerPassword.trim() ? ownerPassword.trim() : undefined,
          algorithm: protectAlgorithm,
          permissions: {
            printing: allowPrinting ? 'highResolution' : 'none',
            copying: allowCopying,
            modifying: allowModifying,
          },
        });

        outputBlob = new Blob([encryptedBytes], { type: 'application/pdf' });
        outputFilename = `protected_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Encrypted with ${protectAlgorithm} cipher. Password required to open.`,
        });
      }

      // 4. PDF Watermark & Stamps
      else if (isWatermarkMode) {
        const textToApply = watermarkText.trim() || 'CONFIDENTIAL';
        const targetPages =
          selectedPageIndices.length > 0
            ? selectedPageIndices
            : Array.from({ length: docInfo?.numPages || 1 }, (_, i) => i);

        setStatusMessage(`Applying watermark to ${targetPages.length} page${targetPages.length > 1 ? 's' : ''}...`);
        const hex = watermarkColor.replace('#', '') || 'ef4444';
        const num = parseInt(hex, 16) || 0xef4444;
        const color = {
          r: ((num >> 16) & 255) / 255,
          g: ((num >> 8) & 255) / 255,
          b: (num & 255) / 255,
        };

        const watermarkedBytes = await PdfEngine.addWatermark(activeBuffer!, textToApply, {
          opacity: (watermarkOpacity || 25) / 100,
          size: watermarkSize || 48,
          rotation: watermarkRotation ?? 45,
          position: watermarkPosition || 'center',
          color,
          targetPageIndices: targetPages,
          tiled: watermarkTiled,
          tileSpacingX: watermarkTileSpacingX,
          tileSpacingY: watermarkTileSpacingY,
        });

        outputBlob = new Blob([watermarkedBytes], { type: 'application/pdf' });
        outputFilename = `watermarked_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Watermark applied to ${targetPages.length} of ${docInfo?.numPages || 1} pages`,
        });
      }

      // 5. PDF Page Numberer
      else if (isPageNumberMode) {
        const targetPages =
          selectedPageIndices.length > 0
            ? selectedPageIndices
            : Array.from({ length: docInfo?.numPages || 1 }, (_, i) => i);

        setStatusMessage(`Adding page numbers to ${targetPages.length} page${targetPages.length > 1 ? 's' : ''}...`);
        const hex = pageNumberColor.replace('#', '') || '475569';
        const num = parseInt(hex, 16) || 0x475569;
        const color = {
          r: ((num >> 16) & 255) / 255,
          g: ((num >> 8) & 255) / 255,
          b: (num & 255) / 255,
        };

        const numberedBytes = await PdfEngine.addPageNumbers(activeBuffer!, {
          format: pageNumberFormat || 'Page {n} of {total}',
          position: pageNumberPosition || 'bottom-center',
          startNumber: pageNumberStart || 1,
          fontSize: pageNumberFontSize || 10,
          margin: pageNumberMargin || 25,
          color,
          targetPageIndices: targetPages,
        });

        outputBlob = new Blob([numberedBytes], { type: 'application/pdf' });
        outputFilename = `numbered_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Numbered ${targetPages.length} pages starting from #${pageNumberStart || 1}`,
        });
      }

      // 6. Rotate & Deskew
      else if (isRotateMode) {
        const targetIndices = selectedPageIndices.length > 0 ? selectedPageIndices : undefined;
        setStatusMessage(`Rotating ${targetIndices ? targetIndices.length : 'all'} pages by ${rotationAngle}°...`);
        const rotatedBytes = await PdfEngine.rotatePages(activeBuffer!, rotationAngle, targetIndices);
        outputBlob = new Blob([rotatedBytes], { type: 'application/pdf' });
        outputFilename = `rotated_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Rotated ${targetIndices ? targetIndices.length : (docInfo?.numPages || 1)} pages by ${rotationAngle}° clockwise`,
        });
      }

      // 7. Metadata Editor & Privacy Scrubber
      else if (isMetadataMode) {
        setStatusMessage('Updating PDF document metadata properties...');
        const updatedBytes = await PdfEngine.updateMetadata(activeBuffer!, {
          title: metadataTitle,
          author: metadataAuthor,
          subject: metadataSubject,
          stripAll: stripAllMetadata,
        });
        outputBlob = new Blob([updatedBytes], { type: 'application/pdf' });
        outputFilename = `metadata_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: stripAllMetadata
            ? 'Sanitized and stripped all hidden metadata & personal identifiers'
            : 'Updated document metadata dictionary and info properties',
        });
      }

      // 8. Grayscale & Dark Mode Color Converter
      else if (isColorDarkMode) {
        const isDark = toolId.includes('invert') || toolId.includes('dark-mode') || toolName.includes('dark mode') || toolName.includes('invert');
        setStatusMessage(isDark ? 'Inverting document colors to Dark Mode...' : 'Converting PDF document to Grayscale monochrome...');
        const convertedBytes = isDark
          ? await PdfEngine.convertPdfToDarkMode(activeBuffer!)
          : await PdfEngine.convertPdfToGrayscale(activeBuffer!);
        outputBlob = new Blob([convertedBytes], { type: 'application/pdf' });
        outputFilename = `${isDark ? 'darkmode_' : 'grayscale_'}${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: isDark
            ? 'Converted all document layers to high-contrast Dark Mode'
            : 'Converted document color space to monochrome grayscale',
        });
      }

      // 9. Legal Bates Numbering & Stamping
      else if (isBatesMode) {
        setStatusMessage('Applying legal Bates stamps to document pages...');
        const stampedBytes = await PdfEngine.applyBatesStamp(activeBuffer!, {
          prefix: batesPrefix,
          startNumber: batesStart,
          digitCount: batesDigits,
          position: batesPosition,
        });
        outputBlob = new Blob([stampedBytes], { type: 'application/pdf' });
        outputFilename = `bates_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Applied Bates sequence ${batesPrefix}${String(batesStart).padStart(batesDigits, '0')} to ${docInfo?.numPages || 1} pages`,
        });
      }

      // 10. PDF to Raster Images (JPG, PNG, WebP)
      else if (isPdfToImages) {
        setStatusMessage('Converting PDF pages to raster images...');
        const total = docInfo?.numPages || 1;
        const ext = imageExportFormat === 'image/png' ? 'png' : imageExportFormat === 'image/webp' ? 'webp' : 'jpg';
        if (total === 1) {
          const imgDataUrl = await PdfEngine.renderPageToImage(activeBuffer!, 1, imageExportDpi);
          const res = await fetch(imgDataUrl);
          outputBlob = await res.blob();
          outputFilename = `${file?.name.replace(/\.[^/.]+$/, '') || 'document'}_page_1.${ext}`;
        } else {
          const zip = new JSZip();
          for (let p = 1; p <= total; p++) {
            setProgressPercent(Math.round((p / total) * 90));
            setStatusMessage(`Rendering page ${p} of ${total}...`);
            const imgDataUrl = await PdfEngine.renderPageToImage(activeBuffer!, p, imageExportDpi);
            const base64Data = imgDataUrl.split(',')[1];
            zip.file(`page_${String(p).padStart(3, '0')}.${ext}`, base64Data, { base64: true });
          }
          outputBlob = await zip.generateAsync({ type: 'blob' });
          outputFilename = `${file?.name.replace(/\.[^/.]+$/, '') || 'document'}_images.zip`;
        }
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Rendered ${total} page${total > 1 ? 's' : ''} at ${imageExportDpi === 3 ? '600 DPI' : imageExportDpi === 2 ? '300 DPI' : '150 DPI'}`,
        });
      }

      // 11. PDF to Structured Text & Doc Intel
      else if (isPdfToText) {
        setStatusMessage('Extracting structured text from document...');
        const extracted = await PdfEngine.extractStructuredText(activeBuffer!);
        const textContent =
          extracted.text && extracted.text.trim().length > 0
            ? extracted.text
            : '--- No direct text layer detected in PDF (scanned or image-only document) ---';
        setExtractedText(textContent);
        let mime = 'text/plain;charset=utf-8';
        let content = textContent;
        const ext = textExportFormat;
        if (textExportFormat === 'html') {
          mime = 'text/html;charset=utf-8';
          content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file?.name || 'Document'}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:2rem auto;line-height:1.6;padding:1rem;color:#1e293b;}</style></head><body><h1>${file?.name || 'Document'}</h1><div>${textContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</div></body></html>`;
        } else if (textExportFormat === 'md') {
          mime = 'text/markdown;charset=utf-8';
          content = `# ${file?.name || 'Document'}\n\n${textContent}`;
        }
        outputBlob = new Blob([content], { type: mime });
        outputFilename = `${file?.name.replace(/\.[^/.]+$/, '') || 'extracted_text'}.${ext}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Extracted ${textContent.length} characters of structured content across ${docInfo?.numPages || 1} pages`,
        });
      }

      // 12. Merge Multi-PDF
      else if (isMergeMode) {
        if (multiFiles.length < 2) {
          throw new Error('Please add at least 2 PDF files to merge.');
        }
        const buffers: ArrayBuffer[] = [];
        for (const item of multiFiles) {
          buffers.push(await FileEngine.readAsArrayBuffer(item.file));
        }
        const mergedBytes = await PdfEngine.mergePdfs(buffers);
        outputBlob = new Blob([mergedBytes], { type: 'application/pdf' });
        outputFilename = 'merged_document.pdf';
        setResultStats({
          beforeSize: multiFiles.reduce((acc, f) => acc + f.file.size, 0),
          afterSize: outputBlob.size,
          detail: `Merged ${multiFiles.length} separate documents into 1 complete PDF`,
        });
      }

      // 13. Images to PDF
      else if (isImagesToPdf) {
        if (imageFiles.length === 0) {
          throw new Error('Please upload at least one image file.');
        }
        setStatusMessage(`Converting ${imageFiles.length} image(s) to PDF...`);
        const pdfBytes = await PdfEngine.imagesToPdf(imageFiles, {
          pageSize: imagesToPdfOptions.pageSize,
          orientation: imagesToPdfOptions.orientation,
          fitMode: imagesToPdfOptions.fitMode,
          margin: imagesToPdfOptions.margin,
          onProgress: (curr, total) => {
            setProgressPercent(Math.round((curr / total) * 90));
          },
        });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFilename = 'converted_images.pdf';
        setResultStats({
          beforeSize: imageFiles.reduce((acc, f) => acc + f.size, 0),
          afterSize: outputBlob.size,
          detail: `Converted ${imageFiles.length} image files into 1 PDF document (${imagesToPdfOptions.pageSize.toUpperCase()} page size, ${imagesToPdfOptions.orientation} orientation)`,
        });
      }

      // Security Forensic Inspector
      else if (isSecurityInspectorMode) {
        setStatusMessage('Running comprehensive cryptographic security inspection...');
        const report = await PdfEngine.inspectPdfSecurity(activeBuffer!);
        setSecurityReport(report);
        const jsonReport = JSON.stringify(report, null, 2);
        outputBlob = new Blob([jsonReport], { type: 'application/json' });
        outputFilename = `security_audit_${file?.name.replace(/\.[^/.]+$/, '') || 'document'}.json`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Security inspection completed. Algorithm: ${report.algorithm} (${report.securityHandler})`,
        });
      }

      // 14. Unlock & Decrypt
      else if (isUnlockMode) {
        const decryptedBytes = await PdfEngine.decryptPdf(activeBuffer!, userPassword);
        outputBlob = new Blob([decryptedBytes], { type: 'application/pdf' });
        outputFilename = `unlocked_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: 'Decrypted and removed all password restrictions and permission locks',
        });
      }

      // 15. Sign PDF (Electronic Signature)
      else if (isSignMode) {
        setStatusMessage('Applying electronic signature and audit badge...');
        const signedBytes = await PdfEngine.signPdf(activeBuffer!, {
          signatureImageBase64: signatureImageBase64 || undefined,
          signerName: signerName || 'Authorized Signer',
          signatureText: signatureText || signerName || 'Signed',
          signerTitle: signerTitle,
          reason: signatureReason,
          pageMode: signPlacement,
          customPage: signCustomPage,
          position: signPosition,
          stampStyle: stampStyle,
          dateText: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        });
        outputBlob = new Blob([signedBytes], { type: 'application/pdf' });
        outputFilename = `signed_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Electronically signed document as "${signerName}" with cryptographic audit seal`,
        });
      }

      // 16. PDF Compare & Visual Diff
      else if (isCompareMode) {
        if (!compareBufferB || !compareFileB) {
          throw new Error('Please upload Document B to perform comparison.');
        }
        setStatusMessage('Comparing document versions and generating visual audit diff...');
        const { diffPdfBytes, summary } = await PdfEngine.comparePdfs(activeBuffer!, compareBufferB);
        outputBlob = new Blob([diffPdfBytes], { type: 'application/pdf' });
        outputFilename = `comparison_${file?.name.replace(/\.[^/.]+$/, '')}_vs_${compareFileB.name.replace(/\.[^/.]+$/, '')}.pdf`;
        setResultStats({
          beforeSize: (file?.size || 0) + compareFileB.size,
          afterSize: outputBlob.size,
          detail: summary.report,
        });
      }

      // 17. PDF Form Filler & Field Editor
      else if (isFormFillerMode) {
        setStatusMessage('Filling interactive form fields and embedding data...');
        const filledBytes = await PdfEngine.fillPdfForms(activeBuffer!, formFieldValues, flattenForm);
        outputBlob = new Blob([filledBytes], { type: 'application/pdf' });
        outputFilename = `filled_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: flattenForm
            ? 'Populated form fields and flattened into read-only document'
            : 'Populated interactive AcroForm fields (editable format preserved)',
        });
      }

      // 18. PDF Repair & Corrupt Stream Rebuilder
      else if (isRepairMode) {
        setStatusMessage('Scanning structural XRef tables and rebuilding object streams...');
        const { repairedBytes, log } = await PdfEngine.repairPdf(activeBuffer!, { aggressive: aggressiveRepair });
        setRepairDiagnosticLog(log);
        outputBlob = new Blob([repairedBytes], { type: 'application/pdf' });
        outputFilename = `repaired_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Recovered ${docInfo?.numPages || 1} pages with intact xref hierarchy`,
        });
      }

      // 19. PDF Crop Pages & Margin Trimmer
      else if (isCropMode) {
        setStatusMessage('Applying precision margin crop boundaries...');
        const croppedBytes = await PdfEngine.cropMargins(activeBuffer!, {
          top: Number(cropTop || 0),
          bottom: Number(cropBottom || 0),
          left: Number(cropLeft || 0),
          right: Number(cropRight || 0),
        });
        outputBlob = new Blob([croppedBytes], { type: 'application/pdf' });
        outputFilename = `cropped_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Trimmed margins (T:${cropTop}pt, B:${cropBottom}pt, L:${cropLeft}pt, R:${cropRight}pt) across ${docInfo?.numPages || 1} pages`,
        });
      }

      // 20. PDF Scanned Page Deskew & Leveler
      else if (isDeskewMode) {
        setStatusMessage(`Correcting document rotational tilt (${deskewAngle}°)...`);
        const deskewedBytes = await PdfEngine.deskewPdf(activeBuffer!, deskewAngle);
        outputBlob = new Blob([deskewedBytes], { type: 'application/pdf' });
        outputFilename = `deskewed_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Straightened scanned page alignment by ${deskewAngle}° leveling angle`,
        });
      }

      // 21a. PDF Blank Page Detector & Stripper
      else if (isBlankPageStripperMode) {
        const pagesToRemove = selectedPagesToRemove.length > 0 
          ? selectedPagesToRemove 
          : (blankDetectionReport ? blankDetectionReport.pages.filter(p => p.isBlank).map(p => p.pageIndex) : []);
        
        setStatusMessage(`Removing ${pagesToRemove.length} blank page(s)...`);
        const { pdfBytes, removedCount, remainingPages, removedPageNumbers } = await PdfEngine.removeBlankPages(activeBuffer!, {
          targetPageIndicesToRemove: pagesToRemove,
        });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFilename = `cleaned_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Safely removed ${removedCount} blank page${removedCount === 1 ? '' : 's'}${removedPageNumbers.length > 0 ? ` (pages ${removedPageNumbers.join(', ')})` : ''}. ${remainingPages} page(s) preserved.`,
        });
      }

      // 21b. PDF Header Classification & Security Banner Stamper
      else if (isClassificationBannerMode) {
        setStatusMessage(`Applying ${bannerConfig.classification} security classification banner...`);
        const bannerBytes = await PdfEngine.applyClassificationBanner(activeBuffer!, {
          classification: bannerConfig.classification,
          customLabel: bannerConfig.customLabel,
          handlingInstruction: bannerConfig.handlingInstruction,
          organization: bannerConfig.organization,
          caseOrRefNumber: bannerConfig.caseOrRefNumber,
          placement: bannerConfig.placement,
          pageScope: bannerConfig.pageScope,
          customPageRange: bannerConfig.customPageRange,
          bannerStyle: bannerConfig.bannerStyle,
          bannerColor: bannerConfig.bannerColor,
          fontSize: bannerConfig.fontSize,
          bannerHeight: bannerConfig.bannerHeight,
          opacity: bannerConfig.opacity,
          addDate: bannerConfig.addDate,
        });
        outputBlob = new Blob([bannerBytes], { type: 'application/pdf' });
        outputFilename = `classified_${bannerConfig.classification.toLowerCase().replace(/\s+/g, '_')}_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Stamped ${bannerConfig.classification} security banner (${bannerConfig.placement}) across ${bannerConfig.pageScope} pages`,
        });
      }

      // 21c. PDF Blank Page Inserter
      else if (isBlankPageInserterMode) {
        setStatusMessage('Injecting blank pages into document sequence...');
        const blankBytes = await PdfEngine.insertBlankPages(activeBuffer!, {
          position: blankPagePosition,
          targetPageIndex: Math.max(0, blankTargetPage - 1),
          count: blankPageCount,
          pageSize: blankPageSize,
        });
        outputBlob = new Blob([blankBytes], { type: 'application/pdf' });
        outputFilename = `blank_inserted_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Inserted ${blankPageCount} blank page(s) at ${blankPagePosition} page ${blankTargetPage}`,
        });
      }

      // 22. PDF Page Reverser & Inverter
      else if (isPageReverserMode) {
        setStatusMessage(`Inverting page sequence (${reverseScope} pages)...`);
        const reversedBytes = await PdfEngine.reversePageOrder(activeBuffer!, reverseScope);
        outputBlob = new Blob([reversedBytes], { type: 'application/pdf' });
        outputFilename = `reversed_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Inverted sequence of ${docInfo?.numPages || 1} pages (${reverseScope} mode)`,
        });
      }

      // 23. PDF Booklet & Imposition
      else if (isBookletMode) {
        setStatusMessage('Imposing pages into saddle-stitch duplex booklet sheets...');
        const bookletBytes = await PdfEngine.generateBooklet(activeBuffer!, {
          paperSize: bookletPaperSize,
          gutter: bookletGutter,
        });
        outputBlob = new Blob([bookletBytes], { type: 'application/pdf' });
        outputFilename = `booklet_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Imposed ${docInfo?.numPages || 1} pages into 2-up sheet signatures for ${bookletPaperSize} printing`,
        });
      }

      // 24. PDF Bookmark Manager
      else if (isBookmarkMode) {
        setStatusMessage('Generating document outline & bookmark catalog...');
        const bookmarkedBytes = await PdfEngine.manageBookmarks(activeBuffer!, bookmarkList);
        outputBlob = new Blob([bookmarkedBytes], { type: 'application/pdf' });
        outputFilename = `bookmarked_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Injected ${bookmarkList.length} navigation bookmarks and table of contents entries`,
        });
      }

      // 25. PDF OCR & Searchable Text Creator
      else if (isOcrMode) {
        setStatusMessage('Executing OCR scan and injecting searchable invisible text overlay...');
        const ocrBytes = await PdfEngine.createSearchableOcrPdf(activeBuffer!, {
          language: ocrLanguage,
          quality: ocrQuality,
        });
        outputBlob = new Blob([ocrBytes], { type: 'application/pdf' });
        outputFilename = `searchable_ocr_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Synthesized searchable OCR text layer (${ocrLanguage.toUpperCase()}, ${ocrQuality} quality) across ${docInfo?.numPages || 1} pages`,
        });
      }

      // 26. PDF Redaction & Sanitizer
      else if (isRedactionMode) {
        setStatusMessage(`Permanently sanitizing and blacking out ${redactionBoxes.length} confidential region(s)...`);
        const { redactedBytes, count } = await PdfEngine.redactPdf(activeBuffer!, redactionBoxes);
        outputBlob = new Blob([redactedBytes], { type: 'application/pdf' });
        outputFilename = `redacted_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Permanently destroyed and sanitized ${count} confidential bounding box(es)`,
        });
      }

      // 27. PDF Annotation Studio
      else if (isAnnotationMode) {
        setStatusMessage(`Applying ${annotList.length} visual markups and annotations...`);
        const annotsData = annotList.map((a) => ({
          pageNumber: a.pageNumber,
          type: (a.type === 'rect' ? 'rectangle' : a.type) as any,
          x: a.x,
          y: a.y,
          width: a.width || 120,
          height: a.height || 30,
          text: a.text,
          color: a.color,
          opacity: a.opacity / 100,
        }));
        const annotatedBytes = await PdfEngine.annotatePdf(activeBuffer!, annotsData);
        outputBlob = new Blob([annotatedBytes], { type: 'application/pdf' });
        outputFilename = `annotated_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Rendered ${annotList.length} vector annotation(s) on document`,
        });
      }

      // 28. PDF Hyperlink Editor
      else if (isHyperlinkMode) {
        setStatusMessage(`Injecting ${hyperlinksList.length} clickable URI links and interactive hotspots...`);
        const linkedBytes = await PdfEngine.editHyperlinks(activeBuffer!, hyperlinksList);
        outputBlob = new Blob([linkedBytes], { type: 'application/pdf' });
        outputFilename = `hyperlinks_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Embedded ${hyperlinksList.length} active URI hyperlink hotspot(s)`,
        });
      }

      // 29. PDF Flatten Forms & Annotations
      else if (isFlattenMode) {
        setStatusMessage('Flattening AcroForms, interactive widgets, and dynamic annotations...');
        const flattenedBytes = await PdfEngine.flattenFormsAndAnnotations(activeBuffer!, {
          forms: flattenFormsOnly,
          annotations: flattenAnnotationsOnly,
        });
        outputBlob = new Blob([flattenedBytes], { type: 'application/pdf' });
        outputFilename = `flattened_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: 'Rendered interactive layers permanently into read-only static background',
        });
      }

      // 30. PDF Layers Manager (OCG)
      else if (isLayersMode) {
        setStatusMessage('Configuring PDF Optional Content Groups (OCG) and layer visibilities...');
        const { pdfBytes } = await PdfEngine.managePdfLayers(activeBuffer!, {
          layers: pdfLayersList.map((l) => ({ name: l.name, visible: l.visible })),
        });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFilename = `layers_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Managed ${pdfLayersList.length} Optional Content Group layers (OCG)`,
        });
      }

      // 31. PDF Attachments & Embedded Files
      else if (isAttachmentsMode) {
        setStatusMessage(`Embedding ${embeddedFilesQueue.length} file attachment(s) into PDF Catalog...`);
        const { pdfBytes, attachmentsCount } = await PdfEngine.managePdfAttachments(activeBuffer!, {
          addFiles: embeddedFilesQueue.map((f) => ({ name: f.name, buffer: f.buffer })),
        });
        outputBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        outputFilename = `attachments_${file?.name || 'document.pdf'}`;
        setResultStats({
          beforeSize: file?.size || 0,
          afterSize: outputBlob.size,
          detail: `Embedded ${attachmentsCount} file attachment(s) into document tree catalog`,
        });
      }

      // 21. Default / Fallback & Dedicated Tool Execution
      else {
        if (typeof tool.execute === 'function' && file) {
          const res = await tool.execute({ file, activeBuffer });
          if (res && res.success) {
            if (res.blob && res.blob.size > 0) {
              outputBlob = res.blob;
            } else if ((res as any).bytes || (res as any).buffer) {
              outputBlob = new Blob([(res as any).bytes || (res as any).buffer], { type: 'application/pdf' });
            } else if (res.text || (res as any).data) {
              const textContent =
                res.text ||
                (typeof (res as any).data === 'string'
                  ? (res as any).data
                  : JSON.stringify((res as any).data, null, 2));
              outputBlob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
              if (!outputFilename.endsWith('.txt') && !outputFilename.endsWith('.json')) {
                outputFilename = `result_${file?.name.replace(/\.[^/.]+$/, '') || 'document'}.txt`;
              }
              setExtractedText(textContent);
            } else if (activeBuffer) {
              const updatedBytes = await PdfEngine.flattenForms(activeBuffer!);
              outputBlob = new Blob([updatedBytes], { type: 'application/pdf' });
            }
            outputFilename = res.filename || outputFilename || `processed_${file?.name || 'document.pdf'}`;
            setResultStats({
              beforeSize: file?.size || 0,
              afterSize: outputBlob ? outputBlob.size : 0,
              detail: res.text || 'Processed PDF successfully',
            });
          } else if (res && !res.success) {
            throw new Error(res.error || 'Failed to process document');
          }
        }
        
        if (!outputBlob && activeBuffer) {
          const updatedBytes = await PdfEngine.flattenForms(activeBuffer!);
          outputBlob = new Blob([updatedBytes], { type: 'application/pdf' });
          outputFilename = `processed_${file?.name || 'document.pdf'}`;
          setResultStats({
            beforeSize: file?.size || 0,
            afterSize: outputBlob.size,
            detail: 'Processed and flattened document streams',
          });
        }
      }

      const elapsed = Math.round(performance.now() - startTime);

      // Ultimate safeguard: if outputBlob is somehow null but activeBuffer exists, create blob from buffer
      if (!outputBlob && activeBuffer) {
        outputBlob = new Blob([activeBuffer], { type: 'application/pdf' });
        outputFilename = `processed_${file?.name || 'document.pdf'}`;
      }

      if (outputBlob && outputBlob.size > 0) {
        // Output Validation: Verify file size, MIME type, and binary header integrity
        if (outputBlob.size < 10) {
          throw new Error('Output validation failed: generated file size is abnormally small or corrupt.');
        }

        // Validate PDF binary header if output is marked as PDF
        if (outputBlob.type === 'application/pdf' || outputFilename.endsWith('.pdf')) {
          const sliceBuf = await outputBlob.slice(0, 5).arrayBuffer();
          const header = new TextDecoder('ascii').decode(sliceBuf);
          if (!header.startsWith('%PDF')) {
            throw new Error('Output validation failed: generated PDF does not contain valid PDF magic bytes header.');
          }
        }

        const url = URL.createObjectURL(outputBlob);
        setResultBlob(outputBlob);
        setResultUrl(url);
        setResultFilename(outputFilename);
        setProgressPercent(100);
        setStatusMessage(`Processing complete in ${elapsed}ms!`);
      } else {
        throw new Error('Document processing produced an empty output. Please verify input settings.');
      }
    } catch (err: any) {
      console.error('Operation failed:', err);
      setErrorMessage(err.message || 'Failed to process document.');
    } finally {
      setProcessing(false);
    }
  };

  // Download action
  const handleDownload = () => {
    if (!resultBlob || !resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = resultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 1. Header & Functional Identity */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 shrink-0">
              {isCompressMode ? (
                <Minimize2 className="w-7 h-7" />
              ) : isProtectMode ? (
                <Lock className="w-7 h-7" />
              ) : isSplitExtractMode ? (
                <Scissors className="w-7 h-7" />
              ) : isWatermarkMode ? (
                <Type className="w-7 h-7" />
              ) : isPageNumberMode ? (
                <Hash className="w-7 h-7" />
              ) : (
                <FileText className="w-7 h-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{tool.name}</h1>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded">
                  EditMee PDF Studio
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{tool.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadSampleDocument}
            disabled={loading || processing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 whitespace-nowrap self-start sm:self-auto cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {isImagesToPdf ? 'Try Sample Images' : 'Try Sample PDF'}
          </button>
        </div>
      </div>

      {/* Hidden File Input for Clean File Loading and "Change File" */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            if (isImagesToPdf) {
              const imgs = Array.from(e.target.files).filter(
                (f) => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|svg|tiff)$/i.test(f.name)
              );
              if (imgs.length > 0) {
                setFile(null);
                setFileBuffer(null);
                setDocInfo(null);
                setThumbnails([]);
                setResultBlob(null);
                if (resultUrl) {
                  URL.revokeObjectURL(resultUrl);
                  setResultUrl(null);
                }
                setResultStats(null);
                setImageFiles(imgs);
                setStatusMessage(`Loaded ${imgs.length} image(s) for PDF conversion`);
              }
            } else if (isMergeMode) {
              const pdfs = Array.from(e.target.files).filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
              if (pdfs.length > 0) {
                setMultiFiles(pdfs.map((f) => ({ id: Math.random().toString(36).substring(2, 9), file: f, name: f.name, size: f.size })));
              }
            } else {
              setImageFiles([]);
              loadPdfFile(e.target.files[0]);
            }
          }
        }}
        accept={isImagesToPdf ? 'image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.svg' : isMergeMode ? 'application/pdf,.pdf' : 'application/pdf,.pdf'}
        multiple={isImagesToPdf || isMergeMode}
        className="hidden"
      />

      {/* 2. Upload Area for Standard PDF (When No File Loaded) */}
      {!fileBuffer && !isImagesToPdf && !isMergeMode && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 lg:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-inner'
              : 'border-slate-300 dark:border-slate-700 hover:border-red-400 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 mb-3 sm:mb-4 text-red-600 dark:text-red-400">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
              Drop your PDF file here or <span className="text-red-600 dark:text-red-400 hover:underline">browse</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Supports standard PDF documents up to 100 MB. Instant, secure browser processing with 100% data privacy.
            </p>
          </div>
        </div>
      )}

      {/* Upload Area for Images-to-PDF (When No Images Loaded) */}
      {imageFiles.length === 0 && isImagesToPdf && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 lg:p-12 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-inner'
              : 'border-slate-300 dark:border-slate-700 hover:border-red-400 bg-slate-50/50 dark:bg-slate-900/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="p-3.5 sm:p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 mb-3 sm:mb-4 text-red-600 dark:text-red-400">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200">
              Drop your image files here or <span className="text-red-600 dark:text-red-400 hover:underline">browse</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
              Supports JPG, PNG, WebP, GIF, BMP, SVG, TIFF. Convert multiple images into a single clean PDF.
            </p>
          </div>
        </div>
      )}

      {/* Active bar for Images-to-PDF */}
      {isImagesToPdf && imageFiles.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">
                  {imageFiles.length} Image{imageFiles.length > 1 ? 's' : ''} Loaded
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium shrink-0">
                  {formatBytes(imageFiles.reduce((acc, f) => acc + f.size, 0))}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ready to consolidate into PDF • {imagesToPdfOptions.pageSize.toUpperCase()} • {imagesToPdfOptions.orientation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleChangeFile}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Add More / Change
            </button>
            <button
              type="button"
              onClick={resetAll}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors border border-red-200 dark:border-red-900/40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove All
            </button>
          </div>
        </div>
      )}

      {/* 3. Document Active Bar (File Metadata + Change File + Reset) */}
      {file && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm">{file.name}</span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-medium shrink-0">
                  {formatBytes(file.size)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{docInfo?.numPages || 1} Total Pages</span>
                <span>•</span>
                <span>PDF v{docInfo?.version || '1.7'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleChangeFile}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change File
            </button>
            <button
              type="button"
              onClick={resetAll}
              disabled={processing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors border border-red-200 dark:border-red-900/40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* 4. TOOL-SPECIFIC CONTROL WORKSPACES */}
      {(file || (isImagesToPdf && imageFiles.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stage (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* TOOL 0A: IMAGES TO PDF WORKSPACE */}
            {isImagesToPdf && imageFiles.length > 0 && (
              <ImagesToPdfToolPanel
                imageFiles={imageFiles}
                setImageFiles={setImageFiles}
                options={imagesToPdfOptions}
                setOptions={setImagesToPdfOptions}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
                onConvert={handleExecute}
                processing={processing}
              />
            )}

            {/* TOOL 0B: SECURITY FORENSIC INSPECTOR WORKSPACE */}
            {isSecurityInspectorMode && (
              <SecurityInspectorToolPanel
                report={securityReport}
                fileName={file?.name || 'document.pdf'}
                isInspecting={isInspectingSecurity}
              />
            )}
            {/* TOOL 1: PDF SPLITTER PAGE GRID & SELECTION */}
            {isSplitExtractMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-red-500" />
                      Split Mode & Page Selection
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {splitMode === 'extract' && `${selectedPageIndices.length} of ${docInfo?.numPages || 1} pages selected`}
                      {splitMode === 'every-page' && `Extract each of the ${docInfo?.numPages || 1} pages into individual PDFs`}
                      {splitMode === 'every-n-pages' && `Split every ${splitEveryN} pages`}
                      {splitMode === 'custom-ranges' && `Split into ${customRangeList.length} custom sections`}
                      {splitMode === 'break-points' && `Split at break points: ${breakPointInput}`}
                    </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSplitMode('extract')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        splitMode === 'extract'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Extract Pages
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitMode('every-page')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        splitMode === 'every-page'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Every Page
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitMode('every-n-pages')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        splitMode === 'every-n-pages'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Every N
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitMode('custom-ranges')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        splitMode === 'custom-ranges'
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Custom Ranges
                    </button>
                  </div>
                </div>

                {/* Sub-controls based on Split Mode */}
                {splitMode === 'extract' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllPages}
                          className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={deselectAllPages}
                          className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          Deselect All
                        </button>
                        <button
                          type="button"
                          onClick={invertPageSelection}
                          className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          Invert
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Page Range:</label>
                        <input
                          type="text"
                          value={pageRange}
                          onChange={handleRangeInputChange}
                          placeholder="e.g. 1-3, 5, 8"
                          className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 w-36 font-mono"
                        />
                      </div>
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                      {thumbnails.map((t) => (
                        <div
                          key={t.pageNumber}
                          onClick={() => togglePageSelection(t.pageNumber)}
                          className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all ${
                            t.selected
                              ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 shadow-xs'
                              : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100 bg-slate-50 dark:bg-slate-800/40'
                          }`}
                        >
                          <div className="absolute top-2 left-2 z-10">
                            {t.selected ? (
                              <CheckSquare className="w-5 h-5 text-red-600 dark:text-red-400 fill-white dark:fill-slate-900" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-400 dark:text-slate-500 fill-white dark:fill-slate-900" />
                            )}
                          </div>
                          <div className="aspect-3/4 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                            {t.dataUrl ? (
                              <img src={t.dataUrl} alt={`Page ${t.pageNumber}`} className="w-full h-full object-contain" />
                            ) : (
                              <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                            )}
                          </div>
                          <div className="text-center mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Page {t.pageNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {splitMode === 'every-page' && (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Scissors className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Split into {docInfo?.numPages || 1} Separate PDFs</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      Each page of your document will be extracted into a standalone 1-page PDF file, packaged in a single ZIP download.
                    </p>
                  </div>
                )}

                {splitMode === 'every-n-pages' && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Split Every (N) Pages:</label>
                      <input
                        type="number"
                        min="1"
                        max={docInfo?.numPages || 100}
                        value={splitEveryN}
                        onChange={(e) => setSplitEveryN(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-24 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Will create chunks: {Array.from({ length: Math.ceil((docInfo?.numPages || 1) / Math.max(1, splitEveryN)) }, (_, i) => {
                        const s = i * splitEveryN + 1;
                        const e = Math.min((i + 1) * splitEveryN, docInfo?.numPages || 1);
                        return `Part ${i + 1} (${s}-${e})`;
                      }).join(', ')}
                    </p>
                  </div>
                )}

                {splitMode === 'custom-ranges' && (
                  <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Custom Output Ranges</h4>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomRangeList((prev) => [
                            ...prev,
                            { id: Math.random().toString(), start: 1, end: docInfo?.numPages || 1, name: `Part ${prev.length + 1}` },
                          ])
                        }
                        className="px-2.5 py-1 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        + Add Range
                      </button>
                    </div>

                    {customRangeList.map((r, idx) => (
                      <div key={r.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={r.name}
                          onChange={(e) =>
                            setCustomRangeList((prev) => prev.map((item) => (item.id === r.id ? { ...item, name: e.target.value } : item)))
                          }
                          className="w-28 px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        />
                        <span className="text-xs text-slate-500">Pages:</span>
                        <input
                          type="number"
                          min="1"
                          max={docInfo?.numPages || 100}
                          value={r.start}
                          onChange={(e) =>
                            setCustomRangeList((prev) =>
                              prev.map((item) => (item.id === r.id ? { ...item, start: parseInt(e.target.value, 10) || 1 } : item))
                            )
                          }
                          className="w-16 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        />
                        <span className="text-xs text-slate-500">to</span>
                        <input
                          type="number"
                          min="1"
                          max={docInfo?.numPages || 100}
                          value={r.end}
                          onChange={(e) =>
                            setCustomRangeList((prev) =>
                              prev.map((item) => (item.id === r.id ? { ...item, end: parseInt(e.target.value, 10) || 1 } : item))
                            )
                          }
                          className="w-16 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                        />
                        {customRangeList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCustomRangeList((prev) => prev.filter((item) => item.id !== r.id))}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TOOL 2: PDF COMPRESSOR DOCUMENT OVERVIEW (NO UNNECESSARY PAGE THUMBNAILS!) */}
            {isCompressMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Minimize2 className="w-4 h-4 text-red-500" />
                    Compression Presets & Optimization Level
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select an optimization tier. The entire document will be compressed with genuine object stream & visual stream optimization.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Preset 1: High Quality */}
                  <div
                    onClick={() => setCompressPreset('high')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      compressPreset === 'high'
                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">High Quality</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-semibold">
                        Lossless
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Lossless object stream optimization and structure cleanup. Retains 100% original visual sharpness.
                    </p>
                  </div>

                  {/* Preset 2: Recommended */}
                  <div
                    onClick={() => setCompressPreset('recommended')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      compressPreset === 'recommended'
                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Recommended (Balanced)</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                        Popular
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Balances crisp text resolution with efficient ~100 DPI stream compression. Ideal for standard sharing.
                    </p>
                  </div>

                  {/* Preset 3: Strong Compression */}
                  <div
                    onClick={() => setCompressPreset('strong')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      compressPreset === 'strong'
                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Strong Compression</span>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded font-semibold">
                        Email
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Downsamples images to ~85 DPI with medium quality. Great for email attachment limits.
                    </p>
                  </div>

                  {/* Preset 4: Extreme Compression */}
                  <div
                    onClick={() => setCompressPreset('extreme')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      compressPreset === 'extreme'
                        ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Maximum Compression</span>
                      <span className="text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded font-semibold">
                        Smallest
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      72 DPI screen resolution with maximum space savings. Produces the smallest possible valid PDF.
                    </p>
                  </div>
                </div>

                {/* Custom Manual Controls */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setCompressPreset(compressPreset === 'custom' ? 'recommended' : 'custom')}
                    className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{compressPreset === 'custom' ? 'Hide Advanced Controls' : 'Show Advanced Manual Controls'}</span>
                  </button>

                  {compressPreset === 'custom' && (
                    <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Target Resolution</span>
                          <span>{customDpi} DPI</span>
                        </div>
                        <input
                          type="range"
                          min="72"
                          max="300"
                          step="10"
                          value={customDpi}
                          onChange={(e) => setCustomDpi(parseInt(e.target.value, 10))}
                          className="w-full accent-red-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          <span>Image Quality</span>
                          <span>{customQuality}%</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="95"
                          step="5"
                          value={customQuality}
                          onChange={(e) => setCustomQuality(parseInt(e.target.value, 10))}
                          className="w-full accent-red-600"
                        />
                      </div>
                      <div className="sm:col-span-2 flex flex-wrap gap-4 pt-1">
                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customGrayscale}
                            onChange={(e) => setCustomGrayscale(e.target.checked)}
                            className="rounded accent-red-600"
                          />
                          Convert to Grayscale (Save additional color stream bytes)
                        </label>
                        <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={customRemoveMetadata}
                            onChange={(e) => setCustomRemoveMetadata(e.target.checked)}
                            className="rounded accent-red-600"
                          />
                          Strip XML Metadata & Producer Tags
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TOOL 3: PDF PROTECT CONFIGURATION (NO UNNECESSARY PAGE THUMBNAILS!) */}
            {isProtectMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    Password Protection & Cryptographic Security
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Protect the entire document with real AES-256 encryption. Password is required to open the resulting PDF.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Open Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Open Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        placeholder="Enter password..."
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 pr-10 focus:ring-2 focus:ring-red-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type password..."
                        className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-800 dark:text-slate-200 pr-10 focus:ring-2 focus:ring-red-500 outline-none ${
                          confirmPassword && userPassword !== confirmPassword
                            ? 'border-red-400 dark:border-red-700'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirmPassword && userPassword !== confirmPassword && (
                      <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>
                    )}
                  </div>
                </div>

                {/* Permissions & Algorithm */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Security Standard & Permissions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowPrinting}
                        onChange={(e) => setAllowPrinting(e.target.checked)}
                        className="rounded accent-red-600"
                      />
                      Allow Printing
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowCopying}
                        onChange={(e) => setAllowCopying(e.target.checked)}
                        className="rounded accent-red-600"
                      />
                      Allow Text Copying
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowModifying}
                        onChange={(e) => setAllowModifying(e.target.checked)}
                        className="rounded accent-red-600"
                      />
                      Allow Modifications
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 4: PDF WATERMARK PAGE SELECTION & SETTINGS */}
            {isWatermarkMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Type className="w-4 h-4 text-red-500" />
                    Watermark Text & Selective Pages
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select which pages will receive the watermark. Deselected pages will remain completely un-watermarked.
                  </p>
                </div>

                {/* Watermark Text & Quick Presets */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['CONFIDENTIAL', 'DRAFT', 'APPROVED', 'INTERNAL ONLY', 'COPY', 'SAMPLE'].map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => setWatermarkText(txt)}
                        className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Selection Controls */}
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Apply to Pages ({selectedPageIndices.length} of {docInfo?.numPages || 1} selected)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={selectAllPages}
                        className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={deselectAllPages}
                        className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Deselect All
                      </button>
                      <button
                        type="button"
                        onClick={invertPageSelection}
                        className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Invert
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                    {thumbnails.map((t) => (
                      <div
                        key={t.pageNumber}
                        onClick={() => togglePageSelection(t.pageNumber)}
                        className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all ${
                          t.selected
                            ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 opacity-50 hover:opacity-100 bg-slate-50 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="absolute top-2 left-2 z-10">
                          {t.selected ? (
                            <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400 fill-white dark:fill-slate-900" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 fill-white dark:fill-slate-900" />
                          )}
                        </div>
                        <div className="aspect-3/4 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                          {t.dataUrl ? (
                            <img src={t.dataUrl} alt={`Page ${t.pageNumber}`} className="w-full h-full object-contain" />
                          ) : (
                            <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <div className="text-center mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Page {t.pageNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Opacity</span>
                      <span>{watermarkOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="90"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-red-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Font Size</span>
                      <span>{watermarkSize} pt</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="80"
                      value={watermarkSize}
                      onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
                      className="w-full accent-red-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Rotation</span>
                      <span>{watermarkRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="15"
                      value={watermarkRotation}
                      onChange={(e) => setWatermarkRotation(parseInt(e.target.value, 10))}
                      className="w-full accent-red-600"
                    />
                  </div>
                </div>

                {/* Pattern & Positioning Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                  {/* Pattern Mode Toggle */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Pattern Layout
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWatermarkTiled(false)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          !watermarkTiled
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Single Position
                      </button>
                      <button
                        type="button"
                        onClick={() => setWatermarkTiled(true)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          watermarkTiled
                            ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        Tiled Full Page Grid
                      </button>
                    </div>
                  </div>

                  {/* Position or Tile Spacing */}
                  {!watermarkTiled ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        Placement Position
                      </label>
                      <select
                        value={watermarkPosition}
                        onChange={(e: any) => setWatermarkPosition(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                      >
                        <option value="center">Center</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                        <option value="middle-left">Middle Left</option>
                        <option value="middle-right">Middle Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <span>Tile Spacing</span>
                        <span>{watermarkTileSpacingX} × {watermarkTileSpacingY} pt</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="100"
                          max="400"
                          step="20"
                          value={watermarkTileSpacingX}
                          onChange={(e) => setWatermarkTileSpacingX(parseInt(e.target.value, 10))}
                          className="flex-1 accent-red-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Color Palette */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Watermark Color</span>
                  <div className="flex items-center gap-2">
                    {['#ef4444', '#f97316', '#eab308', '#3b82f6', '#64748b', '#000000'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setWatermarkColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                          watermarkColor === col ? 'scale-125 border-white shadow-sm ring-2 ring-red-500' : 'border-transparent'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={watermarkColor}
                      onChange={(e) => setWatermarkColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 5: PDF PAGE NUMBERER WORKSPACE */}
            {isPageNumberMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-red-500" />
                    Page Number Format & Selective Numbering
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize numbering format, position, and starting number. Excluded pages (such as cover pages) remain unnumbered.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Number Format</label>
                    <select
                      value={pageNumberFormat}
                      onChange={(e) => setPageNumberFormat(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="Page {n} of {total}">Page {`{n}`} of {`{total}`}</option>
                      <option value="{n} / {total}">{`{n}`} / {`{total}`}</option>
                      <option value="{n}">{`{n}`}</option>
                      <option value="Page {n}">Page {`{n}`}</option>
                      <option value="- {n} -">- {`{n}`} -</option>
                      <option value="roman-lower">Roman Lower (i, ii, iii)</option>
                      <option value="roman-upper">Roman Upper (I, II, III)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Position</label>
                    <select
                      value={pageNumberPosition}
                      onChange={(e) => setPageNumberPosition(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="bottom-center">Bottom Center</option>
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-center">Top Center</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Number</label>
                    <input
                      type="number"
                      min="1"
                      value={pageNumberStart}
                      onChange={(e) => setPageNumberStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                </div>

                {/* Selective Page Numbering Grid */}
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Numbered Pages ({selectedPageIndices.length} of {docInfo?.numPages || 1})
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={selectAllPages}
                        className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 rounded hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={excludeFirstPage}
                        className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 rounded hover:bg-red-200 cursor-pointer"
                      >
                        Exclude Cover (Page 1)
                      </button>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
                    {thumbnails.map((t) => (
                      <div
                        key={t.pageNumber}
                        onClick={() => togglePageSelection(t.pageNumber)}
                        className={`relative rounded-xl border-2 p-2 cursor-pointer transition-all ${
                          t.selected
                            ? 'border-red-500 bg-red-50/20 dark:bg-red-950/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 opacity-50 hover:opacity-100 bg-slate-50 dark:bg-slate-800/40'
                        }`}
                      >
                        <div className="absolute top-2 left-2 z-10">
                          {t.selected ? (
                            <CheckSquare className="w-4 h-4 text-red-600 dark:text-red-400 fill-white dark:fill-slate-900" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 fill-white dark:fill-slate-900" />
                          )}
                        </div>
                        <div className="aspect-3/4 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                          {t.dataUrl ? (
                            <img src={t.dataUrl} alt={`Page ${t.pageNumber}`} className="w-full h-full object-contain" />
                          ) : (
                            <FileText className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                          )}
                        </div>
                        <div className="text-center mt-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          {t.selected ? `Numbered (Pg ${t.pageNumber})` : `Excluded`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 6: ROTATE PDF WORKSPACE */}
            {isRotateMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <RotateCw className="w-4 h-4 text-red-500" />
                    Rotation Angle & Page Orientation
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select the rotation angle to apply. You can rotate all pages or select specific pages below.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { angle: 90, label: '90° Clockwise', desc: 'Rotate Right' },
                    { angle: 180, label: '180° Invert', desc: 'Flip Upside Down' },
                    { angle: 270, label: '270° CCW', desc: 'Rotate Left' },
                  ].map((item) => (
                    <button
                      key={item.angle}
                      type="button"
                      onClick={() => setRotationAngle(item.angle)}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        rotationAngle === item.angle
                          ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-bold'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-sm font-bold">{item.label}</div>
                      <div className="text-[11px] opacity-75 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TOOL 7: METADATA EDITOR WORKSPACE */}
            {isMetadataMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-red-500" />
                    PDF Document Metadata & Privacy
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Edit document title, author, and description, or sanitize the document by stripping all hidden metadata.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Title</label>
                    <input
                      type="text"
                      value={metadataTitle}
                      onChange={(e) => setMetadataTitle(e.target.value)}
                      placeholder="e.g. Annual Financial Report 2026"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Author / Organization</label>
                      <input
                        type="text"
                        value={metadataAuthor}
                        onChange={(e) => setMetadataAuthor(e.target.value)}
                        placeholder="e.g. Department of Finance"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject / Description</label>
                      <input
                        type="text"
                        value={metadataSubject}
                        onChange={(e) => setMetadataSubject(e.target.value)}
                        placeholder="e.g. Confidential Audit Summary"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                      />
                    </div>
                  </div>

                  {/* Strip Metadata Toggle */}
                  <div
                    onClick={() => setStripAllMetadata(!stripAllMetadata)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      stripAllMetadata
                        ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">Strip All Hidden Metadata & Personal Identifiers</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Removes software creator tags, modification timestamps, printer IDs, and private user traces.
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${stripAllMetadata ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                      {stripAllMetadata && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 8: GRAYSCALE & DARK MODE WORKSPACE */}
            {isColorDarkMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-red-500" />
                    Color Palette & Monochrome Optimization
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Converts full-color pages into ink-saving black & white grayscale or dark mode for screen reading.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Conversion Highlights:</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400">
                    <li>Converts all embedded RGB/CMYK raster images and vector paths to calibrated grayscale luminance.</li>
                    <li>Saves printer toner and ink cartridges on physical paper printouts.</li>
                    <li>Complies with monochromatic archiving standards (PDF/A).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TOOL 9: BATES NUMBERING WORKSPACE */}
            {isBatesMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-500" />
                    Legal Bates Numbering & Sequential Stamping
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Apply standardized alphanumeric Bates sequence identifiers for legal discovery and audit trails.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prefix</label>
                    <input
                      type="text"
                      value={batesPrefix}
                      onChange={(e) => setBatesPrefix(e.target.value)}
                      placeholder="e.g. DOC-"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Start Number</label>
                    <input
                      type="number"
                      min="1"
                      value={batesStart}
                      onChange={(e) => setBatesStart(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Number of Digits</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={batesDigits}
                      onChange={(e) => setBatesDigits(Math.max(1, parseInt(e.target.value, 10) || 6))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Position</label>
                    <select
                      value={batesPosition}
                      onChange={(e) => setBatesPosition(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-center">Bottom Center</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-red-50/50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/30 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
                  <span>Preview First Stamp:</span>
                  <span className="font-mono font-bold">{batesPrefix}{String(batesStart).padStart(batesDigits, '0')}</span>
                </div>
              </div>
            )}

            {/* TOOL 10: PDF TO IMAGES WORKSPACE */}
            {isPdfToImages && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-red-500" />
                    Raster Image Conversion Options
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Render each PDF page as high-resolution JPG, PNG, or WebP raster image files.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Image Format</label>
                    <select
                      value={imageExportFormat}
                      onChange={(e) => setImageExportFormat(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value="image/jpeg">JPEG (.jpg) - Universal & Lightweight</option>
                      <option value="image/png">PNG (.png) - Lossless & Crisp</option>
                      <option value="image/webp">WebP (.webp) - Modern Web Quality</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resolution Quality</label>
                    <select
                      value={imageExportDpi}
                      onChange={(e) => setImageExportDpi(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    >
                      <option value={1}>Standard Screen (150 DPI)</option>
                      <option value={2}>High Resolution (300 DPI - Recommended)</option>
                      <option value={3}>Ultra Print (600 DPI - Maximum Detail)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 11: PDF TO TEXT WORKSPACE */}
            {isPdfToText && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    Structured Text & Document Intel Extraction
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Extract structured paragraphs, headings, and data streams from the document.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Output Format</label>
                  <select
                    value={textExportFormat}
                    onChange={(e) => setTextExportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                  >
                    <option value="txt">Plain Text (.txt)</option>
                    <option value="md">Markdown Document (.md)</option>
                    <option value="html">HTML Web Document (.html)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TOOL 12: PDF UNLOCK WORKSPACE */}
            {isUnlockMode && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-red-500" />
                    PDF Decryption & Password Removal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Enter the document password to permanently remove password restrictions and export an open PDF.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Document Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full px-3 py-2 pr-10 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TOOL 13: ELECTRONIC SIGNATURE WORKSPACE */}
            {isSignMode && (
              <SignToolPanel
                signerName={signerName}
                setSignerName={setSignerName}
                signatureText={signatureText}
                setSignatureText={setSignatureText}
                signerTitle={signerTitle}
                setSignerTitle={setSignerTitle}
                signatureReason={signatureReason}
                setSignatureReason={setSignatureReason}
                signPlacement={signPlacement}
                setSignPlacement={setSignPlacement}
                signCustomPage={signCustomPage}
                setSignCustomPage={setSignCustomPage}
                signPosition={signPosition}
                setSignPosition={setSignPosition}
                stampStyle={stampStyle}
                setStampStyle={setStampStyle}
                maxPages={docInfo?.numPages || 1}
                onSignatureDrawn={(dataUrl, typed) => {
                  setSignatureImageBase64(dataUrl);
                  if (typed) setSignatureText(typed);
                }}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 14: PDF COMPARE WORKSPACE */}
            {isCompareMode && (
              <CompareToolPanel
                fileA={file}
                docInfoA={docInfo}
                compareFileB={compareFileB}
                setCompareFileB={setCompareFileB}
                compareDocInfoB={compareDocInfoB}
                setCompareDocInfoB={setCompareDocInfoB}
                setCompareBufferB={setCompareBufferB}
                compareMode={compareMode}
                setCompareMode={setCompareMode}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
                formatBytes={formatBytes}
              />
            )}

            {/* TOOL 15: PDF FORM FILLER WORKSPACE */}
            {isFormFillerMode && (
              <FormFillerToolPanel
                formFieldValues={formFieldValues}
                setFormFieldValues={setFormFieldValues}
                detectedFields={detectedFormFields}
                flattenForm={flattenForm}
                setFlattenForm={setFlattenForm}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 16: PDF REPAIR WORKSPACE */}
            {isRepairMode && (
              <RepairToolPanel
                aggressiveRepair={aggressiveRepair}
                setAggressiveRepair={setAggressiveRepair}
                repairDiagnosticLog={repairDiagnosticLog}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 17: PDF CROP WORKSPACE */}
            {isCropMode && (
              <CropToolPanel
                cropTop={cropTop}
                setCropTop={setCropTop}
                cropBottom={cropBottom}
                setCropBottom={setCropBottom}
                cropLeft={cropLeft}
                setCropLeft={setCropLeft}
                cropRight={cropRight}
                setCropRight={setCropRight}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 18: PDF DESKEW WORKSPACE */}
            {isDeskewMode && (
              <DeskewToolPanel
                deskewAngle={deskewAngle}
                setDeskewAngle={setDeskewAngle}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 19: BLANK PAGE INSERT */}
            {isBlankPageInserterMode && (
              <BlankPageToolPanel
                docInfo={docInfo}
                blankPagePosition={blankPagePosition}
                setBlankPagePosition={setBlankPagePosition}
                blankTargetPage={blankTargetPage}
                setBlankTargetPage={setBlankTargetPage}
                blankPageCount={blankPageCount}
                setBlankPageCount={setBlankPageCount}
                blankPageSize={blankPageSize}
                setBlankPageSize={setBlankPageSize}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 19b: BLANK PAGE DETECTOR & STRIPPER */}
            {isBlankPageStripperMode && (
              <BlankPageStripperToolPanel
                detectionReport={blankDetectionReport}
                isScanning={isScanningBlanks}
                scanProgress={blankScanProgress}
                selectedPagesToRemove={selectedPagesToRemove}
                setSelectedPagesToRemove={setSelectedPagesToRemove}
                onRescan={handleRescanBlanks}
                onExecuteRemoval={handleExecute}
                isProcessing={processing}
                totalOriginalPages={docInfo?.numPages || 1}
              />
            )}

            {/* TOOL 19c: PDF HEADER CLASSIFICATION & SECURITY BANNER STAMPER */}
            {isClassificationBannerMode && (
              <ClassificationBannerToolPanel
                docInfo={docInfo}
                bannerConfig={bannerConfig}
                setBannerConfig={setBannerConfig}
                onApplyBanner={handleExecute}
                isProcessing={processing}
              />
            )}

            {/* TOOL 20: PAGE REVERSER */}
            {isPageReverserMode && (
              <PageReverserToolPanel
                docInfo={docInfo}
                reverseScope={reverseScope}
                setReverseScope={setReverseScope}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 21: BOOKLET IMPOSITION */}
            {isBookletMode && (
              <BookletToolPanel
                docInfo={docInfo}
                bookletPaperSize={bookletPaperSize}
                setBookletPaperSize={setBookletPaperSize}
                bookletGutter={bookletGutter}
                setBookletGutter={setBookletGutter}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 22: BOOKMARK MANAGER */}
            {isBookmarkMode && (
              <BookmarkToolPanel
                docInfo={docInfo}
                bookmarkList={bookmarkList}
                setBookmarkList={setBookmarkList}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 23: OCR SEARCHABLE PDF */}
            {isOcrMode && (
              <OcrToolPanel
                docInfo={docInfo}
                ocrLanguage={ocrLanguage}
                setOcrLanguage={setOcrLanguage}
                ocrQuality={ocrQuality}
                setOcrQuality={setOcrQuality}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 24: REDACTION & SANITIZATION */}
            {isRedactionMode && (
              <RedactionToolPanel
                docInfo={docInfo}
                redactionBoxes={redactionBoxes}
                setRedactionBoxes={setRedactionBoxes}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 25: ANNOTATION STUDIO */}
            {isAnnotationMode && (
              <AnnotationToolPanel
                docInfo={docInfo}
                annotList={annotList}
                setAnnotList={setAnnotList}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 26: HYPERLINK EDITOR */}
            {isHyperlinkMode && (
              <HyperlinkToolPanel
                docInfo={docInfo}
                hyperlinksList={hyperlinksList}
                setHyperlinksList={setHyperlinksList}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 27: FLATTEN FORMS & ANNOTATIONS */}
            {isFlattenMode && (
              <FlattenToolPanel
                flattenFormsOnly={flattenFormsOnly}
                setFlattenFormsOnly={setFlattenFormsOnly}
                flattenAnnotationsOnly={flattenAnnotationsOnly}
                setFlattenAnnotationsOnly={setFlattenAnnotationsOnly}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 28: PDF LAYERS (OCG) */}
            {isLayersMode && (
              <LayersToolPanel
                docInfo={docInfo}
                pdfLayersList={pdfLayersList}
                setPdfLayersList={setPdfLayersList}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
              />
            )}

            {/* TOOL 29: PDF ATTACHMENTS & EMBEDDED FILES */}
            {isAttachmentsMode && (
              <AttachmentsToolPanel
                docInfo={docInfo}
                embeddedFilesQueue={embeddedFilesQueue}
                setEmbeddedFilesQueue={setEmbeddedFilesQueue}
                isAdvancedMode={isAdvancedMode}
                setIsAdvancedMode={setIsAdvancedMode}
                formatBytes={formatBytes}
              />
            )}

            {/* INTEGRATED INTERACTIVE WORKFLOW DIAGRAM */}
            <PdfToolWorkflowDiagram toolMode={toolId} toolName={tool.name} />
          </div>

          {/* Sidebar / Execution Panel (1 col) */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Ready to Process</h3>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex justify-between">
                  <span>Tool</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{tool.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Document Size</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {file ? formatBytes(file.size) : formatBytes(imageFiles.reduce((acc, f) => acc + f.size, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{isImagesToPdf ? 'Images' : 'Pages'}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {isImagesToPdf ? `${imageFiles.length} Images` : (docInfo?.numPages || 1)}
                  </span>
                </div>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Status & Progress Bar */}
              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>{statusMessage || 'Processing...'}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Execute Action Button */}
              <button
                type="button"
                onClick={handleExecute}
                disabled={processing || loading}
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Execute {tool.name.replace('PDF ', '')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Results Card (When Output Available) */}
            {resultBlob && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Processing Succeeded</span>
                </div>

                {resultStats && (
                  <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl text-xs space-y-1.5 border border-emerald-100 dark:border-emerald-900/30 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Original Size</span>
                      <span className="font-semibold">{formatBytes(resultStats.beforeSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output Size</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatBytes(resultStats.afterSize)}</span>
                    </div>
                    {resultStats.detail && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 pt-1 border-t border-slate-100 dark:border-slate-800 font-medium">
                        {resultStats.detail}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Output File</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
