import { SeoAuditReport, AuditComparisonItem, VerificationStatus } from './types';

/**
 * Compare two audits (Before vs After) using stable issue IDs to verify whether
 * issues were genuinely fixed on the live website.
 */
export function compareAudits(
  beforeReport: SeoAuditReport,
  afterReport: SeoAuditReport
): {
  items: AuditComparisonItem[];
  fixedCount: number;
  stillPresentCount: number;
  unableToVerifyCount: number;
  newIssuesCount: number;
} {
  const items: AuditComparisonItem[] = [];
  const beforeIssuesMap = new Map(beforeReport.issues.map((i) => [i.id, i]));
  const afterIssuesMap = new Map(afterReport.issues.map((i) => [i.id, i]));

  // 1. Check all issues from the previous audit
  beforeIssuesMap.forEach((beforeIssue, id) => {
    const afterIssue = afterIssuesMap.get(id);
    const wasProblemBefore = ['critical', 'high', 'medium', 'low'].includes(beforeIssue.severity);

    if (wasProblemBefore) {
      if (!afterIssue || afterIssue.severity === 'passed') {
        items.push({
          issueId: id,
          title: beforeIssue.title,
          severity: beforeIssue.severity,
          beforeState: '❌ Defect Detected',
          afterState: '✅ Verified Resolved on Live Site',
          status: 'fixed',
          explanation: `The issue "${beforeIssue.title}" was present in the previous scan and is now confirmed resolved on the live URL.`,
        });
      } else if (afterIssue.severity === 'unable_to_verify') {
        items.push({
          issueId: id,
          title: beforeIssue.title,
          severity: beforeIssue.severity,
          beforeState: '❌ Defect Detected',
          afterState: '⚠️ Unable to Verify',
          status: 'unable_to_verify',
          explanation: 'The live server could not be reached or connection timed out during verification.',
        });
      } else {
        items.push({
          issueId: id,
          title: beforeIssue.title,
          severity: beforeIssue.severity,
          beforeState: '❌ Defect Detected',
          afterState: '❌ Still Present',
          status: 'still_present',
          explanation: 'The issue remains detected on the live website. Confirm your server deployment is complete and CDN cache is purged.',
        });
      }
    }
  });

  // 2. Check for new issues in the after report that were not problems before
  afterIssuesMap.forEach((afterIssue, id) => {
    const beforeIssue = beforeIssuesMap.get(id);
    const isProblemNow = ['critical', 'high', 'medium', 'low'].includes(afterIssue.severity);
    const wasProblemBefore = beforeIssue && ['critical', 'high', 'medium', 'low'].includes(beforeIssue.severity);

    if (isProblemNow && !wasProblemBefore) {
      items.push({
        issueId: id,
        title: afterIssue.title,
        severity: afterIssue.severity,
        beforeState: '✅ Clear / Not Triggered',
        afterState: '⚠️ New Issue Detected',
        status: 'new_issue',
        explanation: 'This issue was not present in the earlier audit and was introduced in recent changes.',
      });
    }
  });

  const fixedCount = items.filter((i) => i.status === 'fixed').length;
  const stillPresentCount = items.filter((i) => i.status === 'still_present').length;
  const unableToVerifyCount = items.filter((i) => i.status === 'unable_to_verify').length;
  const newIssuesCount = items.filter((i) => i.status === 'new_issue').length;

  return {
    items,
    fixedCount,
    stillPresentCount,
    unableToVerifyCount,
    newIssuesCount,
  };
}
