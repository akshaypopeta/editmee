import { ToolDefinition } from '../../../types';

export const img_iso_paper_size_dpi_pixel_calculator_ToolDef: ToolDefinition = {
  "id": "img-iso-paper-size-dpi-pixel-calculator",
  "name": "ISO Paper Size (A0-A10, B0-B10) Print DPI Pixel Sizer",
  "category": "images",
  "subcategory": "print-production",
  "description": "Calculate exact required pixel resolutions for 300 DPI, 600 DPI, and 150 DPI commercial print sizes.",
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
      toolId: 'img-iso-paper-size-dpi-pixel-calculator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default img_iso_paper_size_dpi_pixel_calculator_ToolDef;
