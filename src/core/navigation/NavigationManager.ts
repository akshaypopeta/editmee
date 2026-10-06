/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { safeSessionStorage } from '../storage/safeStorage';

export interface NavigationHistoryEntry {
  path: string;
  type: 'tool' | 'category' | 'legal' | 'home' | 'workflows' | 'history';
  id?: string;
  name?: string;
  timestamp: number;
}

const STORAGE_KEY = 'editmee_navigation_history_v1';
const MAX_HISTORY_LENGTH = 50;

class NavigationManager {
  private historyStack: NavigationHistoryEntry[] = [];
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    try {
      const stored = safeSessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.historyStack = JSON.parse(stored);
      }
    } catch {
      this.historyStack = [];
    }

    // Capture initial entry if empty
    if (this.historyStack.length === 0) {
      const currentPath = window.location.pathname || '/';
      this.historyStack.push({
        path: currentPath,
        type: this.determineRouteType(currentPath),
        timestamp: Date.now(),
      });
      this.persist();
    }

    // Listen to popstate to keep stack synchronized
    window.addEventListener('popstate', () => {
      const currentPath = window.location.pathname || '/';
      // If returning to a previous entry, we adjust or record
      const lastIndex = this.historyStack.findIndex((e) => e.path === currentPath);
      if (lastIndex >= 0 && lastIndex < this.historyStack.length - 1) {
        // Truncate forward history if popped back
        this.historyStack = this.historyStack.slice(0, lastIndex + 1);
      } else {
        this.historyStack.push({
          path: currentPath,
          type: this.determineRouteType(currentPath),
          timestamp: Date.now(),
        });
      }
      this.persist();
    });

    this.isInitialized = true;
  }

  private determineRouteType(path: string): NavigationHistoryEntry['type'] {
    if (path.startsWith('/tool/') || path.startsWith('/tools/')) return 'tool';
    if (path.startsWith('/category/')) return 'category';
    if (path === '/workflows') return 'workflows';
    if (path === '/history') return 'history';
    if (
      path === '/privacy-policy' ||
      path === '/terms-and-conditions' ||
      path === '/security-architecture' ||
      path === '/about-us' ||
      path === '/contact-us' ||
      path === '/disclaimer'
    ) {
      return 'legal';
    }
    return 'home';
  }

  private persist() {
    try {
      if (this.historyStack.length > MAX_HISTORY_LENGTH) {
        this.historyStack = this.historyStack.slice(-MAX_HISTORY_LENGTH);
      }
      safeSessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.historyStack));
    } catch {}
  }

  /**
   * Record a navigation event when user pushes a new route
   */
  public recordNavigation(entry: Omit<NavigationHistoryEntry, 'timestamp'>) {
    const currentPath = entry.path.toLowerCase();
    const lastEntry = this.historyStack[this.historyStack.length - 1];

    // Avoid duplicate adjacent entries
    if (lastEntry && lastEntry.path.toLowerCase() === currentPath) {
      return;
    }

    this.historyStack.push({
      ...entry,
      timestamp: Date.now(),
    });
    this.persist();
  }

  /**
   * Check if there is internal session history to navigate back to
   */
  public canGoBack(): boolean {
    if (typeof window === 'undefined') return false;
    // We can go back if our internal stack has more than 1 entry and window.history has history
    return this.historyStack.length > 1 && window.history.length > 1;
  }

  /**
   * Get the previous history entry in session if available
   */
  public getPreviousEntry(): NavigationHistoryEntry | null {
    if (this.historyStack.length >= 2) {
      return this.historyStack[this.historyStack.length - 2];
    }
    return null;
  }

  /**
   * Execute intelligent back navigation.
   * If there is an authentic previous internal route, pops browser history.
   * Otherwise executes the safe fallback callback.
   */
  public goBack(fallbackCallback?: () => void) {
    if (typeof window === 'undefined') {
      fallbackCallback?.();
      return;
    }

    if (this.canGoBack()) {
      // Pop the current entry from our internal stack before triggering browser back
      this.historyStack.pop();
      this.persist();
      window.history.back();
    } else {
      // Fallback for direct entrance or external referrer
      if (fallbackCallback) {
        fallbackCallback();
      } else {
        // Default safe fallback to Home
        try {
          window.history.pushState(null, '', '/');
          window.dispatchEvent(new PopStateEvent('popstate'));
        } catch {
          window.location.href = '/';
        }
      }
    }
  }

  /**
   * Get dynamic, user-friendly label for where Back will take the user
   */
  public getBackLabel(defaultLabel = 'Back'): string {
    const prev = this.getPreviousEntry();
    if (!prev) return defaultLabel;

    if (prev.name) {
      return `Back to ${prev.name}`;
    }
    if (prev.type === 'category' && prev.id) {
      return `Back to ${prev.id.toUpperCase()} Tools`;
    }
    if (prev.type === 'home') {
      return 'Back to Home';
    }
    if (prev.type === 'workflows') {
      return 'Back to Workflows';
    }
    if (prev.type === 'history') {
      return 'Back to History';
    }
    return defaultLabel;
  }
}

export const navigationManager = new NavigationManager();
