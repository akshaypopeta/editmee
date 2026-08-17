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
import { ToolDefinition } from '../../types';

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
};

export const allCatalogs: { category: string; title: string; tools: ToolDefinition[] }[] = [
  { category: 'pdf', title: 'PDF & Document Studio', tools: pdfCatalog },
  { category: 'images', title: 'Image Processing & Graphics', tools: imagesCatalog },
  { category: 'documents', title: 'Document & Text Utilities', tools: documentsCatalog },
  { category: 'resumes', title: 'Resume & Career Suite', tools: resumesCatalog },
  { category: 'data', title: 'Data, CSV & Analytics', tools: dataCatalog },
  { category: 'developer', title: 'Developer & Web Utilities', tools: developerCatalog },
  { category: 'calculators', title: 'Calculators & Converters', tools: calculatorsCatalog },
  { category: 'business', title: 'Business, Invoicing & Finance', tools: businessCatalog },
  { category: 'media', title: 'Audio & Media Studio', tools: mediaCatalog },
  { category: 'security', title: 'Security & Cryptography', tools: securityCatalog },
  { category: 'ai', title: 'AI & Intelligence Suite', tools: aiCatalog },
  { category: 'new1000', title: 'Master Expansion Suite (1,000 Tools)', tools: allNew1000Tools },
];

export const allCatalogTools: ToolDefinition[] = [
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
];
