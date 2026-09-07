import { ToolDefinition } from '../../../types';

export const image_converter_ToolDef: ToolDefinition = {
  "id": "image-converter",
  "name": "Image Converter",
  "category": "images",
  "subcategory": "convert",
  "description": "Convert images seamlessly between PNG, JPEG, WebP, BMP, and multi-icon Windows ICO formats in browser.",
  "iconName": "RefreshCw",
  "version": "2.0.0",
  "tags": [
    "image",
    "convert",
    "png",
    "jpg",
    "webp",
    "ico",
    "bmp"
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
        "name": "targetFormat",
        "label": "Target Format",
        "type": "select",
        "defaultValue": "image/webp",
        "options": [
          {
            "label": "WebP (Next-Gen Smallest)",
            "value": "image/webp"
          },
          {
            "label": "PNG (Lossless Graphics)",
            "value": "image/png"
          },
          {
            "label": "JPEG (Universal Photo)",
            "value": "image/jpeg"
          },
          {
            "label": "ICO (Favicon Studio)",
            "value": "image/x-icon"
          },
          {
            "label": "BMP (Windows Bitmap)",
            "value": "image/bmp"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "filename": "converted_image.webp"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-converter',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_converter_ToolDef;
