import { ToolDefinition, ToolCategory, ToolCapabilities } from '../../types';

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, ToolDefinition> = new Map();
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  /**
   * Register a new tool into the registry
   */
  public register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
    this.notify();
  }

  /**
   * Register multiple tools at once
   */
  public registerMany(toolsList: ToolDefinition[]): void {
    for (const tool of toolsList) {
      this.tools.set(tool.id, tool);
    }
    this.notify();
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
   * Get a single tool by ID
   */
  public get(toolId: string): ToolDefinition | undefined {
    if (this.tools.has(toolId)) {
      return this.tools.get(toolId);
    }
    // Handle common ID aliases
    const aliases: Record<string, string> = {
      'protect-pdf': 'pdf-protect',
      'compress-pdf': 'pdf-compressor',
      'merge-pdf': 'pdf-merger',
      'split-pdf': 'pdf-splitter',
      'watermark-pdf': 'pdf-watermark',
      'pagenumber-pdf': 'pdf-page-numberer',
    };
    if (aliases[toolId] && this.tools.has(aliases[toolId])) {
      return this.tools.get(aliases[toolId]);
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
    return this.getAll().filter((t) => {
      const cat = t.category as string;
      if (cat === target) return true;
      if (target === 'marketing' && (cat === 'seo' || t.tags.includes('marketing') || t.tags.includes('seo'))) return true;
      if (target === 'seo' && (cat === 'marketing' || t.tags.includes('seo'))) return true;
      if (target === 'productivity' && (cat === 'utilities' || t.tags.includes('productivity') || t.tags.includes('lifestyle'))) return true;
      if (target === 'utilities' && (cat === 'productivity' || t.tags.includes('utilities'))) return true;
      if (target === 'automation' && (cat === 'workflow' || cat === 'developer' || t.tags.includes('automation') || t.tags.includes('devops') || t.tags.includes('ci/cd'))) return true;
      if (target === 'files' && (cat === 'documents' && t.tags.includes('conversion'))) return true;
      if (target === 'design' && (cat === 'images' && (t.tags.includes('mockup') || t.tags.includes('banner')))) return true;
      return false;
    });
  }

  /**
   * Get all tools within a subcategory
   */
  public getBySubcategory(subcategory: string): ToolDefinition[] {
    return this.getAll().filter((t) => t.subcategory === subcategory);
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
