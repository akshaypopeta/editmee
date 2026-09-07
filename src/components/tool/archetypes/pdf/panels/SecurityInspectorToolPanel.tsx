import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, Key, Check, AlertCircle, FileSearch, Eye, Printer, Copy, Edit3 } from 'lucide-react';
import { PdfSecurityReport } from '../../../../../core/pdf-engine/PdfEngine';

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface SecurityInspectorToolPanelProps {
  report: PdfSecurityReport | null;
  fileName: string;
  isInspecting: boolean;
}

export const SecurityInspectorToolPanel: React.FC<SecurityInspectorToolPanelProps> = ({
  report,
  fileName,
  isInspecting,
}) => {
  if (isInspecting || !report) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto animate-pulse">
          <FileSearch className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Analyzing Cryptographic Envelope & Security Headers...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Inspecting dictionary streams, permissions bitmasks, encryption version, and signing certificates.
        </p>
      </div>
    );
  }

  const p = report.permissions;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-red-500" />
            PDF Security & Cryptographic Inspector
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Deep structural forensic audit of encryption handlers, revision history, and user permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {report.isEncrypted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Lock className="w-3.5 h-3.5" />
              Encrypted Protected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Unlock className="w-3.5 h-3.5" />
              Unencrypted / Plaintext
            </span>
          )}
        </div>
      </div>

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Encryption Algorithm
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1" title={report.algorithm}>
            {report.algorithm}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Security Handler
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1" title={report.securityHandler}>
            {report.securityHandler}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Key Length / Version
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {report.keyLengthBits ? `${report.keyLengthBits}-bit` : 'None'} • {report.pdfVersion}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
            Digital Signatures
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {report.hasDigitalSignatures ? `${report.signatureCount} Embedded Signature(s)` : 'None detected'}
          </span>
        </div>
      </div>

      {/* Permissions Bitmask Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-red-500" />
          Effective User Access Permissions (/P Bitmask)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Document Printing
            </span>
            {p.canPrint ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Allowed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restricted
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              Content Copying & Extract
            </span>
            {p.canCopy ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Allowed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restricted
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              Document Modification
            </span>
            {p.canModify ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Allowed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="text-slate-700 dark:text-slate-300">Form Field Filling</span>
            {p.canFillForms ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Allowed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restricted
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="text-slate-700 dark:text-slate-300">Accessibility Reader</span>
            {p.canExtractAccessibility ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Allowed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restricted
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <span className="text-slate-700 dark:text-slate-300">Document Assembly</span>
            {p.canAssemble ? (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Allowed
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Restricted
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Warnings & Security Advisories */}
      {report.warnings.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-1.5 text-xs text-amber-800 dark:text-amber-200">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Security Advisories & Restrictions:
          </div>
          <ul className="list-disc pl-4 space-y-1 text-[11px]">
            {report.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
