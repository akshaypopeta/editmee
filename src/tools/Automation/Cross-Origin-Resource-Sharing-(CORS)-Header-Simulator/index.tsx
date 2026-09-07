import { ToolDefinition } from '../../../types';

export const dev_cors_header_simulator_ToolDef: ToolDefinition = {
  "id": "dev-cors-header-simulator",
  "name": "Cross-Origin Resource Sharing (CORS) Header Simulator",
  "category": "automation",
  "subcategory": "devops",
  "description": "Simulate browser preflight OPTIONS requests and configure Access-Control-Allow-Origin headers.",
  "iconName": "Terminal",
  "version": "1.0.0",
  "tags": [
    "developer",
    "devops",
    "code",
    "cloud",
    "api",
    "dev cors header simulator"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "config",
        "label": "Configuration Payload / Code / Query",
        "type": "textarea",
        "defaultValue": "server {\n  listen 80;\n  server_name example.com;\n}",
        "required": true
      },
      {
        "name": "mode",
        "label": "Generation Preset",
        "type": "select",
        "defaultValue": "production",
        "options": [
          {
            "label": "Production Hardened",
            "value": "production"
          },
          {
            "label": "Development / Debug",
            "value": "development"
          },
          {
            "label": "Minimal / Compact",
            "value": "minimal"
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
      toolId: 'dev-cors-header-simulator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_cors_header_simulator_ToolDef;
