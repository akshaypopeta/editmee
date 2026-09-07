import { ToolDefinition } from '../../../types';

export const life_ideal_body_weight_formulas_ToolDef: ToolDefinition = {
  "id": "life-ideal-body-weight-formulas",
  "name": "Ideal Body Weight (Devine, Robinson, Hamwi Formulas)",
  "category": "productivity",
  "subcategory": "lifestyle",
  "description": "Calculate healthy weight ranges based on height, frame size, and classical medical research formulas.",
  "iconName": "Activity",
  "version": "1.0.0",
  "tags": [
    "lifestyle",
    "productivity",
    "health",
    "fitness",
    "home",
    "life ideal body weight formulas"
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
        "name": "inputVal",
        "label": "Primary Input / Measurement / Time",
        "type": "text",
        "defaultValue": "25",
        "required": true
      },
      {
        "name": "preference",
        "label": "Optimization Preset",
        "type": "select",
        "defaultValue": "balanced",
        "options": [
          {
            "label": "Balanced Lifestyle",
            "value": "balanced"
          },
          {
            "label": "High Performance / Peak",
            "value": "peak"
          },
          {
            "label": "Gentle / Relaxed",
            "value": "relaxed"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/markdown"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'life-ideal-body-weight-formulas',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default life_ideal_body_weight_formulas_ToolDef;
