import { ToolDefinition } from '../../../types';

export const image_watermark_ToolDef: ToolDefinition = {
  "id": "image-watermark",
  "name": "Image Watermark",
  "category": "images",
  "subcategory": "editor",
  "description": "Add custom text stamps, copyright notices, or logo overlays with diagonal tiling and alpha transparency.",
  "iconName": "Type",
  "version": "2.0.0",
  "tags": [
    "image",
    "watermark",
    "copyright",
    "stamp",
    "branding",
    "logo"
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
        "name": "text",
        "label": "Watermark Text",
        "type": "text",
        "defaultValue": "CONFIDENTIAL"
      },
      {
        "name": "opacity",
        "label": "Opacity (0.1 - 1.0)",
        "type": "range",
        "min": 0.1,
        "max": 1,
        "step": 0.05,
        "defaultValue": 0.4
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "filename": "watermarked_image.png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-watermark',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_watermark_ToolDef;
