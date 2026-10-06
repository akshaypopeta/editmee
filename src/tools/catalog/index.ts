import { aiCatalog } from './aiCatalog';
import { businessCatalog } from './businessCatalog';
import { calculatorsCatalog } from './calculatorsCatalog';
import { dataCatalog } from './dataCatalog';
import { developerCatalog } from './developerCatalog';
import { documentsCatalog } from './documentsCatalog';
import { imagesCatalog } from './imagesCatalog';
import { mediaCatalog } from './mediaCatalog';
import { pdfCatalog } from './pdfCatalog';
import { resumesCatalog } from './resumesCatalog';
import { securityCatalog } from './securityCatalog';
import { ToolDefinition } from '../../types';

// Import all authentic flagship implementations
import {
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
} from '../pdf/PdfTools';

import {
  imageStudioToolDef,
  imageCompressorToolDef,
  imageResizerToolDef,
  imageCropperToolDef,
  imageRotatorToolDef,
  imageConverterToolDef,
  bgRemoverToolDef,
  imageUpscalerToolDef,
  imageEnhancerToolDef,
  imageWatermarkToolDef,
  imageAnnotatorToolDef,
  colorExtractorToolDef,
  exifViewerToolDef,
  specializedFilterToolDef,
} from '../images/ImageTools';

import {
  workAssistantTool,
  aiWritingTool,
  aiDocIntelTool,
  aiImageGeneratorTool,
} from '../ai/AiTools';

import {
  devStudioToolDef,
  jsonFormatterToolDef,
  base64ToolDef,
} from '../developer/DevTools';

import {
  csvStudioToolDef,
  csvToJsonToolDef,
  jsonToCsvToolDef,
} from '../data/DataTools';

import { calculatorStudioToolDef } from '../calculators/CalculatorStudioTool';
import { invoiceGeneratorToolDef } from '../business/InvoiceGeneratorTool';
import { resumeBuilderToolDef } from '../resumes/ResumeBuilderTool';
import { mediaStudioToolDef } from '../media/MediaStudioTool';
import { logoMakerStudioToolDef } from '../studios/LogoMakerStudioTool';
import { videoStudioToolDef } from '../studios/VideoStudioTool';
import { audioStudioToolDef } from '../studios/AudioStudioTool';
import { textStudioToolDef } from '../studios/TextStudioTool';
import { seoMarketingStudioToolDef } from '../studios/SeoMarketingStudioTool';
import { converterStudioToolDef } from '../studios/ConverterStudioTool';
import { securityStudioToolDef } from '../studios/SecurityStudioTool';
import { productivityStudioToolDef } from '../studios/ProductivityStudioTool';
import { designStudioToolDef } from '../studios/DesignStudioTool';
import { creatorStudioToolDef } from '../studios/CreatorStudioTool';
import { webStudioToolDef } from '../studios/WebStudioTool';
import { educationStudioToolDef } from '../studios/EducationStudioTool';
import { fileArchiveStudioToolDef } from '../studios/FileArchiveStudioTool';

export const allRealTools: ToolDefinition[] = [
  // PDF Suite
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

  // Image & Design Suite
  imageStudioToolDef,
  logoMakerStudioToolDef,
  designStudioToolDef,
  imageCompressorToolDef,
  imageResizerToolDef,
  imageCropperToolDef,
  imageRotatorToolDef,
  imageConverterToolDef,
  bgRemoverToolDef,
  imageUpscalerToolDef,
  imageEnhancerToolDef,
  imageWatermarkToolDef,
  imageAnnotatorToolDef,
  colorExtractorToolDef,
  exifViewerToolDef,
  specializedFilterToolDef,

  // Video & Audio Studios
  videoStudioToolDef,
  audioStudioToolDef,
  mediaStudioToolDef,

  // Text & Writing Suite
  textStudioToolDef,

  // SEO & Marketing Suite
  seoMarketingStudioToolDef,

  // Universal Converter Suite
  converterStudioToolDef,

  // Security & Privacy Suite
  securityStudioToolDef,

  // Productivity & Focus Suite
  productivityStudioToolDef,

  // Creator & Social Media Suite
  creatorStudioToolDef,

  // Web & URL Suite
  webStudioToolDef,

  // Education & Academic Suite
  educationStudioToolDef,

  // File & Archive Suite
  fileArchiveStudioToolDef,

  // AI Suite
  workAssistantTool,
  aiWritingTool,
  aiDocIntelTool,
  aiImageGeneratorTool,

  // Developer Suite
  devStudioToolDef,
  jsonFormatterToolDef,
  base64ToolDef,

  // Data Suite
  csvStudioToolDef,
  csvToJsonToolDef,
  jsonToCsvToolDef,

  // Calculator Suite
  calculatorStudioToolDef,

  // Business Suite
  invoiceGeneratorToolDef,

  // Resume Suite
  resumeBuilderToolDef,
];

export {
  aiCatalog,
  businessCatalog,
  calculatorsCatalog,
  dataCatalog,
  developerCatalog,
  documentsCatalog,
  imagesCatalog,
  mediaCatalog,
  pdfCatalog,
  resumesCatalog,
  securityCatalog,
};

import { deduplicateTools } from '../../core/tool-registry/deduplication';

export const rawCoreCatalogTools: ToolDefinition[] = [
  ...allRealTools,
  ...pdfCatalog,
  ...imagesCatalog,
  ...documentsCatalog,
  ...resumesCatalog,
  ...dataCatalog,
  ...developerCatalog,
  ...calculatorsCatalog,
  ...businessCatalog,
  ...mediaCatalog,
  ...securityCatalog,
  ...aiCatalog,
];

// Perform canonical semantic deduplication on core catalog
const dedupeResult = deduplicateTools(rawCoreCatalogTools);
export const coreCatalogTools: ToolDefinition[] = dedupeResult.canonicalTools;
export const coreAliasMap = dedupeResult.aliasMap;

// Backward-compatible exports
export const allCatalogTools: ToolDefinition[] = coreCatalogTools;
export const catalogAliasMap = coreAliasMap;

export const allCatalogs: { category: string; title: string; tools: ToolDefinition[] }[] = [
  { category: 'pdf', title: 'PDF & Document Studio', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'pdf') },
  { category: 'images', title: 'Image Processing & Graphics', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'images') },
  { category: 'documents', title: 'Document & Text Utilities', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'documents') },
  { category: 'resumes', title: 'Resume & Career Suite', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'resumes') },
  { category: 'data', title: 'Data, CSV & Analytics', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'data') },
  { category: 'developer', title: 'Developer & Web Utilities', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'developer') },
  { category: 'calculators', title: 'Calculators & Converters', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'calculators') },
  { category: 'business', title: 'Business, Invoicing & Finance', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'business') },
  { category: 'media', title: 'Audio & Media Studio', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'media') },
  { category: 'security', title: 'Security & Cryptography', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'security') },
  { category: 'ai', title: 'AI & Intelligence Suite', tools: coreCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'ai') },
];

