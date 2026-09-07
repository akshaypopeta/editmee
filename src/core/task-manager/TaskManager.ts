/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

export interface ActiveTaskInfo {
  toolId: string;
  toolName: string;
  isProcessing: boolean;
  hasUnsavedData?: boolean;
  progressPercent?: number;
  statusText?: string;
  onAbort?: () => void;
}

type TaskChangeListener = (task: ActiveTaskInfo | null) => void;

class TaskManager {
  private activeTask: ActiveTaskInfo | null = null;
  private listeners: Set<TaskChangeListener> = new Set();

  public getActiveTask(): ActiveTaskInfo | null {
    return this.activeTask;
  }

  public registerTask(task: ActiveTaskInfo): void {
    this.activeTask = task;
    this.notify();
  }

  public updateTaskProgress(progressPercent: number, statusText?: string): void {
    if (this.activeTask) {
      this.activeTask = {
        ...this.activeTask,
        progressPercent,
        statusText: statusText ?? this.activeTask.statusText,
      };
      this.notify();
    }
  }

  public clearTask(toolId?: string): void {
    if (!toolId || (this.activeTask && this.activeTask.toolId === toolId)) {
      this.activeTask = null;
      this.notify();
    }
  }

  public abortActiveTask(): void {
    if (this.activeTask) {
      try {
        this.activeTask.onAbort?.();
      } catch (err) {
        console.warn('Error during active task abort:', err);
      }
      this.activeTask = null;
      this.notify();
    }
  }

  public subscribe(listener: TaskChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.activeTask);
      } catch (err) {
        console.warn('Task manager listener error:', err);
      }
    });
  }
}

export const taskManager = new TaskManager();

/**
 * Global React hook for any archetype or tool workspace to report active tasks/unsaved data
 */
export function useToolTask(
  toolId: string,
  toolName: string,
  isProcessing: boolean,
  hasUnsavedData: boolean = false,
  statusText?: string,
  onAbort?: () => void
) {
  useEffect(() => {
    if (isProcessing || hasUnsavedData) {
      taskManager.registerTask({
        toolId,
        toolName,
        isProcessing,
        hasUnsavedData,
        statusText,
        onAbort,
      });
    } else {
      taskManager.clearTask(toolId);
    }
  }, [toolId, toolName, isProcessing, hasUnsavedData, statusText, onAbort]);

  useEffect(() => {
    return () => {
      taskManager.clearTask(toolId);
    };
  }, [toolId]);
}

