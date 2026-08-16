import React, { useState } from 'react';
import { ToolDefinition } from '../../types';
import { getToolContent } from '../../data/toolDescriptions';
import { Breadcrumbs } from './Breadcrumbs';
import { Footer } from '../common/Footer';
import { storageEngine } from '../../core/storage-engine/StorageEngine';
import { toolRegistry } from '../../core/tool-registry/ToolRegistry';
import { LegalPageId } from '../common/LegalPages';
import {
  Star,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Zap,
} from 'lucide-react';

interface ToolPageTemplateProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  onNavigateHome: () => void;
  onNavigateCategory: (category: string) => void;
  onSelectTool: (toolId: string) => void;
  onOpenLegalPage?: (pageId: LegalPageId) => void;
}

export const ToolPageTemplate: React.FC<ToolPageTemplateProps> = ({
  tool,
  children,
  onNavigateHome,
  onNavigateCategory,
  onSelectTool,
  onOpenLegalPage,
}) => {
  const [isFav, setIsFav] = useState(() => storageEngine.isFavorite(tool.id));
  const [openFaqIndices, setOpenFaqIndices] = useState<number[]>([0]);

  const content = getToolContent(tool.id, tool.category, tool.name);

  const toggleFav = () => {
    const next = storageEngine.toggleFavorite(tool.id);
    setIsFav(next);
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Resolve related tools
  const relatedTools: ToolDefinition[] = [];
  if (content.relatedToolIds) {
    content.relatedToolIds.forEach((id) => {
      if (id !== tool.id) {
        const t = toolRegistry.get(id);
        if (t) relatedTools.push(t);
      }
    });
  }
  // Fill up from same category if needed
  if (relatedTools.length < 4) {
    const sameCat = toolRegistry.getByCategory(tool.category).filter((t) => t.id !== tool.id);
    for (const t of sameCat) {
      if (!relatedTools.some((r) => r.id === t.id)) {
        relatedTools.push(t);
        if (relatedTools.length >= 6) break;
      }
    }
  }

  const categoryLabel = tool.category.toUpperCase() + ' TOOLS';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white">
      {/* Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {/* Breadcrumbs */}
        <Breadcrumbs
          category={tool.category}
          categoryLabel={categoryLabel}
          toolName={tool.name}
          onNavigateHome={onNavigateHome}
          onNavigateCategory={onNavigateCategory}
        />

        {/* Tool Header Section */}
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-red-950/70 border border-red-800 text-red-300">
                  {tool.category}
                </span>
                {tool.capabilities.clientSide && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/70 border border-emerald-800 text-emerald-300 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> 100% Client-Side Privacy
                  </span>
                )}
                {tool.capabilities.aiPowered && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-950/70 border border-purple-800 text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" /> AI Accelerated
                  </span>
                )}
                <span className="text-slate-500 text-xs font-mono">v{tool.version}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{tool.name}</h1>
            </div>

            {/* Favorite & Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={toggleFav}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFav
                    ? 'bg-amber-950/50 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={isFav ? 'Remove from favorites' : 'Save to favorites'}
              >
                <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>{isFav ? 'Favorited' : 'Favorite'}</span>
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
            {content.shortDescription}
          </p>
        </div>

        {/* PRIMARY INTERACTIVE WORKSPACE (Custom Workspace or Universal Execution Workspace) */}
        <div className="mb-12">
          {children}
        </div>

        {/* EDUCATIONAL & HOW-TO CONTENT SECTION */}
        <div className="space-y-12">
          {/* How to Use Section */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              How to Use {tool.name} (Step-by-Step)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {content.howTo.map((step) => (
                <div
                  key={step.step}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative flex flex-col justify-between"
                >
                  <div>
                    <div className="w-7 h-7 rounded-full bg-red-950 border border-red-600 text-red-400 font-bold text-xs flex items-center justify-center mb-3">
                      {step.step}
                    </div>
                    <h3 className="font-semibold text-sm text-slate-200 mb-1">{step.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid & Supported Inputs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Features (2 cols) */}
            <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Key Features & Capabilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {content.features.map((feat, fIdx) => (
                  <div key={fIdx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80">
                    <h4 className="font-semibold text-sm text-slate-200 mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                      {feat.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Specifications Box (1 col) */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-red-400" /> Format Specifications
                </h2>
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">Supported Inputs</h4>
                    <ul className="space-y-1">
                      {content.supportedInputs.map((inp, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{inp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-slate-800">
                    <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-1.5">Output Format</h4>
                    <p className="text-slate-300 leading-relaxed">{content.outputSpecs}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero server upload • Processed locally in browser</span>
              </div>
            </section>
          </div>

          {/* In-depth Detailed Explanation */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-4">Detailed Technical Overview</h2>
            <div className="text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
              {content.detailedDescription}
            </div>
          </section>

          {/* Pro Tips & Common Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Pro Tips & Best Practices
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {content.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-sm text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> Common Issues & Solutions
              </h3>
              <div className="space-y-3 text-xs">
                {content.commonIssues.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="font-semibold text-slate-200">{item.issue}</p>
                    <p className="text-slate-400 leading-relaxed pl-2 border-l border-red-500/50">
                      {item.solution}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Frequently Asked Questions (FAQ) */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" /> Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {content.faq.map((item, idx) => {
                const isOpen = openFaqIndices.includes(idx);
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 rounded-xl overflow-hidden transition-colors bg-slate-950/60"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-4 py-3 text-left font-medium text-sm text-slate-200 hover:text-white flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <span>{item.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/80">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Clickable Related Tools */}
          {relatedTools.length > 0 && (
            <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Related {categoryLabel}</h2>
                <button
                  type="button"
                  onClick={() => onNavigateCategory(tool.category)}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                >
                  View all in category →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {relatedTools.map((rt) => (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => onSelectTool(rt.id)}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/60 hover:bg-slate-900 transition-all text-left group cursor-pointer flex flex-col justify-between h-32"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                          {rt.category}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <h4 className="font-semibold text-sm text-slate-200 group-hover:text-white line-clamp-1">
                        {rt.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-tight">
                      {rt.description}
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Universal Footer */}
      <Footer
        onNavigateCategory={onNavigateCategory}
        onOpenTool={onSelectTool}
        onOpenAllTools={onNavigateHome}
        onOpenLegalPage={onOpenLegalPage}
      />
    </div>
  );
};
