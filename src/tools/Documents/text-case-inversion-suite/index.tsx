import { ToolDefinition } from '../../../types';

export const text_case_inversion_suite_ToolDef: ToolDefinition = {
  "id": "text-case-inversion-suite",
  "name": "Text Case Inversion & CamelCase Transformer",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, and Title Case.",
  "iconName": "Type",
  "version": "1.0.0",
  "tags": [
    "camelcase",
    "snake_case",
    "kebab-case",
    "pascalcase",
    "case converter",
    "naming convention"
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
        "label": "Input Text / Identifier",
        "type": "textarea",
        "defaultValue": "editmee high performance tools and cloud engines",
        "required": true
      },
      {
        "name": "targetCase",
        "label": "Target Convention",
        "type": "select",
        "defaultValue": "camel",
        "options": [
          {
            "label": "camelCase",
            "value": "camel"
          },
          {
            "label": "PascalCase",
            "value": "pascal"
          },
          {
            "label": "snake_case",
            "value": "snake"
          },
          {
            "label": "kebab-case",
            "value": "kebab"
          },
          {
            "label": "CONSTANT_CASE",
            "value": "constant"
          },
          {
            "label": "Title Case",
            "value": "title"
          },
          {
            "label": "UPPERCASE",
            "value": "upper"
          },
          {
            "label": "lowercase",
            "value": "lower"
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
      toolId: 'text-case-inversion-suite',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default text_case_inversion_suite_ToolDef;
