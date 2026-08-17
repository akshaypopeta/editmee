import { ToolDefinition } from '../../../types';
import { batch1PdfDocs } from './batch1_pdf_docs';
import { batch2SpecializedDocs } from './batch2_specialized_docs';
import { batch3ImagesGraphics } from './batch3_images_graphics';
import { batch4DesignCanvas } from './batch4_design_canvas';
import { batch5OcrScanning } from './batch5_ocr_scanning';
import { batch6FileConversion } from './batch6_file_conversion';
import { batch7TextWriting } from './batch7_text_writing';
import { batch8AiGenerators } from './batch8_ai_generators';
import { batch9DevOpsDeveloper } from './batch9_developer_devops';
import { batch10DataStructured } from './batch10_data_json_xml';
import { batch11SpreadsheetsTables } from './batch11_spreadsheets_tables';
import { batch12AudioEngineering } from './batch12_audio_engineering';
import { batch13VideoMotion } from './batch13_video_motion';
import { batch14WebFrontend } from './batch14_web_frontend';
import { batch15SeoMarketing } from './batch15_seo_marketing';
import { batch16FinancialCalculators } from './batch16_financial_calculators';
import { batch17MathStatistics } from './batch17_math_statistics';
import { batch18PhysicsEngineering } from './batch18_physics_engineering';
import { batch19DailyProductivity } from './batch19_daily_productivity';
import { batch20CryptoSecurity } from './batch20_crypto_security';

export const allNew1000Tools: ToolDefinition[] = [
  ...batch1PdfDocs,
  ...batch2SpecializedDocs,
  ...batch3ImagesGraphics,
  ...batch4DesignCanvas,
  ...batch5OcrScanning,
  ...batch6FileConversion,
  ...batch7TextWriting,
  ...batch8AiGenerators,
  ...batch9DevOpsDeveloper,
  ...batch10DataStructured,
  ...batch11SpreadsheetsTables,
  ...batch12AudioEngineering,
  ...batch13VideoMotion,
  ...batch14WebFrontend,
  ...batch15SeoMarketing,
  ...batch16FinancialCalculators,
  ...batch17MathStatistics,
  ...batch18PhysicsEngineering,
  ...batch19DailyProductivity,
  ...batch20CryptoSecurity,
];
