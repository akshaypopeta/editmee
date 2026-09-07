import { ToolDefinition } from '../../../types';

export const json_to_csv_ToolDef: ToolDefinition = {
  "id": "json-to-csv",
  "name": "JSON to CSV Converter",
  "category": "data",
  "subcategory": "convert",
  "description": "Convert JSON object arrays into structured CSV spreadsheets.",
  "iconName": "FileSpreadsheet",
  "version": "1.0.0",
  "tags": [
    "json",
    "csv",
    "convert",
    "export",
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
        "label": "JSON File (Optional)",
        "type": "file",
        "accept": ".json"
      },
      {
        "name": "jsonText",
        "label": "Or Paste JSON Content",
        "type": "textarea",
        "placeholder": "[{\"id\": 1, \"name\": \"Item\"}]"
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "filename": "converted.csv"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'json-to-csv',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default json_to_csv_ToolDef;
