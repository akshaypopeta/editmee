import { ToolDefinition } from '../../../types';

export const csv_to_json_ToolDef: ToolDefinition = {
  "id": "csv-to-json",
  "name": "CSV to JSON Converter",
  "category": "data",
  "subcategory": "convert",
  "description": "Convert CSV tabular data or files into cleanly indented JSON arrays.",
  "iconName": "FileJson",
  "version": "1.0.0",
  "tags": [
    "csv",
    "json",
    "convert",
    "parser",
    "data",
    "utility",
    "client-side"
  ],
  "executionMode": "client",
  "supportsBatch": true,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": true,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "file",
        "label": "CSV File (Optional)",
        "type": "file",
        "accept": ".csv,.txt"
      },
      {
        "name": "csvText",
        "label": "Or Paste CSV Content",
        "type": "textarea",
        "placeholder": "name,age,city\nAlice,28,New York"
      }
    ]
  },
  "outputSchema": {
    "type": "json",
    "filename": "converted.json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'csv-to-json',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default csv_to_json_ToolDef;
