import React from 'react';
import { toolRegistry } from '../../core/tool-registry/ToolRegistry';
import { ToolDefinition } from '../../types';
import {
  FileText,
  Image as ImageIcon,
  Database,
  Code,
  Calculator,
  Briefcase,
  FileCheck,
  Sparkles,
  Shield,
  Layers,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  subgroups: { name: string; matchTag?: string; toolIds?: string[] }[];
}

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  {
    id: 'pdf',
    name: 'PDF TOOLS',
    description: 'Edit, convert, compress and manage PDF files',
    icon: FileText,
    subgroups: [
      { name: 'EDIT', toolIds: ['edit-pdf', 'add-text-pdf', 'sign-pdf', 'annotate-pdf', 'watermark-pdf'] },
      { name: 'ORGANIZE', toolIds: ['merge-pdf', 'split-pdf', 'reorder-pdf-pages', 'delete-pdf-pages', 'extract-pdf-pages', 'rotate-pdf'] },
      { name: 'CONVERT', toolIds: ['pdf-to-word', 'pdf-to-jpg', 'jpg-to-pdf', 'pdf-to-text', 'pdf-to-png'] },
      { name: 'OPTIMIZE', toolIds: ['compress-pdf', 'repair-pdf'] },
      { name: 'SECURITY', toolIds: ['protect-pdf', 'unlock-pdf', 'redact-pdf'] },
    ],
  },
  {
    id: 'images',
    name: 'IMAGE TOOLS',
    description: 'Resize, compress, convert, enhance and edit images',
    icon: ImageIcon,
    subgroups: [
      { name: 'EDIT & STUDIO', toolIds: ['image-studio', 'crop-image', 'resize-image', 'watermark-image'] },
      { name: 'OPTIMIZE', toolIds: ['compress-image', 'compress-png', 'compress-jpeg'] },
      { name: 'CONVERT', toolIds: ['image-converter', 'png-to-jpg', 'jpg-to-png', 'svg-to-png', 'webp-to-png'] },
      { name: 'AI & ENHANCE', toolIds: ['background-remover', 'image-enhancer', 'ai-image-generator'] },
    ],
  },
  {
    id: 'documents',
    name: 'DOCUMENT TOOLS',
    description: 'Create, convert, edit and manage documents',
    icon: FileCheck,
    subgroups: [
      { name: 'OCR & SCAN', toolIds: ['ocr-text-extractor', 'document-scanner', 'scan-to-pdf'] },
      { name: 'CONVERT', toolIds: ['markdown-to-pdf', 'html-to-pdf', 'text-to-pdf', 'pdf-to-word'] },
      { name: 'DIFF & UTILITIES', toolIds: ['document-diff', 'word-counter', 'character-counter'] },
    ],
  },
  {
    id: 'resumes',
    name: 'RESUME TOOLS',
    description: 'Create, edit, improve and optimize resumes',
    icon: Briefcase,
    subgroups: [
      { name: 'BUILD & EDIT', toolIds: ['resume-builder', 'resume-editor', 'cover-letter-generator'] },
      { name: 'ANALYZE & OPTIMIZE', toolIds: ['resume-analyzer', 'resume-tailor', 'ats-resume-scanner', 'linkedin-summary-generator'] },
    ],
  },
  {
    id: 'ai',
    name: 'AI TOOLS',
    description: 'Generate, analyze, summarize and transform content',
    icon: Sparkles,
    subgroups: [
      { name: 'ASSISTANTS', toolIds: ['ai-assistant', 'ai-writing', 'ai-doc-intel', 'ai-image-generator'] },
      { name: 'GENERATION', toolIds: ['ai-summarizer', 'ai-translator', 'ai-code-explainer', 'ai-grammar-checker'] },
    ],
  },
  {
    id: 'data',
    name: 'DATA & CSV',
    description: 'Clean, convert, analyze and transform data',
    icon: Database,
    subgroups: [
      { name: 'STUDIO & CLEAN', toolIds: ['csv-studio', 'csv-cleaner', 'csv-deduplicator', 'data-visualizer'] },
      { name: 'CONVERT', toolIds: ['csv-to-json', 'json-to-csv', 'csv-to-sql', 'csv-to-excel', 'xml-to-json'] },
    ],
  },
  {
    id: 'developer',
    name: 'DEVELOPER TOOLS',
    description: 'Format, validate, encode, decode and inspect technical data',
    icon: Code,
    subgroups: [
      { name: 'FORMATTERS', toolIds: ['dev-studio', 'json-formatter', 'sql-formatter', 'html-formatter', 'xml-formatter'] },
      { name: 'ENCODING & SECURITY', toolIds: ['base64-encode-decode', 'url-encoder-decoder', 'jwt-debugger', 'hash-generator'] },
      { name: 'VALIDATORS', toolIds: ['regex-tester', 'cron-expression-generator', 'uuid-generator'] },
    ],
  },
  {
    id: 'business',
    name: 'BUSINESS TOOLS',
    description: 'Useful tools for everyday business work',
    icon: Briefcase,
    subgroups: [
      { name: 'INVOICING & FINANCE', toolIds: ['invoice-generator', 'receipt-generator', 'purchase-order-generator', 'nda-generator'] },
      { name: 'PLANNING & ASSETS', toolIds: ['business-plan-generator', 'swot-analysis-generator', 'email-signature-generator'] },
    ],
  },
  {
    id: 'calculators',
    name: 'FINANCE & CALCULATORS',
    description: 'Calculators and financial utilities',
    icon: Calculator,
    subgroups: [
      { name: 'FINANCE', toolIds: ['calculator-studio', 'mortgage-calculator', 'loan-amortization-calculator', 'compound-interest-calculator', 'roi-calculator'] },
      { name: 'BUSINESS MATH', toolIds: ['discount-calculator', 'percentage-calculator', 'margin-markup-calculator', 'gst-vat-calculator'] },
    ],
  },
  {
    id: 'security',
    name: 'SECURITY & PRIVACY',
    description: 'Privacy and security utilities',
    icon: Shield,
    subgroups: [
      { name: 'ENCRYPTION & KEYS', toolIds: ['password-generator', 'file-encryptor', 'file-decryptor', 'metadata-stripper', 'hash-generator'] },
    ],
  },
];

interface CategoryMegaMenuProps {
  category: CategoryConfig;
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onViewAllCategory: (categoryId: string) => void;
}

export const CategoryMegaMenu: React.FC<CategoryMegaMenuProps> = ({
  category,
  isOpen,
  onClose,
  onSelectTool,
  onViewAllCategory,
}) => {
  if (!isOpen) return null;

  const categoryTools = toolRegistry.getByCategory(category.id as any);
  const toolMap = new Map<string, ToolDefinition>();
  categoryTools.forEach((t) => toolMap.set(t.id, t));

  return (
    <div
      onMouseLeave={onClose}
      className="absolute left-0 top-full mt-1.5 w-[680px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-5 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <category.icon className="w-5 h-5 text-red-600" />
          <div>
            <h3 className="font-bold text-sm text-slate-900 tracking-tight">{category.name}</h3>
            <p className="text-xs text-slate-500">{category.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onViewAllCategory(category.id);
            onClose();
          }}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          View All ({categoryTools.length}) <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-h-[380px] overflow-y-auto pr-1">
        {category.subgroups.map((group) => {
          // Resolve tools for this group
          const toolsInGroup: ToolDefinition[] = [];
          if (group.toolIds) {
            group.toolIds.forEach((id) => {
              const t = toolRegistry.get(id);
              if (t) toolsInGroup.push(t);
            });
          }
          if (toolsInGroup.length === 0) return null;

          return (
            <div key={group.name} className="space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase border-b border-slate-100 pb-1">
                {group.name}
              </h4>
              <ul className="space-y-1">
                {toolsInGroup.map((tool) => (
                  <li key={tool.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTool(tool.id);
                        onClose();
                      }}
                      className="w-full text-left text-xs font-medium text-slate-700 hover:text-red-600 hover:bg-red-50/80 px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="truncate">{tool.name}</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-red-600 transition-colors">
                        →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
