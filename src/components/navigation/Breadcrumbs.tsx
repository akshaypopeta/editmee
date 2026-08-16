import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  category?: string;
  categoryLabel?: string;
  toolName?: string;
  onNavigateHome: () => void;
  onNavigateCategory?: (category: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  category,
  categoryLabel,
  toolName,
  onNavigateHome,
  onNavigateCategory,
}) => {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-4 px-1 select-none overflow-x-auto py-1">
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1 hover:text-slate-200 transition-colors cursor-pointer shrink-0"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      {category && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <button
            onClick={() => onNavigateCategory?.(category)}
            className="hover:text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            {categoryLabel || category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        </>
      )}

      {toolName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="text-slate-200 font-semibold truncate shrink-0 max-w-[200px] sm:max-w-none">
            {toolName}
          </span>
        </>
      )}
    </nav>
  );
};
