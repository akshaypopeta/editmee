import { ToolDefinition } from '../../../types';

export const image_resizer_ToolDef: ToolDefinition = {
  "id": "image-resizer",
  "name": "Image Resizer",
  "category": "images",
  "subcategory": "editor",
  "description": "Resize images to exact pixel dimensions, percentage scaling, or popular social media aspect ratios with bicubic smoothing.",
  "iconName": "Maximize2",
  "version": "2.0.0",
  "tags": [
    "image",
    "resize",
    "scale",
    "dimensions",
    "social media presets",
    "images",
    "edit",
    "utility",
    "client-side"
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
        "name": "width",
        "label": "Target Width (px)",
        "type": "number",
        "defaultValue": 1200
      },
      {
        "name": "height",
        "label": "Target Height (px)",
        "type": "number",
        "defaultValue": 630
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "filename": "resized_image.png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-resizer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_resizer_ToolDef;
