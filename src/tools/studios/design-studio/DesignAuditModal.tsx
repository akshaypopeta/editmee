import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { DesignAuditReport } from './types';

interface DesignAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DesignAuditReport;
  onHighlightElement: (id: string) => void;
}

export const DesignAuditModal: React.FC<DesignAuditModalProps> = ({
  isOpen,
  onClose,
  report,
  onHighlightElement,
}) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-black text-white">Design Quality & Contrast Audit</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Score Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-5">
            <div
              className={`w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center font-black ${getScoreColor(
                report.overallScore
              )}`}
            >
              <span className="text-2xl">{report.overallScore}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">/ 100</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-1">
                {report.overallScore >= 85
                  ? 'Exemplary Design Execution'
                  : report.overallScore >= 70
                  ? 'Good Layout with Minor Fixes'
                  : 'Actionable Design Issues Detected'}
              </div>
              <p className="text-xs text-slate-400">
                Automated analysis reviewing WCAG typography contrast, canvas bounds, print safe-area margins, and asset scaling.
              </p>
            </div>
          </div>

          {/* Audit Checks List */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Inspection Checklist
            </label>

            {report.checks.map((check) => {
              return (
                <div
                  key={check.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3"
                >
                  {check.type === 'success' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  {check.type === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  {check.type === 'info' && (
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">{check.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{check.description}</div>

                    {check.affectedElementIds && check.affectedElementIds.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {check.affectedElementIds.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              onHighlightElement(id);
                              onClose();
                            }}
                            className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20"
                          >
                            <span>Inspect Layer</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
