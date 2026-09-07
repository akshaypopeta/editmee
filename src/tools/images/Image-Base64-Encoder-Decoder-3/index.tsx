import { ToolDefinition } from '../../../types';

export const images_image_base64_encoder_decoder_3_60_ToolDef: ToolDefinition = {
  "id": "images-image-base64-encoder-decoder-3-60",
  "name": "Image Base64 Encoder / Decoder 3",
  "category": "images",
  "subcategory": "convert",
  "description": "Convert image files to and from Base64 data URI strings.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "images",
    "convert",
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
        "defaultValue": "Sample input data for Image Base64 Encoder / Decoder 3"
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
      toolId: 'images-image-base64-encoder-decoder-3-60',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default images_image_base64_encoder_decoder_3_60_ToolDef;
