import React, { useState } from 'react';
import { Eye, X, Check, Laptop, Smartphone, Briefcase, Shirt } from 'lucide-react';
import { LogoElement, CanvasDimensions } from './types';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: LogoElement[];
  canvasSize: CanvasDimensions;
  canvasDataUrl: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  elements,
  canvasSize,
  canvasDataUrl,
}) => {
  if (!isOpen) return null;

  const [activeMockup, setActiveMockup] = useState<'business-card' | 'app-icon' | 'website-header' | 'signboard' | 'merch'>('business-card');

  const mockups = [
    { id: 'business-card', label: 'Business Card', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'app-icon', label: 'App Icon', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'website-header', label: 'Website Nav', icon: <Laptop className="w-4 h-4" /> },
    { id: 'signboard', label: 'Store Signboard', icon: <Eye className="w-4 h-4" /> },
    { id: 'merch', label: 'Apparel Merch', icon: <Shirt className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Real-World Mockup Studio</h2>
              <p className="text-xs text-slate-400">
                Preview your brand mark in realistic physical and digital production environments
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mockup Tabs */}
        <div className="px-6 py-2 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto bg-slate-950/60">
          {mockups.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveMockup(m.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors whitespace-nowrap ${
                activeMockup === m.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Mockup Presentation Canvas */}
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-slate-950">
          {/* 1. BUSINESS CARD */}
          {activeMockup === 'business-card' && (
            <div className="relative w-full max-w-lg aspect-[1.75/1] bg-gradient-to-br from-slate-900 via-slate-950 to-black rounded-2xl shadow-2xl p-8 flex flex-col justify-between border border-slate-800/80 shadow-black/80">
              <div className="flex justify-between items-start">
                <div className="w-32 h-32 flex items-center justify-center">
                  <img
                    src={canvasDataUrl}
                    alt="Logo"
                    className="max-w-full max-h-full object-contain filter drop-shadow-md"
                  />
                </div>
                <div className="w-8 h-8 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-amber-500/30" />
                </div>
              </div>

              <div className="space-y-1 text-slate-300">
                <div className="text-sm font-bold text-white tracking-wide">Alex Morgan</div>
                <div className="text-[11px] text-amber-400/90 tracking-wider uppercase font-medium">
                  Founder & Chief Executive
                </div>
                <div className="text-[10px] text-slate-500 font-mono pt-1">
                  alex@editmee-brand.com • +1 (555) 234-5678 • San Francisco, CA
                </div>
              </div>
            </div>
          )}

          {/* 2. APP ICON */}
          {activeMockup === 'app-icon' && (
            <div className="flex flex-col items-center space-y-6">
              <div className="w-48 h-48 rounded-[38px] bg-gradient-to-br from-slate-800 via-slate-900 to-black p-6 shadow-2xl border border-slate-700/50 flex items-center justify-center shadow-black/90">
                <img
                  src={canvasDataUrl}
                  alt="App Icon"
                  className="max-w-full max-h-full object-contain filter drop-shadow-xl"
                />
              </div>
              <div className="text-center space-y-1">
                <div className="text-sm font-semibold text-white">iOS & Android App Icon</div>
                <div className="text-xs text-slate-400">Superellipse mask with retina pixel grid</div>
              </div>
            </div>
          )}

          {/* 3. WEBSITE NAV */}
          {activeMockup === 'website-header' && (
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Browser bar */}
              <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center space-x-2">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 px-3 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-400 font-mono text-center">
                  https://www.yourbrand.io
                </div>
              </div>

              {/* Website Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
                <div className="h-10 flex items-center">
                  <img src={canvasDataUrl} alt="Nav Brand" className="max-h-10 object-contain" />
                </div>
                <div className="flex items-center space-x-5 text-xs text-slate-300">
                  <span className="hover:text-white cursor-pointer">Products</span>
                  <span className="hover:text-white cursor-pointer">Solutions</span>
                  <span className="hover:text-white cursor-pointer">Pricing</span>
                  <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs">
                    Get Started
                  </button>
                </div>
              </div>

              {/* Website Hero Placeholder */}
              <div className="p-12 text-center space-y-3 bg-gradient-to-b from-slate-900 to-slate-950">
                <h1 className="text-xl font-bold text-white">The Next Generation Platform</h1>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Engineered with mathematical precision to unify your brand assets and enterprise identity.
                </p>
              </div>
            </div>
          )}

          {/* 4. STOREFRONT SIGNBOARD */}
          {activeMockup === 'signboard' && (
            <div className="w-full max-w-xl aspect-[16/9] bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 rounded-2xl border border-slate-700/60 p-8 shadow-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="p-8 rounded-xl bg-slate-900/80 border border-slate-700/50 backdrop-blur-lg shadow-2xl flex items-center justify-center max-w-md">
                <img
                  src={canvasDataUrl}
                  alt="Signboard"
                  className="max-h-24 max-w-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)]"
                />
              </div>
            </div>
          )}

          {/* 5. MERCH T-SHIRT */}
          {activeMockup === 'merch' && (
            <div className="w-full max-w-md aspect-[1/1] bg-slate-900/90 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center relative shadow-2xl">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Embroidered Chest Crest
              </div>
              <div className="w-36 h-36 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center p-4 shadow-inner">
                <img
                  src={canvasDataUrl}
                  alt="Crest"
                  className="max-w-full max-h-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="text-[11px] text-slate-500 mt-4 font-mono">100% Organic Heavyweight Cotton</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
