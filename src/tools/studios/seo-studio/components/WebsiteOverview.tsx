import React from 'react';
import {
  Globe,
  ShieldCheck,
  AlertTriangle,
  Clock,
  FileText,
  CheckCircle2,
  Wrench,
  RotateCcw,
  Download,
  History,
  Layers,
} from 'lucide-react';
import { SeoAuditReport } from '../types';

interface WebsiteOverviewProps {
  report: SeoAuditReport;
  onNavigateTab: (tab: 'issues' | 'code-fixer' | 'verify' | 'serp') => void;
  onOpenHistory: () => void;
  onExport: () => void;
  onRecheck: () => void;
  isRechecking?: boolean;
}

export const WebsiteOverview: React.FC<WebsiteOverviewProps> = ({
  report,
  onNavigateTab,
  onOpenHistory,
  onExport,
  onRecheck,
  isRechecking = false,
}) => {
  const { summary } = report;
  const isHealthy = summary.critical === 0 && summary.high === 0;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/30 text-red-400 border border-red-500/30">
                SEO Audit Completed
              </span>
              <span className="text-xs text-slate-400">
                {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white break-all tracking-tight">
                {report.targetUrl}
              </h2>
              {report.protocol === 'https:' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3.5 h-3.5" /> HTTPS
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                  <AlertTriangle className="w-3.5 h-3.5" /> Insecure HTTP
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real crawler analysis of accessible on-page SEO signals, heading structure, robots directives, image alt attributes, social metadata, and Schema.org markup.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('code-fixer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20 cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>Safe Code Fixer</span>
            </button>

            <button
              type="button"
              onClick={onRecheck}
              disabled={isRechecking}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isRechecking ? 'animate-spin' : ''}`} />
              <span>{isRechecking ? 'Scanning...' : 'Check Again'}</span>
            </button>

            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Technical Signals Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Response TTFB</div>
              <div className="font-mono font-bold text-white">{report.ttfbMs} ms</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50">
            <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">HTML Size</div>
              <div className="font-mono font-bold text-white">{report.htmlSizeKb} KB</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Crawled Pages</div>
              <div className="font-mono font-bold text-white">{report.crawledPagesCount} page(s)</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/50">
            <Globe className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">HTTP Status</div>
              <div className="font-mono font-bold text-white">{report.statusCode} {report.statusText || 'OK'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigateTab('issues')}
          className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 text-center cursor-pointer hover:border-red-500/60 transition-colors"
        >
          <div className="text-2xl font-black text-red-400">{summary.critical}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-300 mt-1">Critical</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Immediate fix needed</div>
        </div>

        <div
          onClick={() => onNavigateTab('issues')}
          className="p-4 rounded-xl bg-orange-950/30 border border-orange-900/40 text-center cursor-pointer hover:border-orange-500/60 transition-colors"
        >
          <div className="text-2xl font-black text-orange-400">{summary.high}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-300 mt-1">High</div>
          <div className="text-[10px] text-slate-400 mt-0.5">High SEO priority</div>
        </div>

        <div
          onClick={() => onNavigateTab('issues')}
          className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/40 text-center cursor-pointer hover:border-amber-500/60 transition-colors"
        >
          <div className="text-2xl font-black text-amber-400">{summary.medium}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mt-1">Medium</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Recommended tweaks</div>
        </div>

        <div
          onClick={() => onNavigateTab('issues')}
          className="p-4 rounded-xl bg-blue-950/30 border border-blue-900/40 text-center cursor-pointer hover:border-blue-500/60 transition-colors"
        >
          <div className="text-2xl font-black text-blue-400">{summary.low}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mt-1">Low</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Minor improvements</div>
        </div>

        <div
          onClick={() => onNavigateTab('issues')}
          className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 text-center cursor-pointer hover:border-emerald-500/60 transition-colors"
        >
          <div className="text-2xl font-black text-emerald-400">{summary.passed}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mt-1">Passed</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Fully compliant</div>
        </div>

        <div
          onClick={() => onNavigateTab('issues')}
          className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="text-2xl font-black text-slate-400">{summary.unableToVerify}</div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mt-1">Unverified</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Network / bot block</div>
        </div>
      </div>

      {/* Crawled Pages Preview */}
      {report.raw.crawlPages.length > 1 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span>Multi-Page Crawl Results ({report.raw.crawlPages.length} Pages)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Safe same-domain crawler</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2 px-3">Page URL</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Page Title</th>
                  <th className="py-2 px-3">H1</th>
                  <th className="py-2 px-3">Missing Alt</th>
                  <th className="py-2 px-3 text-right">Fetch Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report.raw.crawlPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-slate-200">
                    <td className="py-2.5 px-3 font-mono text-sky-400 max-w-[280px] truncate">{page.url}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${page.statusCode === 200 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                        {page.statusCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 max-w-[200px] truncate">{page.title || <span className="text-slate-500 italic">None</span>}</td>
                    <td className="py-2.5 px-3 font-mono">{page.h1Count}</td>
                    <td className="py-2.5 px-3 font-mono">
                      {page.missingAltCount > 0 ? (
                        <span className="text-amber-400 font-bold">{page.missingAltCount} missing</span>
                      ) : (
                        <span className="text-emerald-400">All set</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">{page.durationMs}ms</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
