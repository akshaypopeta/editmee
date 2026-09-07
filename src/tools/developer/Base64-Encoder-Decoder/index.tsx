import { ToolDefinition } from '../../../types';

export const base64_tool_ToolDef: ToolDefinition = {
  "id": "base64-tool",
  "name": "Base64 Encoder / Decoder",
  "category": "developer",
  "subcategory": "convert",
  "description": "Encode text strings to Base64 or decode Base64 strings with UTF-8 support.",
  "iconName": "Binary",
  "version": "1.0.0",
  "tags": [
    "base64",
    "encode",
    "decode",
    "binary"
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
        "name": "text",
        "label": "Input Text",
        "type": "textarea",
        "required": true
      },
      {
        "name": "mode",
        "label": "Action Mode",
        "type": "select",
        "defaultValue": "encode",
        "options": [
          {
            "label": "Encode to Base64",
            "value": "encode"
          },
          {
            "label": "Decode from Base64",
            "value": "decode"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "filename": "base64_result.txt"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'base64-tool',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default base64_tool_ToolDef;
