import { ToolDefinition, ToolResult } from '../../types';
import { DevEngine } from '../../core/developer-engine/DevEngine';
import { DevStudioTool } from './DevStudioTool';

export const devStudioToolDef: ToolDefinition = {
  id: 'dev-studio',
  name: 'Developer Studio',
  description: 'The Flagship developer toolkit: JSON formatter, Base64 encoder/decoder, JWT inspector, Hash generator, Regex tester, Diff checker, and UUIDs.',
  category: 'developer',
  subcategory: 'editor',
  iconName: 'Code',
  version: '2.0.0',
  tags: ['developer', 'json', 'jwt', 'base64', 'hash', 'regex', 'diff', 'uuid', 'flagship'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'input', label: 'Code or text to process', type: 'textarea' },
    ],
  },
  outputSchema: {
    type: 'text',
    filename: 'dev_output.txt',
  },
  customWorkspace: DevStudioTool,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      text: input.input || '',
    };
  },
};

export const jsonFormatterToolDef: ToolDefinition = {
  id: 'json-formatter',
  name: 'JSON Formatter & Validator',
  description: 'Validate, format, and beautify JSON objects with syntax error diagnosis.',
  category: 'developer',
  subcategory: 'format',
  iconName: 'Braces',
  version: '1.0.0',
  tags: ['json', 'format', 'prettify', 'validate', 'minify'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'jsonText', label: 'JSON String', type: 'textarea', placeholder: '{"test": 123}', required: true },
      { name: 'indent', label: 'Indent Spaces', type: 'number', defaultValue: 2 },
    ],
  },
  outputSchema: {
    type: 'json',
    filename: 'formatted.json',
  },
  execute: async (input: any): Promise<ToolResult> => {
    const res = DevEngine.formatJson(input.jsonText, Number(input.indent || 2));
    if (!res.valid) {
      return { success: false, error: res.error || 'Invalid JSON' };
    }
    const blob = new Blob([res.formatted], { type: 'application/json' });
    return {
      success: true,
      text: res.formatted,
      blob,
      filename: 'formatted.json',
    };
  },
};

export const base64ToolDef: ToolDefinition = {
  id: 'base64-tool',
  name: 'Base64 Encoder / Decoder',
  description: 'Encode text strings to Base64 or decode Base64 strings with UTF-8 support.',
  category: 'developer',
  subcategory: 'convert',
  iconName: 'Binary',
  version: '1.0.0',
  tags: ['base64', 'encode', 'decode', 'binary'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: false,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'text', label: 'Input Text', type: 'textarea', required: true },
      {
        name: 'mode',
        label: 'Action Mode',
        type: 'select',
        defaultValue: 'encode',
        options: [
          { label: 'Encode to Base64', value: 'encode' },
          { label: 'Decode from Base64', value: 'decode' },
        ],
      },
    ],
  },
  outputSchema: {
    type: 'text',
    filename: 'base64_result.txt',
  },
  execute: async (input: any): Promise<ToolResult> => {
    if (input.mode === 'encode') {
      const encoded = DevEngine.base64Encode(input.text);
      return { success: true, text: encoded };
    } else {
      const decoded = DevEngine.base64Decode(input.text);
      if (!decoded.valid) return { success: false, error: decoded.error };
      return { success: true, text: decoded.text };
    }
  },
};
