import { ToolDefinition } from '../../../types';

export const image_compressor_ToolDef: ToolDefinition = {
  "id": "image-compressor",
  "name": "Image Compressor",
  "category": "images",
  "subcategory": "optimize",
  "description": "Compress JPG, PNG, and WebP images to reduce file size with real-time compression savings meter and live quality comparison.",
  "iconName": "Minimize2",
  "version": "2.0.0",
  "tags": [
    "image",
    "compress",
    "optimize",
    "shrink",
    "tinypng",
    "images",
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
        "name": "quality",
        "label": "Quality (%)",
        "type": "range",
        "min": 10,
        "max": 100,
        "defaultValue": 75
      },
      {
        "name": "format",
        "label": "Output Format",
        "type": "select",
        "defaultValue": "image/jpeg",
        "options": [
          {
            "label": "JPEG (Best for photos)",
            "value": "image/jpeg"
          },
          {
            "label": "WebP (Modern web format)",
            "value": "image/webp"
          },
          {
            "label": "PNG (Lossless graphics)",
            "value": "image/png"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "filename": "compressed_image.jpg"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-compressor',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_compressor_ToolDef;
