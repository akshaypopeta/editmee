/**
 * Safe Storage Abstraction
 * Provides bulletproof localStorage and sessionStorage access with automatic
 * in-memory fallback for iOS WebKit, Safari Private Browsing, disabled cookies,
 * or quota-exceeded environments where storage throws DOMException / SecurityError.
 */

class MemoryStorage {
  private store: Map<string, string> = new Map();

  public getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public clear(): void {
    this.store.clear();
  }

  public key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  public get length(): number {
    return this.store.size;
  }

  public keys(): string[] {
    return Array.from(this.store.keys());
  }
}

const memoryLocalStorage = new MemoryStorage();
const memorySessionStorage = new MemoryStorage();

// Test native localStorage availability once safely
let isLocalStorageAvailable = false;
try {
  if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage) {
    const testKey = '__safe_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    isLocalStorageAvailable = true;
  }
} catch (err) {
  isLocalStorageAvailable = false;
  console.warn('[EditMee] storage:error localStorage probe failed:', err);
}

// Test native sessionStorage availability once safely
let isSessionStorageAvailable = false;
try {
  if (typeof window !== 'undefined' && 'sessionStorage' in window && window.sessionStorage) {
    const testKey = '__safe_session_test__';
    window.sessionStorage.setItem(testKey, '1');
    window.sessionStorage.removeItem(testKey);
    isSessionStorageAvailable = true;
  }
} catch (err) {
  isSessionStorageAvailable = false;
  console.warn('[EditMee] storage:error sessionStorage probe failed:', err);
}

if (typeof window !== 'undefined') {
  console.info('[EditMee] boot:storage initialized (native localStorage:', isLocalStorageAvailable, ')');
}

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (isLocalStorageAvailable) {
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      } catch (err) {
        console.warn('[EditMee] storage:error localStorage.getItem failed:', err);
      }
    }
    return memoryLocalStorage.getItem(key);
  },

  setItem(key: string, value: string): boolean {
    const strVal = String(value);
    memoryLocalStorage.setItem(key, strVal);

    if (isLocalStorageAvailable) {
      try {
        window.localStorage.setItem(key, strVal);
        return true;
      } catch (err) {
        console.warn('[EditMee] storage:error localStorage.setItem failed, stored in memory:', err);
      }
    }
    return false;
  },

  removeItem(key: string): boolean {
    memoryLocalStorage.removeItem(key);

    if (isLocalStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
        return true;
      } catch (err) {
        console.warn('[EditMee] storage:error localStorage.removeItem failed:', err);
      }
    }
    return false;
  },

  clear(): boolean {
    memoryLocalStorage.clear();

    if (isLocalStorageAvailable) {
      try {
        window.localStorage.clear();
        return true;
      } catch (err) {
        console.warn('[EditMee] storage:error localStorage.clear failed:', err);
      }
    }
    return false;
  },

  getAllKeys(): string[] {
    const keys = new Set<string>(memoryLocalStorage.keys());
    if (isLocalStorageAvailable) {
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k) keys.add(k);
        }
      } catch {}
    }
    return Array.from(keys);
  },

  getLength(): number {
    return this.getAllKeys().length;
  },
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (isSessionStorageAvailable) {
      try {
        const val = window.sessionStorage.getItem(key);
        if (val !== null) return val;
      } catch (err) {
        console.warn('[EditMee] storage:error sessionStorage.getItem failed:', err);
      }
    }
    return memorySessionStorage.getItem(key);
  },

  setItem(key: string, value: string): boolean {
    const strVal = String(value);
    memorySessionStorage.setItem(key, strVal);

    if (isSessionStorageAvailable) {
      try {
        window.sessionStorage.setItem(key, strVal);
        return true;
      } catch (err) {
        console.warn('[EditMee] storage:error sessionStorage.setItem failed, stored in memory:', err);
      }
    }
    return false;
  },

  removeItem(key: string): boolean {
    memorySessionStorage.removeItem(key);

    if (isSessionStorageAvailable) {
      try {
        window.sessionStorage.removeItem(key);
        return true;
      } catch (err) {
        console.warn('[EditMee] storage:error sessionStorage.removeItem failed:', err);
      }
    }
    return false;
  },

  clear(): boolean {
    memorySessionStorage.clear();

    if (isSessionStorageAvailable) {
      try {
        window.sessionStorage.clear();
        return true;
      } catch (err) {
        console.warn('[EditMee] storage:error sessionStorage.clear failed:', err);
      }
    }
    return false;
  },

  getAllKeys(): string[] {
    const keys = new Set<string>(memorySessionStorage.keys());
    if (isSessionStorageAvailable) {
      try {
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const k = window.sessionStorage.key(i);
          if (k) keys.add(k);
        }
      } catch {}
    }
    return Array.from(keys);
  },
};

/**
 * Safe IndexedDB helper
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined' && window.indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Open an IndexedDB database safely with automatic fallback and exception isolation
 */
export function safeOpenIndexedDB(name: string, version?: number): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (!isIndexedDBAvailable()) {
        resolve(null);
        return;
      }
      const req = version ? window.indexedDB.open(name, version) : window.indexedDB.open(name);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        console.warn(`[SafeStorage] IndexedDB open error for "${name}":`, req.error);
        resolve(null);
      };
      req.onblocked = () => {
        console.warn(`[SafeStorage] IndexedDB open blocked for "${name}"`);
        resolve(null);
      };
    } catch (err) {
      console.warn(`[SafeStorage] IndexedDB operation threw exception:`, err);
      resolve(null);
    }
  });
}

