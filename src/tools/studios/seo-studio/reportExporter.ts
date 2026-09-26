import { SeoAuditReport } from './types';

/**
 * Export audit report as structured JSON file
 */
export function exportReportAsJson(report: SeoAuditReport): void {
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeHost = report.targetUrl.replace(/https?:\/\//i, '').replace(/[^a-z0-9]/gi, '_');
  a.href = url;
  a.download = `editmee-seo-report-${safeHost}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export audit report as standalone responsive HTML report
 */
export function exportReportAsHtml(report: SeoAuditReport): void {
  const safeHost = report.targetUrl.replace(/https?:\/\//i, '').replace(/[^a-z0-9]/gi, '_');

  const issuesHtml = report.issues
    .map((issue) => {
      const badgeColor =
        issue.severity === 'critical'
          ? '#ef4444'
          : issue.severity === 'high'
          ? '#f97316'
          : issue.severity === 'medium'
          ? '#eab308'
          : issue.severity === 'low'
          ? '#3b82f6'
          : issue.severity === 'passed'
          ? '#10b981'
          : '#6b7280';

      return `
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: #ffffff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 16px; font-weight: 700; color: #0f172a;">${issue.title}</h3>
          <span style="background: ${badgeColor}; color: #ffffff; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
            ${issue.severity.replace('_', ' ')}
          </span>
        </div>
        
        <div style="margin-bottom: 10px;">
          <strong style="color: #334155; font-size: 13px;">What happened?</strong>
          <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px; line-height: 1.5;">${issue.whatHappened}</p>
        </div>

        <div style="margin-bottom: 10px;">
          <strong style="color: #334155; font-size: 13px;">Why does it matter?</strong>
          <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px; line-height: 1.5;">${issue.whyItMatters}</p>
        </div>

        <div style="margin-bottom: 10px;">
          <strong style="color: #334155; font-size: 13px;">How do I fix it?</strong>
          <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px; line-height: 1.5;">${issue.howToFix}</p>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: ${issue.canAutoFix ? '#059669' : '#64748b'}; font-weight: 600;">
          <span>Can EditMee fix it automatically?</span>
          <span>${issue.canAutoFix ? '✅ Yes (Auto-fix patch ready)' : '⚠️ Manual resolution required'}</span>
        </div>

        ${
          issue.technicalDetails
            ? `<details style="margin-top: 12px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12px; font-family: monospace;">
                <summary style="cursor: pointer; color: #64748b; font-weight: 600;">Technical Details</summary>
                <pre style="margin: 8px 0 0 0; white-space: pre-wrap; word-break: break-all; color: #334155;">${issue.technicalDetails}</pre>
               </details>`
            : ''
        }
      </div>
    `;
    })
    .join('');

  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EditMee SEO Audit Report — ${report.targetUrl}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f1f5f9; color: #0f172a; margin: 0; padding: 24px; }
    .container { max-width: 900px; margin: 0 auto; }
    .header { background: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px; margin-bottom: 24px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 20px; }
    .stat-card { background: rgba(255,255,255,0.08); padding: 14px; border-radius: 10px; text-align: center; }
    .stat-val { font-size: 24px; font-weight: 800; }
    .stat-lbl { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-top: 4px; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .header { border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">EditMee SEO & Marketing Studio Pro</h1>
        <span style="font-size: 12px; color: #94a3b8;">${new Date(report.timestamp).toLocaleString()}</span>
      </div>
      <p style="margin: 8px 0 0 0; color: #38bdf8; font-size: 14px; word-break: break-all;">Audited Target: ${report.targetUrl}</p>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-val" style="color: #ef4444;">${report.summary.critical}</div>
          <div class="stat-lbl">Critical</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #f97316;">${report.summary.high}</div>
          <div class="stat-lbl">High</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #eab308;">${report.summary.medium}</div>
          <div class="stat-lbl">Medium</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #3b82f6;">${report.summary.low}</div>
          <div class="stat-lbl">Low</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color: #10b981;">${report.summary.passed}</div>
          <div class="stat-lbl">Passed</div>
        </div>
      </div>
    </div>

    <div class="issues-list">
      <h2 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">Detailed SEO Findings (${report.issues.length})</h2>
      ${issuesHtml}
    </div>

    <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 12px;">
      Generated by EditMee — Universal Digital-Work Platform
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlDoc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `editmee-seo-report-${safeHost}-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Trigger clean browser print / print-to-PDF
 */
export function exportReportAsPdf(report: SeoAuditReport): void {
  // Open styled printable popup
  const safeHost = report.targetUrl.replace(/https?:\/\//i, '').replace(/[^a-z0-9]/gi, '_');
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popup blocked, fallback to exporting standalone HTML
    exportReportAsHtml(report);
    return;
  }

  const issuesList = report.issues
    .map(
      (i) => `
    <div style="border-bottom: 1px solid #cbd5e1; padding: 12px 0; page-break-inside: avoid;">
      <div style="display:flex; justify-content:space-between; margin-bottom: 6px;">
        <strong style="font-size: 14px; color: #0f172a;">${i.title}</strong>
        <span style="font-size: 11px; font-weight: bold; text-transform: uppercase;">[${i.severity}]</span>
      </div>
      <p style="font-size: 12px; margin: 2px 0; color: #334155;"><strong>What:</strong> ${i.whatHappened}</p>
      <p style="font-size: 12px; margin: 2px 0; color: #334155;"><strong>Why:</strong> ${i.whyItMatters}</p>
      <p style="font-size: 12px; margin: 2px 0; color: #334155;"><strong>Fix:</strong> ${i.howToFix}</p>
      <p style="font-size: 11px; margin: 2px 0; color: #64748b;">Auto-Fix: ${i.canAutoFix ? 'Yes' : 'No'}</p>
    </div>
  `
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>EditMee SEO Report — ${safeHost}</title>
        <style>
          body { font-family: sans-serif; margin: 30px; color: #0f172a; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <h1>EditMee SEO Audit Report</h1>
        <p style="color: #64748b; font-size: 12px;">URL: ${report.targetUrl} | Date: ${new Date(report.timestamp).toLocaleString()}</p>
        <hr style="margin: 16px 0; border: none; border-top: 1px solid #94a3b8;" />
        <div style="display:flex; gap: 20px; font-size: 13px; font-weight: bold; margin-bottom: 16px;">
          <span style="color: #dc2626;">Critical: ${report.summary.critical}</span>
          <span style="color: #ea580c;">High: ${report.summary.high}</span>
          <span style="color: #ca8a04;">Medium: ${report.summary.medium}</span>
          <span style="color: #2563eb;">Low: ${report.summary.low}</span>
          <span style="color: #16a34a;">Passed: ${report.summary.passed}</span>
        </div>
        <div>
          ${issuesList}
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
