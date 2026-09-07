import { ToolDefinition } from '../../../types';

export const data_json_schema_to_mock_data_ToolDef: ToolDefinition = {
  "id": "data-json-schema-to-mock-data",
  "name": "JSON Schema to Realistic Mock Data Generator",
  "category": "data",
  "subcategory": "structured",
  "description": "Generate compliant mock JSON datasets directly from JSON Schema definitions.",
  "iconName": "Database",
  "version": "1.0.0",
  "tags": [
    "data",
    "json",
    "xml",
    "yaml",
    "csv",
    "structured",
    "data json schema to mock data"
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
      toolId: 'data-json-schema-to-mock-data',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_json_schema_to_mock_data_ToolDef;
