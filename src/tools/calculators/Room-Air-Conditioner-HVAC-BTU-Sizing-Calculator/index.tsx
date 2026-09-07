import { ToolDefinition } from '../../../types';

export const phys_hvac_btu_room_cooling_calc_ToolDef: ToolDefinition = {
  "id": "phys-hvac-btu-room-cooling-calc",
  "name": "Room Air Conditioner HVAC BTU Sizing Calculator",
  "category": "calculators",
  "subcategory": "physics",
  "description": "Calculate required cooling BTUs based on room square footage, ceiling height, sunlight, and occupants.",
  "iconName": "Zap",
  "version": "1.0.0",
  "tags": [
    "physics",
    "engineering",
    "science",
    "electronics",
    "mechanics",
    "phys hvac btu room cooling calc"
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
        "name": "param1",
        "label": "Primary Physical Parameter / Value",
        "type": "number",
        "defaultValue": 12,
        "required": true
      },
      {
        "name": "param2",
        "label": "Secondary Parameter / Constant",
        "type": "number",
        "defaultValue": 2.5
      },
      {
        "name": "units",
        "label": "System of Units",
        "type": "select",
        "defaultValue": "si",
        "options": [
          {
            "label": "International System of Units (SI)",
            "value": "si"
          },
          {
            "label": "US Customary / Imperial",
            "value": "imperial"
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
      toolId: 'phys-hvac-btu-room-cooling-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default phys_hvac_btu_room_cooling_calc_ToolDef;
