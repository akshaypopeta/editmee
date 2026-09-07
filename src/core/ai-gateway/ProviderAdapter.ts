/**
 * Provider Adapter interfaces for EditMee AI Gateway
 * Allows extensible, multi-provider AI backends with Gemini 3.7 Flash default
 */

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  message: string;
  history?: AiMessage[];
  systemInstruction?: string;
  temperature?: number;
  toolsContext?: any[];
}

export interface GenerationOptions {
  prompt: string;
  systemInstruction?: string;
  type?: 'text' | 'json';
  jsonMode?: boolean;
  temperature?: number;
}

export interface DocumentAnalysisOptions {
  documentText?: string;
  imageBase64?: string;
  mimeType?: string;
  taskType?: 'summary' | 'qa' | 'extract' | 'invoice' | 'contract' | 'resume' | 'translate';
  query?: string;
}

export interface ImageGenerationOptions {
  prompt: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  style?: string;
}

export interface ToolRouteRequest {
  prompt: string;
  availableTools: any[];
}

export interface ToolRouteResponse {
  requiresToolExecution: boolean;
  rationale: string;
  toolCalls: Array<{
    toolId: string;
    arguments: Record<string, any>;
    explanation: string;
  }>;
  directAnswer?: string;
}

export interface AiProviderAdapter {
  id: string;
  name: string;
  isAvailable(): Promise<boolean>;
  chat(options: ChatCompletionOptions): Promise<{ text: string; success: boolean; error?: string }>;
  generate(options: GenerationOptions): Promise<{ text: string; success: boolean; error?: string }>;
  analyzeDocument(options: DocumentAnalysisOptions): Promise<{ analysis: string; success: boolean; error?: string }>;
  routeIntent(options: ToolRouteRequest): Promise<{ route: ToolRouteResponse; success: boolean; error?: string }>;
  generateImage(options: ImageGenerationOptions): Promise<{ imageUrl?: string; text?: string; success: boolean; error?: string }>;
}

/**
 * Server-Side Gemini Provider Adapter (Secure: never exposes API keys to client)
 */
export class ServerGeminiProviderAdapter implements AiProviderAdapter {
  public id = 'gemini-server';
  public name = 'Google Gemini 3.7 Flash & 3.1 Flash Image (Server-Side Secure)';

  public async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.hasGeminiKey);
    } catch {
      return false;
    }
  }

  public async chat(options: ChatCompletionOptions) {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return { text: data.text || '', success: true };
    } catch (err: any) {
      return { text: '', success: false, error: err.message };
    }
  }

  public async generate(options: GenerationOptions) {
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return { text: data.text || '', success: true };
    } catch (err: any) {
      return { text: '', success: false, error: err.message };
    }
  }

  public async analyzeDocument(options: DocumentAnalysisOptions) {
    try {
      const res = await fetch('/api/ai/document-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return { analysis: data.analysis || '', success: true };
    } catch (err: any) {
      return { analysis: '', success: false, error: err.message };
    }
  }

  public async routeIntent(options: ToolRouteRequest) {
    try {
      const res = await fetch('/api/ai/route-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return { route: data.route, success: true };
    } catch (err: any) {
      return {
        route: {
          requiresToolExecution: false,
          rationale: 'Routing network call failed',
          toolCalls: [],
          directAnswer: '',
        },
        success: false,
        error: err.message,
      };
    }
  }

  public async generateImage(options: ImageGenerationOptions) {
    try {
      const res = await fetch('/api/ai/image-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      return { imageUrl: data.imageUrl, text: data.text, success: Boolean(data.imageUrl) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}

/**
 * Local Deterministic / Offline Fallback Provider Adapter
 */
export class LocalFallbackProviderAdapter implements AiProviderAdapter {
  public id = 'local-fallback';
  public name = 'Local Deterministic Fallback Engine';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async chat(options: ChatCompletionOptions) {
    return {
      text: `[EditMee Assistant]: I can help execute your task with our local zero-latency tools. You asked: "${options.message}". Choose a tool from the directory or let me route your task automatically.`,
      success: true,
    };
  }

  public async generate(options: GenerationOptions) {
    const isJson = options.jsonMode || options.type === 'json';
    if (isJson) {
      return {
        text: JSON.stringify(
          {
            title: 'Processed Content',
            prompt: options.prompt,
            status: 'completed',
            timestamp: new Date().toISOString(),
          },
          null,
          2
        ),
        success: true,
      };
    }
    return {
      text: `Processed content for: "${options.prompt}"\n\n- Local intelligence active\n- Formatted for downstream production pipeline`,
      success: true,
    };
  }

  public async analyzeDocument(options: DocumentAnalysisOptions) {
    const preview = options.documentText ? options.documentText.slice(0, 200) : 'Document received';
    return {
      analysis: `### Document Overview (${options.taskType || 'Summary'})\n\n**Extracted Content**:\n${preview}...\n\n**Status**: Processed with local parser.`,
      success: true,
    };
  }

  public async routeIntent(options: ToolRouteRequest) {
    const p = options.prompt.toLowerCase();
    const matchedTools: any[] = [];

    // Smart heuristic matching against registered tools
    for (const tool of options.availableTools) {
      if (
        p.includes(tool.id.toLowerCase()) ||
        p.includes(tool.name.toLowerCase()) ||
        tool.tags.some((tag: string) => p.includes(tag.toLowerCase()))
      ) {
        matchedTools.push({
          toolId: tool.id,
          arguments: {},
          explanation: `Matched registered tool: ${tool.name}`,
        });
      }
    }

    return {
      route: {
        requiresToolExecution: matchedTools.length > 0,
        rationale: matchedTools.length > 0 ? 'Heuristic intent resolution matched tools in registry.' : 'General query.',
        toolCalls: matchedTools,
        directAnswer: `I recommend executing the following tools: ${matchedTools.map((m) => m.toolId).join(', ') || 'None'}`,
      },
      success: true,
    };
  }

  public async generateImage(options: ImageGenerationOptions) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { success: false, error: 'Canvas context unavailable' };

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 800, 800);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 720, 720);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EditMee Graphic Generator', 400, 380);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(`"${options.prompt.slice(0, 50)}"`, 400, 420);

    return {
      imageUrl: canvas.toDataURL('image/png'),
      text: `Generated graphic for: ${options.prompt}`,
      success: true,
    };
  }
}
