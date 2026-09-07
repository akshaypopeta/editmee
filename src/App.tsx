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
import { taskManager, ActiveTaskInfo } from './core/task-manager/TaskManager';
import { TaskProtectionModal } from './components/common/TaskProtectionModal';
import { ToolShell } from './components/tool/ToolShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToolDefinition, ToolCategory } from './types';
import { aiGateway } from './core/ai-gateway/AiGateway';
import { EditMeeLogo } from './components/common/EditMeeLogo';
import { HeaderNav } from './components/navigation/HeaderNav';
import { SidebarNav } from './components/navigation/SidebarNav';
import { Footer } from './components/common/Footer';
import { LegalPages, LegalPageId } from './components/common/LegalPages';
import { SeoManager } from './core/seo/SeoManager';
import { AutomatedPipelineWorkspace } from './components/workflow/AutomatedPipelineWorkspace';
import { ScrollToTop } from './components/navigation/ScrollToTop';
import { BackButton } from './components/navigation/BackButton';
import { navigationManager } from './core/navigation/NavigationManager';

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
  const [selectedSubcategoryFilter, setSelectedSubcategoryFilter] = useState<string>('all');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<ActiveTaskInfo | null>(() => taskManager.getActiveTask());
  const [pendingNavigation, setPendingNavigation] = useState<{ action: () => void; description: string } | null>(null);

  // Subscribe to task manager
  useEffect(() => {
    const unsub = taskManager.subscribe((task) => {
      setActiveTask(task);
    });
    return unsub;
  }, []);

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
      const foundTool = toolRegistry.get(tid);
      if (foundTool) {
        setActiveToolId(foundTool.id);
        setActiveLegalPage(null);
        if (foundTool.id !== tid) {
          window.history.replaceState({}, '', `/tool/${foundTool.id}`);
        }
        return;
      }
    }
    if (hash.startsWith('tool/')) {
      const tid = hash.replace('tool/', '');
      const foundTool = toolRegistry.get(tid);
      if (foundTool) {
        setActiveToolId(foundTool.id);
        setActiveLegalPage(null);
        if (foundTool.id !== tid) {
          window.history.replaceState({}, '', `/tool/${foundTool.id}`);
        }
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
      const curTask = taskManager.getActiveTask();
      if (curTask && (curTask.isProcessing || curTask.hasUnsavedData)) {
        // Revert URL hash/path to current active tool so user doesn't jump prematurely
        if (activeToolId) {
          try {
            window.history.pushState(null, '', `/tool/${activeToolId}`);
          } catch {}
        }
        setPendingNavigation({
          action: () => parseCurrentUrl(),
          description: 'Previous Page / History',
        });
        return;
      }
      parseCurrentUrl();
    };

    window.addEventListener('popstate', handlePopState);

    const handleGuardedNavigateEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: () => void; description: string }>;
      const { action, description } = customEvent.detail || {};
      if (action) {
        guardedNavigate(action, description || 'Previous Page');
      }
    };
    window.addEventListener('editmee:guarded-navigate', handleGuardedNavigateEvent);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('editmee:guarded-navigate', handleGuardedNavigateEvent);
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
        title: 'EditMee — Free Online PDF, Image, Document & AI Tools',
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

  // Subcategories available in current category selection
  const availableSubcategories = useMemo(() => {
    return toolRegistry.getSubcategoriesForCategory(selectedCategoryFilter);
  }, [selectedCategoryFilter]);

  // Filtered tools for the directory
  const filteredTools = useMemo(() => {
    let list = selectedCategoryFilter === 'all'
      ? allTools
      : toolRegistry.getByCategory(selectedCategoryFilter);

    if (selectedSubcategoryFilter !== 'all') {
      list = list.filter(
        (t) =>
          (t.subcategory || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') ===
          selectedSubcategoryFilter.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.subcategory && t.subcategory.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allTools, selectedCategoryFilter, selectedSubcategoryFilter, searchQuery]);

  // Active tool definition
  const currentActiveTool = useMemo(() => {
    if (!activeToolId) return null;
    return toolRegistry.get(activeToolId) || null;
  }, [activeToolId]);

  // Handle direct tool launch with active task guard
  const doLaunchTool = (toolId: string) => {
    setActiveLegalPage(null);
    setActiveToolId(toolId);
    const targetTool = toolRegistry.get(toolId);
    navigationManager.recordNavigation({
      path: `/tool/${toolId}`,
      type: 'tool',
      id: toolId,
      name: targetTool ? targetTool.name : toolId,
    });
    try {
      window.history.pushState(null, '', `/tool/${toolId}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doOpenLegalPage = (pageId: LegalPageId) => {
    setActiveToolId(null);
    setActiveLegalPage(pageId);
    navigationManager.recordNavigation({
      path: `/${pageId}`,
      type: 'legal',
      id: pageId,
      name: pageId.replace(/-/g, ' ').toUpperCase(),
    });
    try {
      window.history.pushState(null, '', `/${pageId}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doHandleNavClick = (nav: string) => {
    setActiveLegalPage(null);
    setActiveNav(nav);
    setSelectedSubcategoryFilter('all');
    if (nav === 'overview') {
      setActiveToolId(null);
      setSelectedCategoryFilter('all');
      navigationManager.recordNavigation({
        path: '/',
        type: 'home',
        name: 'Home',
      });
      try {
        window.history.pushState(null, '', '/');
      } catch {}
    } else if (nav === 'ai-assistant') {
      doLaunchTool('ai-assistant');
    } else if (nav === 'workflows') {
      setActiveToolId(null);
      navigationManager.recordNavigation({
        path: '/workflows',
        type: 'workflows',
        name: 'Workflows',
      });
      try {
        window.history.pushState(null, '', '/workflows');
      } catch {}
    } else if (nav === 'history') {
      setActiveToolId(null);
      navigationManager.recordNavigation({
        path: '/history',
        type: 'history',
        name: 'History',
      });
      try {
        window.history.pushState(null, '', '/history');
      } catch {}
    } else {
      setSelectedCategoryFilter(nav);
      setActiveToolId(null);
      navigationManager.recordNavigation({
        path: `/category/${nav}`,
        type: 'category',
        id: nav,
        name: `${nav.toUpperCase()} Tools`,
      });
      try {
        window.history.pushState(null, '', `/category/${nav}`);
      } catch {}
    }
  };

  const doCategoryFilterSelect = (catId: string, subcatId: string = 'all') => {
    setActiveLegalPage(null);
    setSelectedCategoryFilter(catId);
    setSelectedSubcategoryFilter(subcatId);
    setActiveNav(catId === 'all' ? 'overview' : catId);
    setActiveToolId(null);
    navigationManager.recordNavigation({
      path: catId === 'all' ? '/' : `/category/${catId}`,
      type: catId === 'all' ? 'home' : 'category',
      id: catId,
      name: catId === 'all' ? 'Home & Directory' : `${catId.toUpperCase()} Tools`,
    });
    try {
      window.history.pushState(null, '', catId === 'all' ? '/' : `/category/${catId}`);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const guardedNavigate = (action: () => void, targetDescription: string, targetToolId?: string) => {
    const curTask = taskManager.getActiveTask();
    if (curTask && (curTask.isProcessing || curTask.hasUnsavedData)) {
      if (!targetToolId || targetToolId !== curTask.toolId) {
        setPendingNavigation({ action, description: targetDescription });
        return;
      }
    }
    action();
  };

  const launchTool = (toolId: string) => {
    const targetTool = toolRegistry.get(toolId);
    const label = targetTool ? targetTool.name : toolId;
    guardedNavigate(() => doLaunchTool(toolId), label, toolId);
  };

  const openLegalPage = (pageId: LegalPageId) => {
    guardedNavigate(() => doOpenLegalPage(pageId), 'Legal / Terms');
  };

  const handleNavClick = (nav: string) => {
    guardedNavigate(() => doHandleNavClick(nav), nav === 'overview' ? 'Home & Directory' : nav.toUpperCase());
  };

  const handleCategoryFilterSelect = (catId: string, subcatId: string = 'all') => {
    guardedNavigate(
      () => doCategoryFilterSelect(catId, subcatId),
      catId === 'all' ? 'All Tools' : `${catId.toUpperCase()} Tools`
    );
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
              <AutomatedPipelineWorkspace />
            ) : activeNav === 'history' ? (
              /* Activity History View */
              <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div>
                  <BackButton customLabel="Back" onFallback={() => handleNavClick('overview')} />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <History className="w-5 h-5 text-amber-500" />
                      Task Execution History
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Audit trail of all locally processed documents, images, and data exports.
                    </p>
                  </div>
                  {historyItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => storageEngine.clearHistory()}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear History
                    </button>
                  )}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                  {historyItems.length === 0 ? (
                    <div className="py-16 text-center text-slate-500 text-sm">
                      No task history recorded yet. Execute any tool to generate records.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                      {historyItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.toolName}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {item.category}
                              </span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                                {item.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {item.outputSummary || item.outputFilename}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-400 dark:text-slate-500 font-medium">
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
              <div className="max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Flagship Production Suites Quick Launch Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => launchTool('edit-pdf')}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation"
                  >
                    <div className="w-11 h-11 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-900/60 text-red-600 dark:text-red-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      PDF Editor Studio
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Edit text in-place, annotate, sign, merge, split, and export.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchTool('image-studio')}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation"
                  >
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Image Studio Pro
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Smart crop, canvas filters, WebP convert & compression.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchTool('resume-builder')}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation"
                  >
                    <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Resume Architect
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      ATS-optimized CVs, executive formatting & PDF export.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => launchTool('csv-studio')}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation"
                  >
                    <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      Data & CSV Studio
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Table analytics, CSV cleaner, JSON/SQL conversion.
                    </p>
                  </button>
                </div>

                {/* Directory Filter & Tools Grid */}
                <div className="space-y-5 pt-2">
                  <div className="flex flex-col gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          Universal Tool Directory
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          100% Client-Side Processing • Zero Server Uploads
                        </p>
                      </div>

                      {/* Search Bar in Directory */}
                      {searchQuery && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Search: &ldquo;{searchQuery}&rdquo;</span>
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Category Pills Filter */}
                    <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
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
                        { id: 'files', label: 'Files' },
                        { id: 'media', label: 'Media' },
                        { id: 'design', label: 'Design' },
                        { id: 'marketing', label: 'Marketing' },
                        { id: 'automation', label: 'Automation' },
                        { id: 'productivity', label: 'Productivity' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryFilterSelect(cat.id, 'all')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            selectedCategoryFilter === cat.id
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Subcategories Row if a specific category is selected and has subcategories */}
                    {selectedCategoryFilter !== 'all' && availableSubcategories.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-850">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                          Subcategory:
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedSubcategoryFilter('all')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            selectedSubcategoryFilter === 'all'
                              ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/40 font-bold'
                              : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          All
                        </button>
                        {availableSubcategories.map((sub, sIdx) => (
                          <button
                            key={`${sub.slug}-${sIdx}`}
                            type="button"
                            onClick={() => setSelectedSubcategoryFilter(sub.slug)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                              selectedSubcategoryFilter === sub.slug
                                ? 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/40 font-bold'
                                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grid of Tool Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                    {filteredTools.map((tool) => {
                      const isFav = favorites.includes(tool.id);
                      return (
                        <div
                          key={tool.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-red-500 dark:hover:border-red-500 hover:shadow-xl transition-all flex flex-col justify-between space-y-3.5 sm:space-y-4 shadow-xs group"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                                  {tool.category}
                                </span>
                                {tool.capabilities.aiPowered && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                                    AI
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => storageEngine.toggleFavorite(tool.id)}
                                aria-label="Favorite"
                                className="text-slate-300 dark:text-slate-600 hover:text-amber-500 cursor-pointer p-1.5 touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                              >
                                <Star
                                  className={`w-4 h-4 ${
                                    isFav ? 'fill-amber-400 text-amber-500' : ''
                                  }`}
                                />
                              </button>
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                {tool.name}
                              </h3>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {tool.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1 overflow-hidden">
                              {tool.tags.slice(0, 3).map((tag, tIdx) => (
                                <span key={`${tool.id}-tag-${tIdx}-${tag}`} className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <button
                              type="button"
                              onClick={() => launchTool(tool.id)}
                              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs touch-manipulation shrink-0 min-h-[36px]"
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

      {/* Cross-Tool Task Protection Modal */}
      {pendingNavigation && activeTask && (
        <TaskProtectionModal
          activeTask={activeTask}
          targetDescription={pendingNavigation.description}
          onCancel={() => setPendingNavigation(null)}
          onConfirmStopAndProceed={() => {
            taskManager.abortActiveTask();
            const nextAction = pendingNavigation.action;
            setPendingNavigation(null);
            nextAction();
          }}
        />
      )}

      {/* Global Scroll-to-Top Button */}
      <ScrollToTop />
    </div>
  );
}
