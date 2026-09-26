import React, { useState } from 'react';
import { X, Laptop, Smartphone, Image as ImageIcon, Download, Check } from 'lucide-react';
import { DesignElement, CanvasSettings } from './types';
import { renderCanvas } from './canvasEngine';
import { triggerBlobDownload } from './exportEngine';

interface MockupModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: DesignElement[];
  settings: CanvasSettings;
}

export const MockupModal: React.FC<MockupModalProps> = ({
  isOpen,
  onClose,
  elements,
  settings,
}) => {
  const [activeMockup, setActiveMockup] = useState<'phone' | 'laptop' | 'poster'>('phone');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  // Render a mini preview of current canvas to a data URL
  const getCanvasPreviewDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = settings.width;
    canvas.height = settings.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      renderCanvas(ctx, elements, settings, { interactive: false, hideHelpers: true });
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const previewDataUrl = getCanvasPreviewDataUrl();

  const handleDownloadMockup = () => {
    setIsExporting(true);
    const mockupCanvas = document.createElement('canvas');
    mockupCanvas.width = 1600;
    mockupCanvas.height = 1200;
    const ctx = mockupCanvas.getContext('2d');
    if (!ctx) return;

    // Background studio gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1600, 1200);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1600, 1200);

    const designImg = new Image();
    designImg.onload = () => {
      if (activeMockup === 'phone') {
        // Draw phone frame
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.roundRect(550, 150, 500, 900, 48);
        ctx.fill();
        ctx.stroke();

        // Screen area
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(570, 180, 460, 840, 36);
        ctx.clip();
        ctx.drawImage(designImg, 570, 180, 460, 840);
        ctx.restore();
      } else if (activeMockup === 'laptop') {
        // Laptop screen
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.roundRect(250, 200, 1100, 680, 24);
        ctx.fill();
        ctx.stroke();

        // Screen area
        ctx.drawImage(designImg, 270, 220, 1060, 640);

        // Laptop base
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.roundRect(150, 890, 1300, 40, 16);
        ctx.fill();
      } else {
        // Poster on wall
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 20;
        ctx.fillRect(400, 150, 800, 900);
        ctx.drawImage(designImg, 420, 170, 760, 860);
      }

      mockupCanvas.toBlob((blob) => {
        if (blob) {
          triggerBlobDownload(blob, `mockup-${activeMockup}.png`);
        }
        setIsExporting(false);
      });
    };
    designImg.src = previewDataUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white">Device & Real-World Mockup Studio</h2>
            <p className="text-xs text-slate-400">Preview your design rendered on physical products</p>
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
        <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
          {/* Mockup Canvas Stage */}
          <div className="flex-1 w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center p-6 relative overflow-hidden shadow-inner">
            {activeMockup === 'phone' && (
              <div className="w-48 h-80 sm:w-56 sm:h-88 rounded-[36px] bg-black border-4 border-slate-700 shadow-2xl p-2 relative overflow-hidden flex items-center justify-center">
                {/* Notch pill */}
                <div className="absolute top-3 w-16 h-3.5 bg-black rounded-full z-10" />
                <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-900">
                  <img
                    src={previewDataUrl}
                    alt="Phone Mockup Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {activeMockup === 'laptop' && (
              <div className="w-full max-w-md flex flex-col items-center">
                <div className="w-full h-52 sm:h-60 rounded-t-xl bg-black border-4 border-slate-700 p-2 overflow-hidden shadow-2xl">
                  <div className="w-full h-full rounded-lg overflow-hidden bg-slate-900">
                    <img
                      src={previewDataUrl}
                      alt="Laptop Mockup Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="w-[110%] h-3.5 bg-slate-600 rounded-b-lg shadow-lg" />
              </div>
            )}

            {activeMockup === 'poster' && (
              <div className="p-3 bg-white shadow-2xl rounded-sm border border-slate-300">
                <div className="w-44 h-64 sm:w-56 sm:h-80 overflow-hidden bg-slate-900">
                  <img
                    src={previewDataUrl}
                    alt="Wall Poster Mockup"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Controls Side */}
          <div className="w-full md:w-72 space-y-4">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Choose Product Environment
            </label>

            <div className="space-y-2">
              {[
                { id: 'phone', name: 'Smartphone Display', icon: Smartphone, desc: 'Flagship mobile screen' },
                { id: 'laptop', name: 'MacBook / Laptop', icon: Laptop, desc: 'High-res desktop presentation' },
                { id: 'poster', name: 'Gallery Wall Poster', icon: ImageIcon, desc: 'Framed gallery exhibit' },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = activeMockup === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveMockup(m.id as any)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-600/20 border-red-500 text-white'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-red-400' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs font-bold">{m.name}</div>
                      <div className="text-[11px] text-slate-500">{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleDownloadMockup}
              disabled={isExporting}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating...' : 'Export High-Res Mockup'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
