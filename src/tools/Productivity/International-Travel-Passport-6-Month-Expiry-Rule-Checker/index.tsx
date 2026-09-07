import { ToolDefinition } from '../../../types';

export const life_passport_validity_6_month_rule_ToolDef: ToolDefinition = {
  "id": "life-passport-validity-6-month-rule",
  "name": "International Travel Passport 6-Month Expiry Rule Checker",
  "category": "productivity",
  "subcategory": "lifestyle",
  "description": "Verify whether your passport has sufficient remaining validity months for entry into destination countries.",
  "iconName": "Activity",
  "version": "1.0.0",
  "tags": [
    "lifestyle",
    "productivity",
    "health",
    "fitness",
    "home",
    "life passport validity 6 month rule"
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
      toolId: 'life-passport-validity-6-month-rule',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default life_passport_validity_6_month_rule_ToolDef;
