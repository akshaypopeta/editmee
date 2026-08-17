/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Code,
  Database,
  Calculator,
  Receipt,
  FileCheck,
  Search,
  Sliders,
  History,
  Workflow,
  Sparkles,
  Star,
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  ChevronRight,
  RefreshCw,
  Plus,
  Shield,
  Download,
  Trash2,
  Cpu,
  PenTool,
  FileSearch,
  Wand2,
} from 'lucide-react';

import { toolRegistry } from './core/tool-registry/ToolRegistry';
import { registerAllTools } from './core/tool-registry/registerAllTools';
import { storageEngine, HistoryItem } from './core/storage-engine/StorageEngine';
import { ToolShell } from './components/tool/ToolShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToolDefinition, ToolCategory, WorkflowDefinition } from './types';
import { aiGateway } from './core/ai-gateway/AiGateway';
import { WorkflowEngine, WorkflowExecutionLog } from './core/workflow-engine/WorkflowEngine';
import { EditMeeLogo } from './components/common/EditMeeLogo';
import { HeaderNav } from './components/navigation/HeaderNav';
import { SidebarNav } from './components/navigation/SidebarNav';
import { Footer } from './components/common/Footer';
import { LegalPages, LegalPageId } from './components/common/LegalPages';
import { SeoManager } from './core/seo/SeoManager';

// Ensure all tools are registered at startup
registerAllTools();

const LEGAL_PATHS: Record<string, LegalPageId> = {
  '/privacy-policy': 'privacy-policy',
  '/terms-and-conditions': 'terms-and-conditions',
  '/terms': 'terms-and-conditions',
  '/security-architecture': 'security-architecture',
  '/security-privacy': 'security-architecture',
  '/security': 'security-architecture',
  '/about-us': 'about-us',
  '/about': 'about-us',
  '/contact-us': 'contact-us',
  '/contact': 'contact-us',
  '/disclaimer': 'disclaimer',
};

export default function App() {
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Workflow state
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowExecutionLog[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState(0);

  // URL parsing helper
  const parseCurrentUrl = useCallback(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const hash = window.location.hash.toLowerCase().replace(/^#/, '');

    // Check legal routes
    if (LEGAL_PATHS[path]) {
      setActiveLegalPage(LEGAL_PATHS[path]);
      setActiveToolId(null);
      return;
    }
    if (LEGAL_PATHS['/' + hash]) {
      setActiveLegalPage(LEGAL_PATHS['/' + hash]);
      setActiveToolId(null);
      return;
    }

    // Check tool routes: /tool/:id or /tools/:id or #tool-:id
    const toolMatch = path.match(/^\/(?:tools?|suite)\/([a-zA-Z0-9_-]+)$/);
    if (toolMatch && toolMatch[1]) {
      const tid = toolMatch[1];
      if (toolRegistry.get(tid)) {
        setActiveToolId(tid);
        setActiveLegalPage(null);
        return;
      }
    }
    if (hash.startsWith('tool/')) {
      const tid = hash.replace('tool/', '');
      if (toolRegistry.get(tid)) {
        setActiveToolId(tid);
        setActiveLegalPage(null);
        return;
      }
    }

    // Check category routes: /category/:id
    const catMatch = path.match(/^\/category\/([a-zA-Z0-9_-]+)$/);
    if (catMatch && catMatch[1]) {
      setSelectedCategoryFilter(catMatch[1]);
      setActiveNav(catMatch[1]);
      setActiveToolId(null);
      setActiveLegalPage(null);
      return;
    }

    if (path === '/workflows' || hash === 'workflows') {
      setActiveNav('workflows');
      setActiveToolId(null);
      setActiveLegalPage(null);
      return;
    }

    if (path === '/history' || hash === 'history') {
      setActiveNav('history');
      setActiveToolId(null);
      setActiveLegalPage(null);
      return;
    }

    if (path === '/all-tools' || hash === 'all-tools') {
      setActiveNav('overview');
      setSelectedCategoryFilter('all');
      setActiveToolId(null);
      setActiveLegalPage(null);
      return;
    }

    // Default home overview
    setActiveLegalPage(null);
    setActiveToolId(null);
  }, []);

  // Initial load and history popstate
  useEffect(() => {
    parseCurrentUrl();

    const handlePopState = () => {
      parseCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [parseCurrentUrl]);

  // Synchronize SEO & document title whenever active route changes
  useEffect(() => {
    if (activeLegalPage) {
      // Handled inside LegalPages component via SeoManager
      return;
    }

    if (activeToolId) {
      const tool = toolRegistry.get(activeToolId);
      if (tool) {
        SeoManager.updateDocumentHead({
          title: `${tool.name} — Free Online Tool | EditMee`,
          description: tool.description,
          keywords: `${tool.name}, ${tool.category} online tool, free ${tool.name}, browser tool, client-side, EditMee`,
          canonicalPath: `/tool/${tool.id}`,
        });
      }
      return;
    }

    if (activeNav === 'workflows') {
      SeoManager.updateDocumentHead({
        title: 'Automated Document Pipelines & Workflows | EditMee',
        description: 'Chains multi-stage PDF and document conversion, watermarking, and compression pipelines entirely in browser.',
        canonicalPath: '/workflows',
      });
      return;
    }

    if (activeNav === 'history') {
      SeoManager.updateDocumentHead({
        title: 'Task Execution Audit History | EditMee',
        description: 'Local audit trail of all processed documents, images, and data exports. Never uploaded to servers.',
        canonicalPath: '/history',
      });
      return;
    }

    // Home / Category Overview
    if (selectedCategoryFilter !== 'all') {
      const catName = selectedCategoryFilter.toUpperCase();
      SeoManager.updateDocumentHead({
        title: `${catName} Tools & Utilities — EditMee`,
        description: `Explore all high-performance ${catName} online utilities. 100% free, private, client-side document and media processing.`,
        canonicalPath: `/category/${selectedCategoryFilter}`,
      });
    } else {
      SeoManager.updateDocumentHead({
        title: 'EditMee — 100+ Free Online PDF, Image, Document & AI Tools',
        description: 'Universal suite of client-side browser tools. Edit PDFs, convert images, build ATS resumes, transform CSVs, format code, and execute AI workflows with 100% privacy.',
        canonicalPath: '/',
      });
    }
  }, [activeLegalPage, activeToolId, activeNav, selectedCategoryFilter]);

  // Global keyboard shortcuts and custom tool open events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeToolId) {
          setActiveToolId(null);
          try {
            window.history.pushState(null, '', '/');
          } catch {}
        }
      }
    };

    const handleOpenToolEvent = (e: any) => {
      const toolId = e.detail;
      if (toolId && typeof toolId === 'string') {
        launchTool(toolId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('editmee:open-tool', handleOpenToolEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('editmee:open-tool', handleOpenToolEvent);
    };
  }, [activeToolId]);

  // Load preferences and history
  useEffect(() => {
    setHistoryItems(storageEngine.getHistory());
    setFavorites(storageEngine.getFavorites());

    const unsubHistory = storageEngine.subscribeHistory((items) => {
      setHistoryItems(items);
    });

    const unsubFavs = storageEngine.subscribeFavorites((favs) => {
      setFavorites(favs);
    });

    return () => {
      unsubHistory();
      unsubFavs();
    };
  }, []);

  // Registry tools
  const allTools = useMemo(() => toolRegistry.getAll(), []);

  // Filtered tools for the directory
  const filteredTools = useMemo(() => {
    let list = allTools;
    if (selectedCategoryFilter !== 'all') {
      list = list.filter((t) => t.category === selectedCategoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allTools, selectedCategoryFilter, searchQuery]);

  // Active tool definition
  const currentActiveTool = useMemo(() => {
    if (!activeToolId) return null;
    return toolRegistry.get(activeToolId) || null;
  }, [activeToolId]);

  // Handle direct tool launch
  const launchTool = (toolId: string) => {
    setActiveLegalPage(null);
    setActiveToolId(toolId);
    try {
      window.history.pushState(null, '', `/tool/${toolId}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLegalPage = (pageId: LegalPageId) => {
    setActiveToolId(null);
    setActiveLegalPage(pageId);
    try {
      window.history.pushState(null, '', `/${pageId}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (nav: string) => {
    setActiveLegalPage(null);
    setActiveNav(nav);
    if (nav === 'overview') {
      setActiveToolId(null);
      setSelectedCategoryFilter('all');
      try {
        window.history.pushState(null, '', '/');
      } catch {}
    } else if (nav === 'ai-assistant') {
      launchTool('ai-assistant');
    } else if (nav === 'workflows') {
      setActiveToolId(null);
      try {
        window.history.pushState(null, '', '/workflows');
      } catch {}
    } else if (nav === 'history') {
      setActiveToolId(null);
      try {
        window.history.pushState(null, '', '/history');
      } catch {}
    } else {
      setSelectedCategoryFilter(nav);
      setActiveToolId(null);
      try {
        window.history.pushState(null, '', `/category/${nav}`);
      } catch {}
    }
  };

  const handleCategoryFilterSelect = (catId: string) => {
    setActiveLegalPage(null);
    setSelectedCategoryFilter(catId);
    setActiveNav(catId === 'all' ? 'overview' : catId);
    setActiveToolId(null);
    try {
      window.history.pushState(null, '', catId === 'all' ? '/' : `/category/${catId}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pre-configured automated workflow
  const sampleWorkflow: WorkflowDefinition = {
    id: 'batch-pdf-invoice-archival',
    name: 'Enterprise Document & Invoice Pipeline',
    description: 'Generates structured billing receipts, optimizes document layers, and creates verified audit records.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    nodes: [
      {
        id: 'node-1',
        type: 'tool',
        toolId: 'invoice-generator',
        label: '1. Build Invoice Record',
        status: 'idle',
        config: { invoiceNumber: 'INV-AUTOMATION-2026', clientName: 'StratoCorp Enterprise' },
      },
      {
        id: 'node-2',
        type: 'tool',
        toolId: 'watermark-pdf',
        label: '2. Apply Security Watermark',
        status: 'idle',
        config: { text: 'OFFICIAL CONFIDENTIAL', opacity: 0.25 },
      },
      {
        id: 'node-3',
        type: 'tool',
        toolId: 'compress-pdf',
        label: '3. Compress & Optimize PDF',
        status: 'idle',
        config: { compressionLevel: 'recommended' },
      },
    ],
    edges: [
      { id: 'e1-2', source: 'node-1', target: 'node-2' },
      { id: 'e2-3', source: 'node-2', target: 'node-3' },
    ],
  };

  const handleRunWorkflow = async () => {
    setWorkflowRunning(true);
    setWorkflowLogs([]);
    setWorkflowProgress(0);

    const engine = WorkflowEngine.getInstance();
    await engine.executeWorkflow(
      sampleWorkflow,
      {},
      {
        onLog: (log) => {
          setWorkflowLogs((prev) => [...prev, log]);
        },
        onProgress: (pct) => {
          setWorkflowProgress(pct);
        },
      }
    );

    setWorkflowRunning(false);
    setWorkflowProgress(100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      <div className="flex flex-1 min-h-screen">
        {/* Sidebar Navigation (Dark Shell) */}
        <SidebarNav
          activeNav={activeNav}
          activeToolId={activeToolId}
          onSelectNav={handleNavClick}
          onSelectTool={launchTool}
          onSelectCategoryFilter={handleCategoryFilterSelect}
          favoritesCount={favorites.length}
          historyCount={historyItems.length}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Layout Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-h-screen w-full min-w-0">
          {/* Header Bar (Dark Shell) */}
          <HeaderNav
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectNav={handleNavClick}
            onSelectTool={launchTool}
            onSelectCategoryFilter={handleCategoryFilterSelect}
            onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          {/* Content Area */}
          <main className="flex-1 w-full min-w-0">
            {activeLegalPage ? (
              <LegalPages
                pageId={activeLegalPage}
                onNavigate={(pageId) => openLegalPage(pageId)}
                onClose={() => {
                  setActiveLegalPage(null);
                  try {
                    window.history.pushState(null, '', '/');
                  } catch {}
                }}
                onOpenTool={launchTool}
              />
            ) : currentActiveTool ? (
              <ErrorBoundary
                fallbackTitle={`Error running ${currentActiveTool.name}`}
                onReset={() => {
                  setActiveToolId(null);
                  try {
                    window.history.pushState(null, '', '/');
                  } catch {}
                }}
              >
                <ToolShell
                  tool={currentActiveTool}
                  onNavigateHome={() => {
                    setActiveToolId(null);
                    setActiveNav('overview');
                    setSelectedCategoryFilter('all');
                    try {
                      window.history.pushState(null, '', '/');
                    } catch {}
                  }}
                  onNavigateCategory={(cat) => handleCategoryFilterSelect(cat)}
                  onSelectTool={launchTool}
                  onOpenLegalPage={openLegalPage}
                />
              </ErrorBoundary>
            ) : activeNav === 'workflows' ? (
              /* Workflows View */
              <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <Workflow className="w-5 h-5 text-red-500" />
                      Automated Multi-Tool Pipelines
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Execute multi-stage document processing chains entirely in-browser without server overhead.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunWorkflow}
                    disabled={workflowRunning}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    {workflowRunning ? 'Executing Pipeline...' : 'Run Automated Pipeline'}
                  </button>
                </div>

                {/* Workflow Pipeline Visualization */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Pipeline Architecture
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sampleWorkflow.nodes.map((node, i) => (
                      <div
                        key={node.id}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">{node.label}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              workflowProgress > (i / 3) * 100
                                ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                                : workflowRunning && workflowProgress >= ((i - 1) / 3) * 100
                                ? 'bg-red-950 border border-red-800 text-red-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {workflowProgress > (i / 3) * 100
                              ? 'COMPLETED'
                              : workflowRunning
                              ? 'PROCESSING'
                              : 'READY'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {node.toolId === 'invoice-generator'
                            ? 'Generates structured invoice PDF with calculation.'
                            : node.toolId === 'watermark-pdf'
                            ? 'Overlays vector security diagonal stamp at 45-degree angle.'
                            : 'Compresses PDF byte streams with lossless optimization.'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {workflowRunning && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs text-slate-400 font-semibold">
                        <span>Pipeline Progress</span>
                        <span>{workflowProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <div
                          className="h-full bg-red-600 rounded-full transition-all duration-300"
                          style={{ width: `${workflowProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Execution Logs */}
                {workflowLogs.length > 0 && (
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Execution Audit Trail
                    </h3>
                    <div className="space-y-1.5 font-mono text-xs max-h-60 overflow-y-auto p-4 bg-slate-950 text-slate-100 rounded-xl border border-slate-800">
                      {workflowLogs.map((log, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="text-slate-500">
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                          </span>
                          <span
                            className={
                              log.level === 'success'
                                ? 'text-emerald-400'
                                : log.level === 'error'
                                ? 'text-red-400'
                                : 'text-blue-300'
                            }
                          >
                            {log.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeNav === 'history' ? (
              /* Activity History View */
              <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-500" />
                      Task Execution History
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Audit trail of all locally processed documents, images, and data exports.
                    </p>
                  </div>
                  {historyItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => storageEngine.clearHistory()}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:text-red-400 hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear History
                    </button>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
                  {historyItems.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-sm">
                      No task history recorded yet. Execute any tool to generate records.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {historyItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 hover:bg-slate-850 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {item.toolName}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                {item.category}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                                {item.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              {item.outputSummary || item.outputFilename}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500 font-medium">
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Home / Directory Overview */
              <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                {/* Flagship Production Suites Quick Launch Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    type="button"
                    onClick={() => launchTool('edit-pdf')}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-red-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-md"
                  >
                    <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                      PDF Editor Studio
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Edit text in-place, annotate, sign, merge, split, and export.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchTool('image-studio')}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-md"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                      Image Studio Pro
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Smart crop, canvas filters, WebP convert & compression.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchTool('resume-builder')}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-md"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 transition-colors">
                      Resume Architect
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      ATS-optimized CVs, executive formatting & PDF export.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchTool('csv-studio')}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-md"
                  >
                    <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-purple-600 transition-colors">
                      Data & CSV Studio
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Table analytics, CSV cleaner, JSON/SQL conversion.
                    </p>
                  </button>
                </div>

                {/* Directory Filter & Tools Grid */}
                <div className="space-y-5 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-white tracking-tight">Universal Tool Directory</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Showing {filteredTools.length} tools • 100% Client-Side Processing • Zero Server Uploads
                      </p>
                    </div>

                    {/* Category Pills Filter */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { id: 'all', label: 'All Tools' },
                        { id: 'pdf', label: 'PDF' },
                        { id: 'images', label: 'Images' },
                        { id: 'documents', label: 'Documents' },
                        { id: 'resumes', label: 'Resumes' },
                        { id: 'ai', label: 'AI Suite' },
                        { id: 'data', label: 'Data & CSV' },
                        { id: 'developer', label: 'Developer' },
                        { id: 'business', label: 'Business' },
                        { id: 'calculators', label: 'Calculators' },
                        { id: 'security', label: 'Security' },
                        { id: 'files', label: 'File Conversion' },
                        { id: 'media', label: 'Media & Audio' },
                        { id: 'design', label: 'Design' },
                        { id: 'marketing', label: 'Marketing' },
                        { id: 'automation', label: 'Automation' },
                        { id: 'productivity', label: 'Productivity' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryFilterSelect(cat.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                            selectedCategoryFilter === cat.id
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid of Tool Cards: Bright White Cards with Red Hover Accents */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTools.map((tool) => {
                      const isFav = favorites.includes(tool.id);
                      return (
                        <div
                          key={tool.id}
                          className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-red-500 hover:shadow-xl transition-all flex flex-col justify-between space-y-4 shadow-md group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 border border-red-200 text-red-700">
                                  {tool.category}
                                </span>
                                {tool.capabilities.aiPowered && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700">
                                    AI
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => storageEngine.toggleFavorite(tool.id)}
                                aria-label="Favorite"
                                className="text-slate-300 hover:text-amber-500 cursor-pointer p-1"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    isFav ? 'fill-amber-400 text-amber-400' : ''
                                  }`}
                                />
                              </button>
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900 text-base group-hover:text-red-600 transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                {tool.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {tool.tags.slice(0, 3).map((tag) => (
                                <span key={tag} className="text-[10px] text-slate-400 font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => launchTool(tool.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                            >
                              Open Tool <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Global Footer (shown on overview / pipelines / history / legal pages) */}
          {!currentActiveTool && (
            <Footer
              onNavigateCategory={handleCategoryFilterSelect}
              onOpenTool={launchTool}
              onOpenAllTools={() => handleCategoryFilterSelect('all')}
              onOpenLegalPage={(pageId) => openLegalPage(pageId)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
