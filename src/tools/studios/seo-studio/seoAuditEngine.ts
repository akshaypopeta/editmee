import { RawSeoAuditResult } from '../../../server/seoAuditService';
import { SeoAuditReport } from './types';
import { evaluateRawAudit } from './seoIssueEvaluator';
import { saveAuditToHistory } from './auditHistoryStorage';

export interface AuditProgressStatus {
  stage: 'fetching' | 'crawling' | 'analyzing' | 'checking_seo' | 'preparing_report' | 'completed' | 'error';
  message: string;
  percent: number;
}

/**
 * Execute real website crawl and SEO audit
 */
export async function runRealWebsiteAudit(
  targetUrl: string,
  maxPages: number = 3,
  onProgress?: (status: AuditProgressStatus) => void,
  signal?: AbortSignal
): Promise<SeoAuditReport> {
  let cleanUrl = targetUrl.trim();
  if (!cleanUrl) {
    throw new Error('Please enter a website URL to audit.');
  }

  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // 1. Stage: Fetching
  onProgress?.({
    stage: 'fetching',
    message: `Connecting to ${cleanUrl}...`,
    percent: 20,
  });

  // 2. Stage: Crawling
  setTimeout(() => {
    onProgress?.({
      stage: 'crawling',
      message: 'Inspecting robots.txt, sitemap.xml, and internal links...',
      percent: 45,
    });
  }, 400);

  // 3. Stage: Analyzing
  setTimeout(() => {
    onProgress?.({
      stage: 'analyzing',
      message: 'Parsing HTML document head, heading hierarchy, and images...',
      percent: 70,
    });
  }, 900);

  // Make backend request to /api/seo/audit
  const res = await fetch('/api/seo/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: cleanUrl, maxPages }),
    signal,
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(
      errorJson?.error || `Server responded with status ${res.status}: Failed to reach target website.`
    );
  }

  const data = await res.json();
  if (!data.success || !data.audit) {
    throw new Error(data.error || 'Could not parse website audit data.');
  }

  // 4. Stage: Checking SEO
  onProgress?.({
    stage: 'checking_seo',
    message: 'Evaluating technical SEO compliance & structured data...',
    percent: 90,
  });

  const rawAudit: RawSeoAuditResult = data.audit;
  const report = evaluateRawAudit(rawAudit);

  // 5. Stage: Preparing Report
  onProgress?.({
    stage: 'preparing_report',
    message: 'Compiling issue explanations and safe fix instructions...',
    percent: 100,
  });

  // Save in local audit history
  saveAuditToHistory(report);

  return report;
}
