import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Lock
} from 'lucide-react';
import { PdfDocumentInfo } from '../../../../../core/pdf-engine/PdfEngine';

export interface ClassificationBannerState {
  classification: string;
  customLabel: string;
  handlingInstruction: string;
  organization: string;
  caseOrRefNumber: string;
  placement: 'header' | 'footer' | 'both';
  pageScope: 'all' | 'first' | 'last' | 'odd' | 'even' | 'custom';
  customPageRange: string;
  bannerStyle: 'solid-bar' | 'outline-box';
  bannerColor: string;
  fontSize: number;
  bannerHeight: number;
  opacity: number;
  addDate: boolean;
}

interface ClassificationBannerToolPanelProps {
  docInfo: PdfDocumentInfo | null;
  bannerConfig: ClassificationBannerState;
  setBannerConfig: React.Dispatch<React.SetStateAction<ClassificationBannerState>>;
  onApplyBanner: () => void;
  isProcessing: boolean;
}

const PRESET_CLASSIFICATIONS = [
  { label: 'CONFIDENTIAL', color: '#d97706', desc: 'Standard business confidential' },
  { label: 'TOP SECRET', color: '#dc2626', desc: 'Highest classification red' },
  { label: 'HIGHLY CONFIDENTIAL', color: '#c2410c', desc: 'Trade secrets & executive' },
  { label: 'INTERNAL USE ONLY', color: '#0284c7', desc: 'Employees only' },
  { label: 'RESTRICTED', color: '#7c3aed', desc: 'Restricted distribution' },
  { label: 'ATTORNEY-CLIENT PRIVILEGED', color: '#991b1b', desc: 'Legal counsel privilege' },
  { label: 'LEGAL HOLD', color: '#881337', desc: 'Litigation hold order' },
  { label: 'COMPANY CONFIDENTIAL', color: '#475569', desc: 'Corporate proprietary' },
  { label: 'DRAFT', color: '#64748b', desc: 'Non-final review copy' },
  { label: 'PUBLIC', color: '#16a34a', desc: 'Approved for external distribution' },
  { label: 'CUSTOM', color: '#334155', desc: 'Custom title & color' },
];

const HANDLING_PRESETS = [
  'Internal Use Only — Do Not Distribute',
  'Strictly Confidential — Authorized Personnel Only',
  'Subject to Protective Order — Highly Sensitive',
  'Attorney-Client Privileged & Confidential Work Product',
  'Distribution Limited to Specified Recipients',
  'Preliminary Draft — Subject to Further Revisions',
];

export const ClassificationBannerToolPanel: React.FC<ClassificationBannerToolPanelProps> = ({
  docInfo,
  bannerConfig,
  setBannerConfig,
  onApplyBanner,
  isProcessing,
}) => {
  const [showAppearance, setShowAppearance] = useState<boolean>(false);
  const totalPages = docInfo?.numPages || 1;

  const currentPreset = PRESET_CLASSIFICATIONS.find(
    (p) => p.label === bannerConfig.classification
  ) || PRESET_CLASSIFICATIONS[0];

  const handleSelectPreset = (preset: typeof PRESET_CLASSIFICATIONS[0]) => {
    setBannerConfig((prev) => ({
      ...prev,
      classification: preset.label,
      bannerColor: preset.color,
    }));
  };

  const activeLabel =
    bannerConfig.classification === 'CUSTOM'
      ? bannerConfig.customLabel || 'CUSTOM CLASSIFICATION'
      : bannerConfig.classification;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            PDF Header Classification & Security Banner Stamper
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stamp official security classification bars across page headers & footers with legal notices and case tracking.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAppearance(!showAppearance)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
            showAppearance
              ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Styling & Typography</span>
        </button>
      </div>

      {/* Live Preview Box */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Security Banner Preview:</span>
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
          <div
            className={`w-full max-w-lg transition-all rounded-lg overflow-hidden py-2 px-4 text-center shadow-xs ${
              bannerConfig.bannerStyle === 'outline-box'
                ? 'bg-white border-2'
                : 'text-white'
            }`}
            style={{
              backgroundColor:
                bannerConfig.bannerStyle === 'outline-box' ? '#ffffff' : bannerConfig.bannerColor,
              borderColor: bannerConfig.bannerColor,
              color: bannerConfig.bannerStyle === 'outline-box' ? bannerConfig.bannerColor : '#ffffff',
              opacity: bannerConfig.opacity,
            }}
          >
            <div className="font-extrabold text-sm tracking-wide font-sans">
              {activeLabel}
            </div>
            {(bannerConfig.handlingInstruction ||
              bannerConfig.organization ||
              bannerConfig.caseOrRefNumber ||
              bannerConfig.addDate) && (
              <div
                className={`text-[11px] mt-0.5 tracking-tight ${
                  bannerConfig.bannerStyle === 'outline-box' ? 'text-slate-600' : 'text-white/90'
                }`}
              >
                {[
                  bannerConfig.handlingInstruction,
                  bannerConfig.organization,
                  bannerConfig.caseOrRefNumber,
                  bannerConfig.addDate ? new Date().toLocaleDateString() : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-2">
            Placement: {bannerConfig.placement.toUpperCase()} • Scope: {bannerConfig.pageScope.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Classification Presets Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Select Security Classification Level:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {PRESET_CLASSIFICATIONS.map((preset) => {
            const isSelected = bannerConfig.classification === preset.label;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate flex-1">
                    {preset.label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Label Input (if CUSTOM selected) */}
      {bannerConfig.classification === 'CUSTOM' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Custom Classification Title
            </label>
            <input
              type="text"
              value={bannerConfig.customLabel}
              onChange={(e) =>
                setBannerConfig((prev) => ({ ...prev, customLabel: e.target.value }))
              }
              placeholder="e.g. SENSITIVE COMPLIANCE RECORD"
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-1 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Banner Color (Hex)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bannerConfig.bannerColor}
                onChange={(e) =>
                  setBannerConfig((prev) => ({ ...prev, bannerColor: e.target.value }))
                }
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
              />
              <input
                type="text"
                value={bannerConfig.bannerColor}
                onChange={(e) =>
                  setBannerConfig((prev) => ({ ...prev, bannerColor: e.target.value }))
                }
                className="flex-1 px-3 py-2 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Handling Instructions & Quick Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
          Document Handling Instruction / Warning:
        </label>
        <input
          type="text"
          value={bannerConfig.handlingInstruction}
          onChange={(e) =>
            setBannerConfig((prev) => ({ ...prev, handlingInstruction: e.target.value }))
          }
          placeholder="e.g. Internal Use Only — Do Not Distribute..."
          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-red-500"
        />

        <div className="flex flex-wrap gap-1.5 pt-1">
          {HANDLING_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() =>
                setBannerConfig((prev) => ({ ...prev, handlingInstruction: preset }))
              }
              className="text-[10px] px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Organization and Case Tracking Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Organization / Department Name (Optional)
          </label>
          <input
            type="text"
            value={bannerConfig.organization}
            onChange={(e) =>
              setBannerConfig((prev) => ({ ...prev, organization: e.target.value }))
            }
            placeholder="e.g. Legal & Corporate Affairs"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Case / Docket / Reference ID (Optional)
          </label>
          <input
            type="text"
            value={bannerConfig.caseOrRefNumber}
            onChange={(e) =>
              setBannerConfig((prev) => ({ ...prev, caseOrRefNumber: e.target.value }))
            }
            placeholder="e.g. Case #2026-CV-0814"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>
      </div>

      {/* Placement & Page Scope */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Banner Placement */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Banner Placement:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'header', label: 'Top Header' },
                { id: 'footer', label: 'Bottom Footer' },
                { id: 'both', label: 'Both Top & Bottom' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setBannerConfig((prev) => ({ ...prev, placement: opt.id }))}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  bannerConfig.placement === opt.id
                    ? 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Page Scope */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
            Page Scope:
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'all', label: 'All Pages' },
                { id: 'first', label: 'First Page' },
                { id: 'odd', label: 'Odd Pages' },
                { id: 'even', label: 'Even Pages' },
                { id: 'last', label: 'Last Page' },
                { id: 'custom', label: 'Range...' },
              ] as const
            ).map((scope) => (
              <button
                key={scope.id}
                type="button"
                onClick={() => setBannerConfig((prev) => ({ ...prev, pageScope: scope.id }))}
                className={`py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                  bannerConfig.pageScope === scope.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                    : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                }`}
              >
                {scope.label}
              </button>
            ))}
          </div>
          {bannerConfig.pageScope === 'custom' && (
            <input
              type="text"
              value={bannerConfig.customPageRange}
              onChange={(e) =>
                setBannerConfig((prev) => ({ ...prev, customPageRange: e.target.value }))
              }
              placeholder="e.g. 1-3, 5, 8"
              className="mt-2 w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Appearance Controls Drawer */}
      {showAppearance && (
        <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Banner Style:
              </span>
              <div className="flex gap-2">
                {(
                  [
                    { id: 'solid-bar', label: 'Solid Colored Strip' },
                    { id: 'outline-box', label: 'Outline Border Box' },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() =>
                      setBannerConfig((prev) => ({ ...prev, bannerStyle: st.id }))
                    }
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      bannerConfig.bannerStyle === st.id
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">Banner Opacity</span>
                <span className="font-mono">{Math.round(bannerConfig.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.05"
                value={bannerConfig.opacity}
                onChange={(e) =>
                  setBannerConfig((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                }
                className="w-full accent-red-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cb-add-date"
              checked={bannerConfig.addDate}
              onChange={(e) =>
                setBannerConfig((prev) => ({ ...prev, addDate: e.target.checked }))
              }
              className="w-4 h-4 accent-red-500 rounded cursor-pointer"
            />
            <label htmlFor="cb-add-date" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              Include automatic stamp date ({new Date().toLocaleDateString()})
            </label>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Will stamp security banner on {bannerConfig.pageScope === 'all' ? `all ${totalPages} pages` : bannerConfig.pageScope} of document.
        </p>

        <button
          type="button"
          id="btn-apply-classification-banner"
          onClick={onApplyBanner}
          disabled={isProcessing}
          className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isProcessing ? 'Stamping Banner...' : 'Apply Security Banner'}</span>
        </button>
      </div>
    </div>
  );
};
