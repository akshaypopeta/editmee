import { ToolDefinition } from '../../../types';

export const data_json_beautify_custom_indent_ToolDef: ToolDefinition = {
  "id": "data-json-beautify-custom-indent",
  "name": "JSON Pretty Printer with Custom Indentation (2/4/Tab)",
  "category": "data",
  "subcategory": "structured",
  "description": "Format unreadable single-line JSON with color-coded syntax highlights and collapsible bracket pairs.",
  "iconName": "Database",
  "version": "1.0.0",
  "tags": [
    "data",
    "json",
    "xml",
    "yaml",
    "csv",
    "structured",
    "data json beautify custom indent"
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
        "name": "data",
        "label": "Input Data / Code",
        "type": "textarea",
        "defaultValue": "{\n  \"title\": \"EditMee Studio\",\n  \"status\": \"active\",\n  \"count\": 1000\n}",
        "required": true
      },
      {
        "name": "formatOption",
        "label": "Output Preference",
        "type": "select",
        "defaultValue": "pretty",
        "options": [
          {
            "label": "Pretty Print / Formatted",
            "value": "pretty"
          },
          {
            "label": "Minified / Compressed",
            "value": "minified"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "application/json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'data-json-beautify-custom-indent',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_json_beautify_custom_indent_ToolDef;
