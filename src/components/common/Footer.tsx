import React from 'react';
import { EditMeeLogo } from './EditMeeLogo';
import {
  Shield,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Database,
  Code,
  Lock,
  Mail,
  Heart,
  ChevronRight,
  Cpu,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { LegalPageId } from './LegalPages';

interface FooterProps {
  onNavigateCategory?: (category: string) => void;
  onOpenTool?: (toolId: string) => void;
  onOpenAllTools?: () => void;
  onOpenLegalPage?: (pageId: LegalPageId) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateCategory,
  onOpenTool,
  onOpenAllTools,
  onOpenLegalPage,
}) => {
  return (
    <footer className="mt-16 bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
        {/* Brand & Mission Column */}
        <div className="sm:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <EditMeeLogo height={38} variant="mascot" />
            <span className="text-2xl font-black text-white tracking-tight">
              <span>edit</span><span className="text-red-500">mee</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            The privacy-first universal digital workspace. Edit PDFs, manipulate images, format documents, architect ATS resumes, wrangle CSV data, and automate pipelines directly in your browser with zero server data leakage.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> 100% Client-Side Privacy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> WebAssembly Engine
            </span>
          </div>
        </div>

        {/* Column 1: PDF & Documents */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-red-500" /> PDF & Documents
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('edit-pdf')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                PDF Editor Studio
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('pdf-protect')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Protect & Encrypt PDF
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('pdf-compressor')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Compress PDF
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('pdf-merger')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Merge PDF Documents
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('pdf-splitter')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Split & Extract PDF
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateCategory?.('pdf')}
                className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 text-[11px] pt-1 cursor-pointer"
              >
                All PDF Tools →
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Images & Graphics */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" /> Images & Graphics
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('image-studio')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Image Studio Pro
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('resume-builder')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                ATS Resume Architect
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('csv-studio')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                CSV & Data Studio
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('invoice-generator')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                Invoice Generator
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateCategory?.('images')}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px] pt-1 cursor-pointer"
              >
                All Graphics Tools →
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: AI Tools & Automation */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Tools
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('ai-assistant')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                EditMee AI Assistant
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('ai-doc-intel')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                AI Document Intel
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('ai-writing')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                AI Writing Assistant
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenTool?.('ai-code-explainer')}
                className="hover:text-white transition-colors cursor-pointer text-left"
              >
                AI Code Explainer
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateCategory?.('ai')}
                className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 text-[11px] pt-1 cursor-pointer"
              >
                All AI Tools →
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal & Company */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-blue-400" /> Legal & Company
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('privacy-policy')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('terms-and-conditions')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('security-architecture')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
              >
                Security Architecture
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('about-us')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('contact-us')}
                className="text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer text-left flex items-center gap-1"
              >
                <Mail className="w-3 h-3" /> Contact Us
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('disclaimer')}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer text-left"
              >
                Disclaimer
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Metadata Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} EditMee. All rights reserved. Zero cloud uploads.</p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={() => onOpenAllTools?.()}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            All 270+ Tools
          </button>
          <span className="text-slate-700">•</span>
          <button
            type="button"
            onClick={() => onOpenLegalPage?.('contact-us')}
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            support@editmee.com
          </button>
          <span className="text-slate-700">•</span>
          <span>100% In-Browser</span>
          <span className="text-slate-700">•</span>
          <span>Production Release v3.5.0</span>
        </div>
      </div>
    </footer>
  );
};
