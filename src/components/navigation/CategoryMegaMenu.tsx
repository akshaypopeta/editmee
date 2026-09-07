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
  FolderArchive,
  Music,
  Palette,
  Megaphone,
  Globe,
  Workflow,
  BarChart,
  CheckSquare,
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
  {
    id: 'files',
    name: 'FILE CONVERSION',
    description: 'Universal document, ebook, and archive conversion utilities',
    icon: FolderArchive,
    subgroups: [
      { name: 'EBOOK & OFFICE', matchTag: 'ebook' },
      { name: 'ARCHIVE & BACKUP', matchTag: 'archive' },
    ],
  },
  {
    id: 'media',
    name: 'MEDIA & AUDIO',
    description: 'Audio transcriber, video compression, sound effects & wave generator',
    icon: Music,
    subgroups: [
      { name: 'AUDIO TOOLS', matchTag: 'audio' },
      { name: 'VIDEO UTILITIES', matchTag: 'video' },
    ],
  },
  {
    id: 'design',
    name: 'GRAPHIC DESIGN',
    description: 'Mockups, badges, banners, social covers & canvas graphics',
    icon: Palette,
    subgroups: [
      { name: 'MOCKUPS & COVERS', matchTag: 'mockup' },
      { name: 'BANNERS & SEALS', matchTag: 'badge' },
    ],
  },
  {
    id: 'marketing',
    name: 'MARKETING & SEO',
    description: 'Copywriting, meta tags, schema generators, UTM builders & campaign metrics',
    icon: Megaphone,
    subgroups: [
      { name: 'CAMPAIGN & ANALYTICS', matchTag: 'marketing' },
      { name: 'SEARCH & METADATA', matchTag: 'seo' },
    ],
  },
  {
    id: 'automation',
    name: 'WORKFLOW & AUTOMATION',
    description: 'Scheduled batch pipelines, webhooks, format parsers & automated builders',
    icon: Workflow,
    subgroups: [
      { name: 'PIPELINES', matchTag: 'automation' },
      { name: 'INTEGRATIONS', matchTag: 'workflow' },
    ],
  },
  {
    id: 'productivity',
    name: 'PRODUCTIVITY SUITE',
    description: 'Timers, Kanban planners, checklists, focus boards & sprint utilities',
    icon: CheckSquare,
    subgroups: [
      { name: 'TIME & FOCUS', matchTag: 'productivity' },
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
  const subcategoryGroups = toolRegistry.getSubcategoriesForCategory(category.id as any);

  // Group tools into organized subcategory buckets
  const groupedTools: { title: string; slug: string; tools: ToolDefinition[] }[] = [];
  const processedIds = new Set<string>();

  // 1. Process configured subgroups first
  if (category.subgroups && category.subgroups.length > 0) {
    category.subgroups.forEach((group) => {
      const toolsInGroup: ToolDefinition[] = [];

      // Check explicit toolIds
      if (group.toolIds) {
        group.toolIds.forEach((id) => {
          const t = toolRegistry.get(id);
          if (t && !processedIds.has(t.id)) {
            toolsInGroup.push(t);
            processedIds.add(t.id);
          }
        });
      }

      // Check matchTag
      if (group.matchTag) {
        const tag = group.matchTag.toLowerCase();
        categoryTools.forEach((t) => {
          if (!processedIds.has(t.id)) {
            const hasTag = t.tags.some((tg) => tg.toLowerCase().includes(tag));
            const hasSub = (t.subcategory || '').toLowerCase().includes(tag);
            if (hasTag || hasSub) {
              toolsInGroup.push(t);
              processedIds.add(t.id);
            }
          }
        });
      }

      if (toolsInGroup.length > 0) {
        groupedTools.push({
          title: group.name,
          slug: group.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tools: toolsInGroup,
        });
      }
    });
  }

  // 2. Add any remaining tools grouped by their actual subcategory
  categoryTools.forEach((tool) => {
    if (!processedIds.has(tool.id)) {
      const subName = (tool.subcategory || 'General')
        .split(/[-_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
      const subSlug = (tool.subcategory || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-');

      let existing = groupedTools.find((g) => g.slug === subSlug);
      if (!existing) {
        existing = { title: subName.toUpperCase(), slug: subSlug, tools: [] };
        groupedTools.push(existing);
      }
      existing.tools.push(tool);
      processedIds.add(tool.id);
    }
  });

  return (
    <div
      onMouseLeave={onClose}
      className="absolute left-0 top-full mt-1.5 w-[760px] max-w-[90vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-5 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <category.icon className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <h3 className="font-bold text-sm text-white tracking-tight">
              {category.name}
            </h3>
            <p className="text-xs text-slate-400">{category.description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onViewAllCategory(category.id);
            onClose();
          }}
          className="text-xs font-black text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer bg-red-950/70 hover:bg-red-900/60 px-3.5 py-1.5 rounded-xl border border-red-800/80 shadow-xs"
        >
          <span>View all {category.name} → {categoryTools.length} Tools</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin">
        {groupedTools.map((group) => (
          <div key={group.title} className="space-y-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <h4 className="text-[11px] font-black text-slate-300 tracking-wider uppercase">
                {group.title}
              </h4>
            </div>
            <ul className="space-y-0.5">
              {group.tools.slice(0, 10).map((tool) => (
                <li key={tool.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTool(tool.id);
                      onClose();
                    }}
                    className="w-full text-left text-xs font-medium text-slate-300 hover:text-red-400 hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate">{tool.name}</span>
                    <span className="text-[10px] text-slate-500 group-hover:text-red-400 transition-colors shrink-0 ml-1">
                      →
                    </span>
                  </button>
                </li>
              ))}
              {group.tools.length > 10 && (
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      onViewAllCategory(category.id);
                      onClose();
                    }}
                    className="w-full text-left text-[11px] font-bold text-red-400 hover:text-red-300 px-2 py-1 transition-colors cursor-pointer"
                  >
                    View more in {group.title} →
                  </button>
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
