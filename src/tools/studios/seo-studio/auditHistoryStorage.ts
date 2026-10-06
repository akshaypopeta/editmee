import { SeoAuditReport, AuditHistoryRecord } from './types';
import { safeLocalStorage } from '../../../core/storage/safeStorage';

const STORAGE_KEY = 'editmee_seo_audit_history_v1';
const MAX_HISTORY_ITEMS = 30;

export function getAuditHistory(): AuditHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = safeLocalStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to read SEO audit history:', err);
    return [];
  }
}

export function saveAuditToHistory(report: SeoAuditReport): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getAuditHistory();
    const newRecord: AuditHistoryRecord = {
      id: report.id,
      targetUrl: report.targetUrl,
      timestamp: report.timestamp,
      criticalCount: report.summary.critical,
      highCount: report.summary.high,
      mediumCount: report.summary.medium,
      lowCount: report.summary.low,
      passedCount: report.summary.passed,
      report,
    };

    // Filter duplicate if same ID
    const updated = [newRecord, ...existing.filter((item) => item.id !== report.id)].slice(0, MAX_HISTORY_ITEMS);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save SEO audit to history:', err);
  }
}

export function deleteAuditFromHistory(id: string): AuditHistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getAuditHistory();
    const updated = existing.filter((item) => item.id !== id);
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete SEO audit:', err);
    return [];
  }
}

export function clearAuditHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    safeLocalStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear SEO audit history:', err);
  }
}

