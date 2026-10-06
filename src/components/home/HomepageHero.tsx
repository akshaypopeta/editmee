import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Layers,
  ArrowDown,
  FileText,
  Image as ImageIcon,
  FileCheck,
  Database,
  Code,
} from 'lucide-react';
import { getToolCanonicalPath } from '../../core/routing/toolUrls';

interface HomepageHeroProps {
  onSelectTool: (toolId: string) => void;
  onNavigateCategory: (category: string) => void;
  totalToolsCount?: number;
}

export const HomepageHero: React.FC<HomepageHeroProps> = ({
  onSelectTool,
  onNavigateCategory,
  totalToolsCount = 200,
}) => {
  return (
    <section
      aria-label="EditMee Platform Introduction"
      className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xl overflow-hidden text-left"
    >
      {/* Background ambient lighting accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
      />

      <div className="relative z-10 max-w-4xl space-y-5">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Universal Digital Workplace Suite &bull; Free In-Browser Tools</span>
        </div>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          Everyday Online Tools for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
            Documents, Images, Data & Code
          </span>
        </h1>

        {/* Introduction / Purpose */}
        <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed font-normal">
          <strong className="text-white font-semibold">EditMee</strong> is an extensive collection of online utilities engineered to solve daily digital tasks directly inside your web browser. Whether you need to edit and sign PDFs, convert and compress images, architect ATS-ready resumes, clean CSV datasets, format JSON payloads, or calculate mortgage amortizations, EditMee provides instant, private utility without software downloads, subscriptions, or forced account creation.
        </p>

        {/* Core Value Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">Client-First Privacy</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-medium">Zero Installation</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-medium">{totalToolsCount}+ Digital Tools</span>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
            <span className="font-medium">Cross-Device Ready</span>
          </div>
        </div>

        {/* Quick jump anchor note */}
        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            Popular Suites:
          </span>
          <a
            href={getToolCanonicalPath('edit-pdf')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTool('edit-pdf');
            }}
            className="hover:text-red-400 transition-colors inline-flex items-center gap-1 font-medium hover:underline"
          >
            <FileText className="w-3 h-3 text-red-500" />
            PDF Editor
          </a>
          <span className="text-slate-700">&bull;</span>
          <a
            href={getToolCanonicalPath('image-studio')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTool('image-studio');
            }}
            className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 font-medium hover:underline"
          >
            <ImageIcon className="w-3 h-3 text-emerald-500" />
            Image Studio
          </a>
          <span className="text-slate-700">&bull;</span>
          <a
            href={getToolCanonicalPath('resume-builder')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTool('resume-builder');
            }}
            className="hover:text-amber-400 transition-colors inline-flex items-center gap-1 font-medium hover:underline"
          >
            <FileCheck className="w-3 h-3 text-amber-500" />
            Resume Architect
          </a>
          <span className="text-slate-700">&bull;</span>
          <a
            href={getToolCanonicalPath('csv-studio')}
            onClick={(e) => {
              e.preventDefault();
              onSelectTool('csv-studio');
            }}
            className="hover:text-purple-400 transition-colors inline-flex items-center gap-1 font-medium hover:underline"
          >
            <Database className="w-3 h-3 text-purple-500" />
            CSV Analytics
          </a>
          <span className="text-slate-700">&bull;</span>
          <a
            href="/category/developer/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateCategory('developer');
            }}
            className="hover:text-blue-400 transition-colors inline-flex items-center gap-1 font-medium hover:underline"
          >
            <Code className="w-3 h-3 text-blue-500" />
            Developer Tools
          </a>
        </div>
      </div>
    </section>
  );
};
