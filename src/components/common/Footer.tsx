import React from 'react';
import { EditMeeLogo } from './EditMeeLogo';
import {
  Shield,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Database,
  Lock,
  Mail,
} from 'lucide-react';
import { LegalPageId } from './LegalPages';
import { getToolCanonicalPath } from '../../core/routing/toolUrls';

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
    <footer className="mt-12 sm:mt-16 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 sm:gap-8 mb-8 sm:mb-12">
        {/* Brand & Mission Column */}
        <div className="sm:col-span-2 space-y-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onOpenAllTools?.();
            }}
            className="flex items-center gap-2.5 inline-block"
          >
            <EditMeeLogo height={38} variant="mascot" />
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              <span>edit</span><span className="text-red-600 dark:text-red-500">mee</span>
            </span>
          </a>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
            The privacy-first universal digital workspace. Edit PDFs, manipulate images, format documents, architect ATS resumes, wrangle CSV data, and automate pipelines directly in your browser with zero server data leakage.
          </p>
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" /> 100% Client-Side Privacy
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" /> WebAssembly Engine
            </span>
          </div>
        </div>

        {/* Column 1: PDF & Documents */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-red-600 dark:text-red-500" /> PDF & Documents
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href={getToolCanonicalPath('edit-pdf')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('edit-pdf');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                PDF Editor Studio
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('pdf-protect')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('pdf-protect');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Protect & Encrypt PDF
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('pdf-compressor')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('pdf-compressor');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Compress PDF
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('pdf-merger')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('pdf-merger');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Merge PDF Documents
              </a>
            </li>
            <li>
              <a
                href="/category/pdf/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateCategory?.('pdf');
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1 block"
              >
                All 50+ PDF Tools →
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Image & Media */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-red-600 dark:text-red-500" /> Image & Media
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href={getToolCanonicalPath('image-studio')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('image-studio');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Image Studio Pro
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('bg-remover')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('bg-remover');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                AI Background Remover
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('image-converter')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('image-converter');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Universal Image Converter
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('image-compressor')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('image-compressor');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Lossless Image Compressor
              </a>
            </li>
            <li>
              <a
                href="/category/images/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateCategory?.('images');
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1 block"
              >
                All 50+ Image Tools →
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Data & Developer */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-red-600 dark:text-red-500" /> Data & Code
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href={getToolCanonicalPath('csv-studio')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('csv-studio');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                CSV Studio & Grid
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('resume-builder')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('resume-builder');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Resume Architect ATS
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('dev-studio')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('dev-studio');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Developer Studio
              </a>
            </li>
            <li>
              <a
                href={getToolCanonicalPath('calculator-studio')}
                onClick={(e) => {
                  e.preventDefault();
                  onOpenTool?.('calculator-studio');
                }}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Calculator Studio
              </a>
            </li>
            <li>
              <a
                href="/category/data/"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigateCategory?.('data');
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors cursor-pointer text-left flex items-center gap-1 block"
              >
                All Data Tools →
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Trust & Legal */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-red-600 dark:text-red-500" /> Trust & Legal
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <a
                href="/privacy-policy/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage?.('privacy-policy');
                }}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms-and-conditions/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage?.('terms-and-conditions');
                }}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Terms & Conditions
              </a>
            </li>
            <li>
              <a
                href="/security-architecture/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage?.('security-architecture');
                }}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Security Architecture
              </a>
            </li>
            <li>
              <a
                href="/about-us/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage?.('about-us');
                }}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/contact-us/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage?.('contact-us');
                }}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold transition-colors cursor-pointer text-left flex items-center gap-1 block"
              >
                <Mail className="w-3 h-3" /> Contact Us
              </a>
            </li>
            <li>
              <a
                href="/disclaimer/"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalPage?.('disclaimer');
                }}
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-left block"
              >
                Disclaimer
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Metadata Bar */}
      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} EditMee. All rights reserved. Zero cloud uploads.</p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onOpenAllTools?.();
            }}
            className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            All Tools
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="/contact-us/"
            onClick={(e) => {
              e.preventDefault();
              onOpenLegalPage?.('contact-us');
            }}
            className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            support@editmee.com
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>100% In-Browser</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span>Production Release v3.5.0</span>
        </div>
      </div>
    </footer>
  );
};
