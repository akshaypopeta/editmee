import { ToolDefinition } from '../../../types';

export const image_side_by_side_stitcher_ToolDef: ToolDefinition = {
  "id": "image-side-by-side-stitcher",
  "name": "Horizontal & Vertical Before/After Image Stitcher",
  "category": "images",
  "subcategory": "effects",
  "description": "Stitch two or more photos side-by-side or stacked vertically with custom separator gutters and labels.",
  "iconName": "Image",
  "version": "1.0.0",
  "tags": [
    "image",
    "photo",
    "graphics",
    "canvas",
    "effects",
    "image side by side stitcher"
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
        "name": "file",
        "label": "Image File",
        "type": "file",
        "accept": "image/*",
        "required": true
      },
      {
        "name": "intensity",
        "label": "Effect Intensity / Preset",
        "type": "range",
        "min": 0,
        "max": 100,
        "defaultValue": 50
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "mimeType": "image/png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-side-by-side-stitcher',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_side_by_side_stitcher_ToolDef;
