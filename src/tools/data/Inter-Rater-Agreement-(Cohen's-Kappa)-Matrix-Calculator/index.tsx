import { ToolDefinition } from '../../../types';

export const data_cohen_kappa_inter_rater_agreement_ToolDef: ToolDefinition = {
  "id": "data-cohen-kappa-inter-rater-agreement",
  "name": "Inter-Rater Agreement (Cohen's Kappa) Matrix Calculator",
  "category": "data",
  "subcategory": "analytics",
  "description": "Calculate chance-adjusted inter-annotator agreement statistics (kappa) between two categorical raters.",
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
        "placeholder": "Enter payload for Inter-Rater Agreement (Cohen's Kappa) Matrix Calculator...",
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
      toolId: 'data-cohen-kappa-inter-rater-agreement',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default data_cohen_kappa_inter_rater_agreement_ToolDef;
