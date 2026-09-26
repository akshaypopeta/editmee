import React, { useState } from 'react';
import { BrandKit } from './types';
import { POPULAR_FONTS } from './palettes';
import { Sparkles, Palette, Type, Check, X, Building2, Briefcase } from 'lucide-react';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandKit: BrandKit;
  onSaveBrandKit: (updated: BrandKit) => void;
  onApplyToCanvas: () => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
  brandKit,
  onSaveBrandKit,
  onApplyToCanvas,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'editor' | 'board'>('editor');
  const [formData, setFormData] = useState<BrandKit>({ ...brandKit });
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopyHex = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleSave = () => {
    onSaveBrandKit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Brand Kit Studio</h2>
              <p className="text-xs text-slate-400">
                Define corporate identity, core palette, typography, and generate unified brand assets
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-800 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'editor' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Settings
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('board')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'board' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Brand Board Preview
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'editor' ? (
            <div className="space-y-6">
              {/* Brand Identity Fields */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>1. Brand Identity</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      placeholder="e.g. Nexus Innovations"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tagline / Slogan</label>
                    <input
                      type="text"
                      value={formData.tagline}
                      onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                      placeholder="e.g. Intelligence Redefined"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Industry / Sector</label>
                    <input
                      type="text"
                      value={formData.industry || ''}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="e.g. Software & Artificial Intelligence"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Brand Personality</label>
                    <input
                      type="text"
                      value={formData.personality || ''}
                      onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                      placeholder="e.g. Visionary, Modern, Premium"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Brand Colors */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-purple-400" />
                  <span>2. Color Palette</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Primary */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-medium text-slate-400 block">Primary Color</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Secondary */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-medium text-slate-400 block">Secondary Color</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Accent */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <span className="text-xs font-medium text-slate-400 block">Accent Color</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Pairings */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <Type className="w-4 h-4 text-purple-400" />
                  <span>3. Typography Pairing</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Heading / Display Font</label>
                    <select
                      value={formData.fontHeading}
                      onChange={(e) => setFormData({ ...formData, fontHeading: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      {POPULAR_FONTS.map((f) => (
                        <option key={`head-${f.name}`} value={f.family}>
                          {f.label} ({f.category})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Body / Tagline Font</label>
                    <select
                      value={formData.fontBody}
                      onChange={(e) => setFormData({ ...formData, fontBody: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                    >
                      {POPULAR_FONTS.map((f) => (
                        <option key={`body-${f.name}`} value={f.family}>
                          {f.label} ({f.category})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Brand Board Preview */
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-6">
              <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h1
                    className="text-3xl font-black text-white tracking-wide"
                    style={{ fontFamily: formData.fontHeading }}
                  >
                    {formData.brandName || 'Brand Identity'}
                  </h1>
                  <p
                    className="text-sm tracking-widest text-slate-400 mt-1 uppercase"
                    style={{ fontFamily: formData.fontBody }}
                  >
                    {formData.tagline || 'Tagline & Positioning Statement'}
                  </p>
                </div>
                {formData.industry && (
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-purple-300 font-medium">
                    {formData.industry}
                  </span>
                )}
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Official Color Swatches</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Primary Brand', color: formData.primaryColor },
                    { label: 'Secondary', color: formData.secondaryColor },
                    { label: 'Accent', color: formData.accentColor },
                  ].map((swatch) => (
                    <div
                      key={swatch.label}
                      onClick={() => handleCopyHex(swatch.color)}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col space-y-2 cursor-pointer hover:border-slate-700 transition-colors"
                    >
                      <div className="w-full h-12 rounded-lg" style={{ backgroundColor: swatch.color }} />
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">{swatch.label}</span>
                        <span className="font-mono text-white flex items-center space-x-1">
                          {copiedColor === swatch.color ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                          <span>{swatch.color}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Typography Specimen */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-slate-400">Typography Scale</span>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">PRIMARY DISPLAY: {formData.fontHeading}</span>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: formData.fontHeading }}>
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">BODY / TAGLINE: {formData.fontBody}</span>
                    <div className="text-sm text-slate-300 leading-relaxed" style={{ fontFamily: formData.fontBody }}>
                      The quick brown fox jumps over the lazy dog. 0123456789
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onApplyToCanvas}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Apply to Active Canvas</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-colors cursor-pointer"
            >
              Save Brand Kit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
