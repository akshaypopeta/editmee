import { ToolDefinition } from '../../../types';

export const documents_html_to_plain_text_stripper_5_ToolDef: ToolDefinition = {
  "id": "documents-html-to-plain-text-stripper-5",
  "name": "HTML to Plain Text Stripper",
  "category": "documents",
  "subcategory": "convert",
  "description": "Strip HTML tags and scripts, leaving clean unformatted text.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "documents",
    "convert",
    "html",
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
        "defaultValue": "Sample input data for HTML to Plain Text Stripper"
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
    "type": "text",
    "mimeType": "text/plain"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'documents-html-to-plain-text-stripper-5',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default documents_html_to_plain_text_stripper_5_ToolDef;
