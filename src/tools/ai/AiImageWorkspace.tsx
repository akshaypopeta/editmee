import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  Wand2,
  Maximize2,
  Layers,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { aiGateway } from '../../core/ai-gateway/AiGateway';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

interface AiImageWorkspaceProps {
  onOpenImageStudio?: (imageSrc: string) => void;
}

export function AiImageWorkspace({ onOpenImageStudio }: AiImageWorkspaceProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [stylePreset, setStylePreset] = useState<string>('vector');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationNotes, setGenerationNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stylePresets = [
    { id: 'vector', name: 'Flat Vector Icon', promptSuffix: 'clean modern vector art, flat minimal design, crisp lines, solid background' },
    { id: 'realistic', name: 'Studio Photorealistic', promptSuffix: 'professional studio lighting, 8k resolution, photorealistic, sharp focus, octane render' },
    { id: 'isometric', name: '3D Isometric Render', promptSuffix: 'isometric 3D render, smooth matte materials, ambient occlusion, blender cycles' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', promptSuffix: 'vibrant neon colors, dark atmosphere, futuristic high-tech aesthetic, cinematic lighting' },
    { id: 'watercolor', name: 'Minimalist Watercolor', promptSuffix: 'soft watercolor texture, pastel tones, artistic ink splatter, delicate brushwork' },
  ];

  const quickSamples = [
    'Minimalist geometric logo of a lightning bolt in a hexagon for cloud software',
    '3D isometric illustration of a secure cloud server database with glowing data pipelines',
    'Modern executive dashboard interface concept with sleek graphs and dark mode aesthetics',
    'High-resolution studio photograph of a titanium wristwatch on black obsidian stone',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setGenerationNotes(null);

    const preset = stylePresets.find((p) => p.id === stylePreset);
    const fullPrompt = preset ? `${prompt}, ${preset.promptSuffix}` : prompt;

    try {
      const res = await aiGateway.generateImage(fullPrompt, aspectRatio, stylePreset);
      if (res.imageUrl) {
        setGeneratedImage(res.imageUrl);
        setGenerationNotes(res.text || 'Generated successfully with EditMee AI');

        storageEngine.addHistory({
          toolId: 'ai-image-generator',
          toolName: 'AI Image Generator',
          category: 'ai',
          status: 'completed',
          inputsSummary: `[${aspectRatio}] ${prompt.slice(0, 40)}...`,
          outputSummary: `Generated ${aspectRatio} graphic image`,
        });
      } else {
        setGenerationNotes('Image generation failed or returned no image data.');
      }
    } catch (err: any) {
      setGenerationNotes(`Generation error: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `editmee-ai-${Date.now()}.png`;
    a.click();
  };

  const handleCopy = () => {
    if (!generatedImage) return;
    navigator.clipboard.writeText(generatedImage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">AI Image & Vector Generator</h2>
            <p className="text-xs text-slate-400">Generative visuals, vector graphics & marketing assets</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {generatedImage && (
            <>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied URL' : 'Copy Data'}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {isGenerating ? 'Synthesizing...' : 'Generate Visual'}
          </button>
        </div>
      </div>

      {/* Main Studio Body: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Config & Prompt Column (5 cols) */}
        <div className="lg:col-span-5 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {/* Quick Idea Samples */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Creative Starters</span>
            <div className="space-y-1.5">
              {quickSamples.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(s)}
                  className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer line-clamp-1"
                >
                  ⚡ {s}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Image Description Prompt</label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate in detail (subject, lighting, composition, colors)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Style Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Style Aesthetic Preset</label>
            <div className="grid grid-cols-1 gap-1.5">
              {stylePresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setStylePreset(preset.id)}
                  className={`p-2.5 rounded-lg text-left transition-all border text-xs cursor-pointer ${
                    stylePreset === preset.id
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{preset.name}</span>
                    {stylePreset === preset.id && <span className="text-[10px] uppercase font-mono">Selected</span>}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.promptSuffix}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { id: '1:1', label: '1:1 (Square)' },
                { id: '16:9', label: '16:9 (Landscape)' },
                { id: '9:16', label: '9:16 (Story)' },
                { id: '4:3', label: '4:3 (Standard)' },
                { id: '3:4', label: '3:4 (Portrait)' },
              ].map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id as any)}
                  className={`p-2 rounded-lg text-center text-xs font-mono transition-all cursor-pointer border ${
                    aspectRatio === ar.id
                      ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {ar.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Preview Canvas Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-950/20">
          <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/60">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Generated Canvas & Visual Assets
            </span>
            <span className="text-[10px] font-mono text-slate-500">{aspectRatio} Ratio</span>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center overflow-y-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-xs font-medium">Generating visual canvas via EditMee AI Engine...</p>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4 max-w-lg w-full flex flex-col items-center">
                <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black max-h-[440px]">
                  <img
                    src={generatedImage}
                    alt="Generated output"
                    className="w-full h-auto object-contain max-h-[440px]"
                  />
                </div>

                {generationNotes && (
                  <p className="text-xs text-slate-400 text-center font-medium">{generationNotes}</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-2 text-slate-500 text-center p-6">
                <ImageIcon className="w-10 h-10 opacity-30" />
                <p className="text-xs max-w-sm">
                  Configure your visual description and style on the left, then click "Generate Visual" to synthesize graphics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
