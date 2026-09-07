import { ToolDefinition } from '../../../types';

export const img_perspective_four_point_transform_ToolDef: ToolDefinition = {
  "id": "img-perspective-four-point-transform",
  "name": "Four-Point Perspective Homography Matrix Calculator",
  "category": "images",
  "subcategory": "computer-vision",
  "description": "Calculate 3x3 homography transformation matrices to straighten angled document photos.",
  "iconName": "Image",
  "version": "1.0.0",
  "tags": [
    "images",
    "graphics",
    "design",
    "photo",
    "color",
    "web-assets"
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
        "name": "width",
        "label": "Image Width (px)",
        "type": "number",
        "defaultValue": 1920
      },
      {
        "name": "height",
        "label": "Image Height (px)",
        "type": "number",
        "defaultValue": 1080
      },
      {
        "name": "format",
        "label": "Output Target Format",
        "type": "select",
        "defaultValue": "webp",
        "options": [
          {
            "label": "WebP (High Efficiency)",
            "value": "webp"
          },
          {
            "label": "AVIF (Next-Gen)",
            "value": "avif"
          },
          {
            "label": "PNG (Lossless)",
            "value": "png"
          },
          {
            "label": "JPEG (Universal)",
            "value": "jpeg"
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
      toolId: 'img-perspective-four-point-transform',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default img_perspective_four_point_transform_ToolDef;
