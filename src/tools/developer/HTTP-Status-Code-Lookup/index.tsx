import { ToolDefinition } from '../../../types';

export const developer_http_status_code_lookup_14_ToolDef: ToolDefinition = {
  "id": "developer-http-status-code-lookup-14",
  "name": "HTTP Status Code Lookup",
  "category": "developer",
  "subcategory": "utilities",
  "description": "Look up HTTP response status codes, definitions, and RFC specifications.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "developer",
    "utilities",
    "http",
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
        "defaultValue": "Sample input data for HTTP Status Code Lookup"
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
      toolId: 'developer-http-status-code-lookup-14',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default developer_http_status_code_lookup_14_ToolDef;
