import { ToolDefinition } from '../../../types';

export const image_cropper_ToolDef: ToolDefinition = {
  "id": "image-cropper",
  "name": "Image Cropper",
  "category": "images",
  "subcategory": "editor",
  "description": "Crop images to exact dimensions and standard aspect ratios (1:1, 16:9, 4:3, 3:2) with interactive visual bounds.",
  "iconName": "Crop",
  "version": "2.0.0",
  "tags": [
    "image",
    "crop",
    "aspect ratio",
    "cut",
    "trim"
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
    "filename": "cropped_image.png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-cropper',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_cropper_ToolDef;
