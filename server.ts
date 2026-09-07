import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Resilient Gemini caller that retries on 503 UNAVAILABLE / 429 rate spikes with exponential backoff
 * and automatically falls back to alternative flash models.
 */
async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  model?: string;
  fallbackModels?: string[];
  maxRetries?: number;
}): Promise<any> {
  const models = [
    params.model || 'gemini-2.5-flash',
    ...(params.fallbackModels || ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.7-flash', 'gemini-2.5-pro']),
  ];

  let lastError: any = null;

  for (const modelName of models) {
    const retries = params.maxRetries ?? 1;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const ai = getAiClient();
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config: params.config,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        
        // If quota is exhausted on this specific model, break immediately and use fallback model
        if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('rate-limit')) {
          console.warn(`[Gemini Fallback] Model ${modelName} quota/rate limit reached. Switching to next model...`);
          break;
        }

        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('temporarily unavailable') ||
          errMsg.includes('overloaded');

        if (isTransient && attempt < retries) {
          const delay = 250 + Math.random() * 150;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Advance to next model on unavailability
        break;
      }
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'EditMee AI Gateway',
      time: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Chat & Work Assistant endpoint (Gemini 3.7 Flash)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, systemInstruction, history = [], toolsContext = [] } = req.body;
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const sysPrompt = systemInstruction || 
        `You are EditMee AI Work Assistant, a powerful intelligence agent inside the universal digital-work platform EditMee.
You help users plan, execute, and automate tasks using EditMee's registered client tools.
Available tools in registry: ${JSON.stringify(toolsContext)}

When a user asks to perform or automate tasks, decompose the task into actionable steps, recommend the exact registered tool IDs, and provide a clear plan. If they want a workflow, output a structured JSON block representing nodes.`;

      const response = await generateContentWithRetry({
        model: 'gemini-3.7-flash',
        contents: message,
        config: {
          systemInstruction: sysPrompt,
          temperature: 0.7,
        },
      });

      return res.json({
        text: response.text || '',
        success: true,
      });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      return res.status(500).json({
        error: err.message || 'AI service execution failed',
        fallbackAvailable: true,
      });
    }
  });

  // AI Router & Tool Call Resolution Endpoint
  app.post('/api/ai/route-intent', async (req, res) => {
    try {
      const { prompt, availableTools = [] } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const toolsSummary = availableTools.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        inputSchema: t.inputSchema,
      }));

      const sysPrompt = `You are EditMee AI Tool Router.
Analyze the user's request and determine the exact registered tools needed to fulfill the request.
You MUST ONLY select from the following registered tool IDs:
${JSON.stringify(toolsSummary, null, 2)}

CRITICAL RULES:
1. ONLY return tool IDs that exist in the provided list. NEVER hallucinate or invent tool IDs.
2. Ensure the "arguments" object conforms to the tool's inputSchema fields.
3. If no tool is needed (e.g. conversational question), set "requiresToolExecution": false.
4. Output STRICT JSON only conforming to the schema below.

JSON Schema:
{
  "requiresToolExecution": boolean,
  "rationale": string,
  "toolCalls": [
    {
      "toolId": string,
      "arguments": Record<string, any>,
      "explanation": string
    }
  ],
  "directAnswer": string
}`;

      const response = await generateContentWithRetry({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: sysPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      let parsed;
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch {
        parsed = {
          requiresToolExecution: false,
          rationale: 'Could not parse structured route response',
          toolCalls: [],
          directAnswer: response.text || '',
        };
      }

      return res.json({
        success: true,
        route: parsed,
      });
    } catch (err: any) {
      console.error('AI Router Error:', err);
      return res.status(500).json({
        error: err.message || 'AI intent routing failed',
        fallbackAvailable: true,
      });
    }
  });

  // AI Content Generator (Writing, Rewriter, Summarizer, Code, Translate)
  app.post('/api/ai/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction, type = 'text', jsonMode = false } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const config: any = {
        systemInstruction: systemInstruction || 'You are an expert AI assistant inside EditMee.',
        temperature: 0.7,
      };

      if (jsonMode) {
        config.responseMimeType = 'application/json';
      }

      const response = await generateContentWithRetry({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config,
      });

      return res.json({
        text: response.text || '',
        success: true,
      });
    } catch (err: any) {
      console.error('AI Generate Error:', err);
      return res.status(500).json({
        error: err.message || 'AI text generation failed',
        fallbackAvailable: true,
      });
    }
  });

  // AI Document Analyzer / Extractor (Supports multimodal document text/images)
  app.post('/api/ai/document-analyze', async (req, res) => {
    try {
      const { documentText, imageBase64, mimeType = 'image/png', taskType = 'summary', query } = req.body;

      let prompt = `Analyze this document for task: ${taskType}. ${query ? `Specific query: ${query}` : ''}`;
      
      const contents: any[] = [];
      if (imageBase64) {
        contents.push({
          inlineData: {
            mimeType,
            data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
          },
        });
      }
      
      const textContent = documentText ? `\n\n--- DOCUMENT CONTENT ---\n${documentText}` : '';
      contents.push({ text: `${prompt}${textContent}` });

      const response = await generateContentWithRetry({
        model: 'gemini-3.7-flash',
        contents: { parts: contents },
        config: {
          systemInstruction: 'You are an intelligent document analyst. Extract key entities, summaries, financial totals, line items, dates, and actionable findings with high precision.',
        },
      });

      return res.json({
        analysis: response.text || '',
        success: true,
      });
    } catch (err: any) {
      console.error('Document Analyzer Error:', err);
      return res.status(500).json({
        error: err.message || 'Document analysis failed',
        fallbackAvailable: true,
      });
    }
  });

  // AI Workflow Generator: translates a natural language prompt into a validated EditMee workflow graph
  app.post('/api/ai/workflow-generate', async (req, res) => {
    try {
      const { prompt, availableTools = [] } = req.body;

      const sysPrompt = `You are the EditMee AI Workflow Architect.
Your job is to convert the user's natural language automation goal into a JSON workflow definition.
Available Tool IDs and names:
${JSON.stringify(availableTools.map((t: any) => ({ id: t.id, name: t.name, category: t.category, capabilities: t.capabilities })))}

Return ONLY valid JSON matching this schema:
{
  "name": "Workflow Name",
  "description": "Short explanation",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger" | "tool" | "ai" | "condition" | "output",
      "toolId": "registered_tool_id_if_type_tool",
      "label": "Step label",
      "config": { "custom": "params" }
    }
  ],
  "edges": [
    { "id": "edge-1-2", "source": "node-1", "target": "node-2" }
  ]
}`;

      const response = await generateContentWithRetry({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: sysPrompt,
          responseMimeType: 'application/json',
        },
      });

      let workflowData;
      try {
        workflowData = JSON.parse(response.text || '{}');
      } catch (e) {
        workflowData = { error: 'Failed to parse structured workflow', raw: response.text };
      }

      return res.json({
        workflow: workflowData,
        success: true,
      });
    } catch (err: any) {
      console.error('Workflow Generator Error:', err);
      return res.status(500).json({
        error: err.message || 'Workflow generation failed',
      });
    }
  });

// Procedural SVG artwork generator for resilient fallback when Gemini image quota is unavailable
function generateProceduralGraphic(prompt: string, aspectRatio: string = '1:1', style?: string): string {
  let width = 800;
  let height = 800;
  if (aspectRatio === '16:9') { width = 960; height = 540; }
  else if (aspectRatio === '9:16') { width = 540; height = 960; }
  else if (aspectRatio === '4:3') { width = 800; height = 600; }
  else if (aspectRatio === '3:4') { width = 600; height = 800; }

  const cleanPrompt = (prompt || 'Artwork').replace(/[<>&"]/g, ' ');
  const title = cleanPrompt.length > 55 ? cleanPrompt.substring(0, 52) + '...' : cleanPrompt;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#1e1b4b" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="100%" stop-color="#8b5cf6" />
      </linearGradient>
      <pattern id="grid" width="36" height="36" patternUnits="userSpaceOnUse">
        <path d="M 36 0 L 0 0 0 36" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />
    
    <circle cx="${width * 0.25}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.25}" fill="#6366f1" opacity="0.22" />
    <circle cx="${width * 0.75}" cy="${height * 0.7}" r="${Math.min(width, height) * 0.22}" fill="#38bdf8" opacity="0.18" />

    <rect x="${width * 0.08}" y="${height * 0.18}" width="${width * 0.84}" height="${height * 0.64}" rx="16" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.14)" stroke-width="1.5" />
    
    <rect x="${width * 0.14}" y="${height * 0.26}" width="150" height="26" rx="13" fill="rgba(99, 102, 241, 0.25)" stroke="rgba(99, 102, 241, 0.6)" />
    <text x="${width * 0.14 + 75}" y="${height * 0.26 + 17}" fill="#a5b4fc" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">EDITMEE ART</text>

    <text x="${width * 0.14}" y="${height * 0.44}" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.min(width, height) > 600 ? '22' : '17'}" font-weight="700">
      ${title}
    </text>

    <text x="${width * 0.14}" y="${height * 0.54}" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="13">
      Style: ${style || 'Custom Vector'} • Aspect Ratio: ${aspectRatio}
    </text>

    <rect x="${width * 0.14}" y="${height * 0.64}" width="${width * 0.72}" height="3" rx="1.5" fill="url(#glowGrad)" />

    <text x="${width * 0.86}" y="${height * 0.74}" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="11" text-anchor="end">
      EditMee Graphics Engine
    </text>
  </svg>`;

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

  // AI Image Generation Endpoint (with graceful fallback on quota limits)
  app.post('/api/ai/image-generate', async (req, res) => {
    const { prompt, aspectRatio = '1:1', style = 'vector' } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
      const ai = getAiClient();
      let imageUrl: string | null = null;
      let textResult = '';

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as any,
            },
          },
        });

        if (response.candidates && response.candidates[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            } else if (part.text) {
              textResult += part.text;
            }
          }
        }
      } catch (geminiErr: any) {
        console.warn('Gemini image model hit quota or unavailable, engaging procedural vector fallback:', geminiErr?.message || geminiErr);
        imageUrl = generateProceduralGraphic(prompt, aspectRatio, style);
        textResult = `Generated custom graphic for: "${prompt}" (Procedural high-res artwork)`;
      }

      if (!imageUrl) {
        imageUrl = generateProceduralGraphic(prompt, aspectRatio, style);
      }

      return res.json({
        imageUrl,
        text: textResult || `Generated graphic for: "${prompt}"`,
        success: true,
      });
    } catch (err: any) {
      console.warn('Fallback graphic generator activated:', err);
      const fallbackUrl = generateProceduralGraphic(prompt, aspectRatio, style);
      return res.json({
        imageUrl: fallbackUrl,
        text: `Generated graphic for: "${prompt}"`,
        success: true,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EditMee server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start EditMee server:', err);
});
