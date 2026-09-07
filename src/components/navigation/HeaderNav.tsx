import React, { useState, useRef, useEffect } from 'react';
import { CATEGORIES_CONFIG, CategoryMegaMenu } from './CategoryMegaMenu';
import { EditMeeLogo } from '../common/EditMeeLogo';
import {
  Search,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Layers,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { toolRegistry } from '../../core/tool-registry/ToolRegistry';

interface HeaderNavProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectNav: (nav: any) => void;
  onSelectTool: (toolId: string) => void;
  onSelectCategoryFilter: (catId: string) => void;
  onToggleMobileSidebar: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  searchQuery,
  onSearchChange,
  onSelectNav,
  onSelectTool,
  onSelectCategoryFilter,
  onToggleMobileSidebar,
}) => {
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close mega menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.mega-menu-trigger') && !target.closest('.mega-menu-content')) {
        setActiveMegaCategory(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 shadow-sm text-slate-200">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 cursor-pointer touch-manipulation min-w-[38px] min-h-[38px] flex items-center justify-center"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onSelectNav('overview')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer lg:hidden touch-manipulation"
          >
            <EditMeeLogo height={30} variant="mascot" />
            <span className="text-lg sm:text-xl font-black text-white tracking-tight">
              <span>edit</span><span className="text-red-500">mee</span>
            </span>
          </button>

          {/* Desktop Category Master Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1">
            {CATEGORIES_CONFIG.slice(0, 7).map((cat) => {
              const isOpen = activeMegaCategory === cat.id;

              return (
                <div key={cat.id} className="relative mega-menu-trigger">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMegaCategory(isOpen ? null : cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      isOpen
                        ? 'bg-slate-800 text-red-400'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <span>{cat.name.replace(' TOOLS', '')}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-red-400' : ''
                      }`}
                    />
                  </button>

                  {/* Mega Menu Dropdown */}
                  <div className="mega-menu-content">
                    <CategoryMegaMenu
                      category={cat}
                      isOpen={isOpen}
                      onClose={() => setActiveMegaCategory(null)}
                      onSelectTool={onSelectTool}
                      onViewAllCategory={onSelectCategoryFilter}
                    />
                  </div>
                </div>
              );
            })}

            {/* Master All Tools Button */}
            <button
              type="button"
              onClick={() => onSelectCategoryFilter('all')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Tools</span>
            </button>
          </nav>
        </div>

        {/* Center/Right: Universal Search & AI Shortcut */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md justify-end min-w-0">
          {/* Universal Search Bar */}
          <div className="relative w-full max-w-xs min-w-[120px]">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 sm:pl-9 pr-7 sm:pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:bg-slate-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                aria-label="Clear search query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* AI Work Assistant Shortcut */}
          <button
            type="button"
            onClick={() => onSelectNav('ai-assistant')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-xs font-bold text-white shadow-xs transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>EditMee AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
