import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Sparkles,
  Workflow,
  History,
  Star,
  Search,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
  Trash2,
  Lock,
  Cpu,
  RefreshCw,
  Home,
  CheckCircle2,
  FileCheck,
  Database,
  Code,
  Zap,
} from 'lucide-react';

import { toolRegistry } from './core/tool-registry/ToolRegistry';
import { registerAllTools } from './core/tool-registry/registerAllTools';
import {
  initToolUrlMappings,
  resolveToolFromPath,
  resolveToolFromSlug,
  getToolCanonicalPath,
} from './core/routing/toolUrls';
import { storageEngine, HistoryItem } from './core/storage-engine/StorageEngine';
import { safeSessionStorage } from './core/storage/safeStorage';
import { taskManager, ActiveTaskInfo } from './core/task-manager/TaskManager';
import { TaskProtectionModal } from './components/common/TaskProtectionModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToolDefinition, ToolCategory } from './types';
import { aiGateway } from './core/ai-gateway/AiGateway';
import { EditMeeLogo } from './components/common/EditMeeLogo';
import { HeaderNav } from './components/navigation/HeaderNav';
import { SidebarNav } from './components/navigation/SidebarNav';
import { Footer } from './components/common/Footer';
import { LegalPages, LegalPageId } from './components/common/LegalPages';
import { SeoManager } from './core/seo/SeoManager';
import { ScrollToTop } from './components/navigation/ScrollToTop';
import { BackButton } from './components/navigation/BackButton';
import { navigationManager } from './core/navigation/NavigationManager';
import { NotFoundPage } from './components/common/NotFoundPage';
import { HomepageHero } from './components/home/HomepageHero';
import { HomepageContentSection } from './components/home/HomepageContentSection';
import { ProgressiveToolDirectory } from './components/home/ProgressiveToolDirectory';

// Lazy-load heavy workspaces to keep initial application startup lightweight (<200kB)
const ToolShell = React.lazy(() =>
  import('./components/tool/ToolShell').then((m) => ({ default: m.ToolShell }))
);
const AutomatedPipelineWorkspace = React.lazy(() =>
  import('./components/workflow/AutomatedPipelineWorkspace').then((m) => ({
    default: m.AutomatedPipelineWorkspace,
  }))
);

function ToolLoadingFallback() {
  return (
    <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      <EditMeeLogo height={44} variant="full" dark />
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading workspace...</span>
      </div>
    </div>
  );
}

// Log boot start
if (typeof window !== 'undefined') {
  console.info('[EditMee] boot:start');
  window.__editMeeStage = 'APP_MODULE_EVALUATION';
}

// Ensure all tools are registered and slug mappings initialized safely at startup
try {
  registerAllTools();
} catch (err) {
  console.warn('[EditMee] boot:error Tool registration completed with warnings:', err);
}

try {
  initToolUrlMappings();
} catch (err) {
  console.warn('[EditMee] boot:error Slug mappings initialized with warnings:', err);
}

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

const VALID_CATEGORIES = [
  'all',
  'pdf',
  'images',
  'documents',
  'resumes',
  'ai',
  'data',
  'developer',
  'business',
  'calculators',
  'security',
  'files',
  'media',
  'design',
  'marketing',
  'automation',
  'productivity',
];

export default function App() {
  const [activeNav, setActiveNav] = useState<string>('overview');
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [activeLegalPage, setActiveLegalPage] = useState<LegalPageId | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [attemptedPath, setAttemptedPath] = useState('');
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

  // URL parsing helper: maps browser URL to canonical route
  const parseCurrentUrl = useCallback(async () => {
    const rawPath = window.location.pathname.toLowerCase();
    const rawHash = window.location.hash.toLowerCase().replace(/^#/, '');

    // 1. Check legal routes (e.g. /privacy-policy or /privacy-policy/)
    const normalizedLegalPath = rawPath.replace(/\/$/, '') || '/';
    if (LEGAL_PATHS[normalizedLegalPath]) {
      setActiveLegalPage(LEGAL_PATHS[normalizedLegalPath]);
      setActiveToolId(null);
      setIsNotFound(false);
      return;
    }
    const normalizedHash = ('/' + rawHash).replace(/\/$/, '');
    if (LEGAL_PATHS[normalizedHash]) {
      setActiveLegalPage(LEGAL_PATHS[normalizedHash]);
      setActiveToolId(null);
      setIsNotFound(false);
      return;
    }

    // 2. Check tool routes: /tools/:slug/, /tools/:slug, /tool/:id/, /suite/:id
    if (rawPath.startsWith('/tool/') || rawPath.startsWith('/tools/') || rawPath.startsWith('/suite/')) {
      let resolved = resolveToolFromPath(rawPath);
      if (!resolved || !resolved.tool) {
        // Tool might be in deferred catalog - await deferred catalog before declaring 404
        try {
          await registerAllTools();
          initToolUrlMappings();
          resolved = resolveToolFromPath(rawPath);
        } catch {}
      }
      if (resolved && resolved.tool) {
        setActiveToolId(resolved.tool.id);
        setActiveLegalPage(null);
        setIsNotFound(false);
        // Canonicalize URL in address bar if legacy format was accessed
        if (!resolved.isCanonical) {
          try {
            window.history.replaceState(null, '', resolved.canonicalPath);
          } catch {}
        }
        return;
      } else {
        // Unknown tool slug - genuine 404
        setIsNotFound(true);
        setAttemptedPath(window.location.pathname);
        setActiveToolId(null);
        setActiveLegalPage(null);
        return;
      }
    }

    // Hash-based tool route support (e.g. #tool/edit-pdf or #tools/merge-pdf)
    if (rawHash.startsWith('tool/') || rawHash.startsWith('tools/')) {
      const slugOrId = rawHash.replace(/^(?:tools?\/)/, '').replace(/\/$/, '');
      let tool = resolveToolFromSlug(slugOrId);
      if (!tool) {
        try {
          await registerAllTools();
          initToolUrlMappings();
          tool = resolveToolFromSlug(slugOrId);
        } catch {}
      }
      if (tool) {
        const canonical = getToolCanonicalPath(tool.id);
        setActiveToolId(tool.id);
        setActiveLegalPage(null);
        setIsNotFound(false);
        try {
          window.history.replaceState(null, '', canonical);
        } catch {}
        return;
      }
    }

    // 3. Category routes: /category/:id/ or /category/:id
    const catMatch = rawPath.match(/^\/category\/([a-zA-Z0-9_-]+)\/?$/);
    if (catMatch && catMatch[1]) {
      const catId = catMatch[1].toLowerCase();
      if (VALID_CATEGORIES.includes(catId)) {
        setSelectedCategoryFilter(catId);
        setActiveNav(catId === 'all' ? 'overview' : catId);
        setActiveToolId(null);
        setActiveLegalPage(null);
        setIsNotFound(false);
        if (!rawPath.endsWith('/')) {
          try {
            window.history.replaceState(null, '', `/category/${catId}/`);
          } catch {}
        }
        return;
      } else {
        setIsNotFound(true);
        setAttemptedPath(window.location.pathname);
        setActiveToolId(null);
        setActiveLegalPage(null);
        return;
      }
    }

    // 4. Workflows & History routes
    const pathNoSlash = rawPath.replace(/\/$/, '') || '/';
    if (pathNoSlash === '/workflows' || rawHash === 'workflows') {
      setActiveNav('workflows');
      setActiveToolId(null);
      setActiveLegalPage(null);
      setIsNotFound(false);
      if (!rawPath.endsWith('/')) {
        try {
          window.history.replaceState(null, '', '/workflows/');
        } catch {}
      }
      return;
    }

    if (pathNoSlash === '/history' || rawHash === 'history') {
      setActiveNav('history');
      setActiveToolId(null);
      setActiveLegalPage(null);
      setIsNotFound(false);
      if (!rawPath.endsWith('/')) {
        try {
          window.history.replaceState(null, '', '/history/');
        } catch {}
      }
      return;
    }

    if (pathNoSlash === '/all-tools' || rawHash === 'all-tools') {
      setActiveNav('overview');
      setSelectedCategoryFilter('all');
      setActiveToolId(null);
      setActiveLegalPage(null);
      setIsNotFound(false);
      try {
        window.history.replaceState(null, '', '/');
      } catch {}
      return;
    }

    // 5. Root Homepage
    if (pathNoSlash === '/' || pathNoSlash === '') {
      setActiveLegalPage(null);
      setActiveToolId(null);
      setIsNotFound(false);
      return;
    }

    // 6. Unknown path -> 404 Not Found
    setIsNotFound(true);
    setAttemptedPath(window.location.pathname);
    setActiveToolId(null);
    setActiveLegalPage(null);
  }, []);

  // Initialize and handle popstate
  useEffect(() => {
    console.info('[EditMee] boot:router', window.location.pathname);
    parseCurrentUrl();

    // Mark boot complete, notify startup guard, and clear temporary reload flags
    console.info('[EditMee] boot:complete');
    if (typeof window !== 'undefined') {
      window.__editMeeStage = 'BOOT_COMPLETE';
      if (typeof (window as any).__markEditMeeLoaded === 'function') {
        (window as any).__markEditMeeLoaded();
      }
    }
    try {
      safeSessionStorage.removeItem('editmee_chunk_reload_v1');
    } catch {}

    // Asynchronously ping non-critical AI gateway status without blocking UI render
    console.info('[EditMee] boot:api');
    aiGateway.getStatus().catch((apiErr) => {
      console.warn('[EditMee] api:error Gateway ping failed (non-blocking):', apiErr);
    });

    const handlePopState = () => {
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

  // Synchronize SEO, structured data, canonical tags & document title whenever active route changes
  useEffect(() => {
    if (isNotFound) {
      SeoManager.updateDocumentHead(SeoManager.getNotFoundSeoMetadata(attemptedPath));
      return;
    }

    if (activeLegalPage) {
      // Handled inside LegalPages component via SeoManager
      return;
    }

    if (activeToolId) {
      const tool = toolRegistry.get(activeToolId);
      if (tool) {
        SeoManager.updateDocumentHead(SeoManager.getToolSeoMetadata(tool));
      }
      return;
    }

    if (activeNav === 'workflows') {
      SeoManager.updateDocumentHead({
        title: 'Automated Document Pipelines & Workflows | EditMee',
        description: 'Chains multi-stage PDF and document conversion, watermarking, and compression pipelines entirely in browser with zero server data leakage.',
        canonicalPath: '/workflows/',
      });
      return;
    }

    if (activeNav === 'history') {
      SeoManager.updateDocumentHead({
        title: 'Task Execution Audit History | EditMee',
        description: 'Local audit trail of all processed documents, images, and data exports. Stored privately on your device and never uploaded to servers.',
        canonicalPath: '/history/',
      });
      return;
    }

    // Home / Category Overview
    if (selectedCategoryFilter !== 'all') {
      SeoManager.updateDocumentHead(SeoManager.getCategorySeoMetadata(selectedCategoryFilter));
    } else {
      SeoManager.updateDocumentHead(SeoManager.DEFAULT_APP_METADATA);
    }
  }, [isNotFound, attemptedPath, activeLegalPage, activeToolId, activeNav, selectedCategoryFilter]);

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

  // Registry tools subscription to update dynamically when deferred tools arrive
  const [registryVersion, setRegistryVersion] = useState(0);

  useEffect(() => {
    const unsub = toolRegistry.subscribe(() => {
      setRegistryVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const allTools = useMemo(() => toolRegistry.getAll(), [registryVersion]);

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
    setIsNotFound(false);
    setActiveToolId(toolId);
    const targetTool = toolRegistry.get(toolId);
    const canonicalPath = getToolCanonicalPath(toolId);
    navigationManager.recordNavigation({
      path: canonicalPath,
      type: 'tool',
      id: toolId,
      name: targetTool ? targetTool.name : toolId,
    });
    try {
      window.history.pushState(null, '', canonicalPath);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doOpenLegalPage = (pageId: LegalPageId) => {
    setActiveToolId(null);
    setIsNotFound(false);
    setActiveLegalPage(pageId);
    const canonicalPath = `/${pageId}/`;
    navigationManager.recordNavigation({
      path: canonicalPath,
      type: 'legal',
      id: pageId,
      name: pageId.replace(/-/g, ' ').toUpperCase(),
    });
    try {
      window.history.pushState(null, '', canonicalPath);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const doHandleNavClick = (nav: string) => {
    setActiveLegalPage(null);
    setIsNotFound(false);
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
        path: '/workflows/',
        type: 'workflows',
        name: 'Workflows',
      });
      try {
        window.history.pushState(null, '', '/workflows/');
      } catch {}
    } else if (nav === 'history') {
      setActiveToolId(null);
      navigationManager.recordNavigation({
        path: '/history/',
        type: 'history',
        name: 'History',
      });
      try {
        window.history.pushState(null, '', '/history/');
      } catch {}
    } else {
      setSelectedCategoryFilter(nav);
      setActiveToolId(null);
      const canonicalPath = `/category/${nav}/`;
      navigationManager.recordNavigation({
        path: canonicalPath,
        type: 'category',
        id: nav,
        name: `${nav.toUpperCase()} Tools`,
      });
      try {
        window.history.pushState(null, '', canonicalPath);
      } catch {}
    }
  };

  const doCategoryFilterSelect = (catId: string, subcatId: string = 'all') => {
    setActiveLegalPage(null);
    setIsNotFound(false);
    setSelectedCategoryFilter(catId);
    setSelectedSubcategoryFilter(subcatId);
    setActiveNav(catId === 'all' ? 'overview' : catId);
    setActiveToolId(null);
    const canonicalPath = catId === 'all' ? '/' : `/category/${catId}/`;
    navigationManager.recordNavigation({
      path: canonicalPath,
      type: catId === 'all' ? 'home' : 'category',
      id: catId,
      name: catId === 'all' ? 'Home & Directory' : `${catId.toUpperCase()} Tools`,
    });
    try {
      window.history.pushState(null, '', canonicalPath);
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

  const handleConfirmLeave = () => {
    if (pendingNavigation) {
      const { action } = pendingNavigation;
      taskManager.clearTask();
      setPendingNavigation(null);
      action();
    }
  };

  const handleCancelLeave = () => {
    setPendingNavigation(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Scroll to Top helper on route changes */}
      <ScrollToTop />

      {/* Task Protection Guard Modal */}
      {pendingNavigation && activeTask && (
        <TaskProtectionModal
          activeTask={activeTask}
          targetDescription={pendingNavigation.description}
          onConfirmStopAndProceed={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
      )}

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 min-h-screen">
        {/* Sidebar Navigation */}
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
          {/* Header Bar */}
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
            {isNotFound ? (
              <NotFoundPage
                attemptedPath={attemptedPath}
                onNavigateHome={() => {
                  setIsNotFound(false);
                  handleNavClick('overview');
                }}
                onSelectTool={launchTool}
              />
            ) : activeLegalPage ? (
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
                <React.Suspense fallback={<ToolLoadingFallback />}>
                  <ToolShell
                    tool={currentActiveTool}
                    onNavigateHome={() => handleNavClick('overview')}
                    onNavigateCategory={handleCategoryFilterSelect}
                    onSelectTool={launchTool}
                    onOpenLegalPage={openLegalPage}
                  />
                </React.Suspense>
              </ErrorBoundary>
            ) : activeNav === 'workflows' ? (
              <React.Suspense fallback={<ToolLoadingFallback />}>
                <AutomatedPipelineWorkspace />
              </React.Suspense>
            ) : activeNav === 'history' ? (
              /* Activity History Panel */
              <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      <History className="w-6 h-6 text-red-500" />
                      Activity & Task History
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Audit records of all jobs processed locally in this browser. Never transmitted to external servers.
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

                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xs overflow-hidden">
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
              <div className="max-w-7xl mx-auto p-3.5 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Homepage Hero / Introduction Banner */}
                {selectedCategoryFilter === 'all' && !searchQuery && (
                  <HomepageHero
                    onSelectTool={launchTool}
                    onNavigateCategory={handleCategoryFilterSelect}
                    totalToolsCount={allTools.length}
                  />
                )}

                {/* Flagship Production Suites Quick Launch Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <a
                    href={getToolCanonicalPath('edit-pdf')}
                    onClick={(e) => {
                      e.preventDefault();
                      launchTool('edit-pdf');
                    }}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation block"
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
                  </a>

                  <a
                    href={getToolCanonicalPath('image-studio')}
                    onClick={(e) => {
                      e.preventDefault();
                      launchTool('image-studio');
                    }}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation block"
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
                  </a>

                  <a
                    href={getToolCanonicalPath('resume-builder')}
                    onClick={(e) => {
                      e.preventDefault();
                      launchTool('resume-builder');
                    }}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation block"
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
                  </a>

                  <a
                    href={getToolCanonicalPath('csv-studio')}
                    onClick={(e) => {
                      e.preventDefault();
                      launchTool('csv-studio');
                    }}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl transition-all text-left group cursor-pointer shadow-xs touch-manipulation block"
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
                  </a>
                </div>

                {/* Directory Filter & Tools Grid */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    {/* Main Categories Row */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
                      ].map((cat) => {
                        const href = cat.id === 'all' ? '/' : `/category/${cat.id}/`;
                        return (
                          <a
                            key={cat.id}
                            href={href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleCategoryFilterSelect(cat.id, 'all');
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer inline-block ${
                              selectedCategoryFilter === cat.id
                                ? 'bg-red-600 text-white shadow-md'
                                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {cat.label}
                          </a>
                        );
                      })}
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

                  {/* Progressive Directory of Tool Cards */}
                  <ProgressiveToolDirectory
                    tools={filteredTools}
                    favorites={favorites}
                    onToggleFavorite={(id) => storageEngine.toggleFavorite(id)}
                    onLaunchTool={launchTool}
                    onSelectCategory={(cat) => handleCategoryFilterSelect(cat, 'all')}
                    onResetFilters={() => {
                      setSelectedCategoryFilter('all');
                      setSelectedSubcategoryFilter('all');
                      setSearchQuery('');
                    }}
                  />
                </div>

                {/* Comprehensive Visible Homepage Content Layer for Users, Search & AdSense */}
                {selectedCategoryFilter === 'all' && !searchQuery && (
                  <HomepageContentSection
                    onSelectTool={launchTool}
                    onNavigateCategory={handleCategoryFilterSelect}
                    onNavigateWorkflows={() => handleNavClick('workflows')}
                  />
                )}
              </div>
            )}
          </main>

          {/* Global Footer (shown on overview / pipelines / history / legal pages / 404) */}
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
