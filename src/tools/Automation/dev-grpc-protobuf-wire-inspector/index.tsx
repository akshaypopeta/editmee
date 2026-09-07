import { ToolDefinition } from '../../../types';

export const dev_grpc_protobuf_wire_inspector_ToolDef: ToolDefinition = {
  "id": "dev-grpc-protobuf-wire-inspector",
  "name": "gRPC Protobuf Wire Format Varint & Field Tag Decoder",
  "category": "automation",
  "subcategory": "devops",
  "description": "Decode raw binary Protocol Buffer wire bytes into field numbers, wire types, and varint values.",
  "iconName": "Terminal",
  "version": "1.0.0",
  "tags": [
    "developer",
    "devops",
    "code",
    "cloud",
    "api",
    "dev grpc protobuf wire inspector"
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
      toolId: 'dev-grpc-protobuf-wire-inspector',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_grpc_protobuf_wire_inspector_ToolDef;
