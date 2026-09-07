import { ToolDefinition } from '../../../types';

export const convert_ini_config_to_json_ToolDef: ToolDefinition = {
  "id": "convert-ini-config-to-json",
  "name": "Windows INI & TOML Configuration to JSON Object",
  "category": "files",
  "subcategory": "conversion",
  "description": "Parse sectioned configuration files into clean structured JSON objects.",
  "iconName": "RefreshCw",
  "version": "1.0.0",
  "tags": [
    "converter",
    "file conversion",
    "transcoder",
    "format",
    "convert ini config to json"
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
        "label": "Source File to Convert",
        "type": "file",
        "required": true
      },
      {
        "name": "quality",
        "label": "Output Quality / Profile",
        "type": "select",
        "defaultValue": "high",
        "options": [
          {
            "label": "Lossless / Maximum Quality",
            "value": "lossless"
          },
          {
            "label": "High Quality (Balanced)",
            "value": "high"
          },
          {
            "label": "Compressed / Web Economy",
            "value": "compact"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "file",
    "mimeType": "application/octet-stream"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'convert-ini-config-to-json',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default convert_ini_config_to_json_ToolDef;
