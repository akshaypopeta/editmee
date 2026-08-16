import React, { useState } from 'react';
import {
  Sparkles,
  PenTool,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sliders,
  FileText,
  Code,
  ArrowRight,
  BookOpen,
  Briefcase,
  Layers,
  Wand2,
} from 'lucide-react';
import { aiGateway } from '../../core/ai-gateway/AiGateway';
import { storageEngine } from '../../core/storage-engine/StorageEngine';

export function AiWritingWorkspace() {
  const [prompt, setPrompt] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings
  const [writingMode, setWritingMode] = useState<
    'generate' | 'rewrite' | 'summarize' | 'expand' | 'ats_resume' | 'invoice_cover' | 'code_sql'
  >('generate');

  const [tone, setTone] = useState<'executive' | 'formal' | 'concise' | 'technical' | 'persuasive'>('executive');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  const templates = [
    {
      id: 'executive_brief',
      name: 'Executive Project Briefing',
      prompt: 'Draft an executive briefing summarizing Q3 engineering velocity, key architectural milestones, and platform cost reductions.',
      mode: 'generate',
      tone: 'executive',
    },
    {
      id: 'ats_bullets',
      name: 'ATS Resume Experience Bullets',
      prompt: 'Generate 4 high-impact, metrics-driven ATS resume bullet points for a Lead Cloud Architect demonstrating 40% latency reduction and $120k cloud savings.',
      mode: 'ats_resume',
      tone: 'technical',
    },
    {
      id: 'invoice_memo',
      name: 'Formal Billing & SOW Letter',
      prompt: 'Compose a professional payment memo for milestone 2 delivery of the enterprise data warehouse migration project.',
      mode: 'invoice_cover',
      tone: 'formal',
    },
    {
      id: 'sql_generator',
      name: 'PostgreSQL Analytics Query',
      prompt: 'Write a high-performance SQL query with window functions to compute 30-day moving average revenue per customer cohort.',
      mode: 'code_sql',
      tone: 'technical',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() && !sourceText.trim()) return;
    setIsLoading(true);

    try {
      const sysInstruction = `You are EditMee AI Writing Master, an elite enterprise author and technical copywriter.
Tone: ${tone}.
Task Mode: ${writingMode}.
Rules:
- Generate clean, highly impactful, actionable copy without fluff or generic filler phrases.
- Use clear typography formatting with markdown headers, bold highlights, and clean bullet lists.
- If producing code or SQL, provide fully valid syntax with concise comments.`;

      let fullPrompt = prompt;
      if (sourceText.trim()) {
        fullPrompt = `${prompt ? `${prompt}\n\n` : ''}SOURCE TEXT TO PROCESS:\n"""\n${sourceText}\n"""`;
      }

      const result = await aiGateway.generate({
        prompt: fullPrompt,
        systemInstruction: sysInstruction,
      });

      setOutputContent(result);

      storageEngine.addHistory({
        toolId: 'ai-writing',
        toolName: 'AI Writing Studio',
        category: 'ai',
        status: 'completed',
        inputsSummary: `${writingMode.toUpperCase()} (${tone}): ${prompt.slice(0, 50)}...`,
        outputSummary: `Generated ${result.split(/\s+/).length} words`,
      });
    } catch (err: any) {
      setOutputContent(`Error generating content: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `editmee-draft-${Date.now()}.md`;
    a.click();
  };

  const wordCount = outputContent.trim() ? outputContent.trim().split(/\s+/).length : 0;
  const readTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">AI Writing & Content Studio</h2>
            <p className="text-xs text-slate-400">Generative copywriting, technical specifications & ATS tuning</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {outputContent && (
            <>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                Export Markdown
              </button>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || (!prompt.trim() && !sourceText.trim())}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            {isLoading ? 'Generating...' : 'Generate Copy'}
          </button>
        </div>
      </div>

      {/* Main Studio Body: 2 Columns */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        {/* Left Config & Input Column (5 cols) */}
        <div className="lg:col-span-5 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">High-Impact Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => {
                    setPrompt(tmpl.prompt);
                    setWritingMode(tmpl.mode as any);
                    setTone(tmpl.tone as any);
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer space-y-1"
                >
                  <div className="text-xs font-bold text-slate-200 truncate">{tmpl.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">{tmpl.tone} tone</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode & Tone Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Operation Mode</label>
              <select
                value={writingMode}
                onChange={(e) => setWritingMode(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="generate">✨ Generate Fresh</option>
                <option value="rewrite">🔄 Professional Rewrite</option>
                <option value="summarize">📑 Executive Summary</option>
                <option value="expand">📈 Expand & Elaboration</option>
                <option value="ats_resume">🎯 ATS Resume Tuning</option>
                <option value="invoice_cover">🧾 Billing Memo / SOW</option>
                <option value="code_sql">💻 Code & SQL Spec</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Aesthetic Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="executive">👔 Executive & Leadership</option>
                <option value="formal">🏛️ Formal Business</option>
                <option value="concise">⚡ Ultra-Concise</option>
                <option value="technical">🛠️ Technical Rigor</option>
                <option value="persuasive">🎯 High-Conversion Persuasive</option>
              </select>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Instruction / Objective</label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Write a comprehensive summary of project deliverables and acceptance criteria..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Source Text (Optional for rewrite/summarize) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Source Text / Draft (Optional)</label>
              {sourceText && (
                <button
                  onClick={() => setSourceText('')}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              rows={5}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste existing document, email, notes, or raw draft to rewrite, summarize, or expand..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Right Output Column (7 cols) */}
        <div className="lg:col-span-7 flex flex-col min-h-0 bg-slate-950/20">
          {/* Output Toolbar */}
          <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Generated Output</span>
              {wordCount > 0 && (
                <span className="text-[11px] text-slate-500 font-mono">
                  {wordCount} words • ~{readTime} min read
                </span>
              )}
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setViewMode('editor')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'editor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw / Edit
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Formatted
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-5 overflow-y-auto">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-xs font-medium">Authoring refined enterprise copy with EditMee AI...</p>
              </div>
            ) : !outputContent ? (
              <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-500 text-center p-6">
                <PenTool className="w-8 h-8 opacity-30" />
                <p className="text-xs max-w-sm">
                  Select a preset or enter instructions on the left to generate polished documents, resumes, and code specs.
                </p>
              </div>
            ) : viewMode === 'editor' ? (
              <textarea
                value={outputContent}
                onChange={(e) => setOutputContent(e.target.value)}
                className="w-full h-full bg-transparent text-sm text-slate-200 font-sans leading-relaxed border-none focus:outline-none resize-none"
              />
            ) : (
              <div className="prose prose-invert prose-sm max-w-none space-y-4 text-slate-200 leading-relaxed">
                <div className="whitespace-pre-wrap">{outputContent}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
