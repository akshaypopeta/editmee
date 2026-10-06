import { HistoryItem, WorkflowDefinition, AppPreferences } from '../../types';
import { safeLocalStorage } from '../storage/safeStorage';

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
      const data = safeLocalStorage.getItem(STORAGE_KEYS.PREFS);
      if (!data) return DEFAULT_PREFS;
      const parsed = JSON.parse(data);
      if (typeof parsed !== 'object' || parsed === null) return DEFAULT_PREFS;
      return {
        ...DEFAULT_PREFS,
        ...parsed,
        favorites: Array.isArray(parsed.favorites) ? parsed.favorites : DEFAULT_PREFS.favorites,
        recentTools: Array.isArray(parsed.recentTools) ? parsed.recentTools : DEFAULT_PREFS.recentTools,
      };
    } catch (e) {
      console.warn('[EditMee] storage:error Failed to load preferences:', e);
      return DEFAULT_PREFS;
    }
  }

  public savePreferences(prefs: Partial<AppPreferences>): void {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      safeLocalStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(updated));
      if (prefs.favorites) {
        this.notifyFavorites();
      }
    } catch (e) {
      console.warn('[EditMee] storage:error Failed to save preferences:', e);
    }
  }

  // Favorites
  public getFavorites(): string[] {
    const favs = this.getPreferences().favorites;
    return Array.isArray(favs) ? favs : [];
  }

  public toggleFavorite(toolId: string): boolean {
    const prefs = this.getPreferences();
    const favorites = new Set(Array.isArray(prefs.favorites) ? prefs.favorites : []);
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
    const currentRecents = Array.isArray(prefs.recentTools) ? prefs.recentTools : [];
    const recents = [toolId, ...currentRecents.filter((id) => id !== toolId)].slice(0, 10);
    this.savePreferences({ recentTools: recents });
  }

  public getRecentTools(): string[] {
    const recents = this.getPreferences().recentTools;
    return Array.isArray(recents) ? recents : [];
  }

  // History
  public getHistory(): HistoryItem[] {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEYS.HISTORY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[EditMee] storage:error Failed to load history:', e);
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
      const currentHistory = this.getHistory();
      const history = [newItem, ...currentHistory].slice(0, 50); // Keep last 50
      safeLocalStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.notifyHistory();
    } catch (e) {
      console.warn('[EditMee] storage:error Failed to add history item:', e);
    }
    return newItem;
  }

  public clearHistory(): void {
    try {
      safeLocalStorage.removeItem(STORAGE_KEYS.HISTORY);
      this.notifyHistory();
    } catch (e) {
      console.warn('[EditMee] storage:error Failed to clear history:', e);
    }
  }

  public deleteHistoryItem(id: string): void {
    try {
      const history = this.getHistory().filter((item) => item.id !== id);
      safeLocalStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      this.notifyHistory();
    } catch (e) {
      console.warn('[EditMee] storage:error Failed to delete history item:', e);
    }
  }

  // Workflows
  public getWorkflows(): WorkflowDefinition[] {
    try {
      const data = safeLocalStorage.getItem(STORAGE_KEYS.WORKFLOWS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[EditMee] storage:error Failed to load workflows:', e);
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
      safeLocalStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.warn('Failed to save workflow', e);
    }
  }

  public deleteWorkflow(id: string): void {
    try {
      const workflows = this.getWorkflows().filter((w) => w.id !== id);
      safeLocalStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
    } catch (e) {
      console.warn('Failed to delete workflow', e);
    }
  }

  // Storage Stats & Maintenance
  public getStorageUsage(): { usedBytes: number; formatted: string; quotaApprox: string } {
    try {
      let totalBytes = 0;
      const keys = safeLocalStorage.getAllKeys();
      for (const key of keys) {
        const val = safeLocalStorage.getItem(key);
        if (val) {
          totalBytes += (val.length + key.length) * 2; // UTF-16 approx
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
        safeLocalStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
        this.notifyHistory();
      }
      if (Array.isArray(parsed.workflows)) {
        safeLocalStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(parsed.workflows));
      }
      return true;
    } catch (e) {
      console.error('Failed to import storage data', e);
      return false;
    }
  }
}

export const storageEngine = StorageEngine.getInstance();

