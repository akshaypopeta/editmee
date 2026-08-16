import { ToolDefinition, ToolResult } from '../../types';
import { DataEngine } from '../../core/data-engine/DataEngine';
import { FileEngine } from '../../core/file-engine/FileEngine';
import { CsvStudioTool } from './CsvStudioTool';

export const csvStudioToolDef: ToolDefinition = {
  id: 'csv-studio',
  name: 'Data & CSV Studio',
  description: 'The Flagship tabular dataset workspace: interactive table viewer, sorting, filtering, statistics, deduplication, JSON/CSV exports, and AI queries.',
  category: 'data',
  subcategory: 'editor',
  iconName: 'FileSpreadsheet',
  version: '2.0.0',
  tags: ['csv', 'table', 'data', 'spreadsheet', 'json', 'analytics', 'flagship'],
  executionMode: 'client',
  supportsBatch: false,
  supportsWorkflow: false,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: false,
    workflowSupported: false,
    aiPowered: true,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'CSV/TSV File', type: 'file', accept: '.csv,.tsv,.txt', required: true },
    ],
  },
  outputSchema: {
    type: 'text',
    filename: 'data_analysis.csv',
  },
  customWorkspace: CsvStudioTool,
  execute: async (input: any): Promise<ToolResult> => {
    return {
      success: true,
      filename: input.file?.name || 'dataset.csv',
    };
  },
};

export const csvToJsonToolDef: ToolDefinition = {
  id: 'csv-to-json',
  name: 'CSV to JSON Converter',
  description: 'Convert CSV tabular data or files into cleanly indented JSON arrays.',
  category: 'data',
  subcategory: 'convert',
  iconName: 'FileJson',
  version: '1.0.0',
  tags: ['csv', 'json', 'convert', 'parser'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'CSV File (Optional)', type: 'file', accept: '.csv,.txt' },
      { name: 'csvText', label: 'Or Paste CSV Content', type: 'textarea', placeholder: 'name,age,city\nAlice,28,New York' },
    ],
  },
  outputSchema: {
    type: 'json',
    filename: 'converted.json',
  },
  execute: async (input: any): Promise<ToolResult> => {
    let text = input.csvText || '';
    if (input.file) {
      text = await FileEngine.readAsText(input.file);
    }
    if (!text.trim()) return { success: false, error: 'Please upload a CSV file or paste CSV text' };

    const { rows } = DataEngine.parseCsv(text);
    const jsonStr = DataEngine.exportToJson(rows);
    const blob = new Blob([jsonStr], { type: 'application/json' });

    return {
      success: true,
      text: jsonStr,
      blob,
      filename: 'data.json',
    };
  },
};

export const jsonToCsvToolDef: ToolDefinition = {
  id: 'json-to-csv',
  name: 'JSON to CSV Converter',
  description: 'Convert JSON object arrays into structured CSV spreadsheets.',
  category: 'data',
  subcategory: 'convert',
  iconName: 'FileSpreadsheet',
  version: '1.0.0',
  tags: ['json', 'csv', 'convert', 'export'],
  executionMode: 'client',
  supportsBatch: true,
  supportsWorkflow: true,
  requiresAI: false,
  capabilities: {
    clientSide: true,
    workerSupported: true,
    batchSupported: true,
    workflowSupported: true,
    aiPowered: false,
    offlineReady: true,
    requiresKey: false,
  },
  inputSchema: {
    fields: [
      { name: 'file', label: 'JSON File (Optional)', type: 'file', accept: '.json' },
      { name: 'jsonText', label: 'Or Paste JSON Content', type: 'textarea', placeholder: '[{"id": 1, "name": "Item"}]' },
    ],
  },
  outputSchema: {
    type: 'text',
    filename: 'converted.csv',
  },
  execute: async (input: any): Promise<ToolResult> => {
    let text = input.jsonText || '';
    if (input.file) {
      text = await FileEngine.readAsText(input.file);
    }
    if (!text.trim()) return { success: false, error: 'Please upload a JSON file or paste JSON text' };

    try {
      const parsed = JSON.parse(text);
      const csvStr = DataEngine.jsonToCsv(parsed);
      const blob = new Blob([csvStr], { type: 'text/csv' });

      return {
        success: true,
        text: csvStr,
        blob,
        filename: 'data.csv',
      };
    } catch (e: any) {
      return { success: false, error: 'Invalid JSON format: ' + e.message };
    }
  },
};
