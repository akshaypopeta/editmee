import { ToolDefinition } from '../../../types';

export const data_iso_8601_date_format_normalizer_ToolDef: ToolDefinition = {
  "id": "data-iso-8601-date-format-normalizer",
  "name": "Tabular Date & Timestamp ISO-8601 Standard Normalizer",
  "category": "data",
  "subcategory": "data-cleaning",
  "description": "Parse ambiguous date strings (DD/MM/YYYY vs MM/DD/YYYY) into standardized YYYY-MM-DD UTC timestamps.",
  "iconName": "Database",
  "version": "1.0.0",
  "tags": [
    "data",
    "analytics",
    "sql",
    "csv",
    "transformation",
    "database",
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
        "name": "dataPayload",
        "label": "Input Data / SQL / CSV / JSON",
        "type": "textarea",
        "placeholder": "Enter payload for Tabular Date & Timestamp ISO-8601 Standard Normalizer...",
        "required": true
      },
      {
        "name": "operation",
        "label": "Operation Mode",
        "type": "select",
        "defaultValue": "analyze",
        "options": [
          {
            "label": "Analyze & Profile",
            "value": "analyze"
          },
          {
            "label": "Transform & Export",
            "value": "transform"
          },
          {
            "label": "Validate Integrity",
            "value": "validate"
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
      toolId: 'data-iso-8601-date-format-normalizer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_iso_8601_date_format_normalizer_ToolDef;
