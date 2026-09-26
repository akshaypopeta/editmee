import React from 'react';
import { BrandAuditReport } from './types';
import { ShieldCheck, AlertTriangle, CheckCircle2, Sparkles, X, ArrowRight, RefreshCw } from 'lucide-react';

interface BrandAuditModalProps {
  report: BrandAuditReport;
  isOpen: boolean;
  onClose: () => void;
  onRunAction: (actionType: string) => void;
  onReAudit: () => void;
}

export const BrandAuditModal: React.FC<BrandAuditModalProps> = ({
  report,
  isOpen,
  onClose,
  onRunAction,
  onReAudit,
}) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                <span>Brand & Design Health Audit</span>
                <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  Client-Side Engine
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated analysis of composition, typography, color harmony, and scalability
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onReAudit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs px-2.5"
              title="Refresh Audit"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-run</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Score Meter */}
            <div className={`p-5 rounded-xl border flex flex-col items-center justify-center text-center ${getScoreColor(report.overallScore)}`}>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Brand Score</span>
              <div className="text-5xl font-black my-2 font-mono">{report.overallScore}</div>
              <div className="text-xs font-medium">
                {report.overallScore >= 85
                  ? 'Exemplary Production Grade'
                  : report.overallScore >= 70
                  ? 'Solid Professional Standard'
                  : report.overallScore >= 50
                  ? 'Moderate - Needs Refinements'
                  : 'Requires Composition Fixes'}
              </div>
            </div>

            {/* Pillar Scores Grid */}
            <div className="md:col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
              {[
                { label: 'Composition & Safe Boundaries', score: report.compositionScore },
                { label: 'Typography & Size Hierarchy', score: report.typographyScore },
                { label: 'Color Harmony & Palette Count', score: report.colorScore },
                { label: 'Simplicity & Memorability', score: report.simplicityScore },
                { label: 'Scalability & Micro-detail', score: report.scalabilityScore },
                { label: 'Universal Versatility', score: report.versatilityScore },
              ].map((pillar) => (
                <div key={pillar.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{pillar.label}</span>
                    <span className="font-mono text-slate-400">{pillar.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(pillar.score)}`}
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Actionable Recommendations ({report.recommendations.length})</span>
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {report.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-mono">
                          {rec.category}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-100">{rec.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{rec.detail}</p>
                    </div>
                    {rec.actionType && (
                      <button
                        type="button"
                        onClick={() => {
                          onRunAction(rec.actionType!);
                          onClose();
                        }}
                        className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <span>Fix Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Warnings Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Strengths</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.strengths.length > 0 ? (
                  report.strengths.map((str, i) => (
                    <li key={`str-${i}`} className="flex items-start space-x-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>{str}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic">No specific strengths recorded yet.</li>
                )}
              </ul>
            </div>

            {/* Warnings */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Design Warnings</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.warnings.length > 0 ? (
                  report.warnings.map((warn, i) => (
                    <li key={`warn-${i}`} className="flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{warn}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Zero warnings! Clean design execution.</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Based on classical logo proportions, legibility thresholds, and color harmony</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
