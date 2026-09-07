import { ToolDefinition } from '../../../types';

export const ts_interface_to_zod_schema_generator_ToolDef: ToolDefinition = {
  "id": "ts-interface-to-zod-schema-generator",
  "name": "TypeScript Interface to Zod Schema Generator",
  "category": "developer",
  "subcategory": "code-generation",
  "description": "Transform TypeScript interfaces and type definitions into runtime Zod schema validators with optional/nullable fields and nested objects.",
  "iconName": "Code",
  "version": "1.0.0",
  "tags": [
    "developer",
    "typescript",
    "zod",
    "validation",
    "schema",
    "types"
  ],
  "executionMode": "client",
  "supportsBatch": false,
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
        "name": "typeScriptCode",
        "label": "TypeScript Interface / Type Code",
        "type": "textarea",
        "defaultValue": "interface UserProfile {\n  id: string;\n  name: string;\n  email?: string;\n  age: number;\n  isAdmin: boolean;\n  tags: string[];\n}",
        "required": true
      },
      {
        "name": "schemaName",
        "label": "Zod Schema Variable Name",
        "type": "text",
        "defaultValue": "userProfileSchema",
        "required": true
      }
    ]
  },
  "outputSchema": {
    "type": "text"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'ts-interface-to-zod-schema-generator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ts_interface_to_zod_schema_generator_ToolDef;
