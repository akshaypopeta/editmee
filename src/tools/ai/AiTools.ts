/**
 * AI Tool definitions for EditMee
 * Covers AI Work Assistant, AI Writing Studio, AI Document Intelligence, and AI Image Tools
 */

import { ToolDefinition } from '../../types';
import { WorkAssistantWorkspace } from './WorkAssistantWorkspace';
import { AiWritingWorkspace } from './AiWritingWorkspace';
import { DocIntelligenceWorkspace } from './DocIntelligenceWorkspace';
import { AiImageWorkspace } from './AiImageWorkspace';
import { aiGateway } from '../../core/ai-gateway/AiGateway';

export const workAssistantTool: ToolDefinition = {
  id: 'ai-assistant',
  name: 'AI Work Assistant',
  category: 'ai',
  subcategory: 'assistant',
  description: 'Agentic assistant that plans, decomposes, and executes tasks using registered client-side tools.',
  iconName: 'Sparkles',
  version: '2.0.0',
  tags: ['ai', 'agent', 'assistant', 'automation', 'planner', 'tool-router'],
  executionMode: 'hybrid',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: true,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: true,
    offlineReady: false,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      {
        name: 'prompt',
        label: 'Instruction / Goal',
        type: 'textarea',
        required: true,
        placeholder: 'e.g. Generate an invoice for consulting and compress output PDF...',
      },
    ],
  },
  outputSchema: {
    type: 'json',
    mimeType: 'application/json',
  },
  customWorkspace: WorkAssistantWorkspace,
  execute: async (inputs) => {
    const prompt = inputs.prompt || 'Help with work tasks';
    const text = await aiGateway.chat({ message: prompt });
    return {
      success: true,
      data: { answer: text },
      text,
    };
  },
};

export const aiWritingTool: ToolDefinition = {
  id: 'ai-writing',
  name: 'AI Writing & Content Studio',
  category: 'ai',
  subcategory: 'writing',
  description: 'Enterprise copywriter for technical specs, executive briefings, ATS resume profiles, and billing memos.',
  iconName: 'PenTool',
  version: '2.0.0',
  tags: ['ai', 'writing', 'copywriting', 'resume', 'proposal', 'spec', 'sql'],
  executionMode: 'hybrid',
  supportsBatch: false,
  supportsWorkflow: true,
  requiresAI: true,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: true,
    aiPowered: true,
    offlineReady: false,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      {
        name: 'prompt',
        label: 'Instruction / Topic',
        type: 'textarea',
        required: true,
        placeholder: 'e.g. Draft an executive briefing on system performance...',
      },
      {
        name: 'sourceText',
        label: 'Source Text to Rewrite/Summarize',
        type: 'textarea',
        required: false,
      },
      {
        name: 'tone',
        label: 'Tone',
        type: 'select',
        required: false,
        defaultValue: 'executive',
        options: [
          { label: 'Executive', value: 'executive' },
          { label: 'Formal Business', value: 'formal' },
          { label: 'Concise', value: 'concise' },
          { label: 'Technical', value: 'technical' },
          { label: 'Persuasive', value: 'persuasive' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'text',
    mimeType: 'text/markdown',
  },
  customWorkspace: AiWritingWorkspace,
  execute: async (inputs) => {
    const prompt = inputs.prompt || 'Draft content';
    const result = await aiGateway.generate({
      prompt: `${prompt}\n${inputs.sourceText ? `\nContext:\n${inputs.sourceText}` : ''}`,
      systemInstruction: `Tone: ${inputs.tone || 'executive'}. Generate concise, high-impact enterprise copy.`,
    });
    return {
      success: true,
      text: result,
      data: { content: result },
    };
  },
};

export const aiDocIntelTool: ToolDefinition = {
  id: 'ai-doc-intel',
  name: 'AI Document Intelligence',
  category: 'ai',
  subcategory: 'extraction',
  description: 'Multimodal entity extraction and structured data parsing for invoices, receipts, contracts, and resumes.',
  iconName: 'FileSearch',
  version: '2.0.0',
  tags: ['ai', 'document', 'ocr', 'invoice', 'contract', 'resume', 'extraction'],
  executionMode: 'hybrid',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: true,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: true,
    offlineReady: false,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      {
        name: 'documentText',
        label: 'Document Text',
        type: 'textarea',
        required: false,
      },
      {
        name: 'taskType',
        label: 'Extraction Target',
        type: 'select',
        required: false,
        defaultValue: 'invoice',
        options: [
          { label: 'Invoice / Receipt', value: 'invoice' },
          { label: 'Contract & MSA', value: 'contract' },
          { label: 'Resume & CV', value: 'resume' },
          { label: 'Executive Summary', value: 'summary' },
          { label: 'Semantic Q&A', value: 'qa' },
        ],
      },
      {
        name: 'query',
        label: 'Custom Query (for Q&A)',
        type: 'text',
        required: false,
      },
    ],
  },
  outputSchema: {
    type: 'json',
    mimeType: 'application/json',
  },
  customWorkspace: DocIntelligenceWorkspace,
  execute: async (inputs) => {
    const result = await aiGateway.analyzeDocument({
      documentText: inputs.documentText,
      taskType: inputs.taskType || 'invoice',
      query: inputs.query,
    });
    return {
      success: true,
      text: result,
      data: { analysis: result },
    };
  },
};

export const aiImageGeneratorTool: ToolDefinition = {
  id: 'ai-image-generator',
  name: 'AI Image & Vector Generator',
  category: 'ai',
  subcategory: 'graphics',
  description: 'Synthesizes graphics, vector icons, UI assets, and marketing visuals with high fidelity.',
  iconName: 'Image',
  version: '2.0.0',
  tags: ['ai', 'image', 'generator', 'vector', 'art', 'asset', 'graphic'],
  executionMode: 'hybrid',
  supportsBatch: false,
  supportsWorkflow: true,
  requiresAI: true,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: true,
    aiPowered: true,
    offlineReady: false,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      {
        name: 'prompt',
        label: 'Image Description',
        type: 'textarea',
        required: true,
        placeholder: 'e.g. Minimalist vector icon of a secure server...',
      },
      {
        name: 'aspectRatio',
        label: 'Aspect Ratio',
        type: 'select',
        required: false,
        defaultValue: '1:1',
        options: [
          { label: '1:1 (Square)', value: '1:1' },
          { label: '16:9 (Landscape)', value: '16:9' },
          { label: '9:16 (Story)', value: '9:16' },
          { label: '4:3 (Standard)', value: '4:3' },
          { label: '3:4 (Portrait)', value: '3:4' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'image',
    mimeType: 'image/png',
  },
  customWorkspace: AiImageWorkspace,
  execute: async (inputs) => {
    const prompt = inputs.prompt || 'Generated graphic';
    const result = await aiGateway.generateImage(prompt, inputs.aspectRatio || '1:1');
    return {
      success: true,
      text: result.text || `Generated image for "${prompt}"`,
      data: { imageUrl: result.imageUrl },
    };
  },
};

export const allAiTools: ToolDefinition[] = [
  workAssistantTool,
  aiWritingTool,
  aiDocIntelTool,
  aiImageGeneratorTool,
];
