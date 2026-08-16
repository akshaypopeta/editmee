import React, { useState } from 'react';
import { CATEGORIES_CONFIG } from './CategoryMegaMenu';
import { toolRegistry } from '../../core/tool-registry/ToolRegistry';
import { EditMeeLogo } from '../common/EditMeeLogo';
import {
  Home,
  Sparkles,
  Search,
  ChevronDown,
  ChevronRight,
  Layers,
  Star,
  History,
  Workflow,
  ArrowRight,
  Shield,
  Sliders,
} from 'lucide-react';

interface SidebarNavProps {
  activeNav: string;
  activeToolId: string | null;
  onSelectNav: (nav: any) => void;
  onSelectTool: (toolId: string) => void;
  onSelectCategoryFilter: (categoryId: string) => void;
  favoritesCount?: number;
  historyCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeNav,
  activeToolId,
  onSelectNav,
  onSelectTool,
  onSelectCategoryFilter,
  favoritesCount = 0,
  historyCount = 0,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['pdf', 'images', 'ai']);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col transition-transform duration-200 shadow-xl lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
        <button
          type="button"
          onClick={() => {
            onSelectNav('overview');
            onCloseMobile?.();
          }}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <EditMeeLogo height={36} variant="mascot" />
          <span className="text-2xl font-black text-white tracking-tight">
            <span>edit</span><span className="text-red-500">mee</span>
          </span>
        </button>
        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-950/70 border border-red-800/80 text-red-400">
          PRO
        </span>
      </div>

      {/* Primary Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* Core Links */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => {
              onSelectNav('overview');
              onCloseMobile?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeNav === 'overview' && !activeToolId
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Home & Directory</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectNav('ai-assistant');
              onCloseMobile?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeToolId === 'ai-assistant'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-red-400" />
            <span>EditMee AI Assistant</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectNav('workflows');
              onCloseMobile?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeNav === 'workflows'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Workflow className="w-4 h-4 text-emerald-400" />
            <span>Visual Pipelines</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectNav('history');
              onCloseMobile?.();
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeNav === 'history'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-amber-400" />
              <span>Activity History</span>
            </div>
            {historyCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Master Category Suite Accordions */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="px-3 flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Tool Suites & Categories
            </h4>
            <span className="text-[10px] text-slate-400 font-mono font-semibold">
              {toolRegistry.getAll().length} Tools
            </span>
          </div>

          <div className="space-y-1">
            {CATEGORIES_CONFIG.map((cat) => {
              const isExpanded = expandedCategories.includes(cat.id);
              const toolsInCat = toolRegistry.getByCategory(cat.id as any);
              const Icon = cat.icon;

              return (
                <div key={cat.id} className="rounded-xl overflow-hidden">
                  <div
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      activeNav === cat.id
                        ? 'bg-slate-800 text-red-400 border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategoryFilter(cat.id);
                        onCloseMobile?.();
                      }}
                      className="flex items-center gap-2.5 text-left flex-1 truncate cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-red-500 shrink-0" />
                      <div className="truncate">
                        <span className="font-bold">{cat.name}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategory(cat.id);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 cursor-pointer ml-1"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Subgroup Tool Links */}
                  {isExpanded && (
                    <div className="pl-5 pr-2 py-1.5 space-y-1 bg-slate-950/60 rounded-b-xl border-l-2 border-red-500 ml-3 my-1">
                      {toolsInCat.slice(0, 8).map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => {
                            onSelectTool(tool.id);
                            onCloseMobile?.();
                          }}
                          className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between group cursor-pointer ${
                            activeToolId === tool.id
                              ? 'bg-red-600 text-white font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/80 font-medium'
                          }`}
                        >
                          <span className="truncate">{tool.name}</span>
                          <span className="text-[10px] opacity-0 group-hover:opacity-100 text-red-400 transition-opacity">
                            →
                          </span>
                        </button>
                      ))}

                      {toolsInCat.length > 8 && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCategoryFilter(cat.id);
                            onCloseMobile?.();
                          }}
                          className="w-full text-left text-[11px] font-bold text-red-400 hover:text-red-300 px-2.5 py-1.5 transition-colors cursor-pointer"
                        >
                          View all {toolsInCat.length} {cat.name} →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-3">
        <Shield className="w-5 h-5 text-emerald-500 shrink-0" />
        <div className="text-[11px] leading-tight">
          <p className="font-bold text-slate-200">100% Client-Side Privacy</p>
          <p className="text-slate-500">Zero file transmission</p>
        </div>
      </div>
    </aside>
  );
};
