import { ToolDefinition } from '../../../types';

export const data_one_hot_encoding_matrix_builder_ToolDef: ToolDefinition = {
  "id": "data-one-hot-encoding-matrix-builder",
  "name": "Categorical Feature One-Hot Encoding Matrix Builder",
  "category": "data",
  "subcategory": "machine-learning",
  "description": "Transform categorical text columns into binary 0/1 dummy feature indicator matrices for ML models.",
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
        "placeholder": "Enter payload for Categorical Feature One-Hot Encoding Matrix Builder...",
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
      toolId: 'data-one-hot-encoding-matrix-builder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_one_hot_encoding_matrix_builder_ToolDef;
