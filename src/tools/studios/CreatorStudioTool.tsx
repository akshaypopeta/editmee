import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  Share2,
  Twitter,
  Instagram,
  Linkedin,
  Copy,
  Check,
  Sparkles,
  Hash,
  Smile,
  Smartphone,
  Eye,
  Sliders,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const CreatorStudioWorkspace: React.FC = () => {
  const [postText, setPostText] = useState(
    '🚀 Super excited to announce our major client-first suite upgrade! Real-time PDF editing, vector logo design, video timeline trimming, and zero-latency conversion directly in your browser.'
  );
  const [copied, setCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'x' | 'linkedin' | 'instagram' | 'threads'>('x');

  const charCount = postText.length;

  const platforms = [
    { id: 'x', name: 'X / Twitter', max: 280, icon: Twitter },
    { id: 'linkedin', name: 'LinkedIn', max: 3000, icon: Linkedin },
    { id: 'instagram', name: 'Instagram', max: 2200, icon: Instagram },
    { id: 'threads', name: 'Threads', max: 500, icon: Share2 },
  ];

  const currentPlatform = platforms.find((p) => p.id === selectedPlatform) || platforms[0];
  const isOverLimit = charCount > currentPlatform.max;

  const handleCopy = () => {
    navigator.clipboard.writeText(postText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addHashtag = (tag: string) => {
    setPostText((prev) => `${prev} #${tag}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Social Media & Creator Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                Multi-Post
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Cross-platform character counter, previewer, hashtag organizer, and social caption builder.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/20 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Post' : 'Copy Post'}</span>
        </button>
      </div>

      {/* Platform Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPlatform === p.id;
          const isOver = charCount > p.max;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlatform(p.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-red-400' : 'text-slate-500'}`} />
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isOver
                      ? 'bg-red-500/20 text-red-400'
                      : isSelected
                      ? 'bg-slate-800 text-slate-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {charCount}/{p.max}
                </span>
              </div>
              <p className="text-xs font-black">{p.name}</p>
            </button>
          );
        })}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Composer (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-slate-900">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                Post Composer ({currentPlatform.name})
              </span>
              <span
                className={`text-xs font-mono font-bold ${
                  isOverLimit ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {currentPlatform.max - charCount} chars remaining
              </span>
            </div>

            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={8}
              placeholder="Draft your social post..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-sans text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 leading-relaxed"
            />

            {/* Quick Hashtags */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Quick Hashtags</span>
              <div className="flex flex-wrap gap-1.5">
                {['productivity', 'tech', 'buildinpublic', 'developer', 'design', 'ai', 'privacy'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addHashtag(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Phone Mockup (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 text-white max-w-sm mx-auto">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
              <span className="font-bold">{currentPlatform.name} Feed Preview</span>
              <Smartphone className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs text-white">
                  EM
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">EditMee Official</h4>
                  <p className="text-[10px] text-slate-400 font-mono">@editmee_app</p>
                </div>
              </div>

              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {postText || 'Your drafted post will appear here in real time...'}
              </p>

              <div className="pt-3 border-t border-slate-800 flex justify-between text-slate-400 text-xs px-2">
                <span>💬 12</span>
                <span>🔁 28</span>
                <span>❤️ 154</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const creatorStudioToolDef: ToolDefinition = {
  id: 'creator-studio',
  name: 'Social Media & Creator Studio Pro',
  category: 'creator',
  subcategory: 'social',
  description: 'Cross-platform post composer, character limit validator, hashtag generator, and live mobile previewer.',
  iconName: 'Share2',
  version: '2.0.0',
  tags: ['creator', 'social', 'twitter', 'linkedin', 'instagram', 'hashtags', 'studio'],
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
  customWorkspace: CreatorStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Creator Studio Ready' };
  },
};
