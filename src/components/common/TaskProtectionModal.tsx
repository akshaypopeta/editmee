/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, X, Play, ArrowRight, ShieldAlert } from 'lucide-react';
import { ActiveTaskInfo } from '../../core/task-manager/TaskManager';

interface TaskProtectionModalProps {
  activeTask: ActiveTaskInfo;
  targetDescription: string;
  onCancel: () => void;
  onConfirmStopAndProceed: () => void;
}

export const TaskProtectionModal: React.FC<TaskProtectionModalProps> = ({
  activeTask,
  targetDescription,
  onCancel,
  onConfirmStopAndProceed,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-slate-900 dark:text-slate-100 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-protection-title"
      >
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/30 dark:border-amber-600/50 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 id="task-protection-title" className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              {activeTask.isProcessing ? 'Active Task Running' : 'Unsaved Work in Progress'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              {activeTask.isProcessing ? (
                <>
                  <span className="font-semibold text-amber-600 dark:text-amber-300">{activeTask.toolName}</span> is currently processing a document. Switching tools will immediately abort this task.
                </>
              ) : (
                <>
                  You have an active document in <span className="font-semibold text-slate-800 dark:text-slate-200">{activeTask.toolName}</span>. Leaving will discard any pending changes.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Current Tool:</span>
            <span className="font-medium text-slate-900 dark:text-slate-200">{activeTask.toolName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Destination:</span>
            <span className="font-medium text-red-600 dark:text-red-400">{targetDescription}</span>
          </div>
          {activeTask.statusText && (
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              <span>Status:</span>
              <span className="font-medium text-amber-600 dark:text-amber-300">{activeTask.statusText}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer"
          >
            Cancel & Stay
          </button>
          <button
            type="button"
            onClick={onConfirmStopAndProceed}
            className="w-full sm:w-1/2 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Stop Task & Open</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
