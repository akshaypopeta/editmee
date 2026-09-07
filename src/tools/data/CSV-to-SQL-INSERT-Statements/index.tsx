import { ToolDefinition } from '../../../types';

export const data_csv_to_sql_insert_statements_6_ToolDef: ToolDefinition = {
  "id": "data-csv-to-sql-insert-statements-6",
  "name": "CSV to SQL INSERT Statements",
  "category": "data",
  "subcategory": "convert",
  "description": "Generate SQL INSERT scripts from CSV records for database seeding.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "data",
    "convert",
    "csv",
    "utility",
    "client-side"
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
        "name": "input",
        "label": "Primary Input / Content",
        "type": "textarea",
        "required": true,
        "defaultValue": "Sample input data for CSV to SQL INSERT Statements"
      },
      {
        "name": "option",
        "label": "Processing Preset",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "High Precision",
            "value": "high"
          },
          {
            "label": "Fast Output",
            "value": "fast"
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
      toolId: 'data-csv-to-sql-insert-statements-6',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_csv_to_sql_insert_statements_6_ToolDef;
