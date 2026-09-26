import React from 'react';
import {
  X,
  History,
  Trash2,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { AuditHistoryRecord, SeoAuditReport } from '../types';
import { getAuditHistory, deleteAuditFromHistory, clearAuditHistory } from '../auditHistoryStorage';

interface AuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: SeoAuditReport) => void;
  onCompareWithCurrent?: (report: SeoAuditReport) => void;
}

export const AuditHistoryModal: React.FC<AuditHistoryModalProps> = ({
  isOpen,
  onClose,
  onSelectReport,
  onCompareWithCurrent,
}) => {
  const [history, setHistory] = React.useState<AuditHistoryRecord[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setHistory(getAuditHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteAuditFromHistory(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all stored audit history?')) {
      clearAuditHistory();
      setHistory([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl text-white">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">SEO Audit History</h3>
              <p className="text-xs text-slate-400">
                Saved audit reports from your previous website scans
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs">No stored audits found in history yet.</p>
            </div>
          ) : (
            history.map((record) => (
              <div
                key={record.id}
                onClick={() => {
                  onSelectReport(record.report);
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 truncate">
                  <div className="text-xs font-mono font-bold text-sky-400 truncate">
                    {record.targetUrl}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(record.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {/* Badge summary */}
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                      {record.criticalCount} crit
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      {record.highCount} high
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {record.passedCount} pass
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(record.id, e)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleClearAll}
              className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
            >
              Clear All History
            </button>
            <span className="text-slate-500">{history.length} record(s)</span>
          </div>
        )}
      </div>
    </div>
  );
};
