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
import { allNew1000Tools } from './new_batches';
import { allExpansion789Tools } from './expansion_batches';
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
  allNew1000Tools,
  allExpansion789Tools,
};

import { deduplicateTools } from '../../core/tool-registry/deduplication';

const rawAllCatalogTools: ToolDefinition[] = [
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
  ...allNew1000Tools,
  ...allExpansion789Tools,
];

// Perform canonical semantic deduplication
const dedupeResult = deduplicateTools(rawAllCatalogTools);
export const allCatalogTools: ToolDefinition[] = dedupeResult.canonicalTools;
export const catalogAliasMap = dedupeResult.aliasMap;

export const allCatalogs: { category: string; title: string; tools: ToolDefinition[] }[] = [
  { category: 'pdf', title: 'PDF & Document Studio', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'pdf') },
  { category: 'images', title: 'Image Processing & Graphics', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'images') },
  { category: 'documents', title: 'Document & Text Utilities', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'documents') },
  { category: 'resumes', title: 'Resume & Career Suite', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'resumes') },
  { category: 'data', title: 'Data, CSV & Analytics', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'data') },
  { category: 'developer', title: 'Developer & Web Utilities', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'developer') },
  { category: 'calculators', title: 'Calculators & Converters', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'calculators') },
  { category: 'business', title: 'Business, Invoicing & Finance', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'business') },
  { category: 'media', title: 'Audio & Media Studio', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'media') },
  { category: 'security', title: 'Security & Cryptography', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'security') },
  { category: 'ai', title: 'AI & Intelligence Suite', tools: allCatalogTools.filter((t) => (t.category || '').toLowerCase() === 'ai') },
];

