/**
 * Centralized AI Gateway for EditMee
 * Manages provider adapters, ensures zero API-key exposure, and drives AI workflows.
 */

import {
  AiProviderAdapter,
  ServerGeminiProviderAdapter,
  LocalFallbackProviderAdapter,
  ChatCompletionOptions,
  GenerationOptions,
  DocumentAnalysisOptions,
  ImageGenerationOptions,
  ToolRouteResponse,
} from './ProviderAdapter';

export interface AiGatewayStatus {
  online: boolean;
  activeProvider: string;
  hasGeminiKey: boolean;
}

export class AiGateway {
  private static instance: AiGateway;
  private primaryAdapter: AiProviderAdapter;
  private fallbackAdapter: AiProviderAdapter;

  private constructor() {
    this.primaryAdapter = new ServerGeminiProviderAdapter();
    this.fallbackAdapter = new LocalFallbackProviderAdapter();
  }

  public static getInstance(): AiGateway {
    if (!AiGateway.instance) {
      AiGateway.instance = new AiGateway();
    }
    return AiGateway.instance;
  }

  /**
   * Status check of AI backend
   */
  public async getStatus(): Promise<AiGatewayStatus> {
    const hasKey = await this.primaryAdapter.isAvailable();
    return {
      online: true,
      activeProvider: hasKey ? this.primaryAdapter.name : this.fallbackAdapter.name,
      hasGeminiKey: hasKey,
    };
  }

  /**
   * Interactive Conversational Chat with Tool Decomposer
   */
  public async chat(options: ChatCompletionOptions): Promise<string> {
    const primaryRes = await this.primaryAdapter.chat(options);
    if (primaryRes.success && primaryRes.text) {
      return primaryRes.text;
    }
    const fallbackRes = await this.fallbackAdapter.chat(options);
    return fallbackRes.text;
  }

  /**
   * Generates text / JSON content
   */
  public async generate(options: GenerationOptions): Promise<string> {
    const primaryRes = await this.primaryAdapter.generate(options);
    if (primaryRes.success && primaryRes.text) {
      return primaryRes.text;
    }
    const fallbackRes = await this.fallbackAdapter.generate(options);
    return fallbackRes.text;
  }

  /**
   * Document Intelligence Analysis (summaries, QA, invoices, contracts, resumes)
   */
  public async analyzeDocument(options: DocumentAnalysisOptions): Promise<string> {
    const primaryRes = await this.primaryAdapter.analyzeDocument(options);
    if (primaryRes.success && primaryRes.analysis) {
      return primaryRes.analysis;
    }
    const fallbackRes = await this.fallbackAdapter.analyzeDocument(options);
    return fallbackRes.analysis;
  }

  /**
   * AI Tool Router: Intent analysis and tool resolution
   */
  public async routeIntent(prompt: string, availableTools: any[]): Promise<{ route: ToolRouteResponse; success: boolean }> {
    const primaryRes = await this.primaryAdapter.routeIntent({ prompt, availableTools });
    if (primaryRes.success && primaryRes.route) {
      return primaryRes;
    }
    return this.fallbackAdapter.routeIntent({ prompt, availableTools });
  }

  /**
   * Generates AI image via Gemini
   */
  public async generateImage(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '1:1', style?: string): Promise<{ imageUrl?: string; text?: string }> {
    const primaryRes = await this.primaryAdapter.generateImage({ prompt, aspectRatio, style });
    if (primaryRes.success && primaryRes.imageUrl) {
      return primaryRes;
    }
    return this.fallbackAdapter.generateImage({ prompt, aspectRatio, style });
  }

  /**
   * Generates automated visual workflow from natural language
   */
  public async generateWorkflow(prompt: string, availableTools: any[]): Promise<any> {
    try {
      const res = await fetch('/api/ai/workflow-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, availableTools }),
      });

      if (!res.ok) {
        throw new Error('Workflow generation failed');
      }

      const data = await res.json();
      return data.workflow;
    } catch {
      // Deterministic fallback matching prompt keywords
      const p = prompt.toLowerCase();
      if (p.includes('image') || p.includes('photo')) {
        return {
          name: 'Batch Image Processing Pipeline',
          description: 'Automated workflow for images generated from prompt',
          nodes: [
            { id: 'node-1', type: 'trigger', label: 'File Upload (Images)' },
            { id: 'node-2', type: 'tool', toolId: 'image-compressor', label: 'Image Compressor' },
            { id: 'node-3', type: 'tool', toolId: 'image-converter', label: 'Convert to WebP' },
            { id: 'node-4', type: 'output', label: 'ZIP Archive Download' },
          ],
          edges: [
            { id: 'e1', source: 'node-1', target: 'node-2' },
            { id: 'e2', source: 'node-2', target: 'node-3' },
            { id: 'e3', source: 'node-3', target: 'node-4' },
          ],
        };
      }
      return {
        name: 'Automated Document Pipeline',
        description: 'Multi-step document automation',
        nodes: [
          { id: 'node-1', type: 'trigger', label: 'Document Input' },
          { id: 'node-2', type: 'tool', toolId: 'ai-doc-intel', label: 'AI Entity Extractor' },
          { id: 'node-3', type: 'output', label: 'JSON Export' },
        ],
        edges: [
          { id: 'e1', source: 'node-1', target: 'node-2' },
          { id: 'e2', source: 'node-2', target: 'node-3' },
        ],
      };
    }
  }
}

export const aiGateway = AiGateway.getInstance();
