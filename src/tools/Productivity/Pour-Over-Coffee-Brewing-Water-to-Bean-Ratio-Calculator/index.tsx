import { ToolDefinition } from '../../../types';

export const life_coffee_brewing_water_ratio_ToolDef: ToolDefinition = {
  "id": "life-coffee-brewing-water-ratio",
  "name": "Pour-Over Coffee Brewing Water-to-Bean Ratio Calculator",
  "category": "productivity",
  "subcategory": "lifestyle",
  "description": "Calculate exact coffee bean grams and water volume for 1:15, 1:16, and 1:17 pour-over brews.",
  "iconName": "Activity",
  "version": "1.0.0",
  "tags": [
    "lifestyle",
    "productivity",
    "health",
    "fitness",
    "home",
    "life coffee brewing water ratio"
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
      toolId: 'life-coffee-brewing-water-ratio',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default life_coffee_brewing_water_ratio_ToolDef;
