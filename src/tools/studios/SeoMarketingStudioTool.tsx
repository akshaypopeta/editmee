import React, { useState, useRef, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import {
  Megaphone,
  Globe,
  Wrench,
  RotateCcw,
  History,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Sparkles,
  Search,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';
import { SeoAuditReport, SeoIssue } from './seo-studio/types';
import { runRealWebsiteAudit, AuditProgressStatus } from './seo-studio/seoAuditEngine';
import { WebsiteOverview } from './seo-studio/components/WebsiteOverview';
import { SeoIssuesList } from './seo-studio/components/SeoIssuesList';
import { CodeFixerWorkspace } from './seo-studio/components/CodeFixerWorkspace';
import { VerificationWorkspace } from './seo-studio/components/VerificationWorkspace';
import { SerpPreviewTool } from './seo-studio/components/SerpPreviewTool';
import { AuditHistoryModal } from './seo-studio/components/AuditHistoryModal';
import { exportReportAsHtml, exportReportAsJson, exportReportAsPdf } from './seo-studio/reportExporter';
import { getAuditHistory } from './seo-studio/auditHistoryStorage';

export const SeoMarketingStudioWorkspace: React.FC = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [crawlDepth, setCrawlDepth] = useState<number>(3);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'code-fixer' | 'verify' | 'serp'>('overview');
  const [report, setReport] = useState<SeoAuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<AuditProgressStatus | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedFixIssueId, setSelectedFixIssueId] = useState<string | undefined>(undefined);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load latest audit from history if available on mount
  useEffect(() => {
    const history = getAuditHistory();
    if (history.length > 0 && !report) {
      setReport(history[0].report);
      setTargetUrl(history[0].targetUrl);
    }
  }, []);

  const handleStartAudit = async (customUrl?: string) => {
    const urlToAudit = (customUrl || targetUrl).trim();
    if (!urlToAudit) {
      setErrorMsg('Please enter a website URL to begin audit.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    setProgress({
      stage: 'fetching',
      message: 'Connecting to target website and verifying SSL/TLS...',
      percent: 15,
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const generatedReport = await runRealWebsiteAudit(
        urlToAudit,
        crawlDepth,
        (p) => setProgress(p),
        controller.signal
      );
      setReport(generatedReport);
      setActiveTab('overview');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setErrorMsg('Audit cancelled by user.');
      } else {
        setErrorMsg(err.message || 'Failed to complete website audit.');
      }
    } finally {
      setIsLoading(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  };

  const handleCancelAudit = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSelectFixIssue = (issueId: string) => {
    setSelectedFixIssueId(issueId);
    setActiveTab('code-fixer');
  };

  const handleRecheckAudit = async (recheckUrl: string): Promise<SeoAuditReport> => {
    setIsLoading(true);
    try {
      const freshReport = await runRealWebsiteAudit(recheckUrl, crawlDepth);
      setReport(freshReport);
      return freshReport;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              SEO & Marketing Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Full-Stack SEO Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Live crawler audit, beginner-friendly explanations, safe automatic code fixer, and before/after verification.
            </p>
          </div>
        </div>

        {/* Global Toolbar: History & Export */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Audit History</span>
          </button>

          {report && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-40 text-xs text-slate-200 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      exportReportAsPdf(report);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <FileText className="w-3.5 h-3.5 text-red-400" />
                    <span>Print / PDF Document</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportReportAsHtml(report);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <FileCode className="w-3.5 h-3.5 text-sky-400" />
                    <span>Standalone HTML Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportReportAsJson(report);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Structured JSON File</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Primary Audit URL Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) handleStartAudit();
              }}
              placeholder="Enter website URL to audit (e.g. https://yourcompany.com)"
              className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              value={crawlDepth}
              onChange={(e) => setCrawlDepth(Number(e.target.value))}
              className="px-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none cursor-pointer"
              title="Number of internal pages to crawl"
            >
              <option value={1}>1 Page (Root only)</option>
              <option value={3}>Crawl up to 3 Pages</option>
              <option value={5}>Crawl up to 5 Pages</option>
            </select>

            <button
              type="button"
              onClick={() => handleStartAudit()}
              disabled={isLoading || !targetUrl.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Search className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Crawling...' : 'Analyze Website'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sample URLs */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Quick Examples:
          </span>
          <button
            type="button"
            onClick={() => {
              setTargetUrl('https://editmee.com');
              handleStartAudit('https://editmee.com');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer font-mono text-[11px]"
          >
            editmee.com
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetUrl('https://example.com');
              handleStartAudit('https://example.com');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer font-mono text-[11px]"
          >
            example.com
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetUrl('https://wikipedia.org');
              handleStartAudit('https://wikipedia.org');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer font-mono text-[11px]"
          >
            wikipedia.org
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Progress Indicator for Live Audit */}
      {isLoading && progress && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Audit in Progress: {progress.stage.replace('_', ' ')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelAudit}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Cancel Operation
            </button>
          </div>

          {/* Workflow Stage Sequence */}
          <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-1 pb-1">
            <span className={progress.percent >= 20 ? 'text-red-400 font-bold' : ''}>1. Fetching</span>
            <span>→</span>
            <span className={progress.percent >= 45 ? 'text-red-400 font-bold' : ''}>2. Crawling</span>
            <span>→</span>
            <span className={progress.percent >= 70 ? 'text-red-400 font-bold' : ''}>3. Analyzing</span>
            <span>→</span>
            <span className={progress.percent >= 90 ? 'text-red-400 font-bold' : ''}>4. Checking SEO</span>
            <span>→</span>
            <span className={progress.percent >= 100 ? 'text-emerald-400 font-bold' : ''}>5. Preparing Report</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-red-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <div className="text-xs font-mono text-slate-300">{progress.message}</div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      {report && (
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl text-xs font-bold overflow-x-auto shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'overview' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Website Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('issues')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'issues' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SEO Issues</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-200">
              {report.issues.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code-fixer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'code-fixer' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Safe Code Fixer</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
              {report.issues.filter((i) => i.canAutoFix).length} fixable
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verify')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'verify' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Verify Published Website</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('serp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'serp' ? 'bg-red-600 text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>SERP & Metadata Preview</span>
          </button>
        </div>
      )}

      {/* Tab Panels */}
      {report && (
        <div>
          {activeTab === 'overview' && (
            <WebsiteOverview
              report={report}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onExport={() => setShowExportMenu(true)}
              onRecheck={() => handleStartAudit(report.targetUrl)}
              isRechecking={isLoading}
            />
          )}

          {activeTab === 'issues' && (
            <SeoIssuesList
              issues={report.issues}
              onSelectFixIssue={handleSelectFixIssue}
            />
          )}

          {activeTab === 'code-fixer' && (
            <CodeFixerWorkspace
              issues={report.issues}
              siteUrl={report.targetUrl}
              initialSelectedIssueId={selectedFixIssueId}
              onNavigateToVerify={() => setActiveTab('verify')}
            />
          )}

          {activeTab === 'verify' && (
            <VerificationWorkspace
              currentReport={report}
              onExecuteRecheck={handleRecheckAudit}
              isRechecking={isLoading}
            />
          )}

          {activeTab === 'serp' && (
            <SerpPreviewTool
              initialUrl={report.targetUrl}
              initialTitle={report.raw.title?.value}
              initialDesc={report.raw.metaDescription?.value}
            />
          )}
        </div>
      )}

      {/* Empty State Banner if no report has been run */}
      {!report && !isLoading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-white shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <Globe className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Ready to Audit Your Website
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Enter any publicly accessible domain above to launch real multi-page crawler verification, detect technical defects, inspect heading structure, and safely patch your source code.
            </p>
          </div>

          {/* Workflow Steps Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left max-w-4xl mx-auto pt-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center text-xs font-bold">1</span>
              <h4 className="text-xs font-bold text-white">Real Website Audit</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Authentic HTTP response, robots.txt, sitemap.xml, canonical, meta, and heading analysis.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="w-6 h-6 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center text-xs font-bold">2</span>
              <h4 className="text-xs font-bold text-white">Simple Issue Report</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Clear answers to What happened, Why it matters, How to fix, and Can EditMee fix it.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs font-bold">3</span>
              <h4 className="text-xs font-bold text-white">Safe Code Fixer</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Upload your project files or ZIP. Zero modification to original files with clean diffs.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="w-6 h-6 rounded-lg bg-sky-600/20 text-sky-400 flex items-center justify-center text-xs font-bold">4</span>
              <h4 className="text-xs font-bold text-white">Live Re-check Verification</h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                Publish and re-audit to verify stable issue status: Fixed, Still Present, or New Issue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      <AuditHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectReport={(selectedReport) => {
          setReport(selectedReport);
          setTargetUrl(selectedReport.targetUrl);
          setActiveTab('overview');
        }}
      />
    </div>
  );
};

export const seoMarketingStudioToolDef: ToolDefinition = {
  id: 'seo-studio',
  name: 'SEO & Marketing Studio Pro',
  category: 'seo',
  subcategory: 'marketing',
  description:
    'Real on-page technical SEO auditor, beginner-friendly issue explainer, safe website code fixer, before/after diff generator, and live verification studio.',
  iconName: 'Megaphone',
  version: '2.0.0',
  tags: [
    'seo',
    'marketing',
    'audit',
    'crawler',
    'meta',
    'schema',
    'json-ld',
    'code-fixer',
    'verification',
    'diff',
    'serp',
  ],
  executionMode: 'hybrid',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  inputSchema: { fields: [] },
  outputSchema: { type: 'custom' },
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  customWorkspace: SeoMarketingStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'SEO Studio Ready' };
  },
};
