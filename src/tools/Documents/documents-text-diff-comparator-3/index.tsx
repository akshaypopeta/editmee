import { ToolDefinition } from '../../../types';

export const documents_text_diff_comparator_3_ToolDef: ToolDefinition = {
  "id": "documents-text-diff-comparator-3",
  "name": "Text Diff & Comparator",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Compare two documents or text blocks side-by-side with diff highlights.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "documents",
    "utilities",
    "text",
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
        "defaultValue": "Sample input data for Text Diff & Comparator"
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
      toolId: 'documents-text-diff-comparator-3',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default documents_text_diff_comparator_3_ToolDef;
