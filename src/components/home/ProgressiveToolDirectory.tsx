import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, ArrowRight } from 'lucide-react';
import { ToolDefinition } from '../../types';
import { getToolCanonicalPath } from '../../core/routing/toolUrls';

interface ToolCardProps {
  tool: ToolDefinition;
  isFav: boolean;
  onToggleFavorite: (toolId: string) => void;
  onLaunchTool: (toolId: string) => void;
  onSelectCategory: (category: string) => void;
}

export const ToolCard = React.memo<ToolCardProps>(({
  tool,
  isFav,
  onToggleFavorite,
  onLaunchTool,
  onSelectCategory,
}) => {
  const toolCanonicalUrl = getToolCanonicalPath(tool.id);

  return (
    <div
      key={tool.id}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-red-500 dark:hover:border-red-500 hover:shadow-xl transition-all flex flex-col justify-between space-y-3.5 sm:space-y-4 shadow-xs group"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <a
              href={`/category/${tool.category.toLowerCase()}/`}
              onClick={(e) => {
                e.preventDefault();
                onSelectCategory(tool.category);
              }}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/70 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 transition-colors"
            >
              {tool.category}
            </a>
            {tool.capabilities.aiPowered && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                AI
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(tool.id)}
            aria-label={`Favorite ${tool.name}`}
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
          <a
            href={toolCanonicalUrl}
            onClick={(e) => {
              e.preventDefault();
              onLaunchTool(tool.id);
            }}
            className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors block"
          >
            {tool.name}
          </a>
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

        <a
          href={toolCanonicalUrl}
          onClick={(e) => {
            e.preventDefault();
            onLaunchTool(tool.id);
          }}
          className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs touch-manipulation shrink-0 min-h-[36px]"
        >
          Open Tool <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
});

ToolCard.displayName = 'ToolCard';

interface ProgressiveToolDirectoryProps {
  tools: ToolDefinition[];
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
  onLaunchTool: (toolId: string) => void;
  onSelectCategory: (category: string) => void;
  onResetFilters?: () => void;
}

export const ProgressiveToolDirectory: React.FC<ProgressiveToolDirectoryProps> = ({
  tools,
  favorites,
  onToggleFavorite,
  onLaunchTool,
  onSelectCategory,
  onResetFilters,
}) => {
  // Render an initial batch of 24 cards for instantaneous first paint on mobile & desktop
  const INITIAL_BATCH_SIZE = 24;
  const BATCH_INCREMENT = 24;

  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // When tools array changes (due to search query or category filter), reset visibleCount to initial batch
  useEffect(() => {
    setVisibleCount(INITIAL_BATCH_SIZE);
  }, [tools]);

  const hasMore = visibleCount < tools.length;
  const displayedTools = useMemo(() => tools.slice(0, visibleCount), [tools, visibleCount]);

  // IntersectionObserver to progressively load next batch when scrolling near bottom
  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0] && entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, tools.length));
        }
      },
      {
        rootMargin: '400px', // Pre-fetch before user reaches the edge for seamless scroll
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, tools.length]);

  if (tools.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4">
        <p className="text-slate-400 text-sm">No tools found matching your current filter.</p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid of Tool Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {displayedTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isFav={favorites.includes(tool.id)}
            onToggleFavorite={onToggleFavorite}
            onLaunchTool={onLaunchTool}
            onSelectCategory={onSelectCategory}
          />
        ))}
      </div>

      {/* Sentinel element for IntersectionObserver */}
      {hasMore && (
        <div ref={sentinelRef} className="h-4 w-full pointer-events-none" aria-hidden="true" />
      )}

      {/* Progressive Loading Controls & Progress Indicator */}
      <div className="pt-2 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-850">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-white">{displayedTools.length}</strong> of{' '}
            <strong className="text-white">{tools.length}</strong> tools
          </span>
          {tools.length > INITIAL_BATCH_SIZE && (
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (displayedTools.length / tools.length) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {hasMore ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, tools.length))}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              Load more (+{Math.min(BATCH_INCREMENT, tools.length - visibleCount)})
            </button>
            <button
              type="button"
              onClick={() => setVisibleCount(tools.length)}
              className="px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Show all ({tools.length})
            </button>
          </div>
        ) : tools.length > INITIAL_BATCH_SIZE ? (
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            All {tools.length} tools loaded
          </span>
        ) : null}
      </div>
    </div>
  );
};
