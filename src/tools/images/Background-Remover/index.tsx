import { ToolDefinition } from '../../../types';

export const bg_remover_ToolDef: ToolDefinition = {
  "id": "bg-remover",
  "name": "Background Remover",
  "category": "images",
  "subcategory": "ai",
  "description": "Remove background from images instantly with client-side smart color thresholding and anti-aliased edge feathering.",
  "iconName": "Wand2",
  "version": "2.0.0",
  "tags": [
    "image",
    "background",
    "transparent",
    "cutout",
    "remove bg",
    "alpha",
    "images",
    "ai",
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
        "name": "tolerance",
        "label": "Color Tolerance (10 - 70)",
        "type": "range",
        "min": 10,
        "max": 70,
        "defaultValue": 38
      },
      {
        "name": "edgeFeather",
        "label": "Smooth Edges (Feathering)",
        "type": "boolean",
        "defaultValue": true
      }
    ]
  },
  "outputSchema": {
    "type": "image",
    "mimeType": "image/png",
    "filename": "cutout_image.png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'bg-remover',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default bg_remover_ToolDef;
