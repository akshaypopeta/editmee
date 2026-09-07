import { ToolDefinition } from '../../../types';

export const life_intermittent_fasting_tracker_ToolDef: ToolDefinition = {
  "id": "life-intermittent-fasting-tracker",
  "name": "Intermittent Fasting (16:8, 18:6, 20:4, OMAD) Tracker",
  "category": "productivity",
  "subcategory": "lifestyle",
  "description": "Track active fasting windows, autophagy stages, and receive notifications when eating windows open.",
  "iconName": "Activity",
  "version": "1.0.0",
  "tags": [
    "lifestyle",
    "productivity",
    "health",
    "fitness",
    "home",
    "life intermittent fasting tracker"
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
      toolId: 'life-intermittent-fasting-tracker',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default life_intermittent_fasting_tracker_ToolDef;
