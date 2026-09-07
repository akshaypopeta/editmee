import React from 'react';
import { ToolDefinition } from '../../../types';
import { getCalculatorDef } from '../../../core/calculators/allCalculators';
import { PdfArchetypeWorkspace } from './PdfArchetypeWorkspace';
import { CalculatorArchetypeWorkspace } from './CalculatorArchetypeWorkspace';
import { DateTimeZoneArchetypeWorkspace } from './DateTimeZoneArchetypeWorkspace';
import { UnitCurrencyArchetypeWorkspace } from './UnitCurrencyArchetypeWorkspace';
import { ScientificMathArchetypeWorkspace } from './ScientificMathArchetypeWorkspace';
import { CodeFormatterArchetypeWorkspace } from './CodeFormatterArchetypeWorkspace';
import { GeneratorArchetypeWorkspace } from './GeneratorArchetypeWorkspace';
import { DataGridArchetypeWorkspace } from './DataGridArchetypeWorkspace';
import { TextTransformArchetypeWorkspace } from './TextTransformArchetypeWorkspace';
import { CryptoSecurityArchetypeWorkspace } from './CryptoSecurityArchetypeWorkspace';
import { MediaAudioArchetypeWorkspace } from './MediaAudioArchetypeWorkspace';
import { ImageColorArchetypeWorkspace } from './ImageColorArchetypeWorkspace';
import { FileOcrArchetypeWorkspace } from './FileOcrArchetypeWorkspace';
import { AiIntelligenceArchetypeWorkspace } from './AiIntelligenceArchetypeWorkspace';
import { ResumeCareerArchetypeWorkspace } from './ResumeCareerArchetypeWorkspace';
import { BusinessSeoArchetypeWorkspace } from './BusinessSeoArchetypeWorkspace';

interface Props {
  tool: ToolDefinition;
}

export const ArchetypeResolver: React.FC<Props> = ({ tool }) => {
  const cat = (tool.category || '').toLowerCase();
  const subcat = (tool.subcategory || '').toLowerCase();
  const name = (tool.name || '').toLowerCase();
  const toolId = (tool.id || '').toLowerCase();

  // 0. PDF & Document Studio Suite (Strict Functional Identity Enforcement - LOCKED)
  if (
    cat === 'pdf' ||
    toolId.startsWith('pdf-') ||
    toolId.includes('-to-pdf') ||
    toolId === 'images-to-pdf' ||
    (name.includes('pdf') && !name.includes('parser') && !name.includes('stream')) ||
    subcat === 'pdf'
  ) {
    return <PdfArchetypeWorkspace tool={tool} />;
  }

  // Registered Calculators & Calculators Category
  if (cat === 'calculators' || getCalculatorDef(tool.id)) {
    return <CalculatorArchetypeWorkspace tool={tool} />;
  }

  // 1. AI & Intelligence / NLP / LLM Tools
  if (
    cat === 'ai' ||
    subcat.includes('ai') ||
    name.includes('ai ') ||
    name.includes('intelligence') ||
    name.includes('summariz') ||
    name.includes('paraphras') ||
    name.includes('sentiment') ||
    name.includes('prompt') ||
    name.includes('gramm') ||
    name.includes('readability') ||
    name.includes('tone') ||
    toolId.includes('ai-') ||
    toolId.includes('-ai') ||
    toolId.includes('summariz')
  ) {
    return <AiIntelligenceArchetypeWorkspace tool={tool} />;
  }

  // 2. Career, Resume, Cover Letter & Interview Prep
  if (
    cat === 'career' ||
    subcat.includes('career') ||
    subcat.includes('resume') ||
    name.includes('resume') ||
    name.includes('cv ') ||
    name.includes('cover letter') ||
    name.includes('interview') ||
    name.includes('ats ') ||
    name.includes('job description') ||
    name.includes('linkedin') ||
    name.includes('career') ||
    toolId.includes('resume') ||
    toolId.includes('cover-letter')
  ) {
    return <ResumeCareerArchetypeWorkspace tool={tool} />;
  }

  // 3. Business, Finance, Invoicing, Receipts & SEO Tools
  if (
    cat === 'business' ||
    cat === 'seo' ||
    subcat.includes('business') ||
    subcat.includes('seo') ||
    subcat.includes('invoice') ||
    subcat.includes('receipt') ||
    name.includes('invoice') ||
    name.includes('receipt') ||
    name.includes('serp') ||
    name.includes('meta tag') ||
    name.includes('schema markup') ||
    name.includes('sitemap') ||
    name.includes('robots.txt') ||
    name.includes('canonical') ||
    name.includes('open graph') ||
    name.includes('purchase order') ||
    toolId.includes('invoice') ||
    toolId.includes('receipt') ||
    toolId.includes('serp')
  ) {
    return <BusinessSeoArchetypeWorkspace tool={tool} />;
  }

  // 4. Time, Date, Timezone & Work Hours
  if (
    name.includes('timezone') ||
    name.includes('time zone') ||
    name.includes('world clock') ||
    name.includes('date diff') ||
    name.includes('date difference') ||
    name.includes('age calc') ||
    name.includes('duration') ||
    name.includes('timestamp') ||
    name.includes('epoch') ||
    name.includes('work hours') ||
    toolId.includes('timezone') ||
    toolId.includes('time-zone') ||
    toolId.includes('date-diff') ||
    toolId.includes('age-calc') ||
    toolId.includes('timestamp')
  ) {
    return <DateTimeZoneArchetypeWorkspace tool={tool} />;
  }

  // 5. Unit Conversions & Currency Exchange
  if (
    name.includes('currency') ||
    name.includes('exchange rate') ||
    name.includes('unit converter') ||
    name.includes('temperature') ||
    name.includes('celsius') ||
    name.includes('fahrenheit') ||
    name.includes('length converter') ||
    name.includes('mass converter') ||
    name.includes('speed converter') ||
    name.includes('byte converter') ||
    toolId.includes('currency') ||
    toolId.includes('unit-converter') ||
    toolId.includes('temperature')
  ) {
    return <UnitCurrencyArchetypeWorkspace tool={tool} />;
  }

  // 6. Scientific, Statistics, Math & Expressions
  if (
    name.includes('scientific') ||
    name.includes('statistic') ||
    name.includes('mean') ||
    name.includes('median') ||
    name.includes('standard deviation') ||
    name.includes('variance') ||
    name.includes('basic calculator') ||
    toolId.includes('scientific') ||
    toolId.includes('statistic')
  ) {
    return <ScientificMathArchetypeWorkspace tool={tool} />;
  }

  // 7. Calculators & Financial & Health & General
  if (
    cat === 'calculators' ||
    cat === 'finance' ||
    subcat.includes('calc') ||
    subcat.includes('finance') ||
    subcat.includes('math') ||
    subcat.includes('loan') ||
    subcat.includes('mortgage') ||
    subcat.includes('tax') ||
    subcat.includes('interest') ||
    subcat.includes('salary') ||
    subcat.includes('percentage') ||
    name.includes('calculator') ||
    name.includes('calc') ||
    name.includes('loan') ||
    name.includes('mortgage') ||
    name.includes('interest') ||
    name.includes('salary') ||
    name.includes('bmi') ||
    name.includes('tax') ||
    name.includes('percentage') ||
    name.includes('roi') ||
    name.includes('discount') ||
    name.includes('tip') ||
    name.includes('margin') ||
    name.includes('compound')
  ) {
    return <CalculatorArchetypeWorkspace tool={tool} />;
  }

  // 8. Code, Developer, Linters, Formatters & Validators
  if (
    cat === 'developer' ||
    subcat.includes('code') ||
    subcat.includes('json') ||
    subcat.includes('xml') ||
    subcat.includes('sql') ||
    subcat.includes('css') ||
    subcat.includes('html') ||
    subcat.includes('yaml') ||
    subcat.includes('devops') ||
    name.includes('formatter') ||
    name.includes('beautifier') ||
    name.includes('minifier') ||
    name.includes('validator') ||
    name.includes('json') ||
    name.includes('xml') ||
    name.includes('sql') ||
    name.includes('css') ||
    name.includes('html') ||
    name.includes('yaml') ||
    name.includes('schema') ||
    name.includes('linter') ||
    name.includes('regex') ||
    name.includes('jwt') ||
    name.includes('base64') ||
    name.includes('clamp') ||
    name.includes('shadow')
  ) {
    return <CodeFormatterArchetypeWorkspace tool={tool} />;
  }

  // 9. Generators & Design Assets (QR, Barcode, Password, UUID, Lorem, Hashes, Gradients)
  if (
    subcat.includes('generator') ||
    name.includes('generator') ||
    name.includes('qr') ||
    name.includes('barcode') ||
    name.includes('password') ||
    name.includes('uuid') ||
    name.includes('guid') ||
    name.includes('lorem') ||
    name.includes('dummy') ||
    name.includes('gradient') ||
    name.includes('hash') ||
    name.includes('checksum')
  ) {
    return <GeneratorArchetypeWorkspace tool={tool} />;
  }

  // 10. Data, CSV, Spreadsheets & Tables
  if (
    cat === 'data' ||
    subcat.includes('data') ||
    subcat.includes('csv') ||
    subcat.includes('table') ||
    subcat.includes('excel') ||
    subcat.includes('spreadsheet') ||
    name.includes('csv') ||
    name.includes('tsv') ||
    name.includes('table') ||
    name.includes('grid') ||
    name.includes('spreadsheet') ||
    name.includes('delimiter') ||
    name.includes('deduplicat')
  ) {
    return <DataGridArchetypeWorkspace tool={tool} />;
  }

  // 11. Audio, Media, Synthesizers & Video
  if (
    cat === 'media' ||
    subcat.includes('audio') ||
    subcat.includes('video') ||
    subcat.includes('sound') ||
    subcat.includes('music') ||
    name.includes('audio') ||
    name.includes('tone') ||
    name.includes('frequency') ||
    name.includes('synth') ||
    name.includes('tempo') ||
    name.includes('bpm') ||
    name.includes('waveform') ||
    name.includes('sound') ||
    name.includes('metronome') ||
    name.includes('delay') ||
    name.includes('dtmf') ||
    name.includes('subtitle') ||
    name.includes('srt')
  ) {
    return <MediaAudioArchetypeWorkspace tool={tool} />;
  }

  // 12. Security, Cryptography & Privacy
  if (
    cat === 'security' ||
    subcat.includes('security') ||
    subcat.includes('crypto') ||
    subcat.includes('cipher') ||
    name.includes('security') ||
    name.includes('crypto') ||
    name.includes('encrypt') ||
    name.includes('decrypt') ||
    name.includes('cipher') ||
    name.includes('jwt') ||
    name.includes('hmac') ||
    name.includes('sha') ||
    name.includes('md5') ||
    name.includes('defang') ||
    name.includes('cidr') ||
    name.includes('secret')
  ) {
    return <CryptoSecurityArchetypeWorkspace tool={tool} />;
  }

  // 13. Image, Color, Palette & Contrast
  if (
    cat === 'images' ||
    subcat.includes('color') ||
    subcat.includes('contrast') ||
    subcat.includes('palette') ||
    subcat.includes('aspect') ||
    name.includes('color') ||
    name.includes('contrast') ||
    name.includes('palette') ||
    name.includes('aspect') ||
    name.includes('ratio') ||
    name.includes('svg') ||
    name.includes('exif') ||
    name.includes('image') ||
    name.includes('photo') ||
    name.includes('filter') ||
    name.includes('crop') ||
    name.includes('resize')
  ) {
    return <ImageColorArchetypeWorkspace tool={tool} />;
  }

  // 14. OCR, Ingestion & File Converters
  if (
    subcat.includes('ocr') ||
    subcat.includes('scan') ||
    subcat.includes('file') ||
    subcat.includes('document') ||
    name.includes('ocr') ||
    name.includes('scan') ||
    name.includes('metadata') ||
    name.includes('extractor') ||
    name.includes('inspector')
  ) {
    return <FileOcrArchetypeWorkspace tool={tool} />;
  }

  // 15. Default Fallback: Text, Writing & NLP Transformer
  return <TextTransformArchetypeWorkspace tool={tool} />;
};
