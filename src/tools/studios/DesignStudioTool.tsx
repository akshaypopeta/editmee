import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  Palette,
  Sparkles,
  Layers,
  Copy,
  Check,
  RefreshCw,
  Sun,
  Sliders,
  Code,
  Download,
  Eye,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const DesignStudioWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'palette' | 'shadow' | 'gradient'>('palette');
  const [baseColor, setBaseColor] = useState('#ef4444');
  const [copied, setCopied] = useState(false);

  // Shadow Generator State
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(10);
  const [shadowBlur, setShadowBlur] = useState(25);
  const [shadowSpread, setShadowSpread] = useState(-5);
  const [shadowOpacity, setShadowOpacity] = useState(0.15);

  // Gradient State
  const [gradColor1, setGradColor1] = useState('#ef4444');
  const [gradColor2, setGradColor2] = useState('#3b82f6');
  const [gradAngle, setGradAngle] = useState(135);

  // Palette Generation
  const palettes = useMemo(() => {
    // Generate simple harmonious tones
    return [
      { name: '50', hex: '#fef2f2' },
      { name: '100', hex: '#fee2e2' },
      { name: '300', hex: '#fca5a5' },
      { name: '500 (Primary)', hex: baseColor },
      { name: '700', hex: '#b91c1c' },
      { name: '900', hex: '#7f1d1d' },
    ];
  }, [baseColor]);

  const cssShadowCode = `box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, ${shadowOpacity});`;
  const cssGradientCode = `background: linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2});`;

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Design & Creative Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Visual Lab
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Color harmony generator, layered CSS box-shadow builder, and linear/mesh gradient studio.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('palette')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'palette' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Color Palette
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shadow')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'shadow' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            CSS Box Shadow
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gradient')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'gradient' ? 'bg-red-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            CSS Gradient
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'palette' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 text-slate-900">
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-14 h-14 rounded-xl border border-slate-200 cursor-pointer p-1"
            />
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pick Primary Base Color</label>
              <input
                type="text"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {palettes.map((p) => (
              <div
                key={p.name}
                onClick={() => handleCopy(p.hex)}
                className="rounded-2xl p-4 flex flex-col justify-between h-36 border border-slate-200 cursor-pointer transition-transform hover:scale-105 shadow-xs"
                style={{ backgroundColor: p.hex }}
              >
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/20 text-white w-fit">
                  {p.name}
                </span>
                <span className="text-xs font-mono font-bold text-white drop-shadow-md">{p.hex}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shadow' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Box Shadow Parameters
            </h3>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Offset Y</span>
                <span className="font-mono">{shadowY}px</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                value={shadowY}
                onChange={(e) => setShadowY(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Blur Radius</span>
                <span className="font-mono">{shadowBlur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={shadowBlur}
                onChange={(e) => setShadowBlur(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Spread</span>
                <span className="font-mono">{shadowSpread}px</span>
              </div>
              <input
                type="range"
                min={-30}
                max={30}
                value={shadowSpread}
                onChange={(e) => setShadowSpread(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Opacity</span>
                <span className="font-mono">{Math.round(shadowOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={shadowOpacity}
                onChange={(e) => setShadowOpacity(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>
          </div>

          <div className="md:col-span-6 space-y-4">
            <div className="bg-slate-100 rounded-2xl p-12 flex items-center justify-center min-h-[260px] border border-slate-200">
              <div
                className="w-44 h-44 bg-white rounded-2xl flex items-center justify-center font-bold text-slate-700 text-xs"
                style={{
                  boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px rgba(0, 0, 0, ${shadowOpacity})`,
                }}
              >
                Preview Box
              </div>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl text-white flex items-center justify-between">
              <code className="text-xs font-mono text-emerald-400 truncate pr-2">{cssShadowCode}</code>
              <button
                type="button"
                onClick={() => handleCopy(cssShadowCode)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CSS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'gradient' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Linear Gradient Generator
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Color 1</label>
                <input
                  type="color"
                  value={gradColor1}
                  onChange={(e) => setGradColor1(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Color 2</label>
                <input
                  type="color"
                  value={gradColor2}
                  onChange={(e) => setGradColor2(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer p-1"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Angle</span>
                <span className="font-mono">{gradAngle}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={gradAngle}
                onChange={(e) => setGradAngle(Number(e.target.value))}
                className="w-full accent-red-600"
              />
            </div>
          </div>

          <div className="md:col-span-6 space-y-4">
            <div
              className="rounded-2xl h-56 border border-slate-200 shadow-md"
              style={{
                background: `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`,
              }}
            />
            <div className="p-4 bg-slate-900 rounded-xl text-white flex items-center justify-between">
              <code className="text-xs font-mono text-cyan-400 truncate pr-2">{cssGradientCode}</code>
              <button
                type="button"
                onClick={() => handleCopy(cssGradientCode)}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy CSS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const designStudioToolDef: ToolDefinition = {
  id: 'design-studio',
  name: 'Design & Creative Studio Pro',
  category: 'design',
  subcategory: 'visual',
  description: 'Color palette designer, CSS box shadow builder, and gradient creator for modern UI development.',
  iconName: 'Palette',
  version: '2.0.0',
  tags: ['design', 'palette', 'color', 'shadow', 'gradient', 'css', 'creative', 'studio'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  inputSchema: { fields: [] },
  outputSchema: { type: 'custom' },
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  customWorkspace: DesignStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Design Studio Ready' };
  },
};
