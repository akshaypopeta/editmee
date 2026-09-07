import { HistoryItem, WorkflowDefinition, AppPreferences } from '../../types';

export type { HistoryItem, WorkflowDefinition, AppPreferences };

const STORAGE_KEYS = {
  PREFS: 'editmee_preferences',
  HISTORY: 'editmee_tool_history',
  WORKFLOWS: 'editmee_saved_workflows',
  FAVORITES: 'editmee_favorites',
  RECENT_TOOLS: 'editmee_recent_tools',
};

const DEFAULT_PREFS: AppPreferences = {
  theme: 'dark',
  sidebarCollapsed: false,
  favorites: ['edit-pdf', 'image-studio', 'resume-builder', 'ai-work-assistant', 'csv-studio', 'json-tools'],
  recentTools: ['edit-pdf', 'image-studio', 'resume-builder'],
  autoDownload: true,
};

export class StorageEngine {
  private static instance: StorageEngine;
  private historyListeners: Set<(items: HistoryItem[]) => void> = new Set();
  private favListeners: Set<(favs: string[]) => void> = new Set();

  private constructor() {}

  public static getInstance(): StorageEngine {
    if (!StorageEngine.instance) {
      StorageEngine.instance = new StorageEngine();
    }
    return StorageEngine.instance;
  }

  public subscribeHistory(callback: (items: HistoryItem[]) => void): () => void {
    this.historyListeners.add(callback);
    return () => this.historyListeners.delete(callback);
  }

  public subscribeFavorites(callback: (favs: string[]) => void): () => void {
    this.favListeners.add(callback);
    return () => this.favListeners.delete(callback);
  }

  private notifyHistory(): void {
    const items = this.getHistory();
    this.historyListeners.forEach((cb) => {
      try {
        cb(items);
      } catch (e) {
        console.error('Error in history listener', e);
      }
    });
  }

  private notifyFavorites(): void {
    const favs = this.getFavorites();
    this.favListeners.forEach((cb) => {
      try {
        cb(favs);
      } catch (e) {
        console.error('Error in favorites listener', e);
      }
    });
  }

  // Preferences
  public getPreferences(): AppPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFS);
      return data ? { ...DEFAULT_PREFS, ...JSON.parse(data) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  }

  public savePreferences(prefs: Partial<AppPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(updated));
      if (prefs.favorites) {
        this.notifyFavorites();
      }
    } catch (e) {
      console.warn('Failed to save preferences to localStorage', e);
    }
  }

  // Favorites
  public getFavorites(): string[] {
    return this.getPreferences().favorites || [];
  }

  public toggleFavorite(toolId: string): boolean {
    const prefs = this.getPreferences();
    const favorites = new Set(prefs.favorites);
    let isFav = false;
    if (favorites.has(toolId)) {
      favorites.delete(toolId);
      isFav = false;
    } else {
      favorites.add(toolId);
      isFav = true;
    }
    this.savePreferences({ favorites: Array.from(favorites) });
    this.notifyFavorites();
    return isFav;
  }

  public isFavorite(toolId: string): boolean {
    return this.getFavorites().includes(toolId);
  }

  // Recent Tools
  public recordRecentTool(toolId: string): void {
    const prefs = this.getPreferences();
    const recents = [toolId, ...prefs.recentTools.filter((id) => id !== toolId)].slice(0, 10);
    this.savePreferences({ recentTools: recents });
  }

  public getRecentTools(): string[] {
    return this.getPreferences().recentTools || [];
  }

  // History
  public getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public addHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
    return this.addHistoryItem(item);
  }

  public addHistoryItem(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
    const newItem: HistoryItem = {
      ...item,
      id: 'hist_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      timestamp: Date.now(),
    };
    try {
      const history = [newItem, ...this.getHistory()].slice(0, 50); // Keep last 50
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.notifyHistory();
    } catch (e) {
      console.warn('Failed to add history item', e);
    }
    return newItem;
  }

  public clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
      this.notifyHistory();
    } catch (e) {
      console.warn('Failed to clear history', e);
    }
  }

  public deleteHistoryItem(id: string): void {
    try {
      const history = this.getHistory().filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.notifyHistory();
    } catch (e) {
      console.warn('Failed to delete history item', e);
    }
  }

  // Workflows
  public getWorkflows(): WorkflowDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveWorkflow(workflow: WorkflowDefinition): void {
    try {
      const workflows = this.getWorkflows();
      const existingIdx = workflows.findIndex((w) => w.id === workflow.id);
      if (existingIdx >= 0) {
        workflows[existingIdx] = { ...workflow, updatedAt: Date.now() };
      } else {
        workflows.unshift({ ...workflow, createdAt: Date.now(), updatedAt: Date.now() });
      }
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.warn('Failed to save workflow', e);
    }
  }

  public deleteWorkflow(id: string): void {
    try {
      const workflows = this.getWorkflows().filter((w) => w.id !== id);
      localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.warn('Failed to delete workflow', e);
    }
  }

  // Storage Stats & Maintenance
  public getStorageUsage(): { usedBytes: number; formatted: string; quotaApprox: string } {
    try {
      let totalBytes = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalBytes += (localStorage[key].length + key.length) * 2; // UTF-16 approx
        }
      }
      const kb = (totalBytes / 1024).toFixed(1);
      return {
        usedBytes: totalBytes,
        formatted: `${kb} KB`,
        quotaApprox: '5 MB',
      };
    } catch {
      return { usedBytes: 0, formatted: '0 KB', quotaApprox: '5 MB' };
    }
  }

  public exportAllData(): string {
    const data = {
      preferences: this.getPreferences(),
      history: this.getHistory(),
      workflows: this.getWorkflows(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  }

  public importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.preferences) {
        this.savePreferences(parsed.preferences);
      }
      if (Array.isArray(parsed.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
        this.notifyHistory();
      }
      if (Array.isArray(parsed.workflows)) {
        localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(parsed.workflows));
      }
      return true;
    } catch (e) {
      console.error('Failed to import storage data', e);
      return false;
    }
  }
}

export const storageEngine = StorageEngine.getInstance();
