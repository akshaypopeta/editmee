import React, { useState, useMemo } from 'react';
import { ToolDefinition } from '../../types';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  Check,
  RotateCcw,
  Sliders,
  Type,
  AlignLeft,
  ArrowRightLeft,
  Clock,
  BookOpen,
  SplitSquareVertical,
  Trash2,
} from 'lucide-react';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export const TextStudioWorkspace: React.FC = () => {
  const initialText = `EditMee is a universal, client-first digital productivity workspace designed for speed, privacy, and high-performance engineering.\n\nEverything operates locally in your browser with zero latency and robust client-side algorithms. You can format text, analyze syllable counts, inspect reading speeds, and manipulate casing in real time.`;

  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'find-replace'>('editor');

  // Compute text statistics
  const stats = useMemo(() => {
    const charsWithSpaces = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+/g) || []).length : 0;
    const paragraphs = text.trim() ? text.split(/\n+/).filter((p) => p.trim()).length : 0;
    const readingTime = (words / 200).toFixed(1);
    const speakingTime = (words / 130).toFixed(1);

    return {
      charsWithSpaces,
      charsNoSpaces,
      words,
      sentences: Math.max(sentences, paragraphs > 0 ? 1 : 0),
      paragraphs,
      readingTime: `${readingTime} min`,
      speakingTime: `${speakingTime} min`,
    };
  }, [text]);

  // Casing transformations
  const transformCase = (type: string) => {
    switch (type) {
      case 'upper':
        setText(text.toUpperCase());
        break;
      case 'lower':
        setText(text.toLowerCase());
        break;
      case 'title':
        setText(
          text.replace(
            /\w\S*/g,
            (w) => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()
          )
        );
        break;
      case 'sentence':
        setText(
          text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        );
        break;
      case 'camel':
        setText(
          text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        );
        break;
      case 'snake':
        setText(
          text
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_]/g, '')
        );
        break;
      case 'kebab':
        setText(
          text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-zA-Z0-9-]/g, '')
        );
        break;
      case 'clean':
        setText(
          text
            .split('\n')
            .map((line) => line.trim().replace(/\s+/g, ' '))
            .filter(Boolean)
            .join('\n')
        );
        break;
      default:
        break;
    }
  };

  const handleFindReplace = () => {
    if (!findWord) return;
    const regex = new RegExp(findWord, 'gi');
    setText(text.replace(regex, replaceWord));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document-export.txt';
    link.click();
    URL.revokeObjectURL(url);

    storageEngine.addHistoryItem({
      toolId: 'text-studio',
      toolName: 'Text & Writing Studio',
      category: 'text',
      status: 'completed',
      outputSummary: `Exported text document (${stats.words} words)`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-white shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 border border-red-500/40 rounded-xl text-red-400">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
              Text & Writing Studio Pro
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">
                NLP Suite
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Live word counters, casing transformers, find & replace, reading metrics, and plain-text export.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-red-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export TXT</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Words</span>
          <span className="text-xl font-black text-slate-900 font-mono">{stats.words}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Characters</span>
          <span className="text-xl font-black text-slate-900 font-mono">{stats.charsWithSpaces}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">No Spaces</span>
          <span className="text-xl font-black text-slate-900 font-mono">{stats.charsNoSpaces}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Sentences</span>
          <span className="text-xl font-black text-slate-900 font-mono">{stats.sentences}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Paragraphs</span>
          <span className="text-xl font-black text-slate-900 font-mono">{stats.paragraphs}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Reading Time</span>
          <span className="text-xl font-black text-red-600 font-mono">{stats.readingTime}</span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Editor (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'editor' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'preview' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Markdown Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('find-replace')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    activeTab === 'find-replace' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Find & Replace
                </button>
              </div>

              <button
                type="button"
                onClick={() => setText('')}
                className="text-xs text-slate-400 hover:text-red-600 font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            {activeTab === 'editor' && (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here..."
                rows={14}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 leading-relaxed"
              />
            )}

            {activeTab === 'preview' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[340px] text-sm text-slate-900 whitespace-pre-wrap font-sans leading-relaxed">
                {text}
              </div>
            )}

            {activeTab === 'find-replace' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Find</label>
                    <input
                      type="text"
                      value={findWord}
                      onChange={(e) => setFindWord(e.target.value)}
                      placeholder="e.g. workspace"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Replace With</label>
                    <input
                      type="text"
                      value={replaceWord}
                      onChange={(e) => setReplaceWord(e.target.value)}
                      placeholder="e.g. platform"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFindReplace}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Replace All Occurrences
                </button>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Casing Tools (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-900">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Transform & Casing
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => transformCase('upper')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                UPPERCASE
              </button>
              <button
                type="button"
                onClick={() => transformCase('lower')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                lowercase
              </button>
              <button
                type="button"
                onClick={() => transformCase('title')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Title Case
              </button>
              <button
                type="button"
                onClick={() => transformCase('sentence')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Sentence case
              </button>
              <button
                type="button"
                onClick={() => transformCase('camel')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                camelCase
              </button>
              <button
                type="button"
                onClick={() => transformCase('snake')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                snake_case
              </button>
              <button
                type="button"
                onClick={() => transformCase('kebab')}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                kebab-case
              </button>
              <button
                type="button"
                onClick={() => transformCase('clean')}
                className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clean Spaces
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const textStudioToolDef: ToolDefinition = {
  id: 'text-studio',
  name: 'Text & Writing Studio Pro',
  category: 'text',
  subcategory: 'nlp',
  description: 'Full-featured text & writing workspace with live word counters, case transformers, find & replace, and reading metrics.',
  iconName: 'Type',
  version: '2.0.0',
  tags: ['text', 'writing', 'word-counter', 'case-converter', 'markdown', 'nlp', 'diff', 'studio'],
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
  customWorkspace: TextStudioWorkspace,
  execute: async () => {
    return { success: true, text: 'Text Studio Ready' };
  },
};
