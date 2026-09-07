import React from 'react';
import { Wrench, Check, Sliders, ShieldCheck } from 'lucide-react';

interface RepairToolPanelProps {
  aggressiveRepair: boolean;
  setAggressiveRepair: (agg: boolean) => void;
  repairDiagnosticLog: string[];
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const RepairToolPanel: React.FC<RepairToolPanelProps> = ({
  aggressiveRepair,
  setAggressiveRepair,
  repairDiagnosticLog,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-red-500" />
            PDF Structural Repair & XRef Rebuilder
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Recover damaged documents, fix broken cross-reference tables, missing EOF markers, and corrupted streams.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            isAdvancedMode
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          {isAdvancedMode ? 'Advanced Pro Mode' : 'Standard Mode'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Aggressive Repair Mode */}
        <div
          onClick={() => setAggressiveRepair(!aggressiveRepair)}
          className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            aggressiveRepair
              ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-red-600 dark:text-red-400" />
              Aggressive Binary Byte Scanner & Page Dictionary Recovery
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              Scans raw binary streams directly to discover orphaned page objects, fix missing /Root catalogs, and rebuild XRef tables.
            </div>
          </div>
          <div
            className={`w-5 h-5 rounded flex items-center justify-center border shrink-0 ${
              aggressiveRepair ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {aggressiveRepair && <Check className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Repair Checklist */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="font-semibold text-slate-900 dark:text-slate-100">Automatic Repair Procedures Applied:</div>
          <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
            <li>Strips corrupt prefix junk bytes before magic <span className="font-mono">%PDF-</span> header.</li>
            <li>Reconstructs missing or truncated <span className="font-mono">%%EOF</span> trailers.</li>
            <li>Recomputes accurate object byte offsets across the Cross-Reference table.</li>
            <li>Sanitizes invalid font descriptors and orphaned annotations.</li>
          </ul>
        </div>

        {/* Diagnostic Logs */}
        {repairDiagnosticLog && repairDiagnosticLog.length > 0 && (
          <div className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl space-y-1">
            <div className="font-bold text-slate-400 mb-1 border-b border-slate-800 pb-1">
              Stream Diagnostic Output:
            </div>
            {repairDiagnosticLog.map((log, i) => (
              <div key={i}>✓ {log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
