import { ToolDefinition } from '../../../types';

export const image_annotator_ToolDef: ToolDefinition = {
  "id": "image-annotator",
  "name": "Image Annotator",
  "category": "images",
  "subcategory": "editor",
  "description": "Draw arrows, shapes, step badges, text labels, and apply censor redactions (pixelation or blur) to photos.",
  "iconName": "PenTool",
  "version": "2.0.0",
  "tags": [
    "image",
    "annotate",
    "markup",
    "censor",
    "redact",
    "arrow",
    "blur",
    "pixelate"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": false,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": false,
    "workflowSupported": false,
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
    "filename": "annotated_image.png"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'image-annotator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default image_annotator_ToolDef;
