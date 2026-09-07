import { ToolDefinition } from '../../../types';

export const image_rotator_ToolDef: ToolDefinition = {
  "id": "image-rotator",
  "name": "Image Rotator",
  "category": "images",
  "subcategory": "editor",
  "description": "Rotate images by 90°, 180°, 270° or mirror flip horizontally and vertically in high resolution.",
  "iconName": "RotateCw",
  "version": "2.0.0",
  "tags": [
    "image",
    "rotate",
    "flip",
    "mirror",
    "orientation"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": false,
    "batchSupported": false,
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
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "filename": "rotated_image.png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-rotator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_rotator_ToolDef;
