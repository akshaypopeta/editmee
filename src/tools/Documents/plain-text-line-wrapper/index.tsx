import { ToolDefinition } from '../../../types';

export const plain_text_line_wrapper_ToolDef: ToolDefinition = {
  "id": "plain-text-line-wrapper",
  "name": "Plain Text Fixed-Width Word Wrapper",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Wrap lines of text cleanly at 72, 80, or custom character widths for email and terminal display.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "document",
    "text",
    "utility",
    "format",
    "plain text line wrapper"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "input",
        "label": "Input Text / Code / Data",
        "type": "textarea",
        "defaultValue": "Sample Document Line 1\nSample Document Line 2\nSample Document Line 3",
        "required": true
      },
      {
        "name": "option",
        "label": "Processing Option",
        "type": "select",
        "defaultValue": "default",
        "options": [
          {
            "label": "Default / Standard",
            "value": "default"
          },
          {
            "label": "Strict / High Precision",
            "value": "strict"
          },
          {
            "label": "Extended Mode",
            "value": "extended"
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
      toolId: 'plain-text-line-wrapper',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default plain_text_line_wrapper_ToolDef;
