import React from 'react';
import { PenTool, Shield, Check, Sliders } from 'lucide-react';
import { SignatureDrawingCanvas } from '../SignatureDrawingCanvas';

interface SignToolPanelProps {
  signerName: string;
  setSignerName: (name: string) => void;
  signatureText: string;
  setSignatureText: (text: string) => void;
  signerTitle: string;
  setSignerTitle: (title: string) => void;
  signatureReason: string;
  setSignatureReason: (reason: string) => void;
  signPlacement: 'last' | 'first' | 'all' | 'custom';
  setSignPlacement: (placement: 'last' | 'first' | 'all' | 'custom') => void;
  signCustomPage?: number;
  setSignCustomPage?: (page: number) => void;
  signPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'custom';
  setSignPosition: (pos: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center' | 'custom') => void;
  stampStyle?: 'verified-badge' | 'clean-signature';
  setStampStyle?: (style: 'verified-badge' | 'clean-signature') => void;
  maxPages?: number;
  onSignatureDrawn?: (dataUrl: string, typed?: string) => void;
  isAdvancedMode: boolean;
  setIsAdvancedMode: (adv: boolean) => void;
}

export const SignToolPanel: React.FC<SignToolPanelProps> = ({
  signerName,
  setSignerName,
  signatureText,
  setSignatureText,
  signerTitle,
  setSignerTitle,
  signatureReason,
  setSignatureReason,
  signPlacement,
  setSignPlacement,
  signCustomPage = 1,
  setSignCustomPage,
  signPosition,
  setSignPosition,
  stampStyle = 'verified-badge',
  setStampStyle,
  maxPages = 1,
  onSignatureDrawn,
  isAdvancedMode,
  setIsAdvancedMode,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-red-500" />
            Electronic Signature Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Draw, type, or upload your signature with tamper-evident audit credentials.
          </p>
        </div>

        {/* Quick / Advanced Toggle */}
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
          {isAdvancedMode ? 'Advanced Pro Mode' : 'Quick Mode'}
        </button>
      </div>

      {/* Interactive Signature Canvas / Script generator */}
      <SignatureDrawingCanvas
        defaultSignerName={signerName}
        onSignatureChange={(dataUrl, typed) => {
          if (typed) {
            setSignatureText(typed);
            if (!signerName) setSignerName(typed);
          }
          if (onSignatureDrawn) onSignatureDrawn(dataUrl, typed);
        }}
      />

      {/* Signature Appearance Style Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Signature Presentation Style
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStampStyle && setStampStyle('verified-badge')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              stampStyle === 'verified-badge'
                ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 ring-1 ring-red-500'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Verified Audit Badge
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Includes digital verification bar, signer name, date, and security seal.
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStampStyle && setStampStyle('clean-signature')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              stampStyle === 'clean-signature'
                ? 'border-red-500 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-300 ring-1 ring-red-500'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="text-xs font-bold flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-blue-500" />
              Clean Signature Only
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Transparent handwritten signature without surrounding border box.
            </div>
          </button>
        </div>
      </div>

      {/* Signer Identity Information */}
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Signer Legal Name
            </label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Title / Capacity
            </label>
            <input
              type="text"
              value={signerTitle}
              onChange={(e) => setSignerTitle(e.target.value)}
              placeholder="e.g. Managing Director"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>

        {isAdvancedMode && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Signing / Audit Note
              </label>
              <input
                type="text"
                value={signatureReason}
                onChange={(e) => setSignatureReason(e.target.value)}
                placeholder="e.g. Verified, Reviewed & Approved by Signatory"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Page Placement
                </label>
                <select
                  value={signPlacement}
                  onChange={(e) => setSignPlacement(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="last">Last Page (Standard Contract Signing)</option>
                  <option value="first">First Page (Executive Summary)</option>
                  <option value="custom">Specific Page</option>
                  <option value="all">All Pages (Initial & Seal Every Page)</option>
                </select>
                {signPlacement === 'custom' && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-[11px] text-slate-500">Page Number (1 to {maxPages}):</label>
                    <input
                      type="number"
                      min="1"
                      max={maxPages}
                      value={signCustomPage}
                      onChange={(e) => setSignCustomPage && setSignCustomPage(Math.max(1, Math.min(maxPages, parseInt(e.target.value, 10) || 1)))}
                      className="w-20 px-2 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Position Coordinates
                </label>
                <select
                  value={signPosition}
                  onChange={(e) => setSignPosition(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="bottom-right">Bottom Right Corner</option>
                  <option value="bottom-left">Bottom Left Corner</option>
                  <option value="top-right">Top Right Corner</option>
                  <option value="top-left">Top Left Corner</option>
                  <option value="center">Page Center</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Audit Seal Preview */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span>Digital Audit Seal:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{signerName || 'Authorized Signer'}</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {new Date().toISOString().slice(0, 10)} (ISO UTC)
          </span>
        </div>
      </div>
    </div>
  );
};
