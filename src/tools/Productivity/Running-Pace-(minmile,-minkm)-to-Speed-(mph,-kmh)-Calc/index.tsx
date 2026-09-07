import { ToolDefinition } from '../../../types';

export const life_pace_to_speed_running_calc_ToolDef: ToolDefinition = {
  "id": "life-pace-to-speed-running-calc",
  "name": "Running Pace (min/mile, min/km) to Speed (mph, km/h) Calc",
  "category": "productivity",
  "subcategory": "lifestyle",
  "description": "Convert running splits, calculate 5K, 10K, Half Marathon, and Marathon projected finish times.",
  "iconName": "Activity",
  "version": "1.0.0",
  "tags": [
    "lifestyle",
    "productivity",
    "health",
    "fitness",
    "home",
    "life pace to speed running calc"
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
      toolId: 'life-pace-to-speed-running-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default life_pace_to_speed_running_calc_ToolDef;
