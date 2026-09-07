import { ToolDefinition } from '../../../types';

export const json_to_typescript_interface_ToolDef: ToolDefinition = {
  "id": "json-to-typescript-interface",
  "name": "JSON to TypeScript Interface & Type Definitions",
  "category": "documents",
  "subcategory": "developer",
  "description": "Generate strongly typed TypeScript interfaces from sample JSON API response payloads.",
  "iconName": "Code",
  "version": "1.0.0",
  "tags": [
    "json",
    "typescript",
    "types",
    "interfaces",
    "api",
    "schema"
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
        "name": "input",
        "label": "JSON Sample Payload",
        "type": "textarea",
        "defaultValue": "{\n  \"id\": 101,\n  \"title\": \"EditMee Studio\",\n  \"published\": true,\n  \"rating\": 4.95,\n  \"author\": {\n    \"name\": \"Alex\",\n    \"email\": \"alex@example.com\"\n  },\n  \"tags\": [\"pdf\", \"image\", \"tools\"]\n}",
        "required": true
      },
      {
        "name": "rootName",
        "label": "Root Interface Name",
        "type": "text",
        "defaultValue": "ApiResponse"
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
      toolId: 'json-to-typescript-interface',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default json_to_typescript_interface_ToolDef;
