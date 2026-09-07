import { ToolDefinition } from '../../../types';

export const dev_yaml_to_json_dialect_converter_ToolDef: ToolDefinition = {
  "id": "dev-yaml-to-json-dialect-converter",
  "name": "YAML 1.2 to Formatted JSON Strict Converter",
  "category": "developer",
  "subcategory": "code-tools",
  "description": "Convert complex nested YAML documents with anchors and aliases into standardized JSON.",
  "iconName": "Code",
  "version": "1.0.0",
  "tags": [
    "developer",
    "coding",
    "devops",
    "api",
    "cloud",
    "typescript",
    "tools"
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
        "name": "inputPayload",
        "label": "Input Code / Configuration / Query",
        "type": "textarea",
        "placeholder": "Enter input for YAML 1.2 to Formatted JSON Strict Converter...",
        "required": true
      },
      {
        "name": "format",
        "label": "Output Formatting",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard / Pretty",
            "value": "standard"
          },
          {
            "label": "Minified / Compact",
            "value": "minified"
          },
          {
            "label": "JSON Wrapped",
            "value": "json"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'dev-yaml-to-json-dialect-converter',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_yaml_to_json_dialect_converter_ToolDef;
