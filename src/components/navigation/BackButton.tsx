/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { navigationManager } from '../../core/navigation/NavigationManager';
import { taskManager } from '../../core/task-manager/TaskManager';

interface BackButtonProps {
  fallbackCategory?: string;
  fallbackCategoryLabel?: string;
  onFallback?: () => void;
  customLabel?: string;
  showDynamicLabel?: boolean;
  className?: string;
  id?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackCategory,
  fallbackCategoryLabel,
  onFallback,
  customLabel,
  showDynamicLabel = false,
  className = '',
  id = 'global-back-button',
}) => {
  const previousEntry = useMemo(() => navigationManager.getPreviousEntry(), []);

  const computedLabel = useMemo(() => {
    if (customLabel) return customLabel;
    if (showDynamicLabel && previousEntry) {
      if (previousEntry.name) return `Back to ${previousEntry.name}`;
      if (previousEntry.type === 'category' && previousEntry.id) {
        return `Back to ${previousEntry.id.toUpperCase()} Tools`;
      }
      if (previousEntry.type === 'home') return 'Back to Home';
    }
    if (fallbackCategoryLabel) return `Back to ${fallbackCategoryLabel}`;
    if (fallbackCategory) return `Back to ${fallbackCategory.toUpperCase()} Tools`;
    return 'Back';
  }, [customLabel, showDynamicLabel, previousEntry, fallbackCategory, fallbackCategoryLabel]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const curTask = taskManager.getActiveTask();
    if (curTask && (curTask.isProcessing || curTask.hasUnsavedData)) {
      // If task is running, task manager / App.tsx popstate or guard handles protection
      window.dispatchEvent(
        new CustomEvent('editmee:guarded-navigate', {
          detail: {
            action: () => executeBack(),
            description: computedLabel,
          },
        })
      );
      return;
    }

    executeBack();
  };

  const executeBack = () => {
    navigationManager.goBack(() => {
      if (onFallback) {
        onFallback();
      } else if (fallbackCategory) {
        try {
          window.history.pushState(null, '', `/category/${fallbackCategory}`);
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch {
          window.location.href = `/category/${fallbackCategory}`;
        }
      } else {
        try {
          window.history.pushState(null, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch {
          window.location.href = '/';
        }
      }
    });
  };

  return (
    <button
      type="button"
      id={id}
      onClick={handleClick}
      aria-label={`Go back - ${computedLabel}`}
      title={computedLabel !== 'Back' ? computedLabel : 'Go back'}
      className={`group inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs sm:text-sm font-semibold transition-all duration-150 shadow-xs hover:shadow-md cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/80 active:scale-98 min-h-[40px] sm:min-h-[38px] ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-0.5 transition-transform shrink-0" />
      <span>Back</span>
    </button>
  );
};
