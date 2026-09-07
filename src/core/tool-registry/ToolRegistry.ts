import { ToolDefinition, ToolCategory, ToolCapabilities } from '../../types';
import { deduplicateTools, cleanToolName, normalizeCategory } from './deduplication';

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();
  private aliasMap: Map<string, string> = new Map();
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Register a new tool into the registry with deduplication check
   */
  public register(tool: ToolDefinition): void {
    const existing = this.tools.get(tool.id);
    // Never allow a generic tool without customWorkspace to overwrite an authentic tool with customWorkspace
    if (existing?.customWorkspace && !tool.customWorkspace) {
      return;
    }
    this.tools.set(tool.id, tool);
    this.aliasMap.set(tool.id.toLowerCase(), tool.id);
    this.notify();
  }

  /**
   * Register multiple tools at once, performing automated semantic deduplication
   */
  public registerMany(toolsList: ToolDefinition[]): void {
    const result = deduplicateTools(toolsList);

    for (const tool of result.canonicalTools) {
      const existing = this.tools.get(tool.id);
      if (existing?.customWorkspace && !tool.customWorkspace) {
        continue;
      }
      this.tools.set(tool.id, tool);
    }

    // Merge alias map
    result.aliasMap.forEach((canonicalId, aliasId) => {
      this.aliasMap.set(aliasId.toLowerCase(), canonicalId);
    });

    this.notify();
  }

  /**
   * Register an explicit alias
   */
  public registerAlias(aliasId: string, canonicalId: string): void {
    this.aliasMap.set(aliasId.toLowerCase(), canonicalId);
  }

  /**
   * Resolve any ID or alias to canonical ID
   */
  public resolveCanonicalId(toolId: string): string {
    if (!toolId) return '';
    const cleanId = toolId.trim().toLowerCase();
    return this.aliasMap.get(cleanId) || this.aliasMap.get(cleanId.replace(/_/g, '-')) || toolId;
  }

  /**
   * Unregister a tool by ID
   */
  public unregister(toolId: string): boolean {
    const deleted = this.tools.delete(toolId);
    if (deleted) this.notify();
    return deleted;
  }

  /**
   * Get a single tool by ID with smart fallback and alias redirection
   */
  public get(toolId: string): ToolDefinition | undefined {
    if (!toolId) return undefined;
    const cleanId = toolId.trim().toLowerCase();

    if (this.tools.has(toolId)) {
      return this.tools.get(toolId);
    }
    if (this.tools.has(cleanId)) {
      return this.tools.get(cleanId);
    }

    // Check dynamic alias map
    const canonicalId = this.aliasMap.get(cleanId) || this.aliasMap.get(cleanId.replace(/_/g, '-'));
    if (canonicalId && this.tools.has(canonicalId)) {
      return this.tools.get(canonicalId);
    }

    // Check if ID had a numeric suffix that points to a canonical tool
    const baseIdCandidate = cleanId.replace(/-\d+(-\d+)?$/, '');
    if (this.tools.has(baseIdCandidate)) {
      return this.tools.get(baseIdCandidate);
    }
    const mappedBase = this.aliasMap.get(baseIdCandidate);
    if (mappedBase && this.tools.has(mappedBase)) {
      return this.tools.get(mappedBase);
    }

    // Handle common standard aliases and normalized slugs
    const aliases: Record<string, string> = {
      // PDF aliases
      'edit-pdf': 'edit-pdf',
      'pdf-edit': 'edit-pdf',
      'edit_pdf': 'edit-pdf',
      'pdf-editor': 'edit-pdf',
      'merge-pdf': 'pdf-merger',
      'pdf-merge': 'pdf-merger',
      'pdf-merger': 'pdf-merger',
      'pdf_merger': 'pdf-merger',
      'pdf-merge-multi-file': 'pdf-merger',
      'pdf-pdf-merge-multi-file-5': 'pdf-merger',
      'split-pdf': 'pdf-splitter',
      'pdf-split': 'pdf-splitter',
      'pdf-splitter': 'pdf-splitter',
      'pdf-split-by-page-range': 'pdf-splitter',
      'pdf-pdf-split-by-page-range-4': 'pdf-splitter',
      'compress-pdf': 'pdf-compressor',
      'pdf-compress': 'pdf-compressor',
      'pdf-compressor': 'pdf-compressor',
      'pdf-compress-optimize': 'pdf-compressor',
      'pdf-pdf-compress-optimize-6': 'pdf-compressor',
      'protect-pdf': 'pdf-protect',
      'pdf-protect': 'pdf-protect',
      'encrypt-pdf': 'pdf-protect',
      'pdf-encrypt-password-protect': 'pdf-protect',
      'pdf-pdf-encrypt-password-protect-7': 'pdf-protect',
      'watermark-pdf': 'pdf-watermark',
      'pdf-watermark': 'pdf-watermark',
      'pdf-watermark-stamper': 'pdf-watermark',
      'pdf-pdf-watermark-stamper-2': 'pdf-watermark',
      'pagenumber-pdf': 'pdf-page-numberer',
      'pdf-page-numberer': 'pdf-page-numberer',
      'pdf-page-number': 'pdf-page-numberer',
      'rotate-pdf': 'pdf-rotate',
      'pdf-rotate': 'pdf-rotate',
      'pdf-rotate-pages': 'pdf-rotate',
      'pdf-pdf-rotate-pages-3': 'pdf-rotate',
      'pdf-metadata': 'pdf-metadata',
      'pdf-metadata-editor': 'pdf-metadata',
      'pdf-pdf-metadata-editor-8': 'pdf-metadata',
      'pdf-grayscale': 'pdf-grayscale',
      'pdf-grayscale-converter': 'pdf-grayscale',
      'pdf-pdf-grayscale-converter-9': 'pdf-grayscale',
      'pdf-to-jpg': 'pdf-to-jpg',
      'pdf-to-word': 'pdf-to-word',
      'pdf-unlock': 'pdf-unlock',
      'images-to-pdf': 'images-to-pdf',
      'jpg-to-pdf': 'images-to-pdf',
      'png-to-pdf': 'images-to-pdf',
      'image-to-pdf': 'images-to-pdf',

      // Image aliases
      'image-studio': 'image-studio',
      'image_studio': 'image-studio',
      'photo-editor': 'image-studio',
      'crop-image': 'image-studio',
      'image-compressor': 'image-compressor',
      'compress-image': 'image-compressor',
      'compress-png': 'image-compressor',
      'compress-jpeg': 'image-compressor',
      'compress-jpg': 'image-compressor',
      'image-resizer': 'image-resizer',
      'resize-image': 'image-resizer',
      'scale-image': 'image-resizer',
      'image-converter': 'image-converter',
      'convert-image': 'image-converter',
      'png-to-jpg': 'image-converter',
      'jpg-to-png': 'image-converter',
      'webp-to-png': 'image-converter',
      'bg-remover': 'bg-remover',
      'background-remover': 'bg-remover',
      'remove-bg': 'bg-remover',
      'remove-background': 'bg-remover',
      'image-upscaler': 'image-upscaler',
      'upscale-image': 'image-upscaler',
      'image-enhancer': 'image-enhancer',
      'enhance-image': 'image-enhancer',
      'image-watermark': 'image-watermark',
      'watermark-image': 'image-watermark',
      'image-annotator': 'image-annotator',
      'annotate-image': 'image-annotator',

      // AI aliases
      'ai-assistant': 'ai-assistant',
      'work-assistant': 'ai-assistant',
      'ai-agent': 'ai-assistant',
      'ai-writing': 'ai-writing',
      'ai-writer': 'ai-writing',
      'ai-doc-intel': 'ai-doc-intel',
      'doc-intel': 'ai-doc-intel',
      'ai-document-intelligence': 'ai-doc-intel',
      'ai-image-generator': 'ai-image-generator',
      'ai-image': 'ai-image-generator',

      // Developer aliases
      'dev-studio': 'dev-studio',
      'developer-studio': 'dev-studio',
      'json-formatter': 'json-formatter',
      'format-json': 'json-formatter',
      'base64-tool': 'base64-tool',
      'base64': 'base64-tool',

      // Data aliases
      'csv-studio': 'csv-studio',
      'data-studio': 'csv-studio',
      'csv-to-json': 'csv-to-json',
      'json-to-csv': 'json-to-csv',

      // Other suites
      'calculator-studio': 'calculator-studio',
      'calculators-studio': 'calculator-studio',
      'calculator': 'calculator-studio',
      'invoice-generator': 'invoice-generator',
      'invoice': 'invoice-generator',
      'receipt-generator': 'invoice-generator',
      'resume-builder': 'resume-builder',
      'resume': 'resume-builder',
      'media-studio': 'media-studio',
      'audio-studio': 'media-studio',
    };

    const mappedTarget = aliases[cleanId] || aliases[cleanId.replace(/_/g, '-')];
    if (mappedTarget && this.tools.has(mappedTarget)) {
      return this.tools.get(mappedTarget);
    }

    return undefined;
  }

  /**
   * Get all registered tools
   */
  public getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get all tools within a specific category with smart alias resolution
   */
  public getByCategory(category: ToolCategory | string): ToolDefinition[] {
    const target = (category || '').toLowerCase().trim();
    if (!target || target === 'all') return this.getAll();

    const normalizedTarget = normalizeCategory(target);

    return this.getAll().filter((t) => {
      const cat = (t.category || '').toLowerCase();
      if (cat === target || cat === normalizedTarget) return true;
      const normalizedToolCat = normalizeCategory(cat, t.id);
      return normalizedToolCat === normalizedTarget;
    });
  }

  /**
   * Get all tools within a subcategory
   */
  public getBySubcategory(subcategory: string): ToolDefinition[] {
    const target = (subcategory || '').toLowerCase().trim();
    return this.getAll().filter((t) => (t.subcategory || '').toLowerCase() === target);
  }

  /**
   * Get tools by category and subcategory
   */
  public getByCategoryAndSubcategory(category: ToolCategory | string, subcategory: string): ToolDefinition[] {
    const catTools = this.getByCategory(category);
    if (!subcategory || subcategory === 'all') return catTools;
    const target = subcategory.toLowerCase().trim();
    return catTools.filter((t) => (t.subcategory || '').toLowerCase() === target);
  }

  /**
   * Get distinct subcategories with tool counts for a given category
   */
  public getSubcategoriesForCategory(category: ToolCategory | string): { name: string; slug: string; count: number }[] {
    const tools = this.getByCategory(category);
    const map = new Map<string, { name: string; slug: string; count: number }>();

    tools.forEach((tool) => {
      const rawSub = tool.subcategory || 'General';
      const slug = rawSub.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const formattedName = rawSub
        .split(/[-_\s]+/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

      if (!map.has(slug)) {
        map.set(slug, { name: formattedName, slug, count: 1 });
      } else {
        map.get(slug)!.count += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }

  /**
   * Universal search across name, description, tags, capabilities, category
   */
  public search(query: string): ToolDefinition[] {
    if (!query || !query.trim()) return this.getAll();
    const q = query.toLowerCase().trim();

    return this.getAll().filter((tool) => {
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      const matchCat = tool.category.toLowerCase().includes(q);
      const matchSub = tool.subcategory?.toLowerCase().includes(q) || false;
      const matchTags = tool.tags.some((tag) => tag.toLowerCase().includes(q));
      return matchName || matchDesc || matchCat || matchSub || matchTags;
    });
  }

  /**
   * Filter tools by capability requirements
   */
  public getByCapabilities(filter: Partial<ToolCapabilities>): ToolDefinition[] {
    return this.getAll().filter((tool) => {
      for (const [key, value] of Object.entries(filter)) {
        if (tool.capabilities[key as keyof ToolCapabilities] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Subscribe to registry changes
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const toolRegistry = ToolRegistry.getInstance();
