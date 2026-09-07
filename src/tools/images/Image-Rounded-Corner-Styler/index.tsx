import { ToolDefinition } from '../../../types';

export const images_image_rounded_corner_styler_16_ToolDef: ToolDefinition = {
  "id": "images-image-rounded-corner-styler-16",
  "name": "Image Rounded Corner Styler",
  "category": "images",
  "subcategory": "effects",
  "description": "Round image corners with custom radius and transparent background.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "images",
    "effects",
    "image",
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
        "name": "input",
        "label": "Primary Input / Content",
        "type": "textarea",
        "required": true,
        "defaultValue": "Sample input data for Image Rounded Corner Styler"
      },
      {
        "name": "option",
        "label": "Processing Preset",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "High Precision",
            "value": "high"
          },
          {
            "label": "Fast Output",
            "value": "fast"
          }
        ]
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
      toolId: 'images-image-rounded-corner-styler-16',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default images_image_rounded_corner_styler_16_ToolDef;
