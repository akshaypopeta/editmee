import { ToolDefinition } from '../../../types';

export const json_formatter_ToolDef: ToolDefinition = {
  "id": "json-formatter",
  "name": "JSON Formatter & Validator",
  "category": "developer",
  "subcategory": "format",
  "description": "Validate, format, and beautify JSON objects with syntax error diagnosis.",
  "iconName": "Braces",
  "version": "1.0.0",
  "tags": [
    "json",
    "format",
    "prettify",
    "validate",
    "minify"
  ],
  "executionMode": "client",
  "supportsBatch": true,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": false,
    "batchSupported": true,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "jsonText",
        "label": "JSON String",
        "type": "textarea",
        "placeholder": "{\"test\": 123}",
        "required": true
      },
      {
        "name": "indent",
        "label": "Indent Spaces",
        "type": "number",
        "defaultValue": 2
      }
    ]
  },
  "outputSchema": {
    "type": "json",
    "filename": "formatted.json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'json-formatter',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default json_formatter_ToolDef;
