import React from 'react';
import { LogoElement, CanvasDimensions, LogoVariationType } from './types';
import { createLogoVariation } from './exportUtils';
import { Layers, X, Check, ArrowRight, Download } from 'lucide-react';

interface VariationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: LogoElement[];
  canvasSize: CanvasDimensions;
  onApplyVariation: (variantElements: LogoElement[]) => void;
  onExportVariantPng: (variantElements: LogoElement[], title: string) => void;
}

interface VariationCardDef {
  type: LogoVariationType;
  title: string;
  description: string;
  bgDark?: boolean;
}

export const VariationsModal: React.FC<VariationsModalProps> = ({
  isOpen,
  onClose,
  elements,
  canvasSize,
  onApplyVariation,
  onExportVariantPng,
}) => {
  if (!isOpen) return null;

  const VARIATIONS: VariationCardDef[] = [
    {
      type: 'full-color',
      title: 'Full Brand Color',
      description: 'Original master color presentation with gradients and shadows.',
    },
    {
      type: 'monochrome-black',
      title: 'Black Monochrome',
      description: 'Solid single-ink black for stamps, laser engraving, and black-and-white print.',
    },
    {
      type: 'monochrome-white',
      title: 'White Monochrome',
      description: 'Clean solid white mark for dark interfaces, apparel, and photography watermarks.',
      bgDark: true,
    },
    {
      type: 'icon-only',
      title: 'Standalone Icon Mark',
      description: 'Symbol mark isolated and centered for app icons, favicons, and social avatars.',
    },
    {
      type: 'horizontal-lockup',
      title: 'Horizontal Header Lockup',
      description: 'Icon mark placed beside brand name for website navigation bars and letterheads.',
    },
    {
      type: 'vertical-lockup',
      title: 'Vertical Stacked Lockup',
      description: 'Icon mark centered above brand name and tagline for signage and badges.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Logo Variations Generator</h2>
              <p className="text-xs text-slate-400">
                Generate production variations without overwriting your original master file
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

        {/* Grid of Variations */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VARIATIONS.map((v) => {
              const variantElements = createLogoVariation(elements, v.type, canvasSize);

              return (
                <div
                  key={v.type}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-white">{v.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">{v.description}</p>
                  </div>

                  {/* Thumbnail Preview representation */}
                  <div
                    className={`w-full h-32 rounded-lg border border-slate-800/80 flex items-center justify-center overflow-hidden relative ${
                      v.bgDark ? 'bg-slate-950' : 'bg-slate-900/70'
                    }`}
                  >
                    <div className="text-center p-2">
                      <span className="text-xs font-mono text-slate-400">
                        {variantElements.length} elements configured
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onApplyVariation(variantElements);
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    >
                      <span>Load to Canvas</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onExportVariantPng(variantElements, v.title)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Export PNG</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
