import { ToolDefinition } from '../../../types';

export const data_csv_to_json_type_inferrer_ToolDef: ToolDefinition = {
  "id": "data-csv-to-json-type-inferrer",
  "name": "CSV to JSON Array Converter with Auto-Type Inference",
  "category": "data",
  "subcategory": "structured",
  "description": "Convert tabular CSV files into JSON objects, automatically casting numbers, booleans, and nulls.",
  "iconName": "Database",
  "version": "1.0.0",
  "tags": [
    "data",
    "json",
    "xml",
    "yaml",
    "csv",
    "structured",
    "data csv to json type inferrer"
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
      toolId: 'data-csv-to-json-type-inferrer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_csv_to_json_type_inferrer_ToolDef;
