import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { SeoAuditReport, AuditComparisonItem } from '../types';
import { compareAudits } from '../auditVerificationEngine';

interface VerificationWorkspaceProps {
  currentReport: SeoAuditReport;
  onExecuteRecheck: (url: string) => Promise<SeoAuditReport>;
  isRechecking: boolean;
}

export const VerificationWorkspace: React.FC<VerificationWorkspaceProps> = ({
  currentReport,
  onExecuteRecheck,
  isRechecking,
}) => {
  const [recheckUrl, setRecheckUrl] = useState(currentReport.targetUrl);
  const [verifiedReport, setVerifiedReport] = useState<SeoAuditReport | null>(null);
  const [comparison, setComparison] = useState<{
    items: AuditComparisonItem[];
    fixedCount: number;
    stillPresentCount: number;
    unableToVerifyCount: number;
    newIssuesCount: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunRecheck = async () => {
    if (!recheckUrl.trim()) return;
    setErrorMsg(null);

    try {
      const freshReport = await onExecuteRecheck(recheckUrl.trim());
      setVerifiedReport(freshReport);
      const comp = compareAudits(currentReport, freshReport);
      setComparison(comp);
    } catch (err: any) {
      setErrorMsg(err.message || 'Live verification failed to reach the server.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Instructions Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Live Website Verification & Re-check
            </h2>
          </div>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            After uploading your corrected files to your hosting server (e.g. Netlify, Vercel, Apache, Nginx, or cPanel), enter your live URL below and click <strong>Check Again</strong>. EditMee will execute a fresh crawler audit and match stable issue IDs to confirm whether issues are genuinely resolved on the live web.
          </p>
        </div>

        {/* Re-Check Input Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={recheckUrl}
              onChange={(e) => setRecheckUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleRunRecheck}
            disabled={isRechecking || !recheckUrl.trim()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-600/20 cursor-pointer shrink-0"
          >
            <RotateCcw className={`w-4 h-4 ${isRechecking ? 'animate-spin' : ''}`} />
            <span>{isRechecking ? 'Running Fresh Audit...' : 'Check Again'}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Verification Comparison Results */}
      {comparison && (
        <div className="space-y-5">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-center">
              <div className="text-2xl font-black text-emerald-400">{comparison.fixedCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mt-1">
                Fixed on Live URL
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Confirmed resolved</div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-center">
              <div className="text-2xl font-black text-red-400">{comparison.stillPresentCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-red-300 mt-1">
                Still Present
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Deployment pending / check cache</div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-center">
              <div className="text-2xl font-black text-amber-400">{comparison.newIssuesCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mt-1">
                New Issues
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Newly triggered in scan</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <div className="text-2xl font-black text-slate-400">{comparison.unableToVerifyCount}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mt-1">
                Unable to Verify
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Network timeout / bot wall</div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Issue-by-Issue Before & After Verification</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Stable ID Correlation Engine
              </span>
            </div>

            {comparison.items.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No actionable issues to compare. All audited parameters are compliant.
              </div>
            ) : (
              <div className="space-y-3">
                {comparison.items.map((item, idx) => {
                  const isFixed = item.status === 'fixed';
                  const isStill = item.status === 'still_present';

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border transition-all space-y-3 ${
                        isFixed
                          ? 'bg-emerald-950/20 border-emerald-800/60'
                          : isStill
                          ? 'bg-red-950/20 border-red-900/50'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                            {item.title}
                          </h4>
                          <span className="text-[10px] font-mono text-slate-400">ID: {item.issueId}</span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {item.status === 'fixed' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-slate-950 flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5" /> FIXED
                            </span>
                          )}
                          {item.status === 'still_present' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white flex items-center gap-1 shadow-sm">
                              <AlertCircle className="w-3.5 h-3.5" /> STILL PRESENT
                            </span>
                          )}
                          {item.status === 'new_issue' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1 shadow-sm">
                              <AlertTriangle className="w-3.5 h-3.5" /> NEW ISSUE
                            </span>
                          )}
                          {item.status === 'unable_to_verify' && (
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-700 text-slate-300 flex items-center gap-1 shadow-sm">
                              <HelpCircle className="w-3.5 h-3.5" /> UNABLE TO VERIFY
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Before / After Columns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                          <div className="text-[10px] text-slate-500 uppercase font-sans font-bold mb-1">
                            Before Patch:
                          </div>
                          <div className="text-red-400 font-bold">{item.beforeState}</div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80">
                          <div className="text-[10px] text-slate-500 uppercase font-sans font-bold mb-1">
                            After Deployment:
                          </div>
                          <div
                            className={
                              isFixed ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'
                            }
                          >
                            {item.afterState}
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                        {item.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
