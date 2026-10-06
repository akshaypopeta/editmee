import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Database,
  Code,
  Calculator,
  Shield,
  FileCheck,
  Workflow,
  Sparkles,
  Music,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Lock,
  Layers,
  Cpu,
  Globe,
  Compass,
  Users,
  Briefcase,
  GraduationCap,
  Laptop,
  Palette,
  HelpCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { getToolCanonicalPath } from '../../core/routing/toolUrls';

interface HomepageContentSectionProps {
  onSelectTool: (toolId: string) => void;
  onNavigateCategory: (category: string) => void;
  onNavigateWorkflows: () => void;
}

export const HomepageContentSection: React.FC<HomepageContentSectionProps> = ({
  onSelectTool,
  onNavigateCategory,
  onNavigateWorkflows,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const faqData = [
    {
      question: 'What is EditMee?',
      answer:
        'EditMee is a universal, in-browser digital work platform that provides an extensive collection of online tools for PDF editing, image processing, document formatting, resume creation, data analytics, developer tasks, and mathematical calculations. It is engineered to perform tasks directly in modern web browsers without requiring desktop software installation or account registration.',
    },
    {
      question: 'What can I do with EditMee?',
      answer:
        'With EditMee, you can edit and annotate PDFs, merge and split documents, crop and compress images, build ATS-optimized professional resumes, inspect and clean CSV data files, validate and format JSON, generate cryptographic hashes, calculate loan payments, and chain automated workflows—all within a unified, responsive interface.',
    },
    {
      question: 'Is EditMee available on mobile devices?',
      answer:
        'Yes. EditMee is fully responsive and optimized for mobile devices, tablets, and desktop computers. Its touch-friendly layout and client-first processing adapt to any screen size, allowing you to edit documents, convert images, and run calculations on smartphones without installing an app.',
    },
    {
      question: 'Can I use EditMee without installing software?',
      answer:
        'Yes. Every tool in EditMee runs directly inside your web browser. There are no native desktop apps, plugins, or extensions required. Simply open the website on any modern browser such as Chrome, Safari, Firefox, or Edge to begin working immediately.',
    },
    {
      question: 'What types of online tools are available on EditMee?',
      answer:
        'EditMee organizes tools across core categories: PDF & Document Studio, Image & Design Tools, Documents & Text Utilities, Resume & Career Suite, Data & CSV Analytics, Developer & Web Utilities, Calculators & Converters, Security & Cryptography, Audio & Media Tools, AI Intelligence Suite, and Automated Visual Pipelines.',
    },
    {
      question: 'Can I use EditMee for PDF work?',
      answer:
        'Yes. EditMee includes a comprehensive PDF suite that allows you to edit text, add digital signatures, highlight and annotate pages, merge multiple PDF documents into one, split pages, compress file sizes, redact sensitive information, extract text, and convert images to PDF format.',
    },
    {
      question: 'Can software developers and web designers use EditMee?',
      answer:
        'Yes. Developers and designers can access specialized utilities including JSON formatters, Base64 encoders/decoders, cURL converters, Regex testers, hash generators, Markdown previewers, color palette extractors, image compressors, and format converters.',
    },
    {
      question: 'How does EditMee process my files and data?',
      answer:
        "EditMee uses a client-first privacy architecture. Most standard document, image, and text tasks (such as PDF merging, image cropping, and CSV viewing) are executed directly in your browser's local memory using modern Web APIs. Files are not uploaded to or stored on remote file servers for these local tasks. Optional AI features securely transmit request prompts over encrypted HTTPS connections without permanent data retention.",
    },
    {
      question: 'Is EditMee free to use?',
      answer:
        'Yes. EditMee provides immediate, free access to its online tools with no subscription fees, hidden paywalls, or forced account creation for core digital utilities.',
    },
  ];

  return (
    <section
      aria-label="EditMee Platform Overview and Guide"
      className="mt-12 pt-10 border-t border-slate-800 space-y-16 text-slate-300 text-left"
    >
      {/* 1. What is EditMee? */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Universal Workplace Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
            What is EditMee?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            EditMee is an all-in-one, browser-powered digital workplace designed to simplify daily document, image, data, and developer workflows. Rather than juggling dozens of single-purpose websites or installing resource-heavy desktop applications, EditMee gathers essential creative, analytical, and office utilities into a cohesive, private, and high-performance environment.
          </p>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            From merging client contracts and resizing social graphics to designing executive resumes and analyzing data tables, EditMee provides instant utility with zero installation barriers. Every module is structured for speed, clean user experience, and dependable execution directly in modern web browsers.
          </p>
        </div>
      </div>

      {/* 2. What Can You Do With EditMee? (Major Existing Categories) */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-red-400" />
            <span>Platform Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            What Can You Do with EditMee?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Explore the core functional domains available within EditMee. Each category offers purpose-built tools crafted to resolve specific digital tasks efficiently and privately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* PDF Suite */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">PDF & Document Management</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Organize, edit, merge, split, compress, and annotate PDF documents. Add digital signatures, insert page numbers, redact confidential content, and convert files without server upload delays.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('edit-pdf')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('edit-pdf');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold hover:underline"
                >
                  PDF Editor &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('pdf-merger')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('pdf-merger');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold hover:underline"
                >
                  Merge PDF &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('pdf-compressor')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('pdf-compressor');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold hover:underline"
                >
                  Compress PDF &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/pdf/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('pdf');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse all PDF tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Image & Graphic Studio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Image Processing & Graphics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Resize, crop, compress, and convert images between WebP, PNG, JPEG, and SVG. Remove backgrounds, apply color enhancements, inspect EXIF metadata, and watermark photo assets locally.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('image-studio')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('image-studio');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                >
                  Image Studio &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('image-compressor')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('image-compressor');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                >
                  Compress &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('bg-remover')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('bg-remover');
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold hover:underline"
                >
                  BG Remover &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/images/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('images');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse all Image tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Resume & Career */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Resume & Career Architect</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Build ATS-friendly, professional resumes with clean typography, customizable sections, and high-quality PDF exports. Craft executive summaries and cover letters optimized for applicant tracking systems.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('resume-builder')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('resume-builder');
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold hover:underline"
                >
                  Resume Builder &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/resumes/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('resumes');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse Resume tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Data & CSV Studio */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Data, CSV & Spreadsheet Studio</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Inspect large CSV tables, clean malformed rows, convert tabular datasets to JSON or SQL, and calculate statistical summaries with responsive in-browser rendering.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('csv-studio')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('csv-studio');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline"
                >
                  CSV Studio &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('csv-to-json-converter')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('csv-to-json-converter');
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold hover:underline"
                >
                  CSV to JSON &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/data/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('data');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse Data tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Developer & Web Utilities */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-400 flex items-center justify-center">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Developer & Code Utilities</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Validate and format JSON payloads, encode and decode Base64 strings, convert cURL commands to JavaScript fetch, test Regular Expressions, and format SQL queries securely.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('json-formatter-validator')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('json-formatter-validator');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                >
                  JSON Formatter &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('base64-encoder-decoder')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('base64-encoder-decoder');
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline"
                >
                  Base64 &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/developer/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('developer');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse Developer tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Calculators & Converters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Calculators & Converters</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Perform mortgage loan amortization, compound interest forecasts, currency estimations, percentage computations, unit conversions, and datetime adjustments with live breakdowns.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('mortgage-loan-amortization-calculator')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('mortgage-loan-amortization-calculator');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                >
                  Mortgage Calculator &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('percentage-calculator')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('percentage-calculator');
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                >
                  Percentages &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/calculators/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('calculators');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse Calculators <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Security & Cryptography */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Security & Cryptography</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Compute SHA-256, SHA-512, and MD5 hashes, generate cryptographically random passwords, audit token entropy, and inspect cryptographic keys using browser crypto primitives.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('hash-generator')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('hash-generator');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline"
                >
                  Hash Generator &rarr;
                </a>
                <span className="text-slate-600">&bull;</span>
                <a
                  href={getToolCanonicalPath('password-generator')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('password-generator');
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold hover:underline"
                >
                  Password Generator &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/security/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('security');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse Security tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Audio & Media Tools */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 flex items-center justify-center">
                <Music className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Audio & Media Utilities</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Trim audio files, inspect audio waveform channels, adjust playback speed, extract sound clips, and format multimedia metadata right inside your browser.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href={getToolCanonicalPath('audio-cutter-trimmer')}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTool('audio-cutter-trimmer');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                >
                  Audio Cutter &rarr;
                </a>
              </div>
            </div>
            <a
              href="/category/media/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateCategory('media');
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Browse Media tools <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Visual Workflows */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-950/60 border border-orange-800/60 text-orange-400 flex items-center justify-center">
                <Workflow className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Automated Document Pipelines</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Chain multi-stage operations into single-click workflows. Merge multiple documents, watermark the result, and compress the final output in an uninterrupted local pipeline.
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <a
                  href="/workflows/"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateWorkflows();
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 font-semibold hover:underline"
                >
                  Launch Pipeline Studio &rarr;
                </a>
              </div>
            </div>
            <a
              href="/workflows/"
              onClick={(e) => {
                e.preventDefault();
                onNavigateWorkflows();
              }}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 pt-2 border-t border-slate-800/80"
            >
              Open Workflows Studio <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 3. How EditMee Works */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Operational Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How EditMee Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Every utility in EditMee adheres to a simple, consistent, and predictable four-step workflow designed to save time and reduce friction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 font-black text-sm flex items-center justify-center">
              01
            </div>
            <h3 className="font-bold text-white text-base">Select Your Tool</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Find the exact utility from the category directory or search bar based on your immediate task.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 font-black text-sm flex items-center justify-center">
              02
            </div>
            <h3 className="font-bold text-white text-base">Provide Input</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Drag and drop your file, paste text, or configure parameters directly in the tool workspace.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 font-black text-sm flex items-center justify-center">
              03
            </div>
            <h3 className="font-bold text-white text-base">Process & Customize</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Adjust settings, preview live changes in real-time, and execute the desired conversion or edit.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 font-black text-sm flex items-center justify-center">
              04
            </div>
            <h3 className="font-bold text-white text-base">Inspect & Export</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Download your modified file, copy the result to your clipboard, or pass it into another pipeline step.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Who Can Use EditMee? */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Target Audiences</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Who Can Use EditMee?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            EditMee is designed for anyone needing dependable, instant utilities across study, office work, creative production, and software development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Students & Academic Researchers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Merge research papers, extract text from lecture notes, convert image diagrams to PDF, calculate percentages, and format citations without requiring campus workstation software.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Business Professionals & Freelancers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Build ATS-compliant resumes, sign NDA documents, split and watermark contracts, analyze tabular sales records in CSV format, and compute loan amortizations securely.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-400 flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Software Developers & IT Teams</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Format API payloads, decode Base64 data, convert cURL commands to JavaScript fetch, test Regular Expressions, and inspect cryptographic hashes quickly during active project development.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Content Creators & Designers</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Crop social media thumbnails, compress graphic banners to modern WebP, remove photo backgrounds, extract hex color palettes, and inspect image EXIF data in seconds.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 md:col-span-2 lg:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Everyday Internet Users</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Need a quick digital fix without signing up or downloading ad-heavy software? EditMee makes everyday tasks like signing a school permission slip, resizing a profile picture, or converting a file effortless and immediate.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Privacy & Processing Transparency */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security & Privacy Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How EditMee Handles Your Data
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Data privacy is central to EditMee. We believe user productivity should not require surrendering personal documents or sensitive corporate files to third-party databases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Client-First Processing
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Most standard document, image, and text tasks (including PDF merging, page reordering, image cropping, and CSV data filtering) execute directly in your browser using Web APIs without transmitting files to external servers.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Secure Transit for AI Features
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Optional cloud-assisted capabilities (such as AI chat assistance or text generation) communicate strictly over encrypted HTTPS protocols. Prompt data is processed transiently and is never sold or used for public training.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-2.5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Zero Remote File Retention
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              EditMee does not operate persistent remote file storage for user workspaces. When you close or refresh your browser tab, memory-allocated files and temporary session caches are promptly discarded.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Why Use EditMee? */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Platform Advantages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Why Choose EditMee?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Practical reasons people rely on EditMee for daily document manipulation and digital tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-white text-sm">Zero Installation Needed</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Works directly in modern web browsers without downloading bulky applications or configuring system runtimes.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-white text-sm">Unified Workplace</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Consolidates PDF, image, document, developer, and calculator utilities in one cohesive interface.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-white text-sm">Cross-Device Adaptability</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Engineered with responsive layouts and lightweight startup bundles that run on mobile, tablet, and desktop screens.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <h3 className="font-bold text-white text-sm">Client-First Privacy</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Local document and image manipulation keeps your sensitive files on your machine rather than in remote cloud buckets.
            </p>
          </div>
        </div>
      </div>

      {/* 7. Frequently Asked Questions (FAQ) with Accordion */}
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Find answers to common questions about using EditMee, our feature capabilities, browser compatibility, and privacy policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-850 transition-colors"
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-red-400' : ''
                    }`}
                  />
                </button>
                {/* Always rendered in the DOM for search bots, animated/shown for users */}
                <div
                  className={`px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed ${
                    isOpen ? 'block' : 'hidden'
                  }`}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
