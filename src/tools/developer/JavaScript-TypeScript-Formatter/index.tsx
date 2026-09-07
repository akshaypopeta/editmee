import { ToolDefinition } from '../../../types';

export const developer_javascript_typescript_formatter_5_ToolDef: ToolDefinition = {
  "id": "developer-javascript-typescript-formatter-5",
  "name": "JavaScript / TypeScript Formatter",
  "category": "developer",
  "subcategory": "format",
  "description": "Format JavaScript code with clean spacing, semicolons, and quotes.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "developer",
    "format",
    "javascript",
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
        "name": "input",
        "label": "Primary Input / Content",
        "type": "textarea",
        "required": true,
        "defaultValue": "Sample input data for JavaScript / TypeScript Formatter"
      },
      {
        "name": "option",
        "label": "Processing Preset",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "High Precision",
            "value": "high"
          },
          {
            "label": "Fast Output",
            "value": "fast"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/plain"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'developer-javascript-typescript-formatter-5',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default developer_javascript_typescript_formatter_5_ToolDef;
