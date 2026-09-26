import { RawSeoAuditResult } from '../../../server/seoAuditService';

export type SeoIssueSeverity = 'critical' | 'high' | 'medium' | 'low' | 'passed' | 'unable_to_verify';

export type SeoCategory =
  | 'meta'
  | 'indexability'
  | 'headings'
  | 'links'
  | 'images'
  | 'structured_data'
  | 'mobile'
  | 'security'
  | 'performance';

export interface SeoIssue {
  id: string; // Stable identifier
  title: string;
  category: SeoCategory;
  severity: SeoIssueSeverity;
  whatHappened: string;
  whyItMatters: string;
  howToFix: string;
  canAutoFix: boolean;
  autoFixType?:
    | 'add_meta_desc'
    | 'add_viewport'
    | 'add_canonical'
    | 'add_og_tags'
    | 'add_twitter_tags'
    | 'fix_img_alt'
    | 'fix_malformed_jsonld'
    | 'add_robots_txt'
    | 'add_sitemap_xml'
    | 'add_title';
  technicalDetails: string;
  affectedUrl?: string;
  fileTargetPattern?: string;
  currentValue?: string;
  recommendedValue?: string;
}

export type VerificationStatus = 'fixed' | 'still_present' | 'unable_to_verify' | 'new_issue';

export interface AuditComparisonItem {
  issueId: string;
  title: string;
  severity: SeoIssueSeverity;
  beforeState: string;
  afterState: string;
  status: VerificationStatus;
  explanation: string;
}

export interface SeoAuditReport {
  id: string;
  targetUrl: string;
  timestamp: string;
  durationMs: number;
  statusCode: number;
  statusText: string;
  finalUrl: string;
  protocol: 'https:' | 'http:';
  ttfbMs: number;
  htmlSizeKb: number;
  crawledPagesCount: number;
  issues: SeoIssue[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
    unableToVerify: number;
  };
  raw: RawSeoAuditResult;
}

export interface UploadedFileItem {
  path: string;
  name: string;
  content: string;
  size: number;
  isModified?: boolean;
}

export interface FileDiffPatch {
  filePath: string;
  appliedIssues: string[];
  originalContent: string;
  patchedContent: string;
  diffLinesCount: { added: number; removed: number };
  isValidated: boolean;
  validationError?: string;
}

export interface AuditHistoryRecord {
  id: string;
  targetUrl: string;
  timestamp: string;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  passedCount: number;
  report: SeoAuditReport;
}
