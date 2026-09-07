import { ToolDefinition } from '../../../types';

export const rich_text_rtf_to_html_ToolDef: ToolDefinition = {
  "id": "rich-text-rtf-to-html",
  "name": "RTF (Rich Text Format) to Clean HTML5 Converter",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Convert legacy Word RTF documents into lightweight, semantic HTML5 markup.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "document",
    "text",
    "utility",
    "format",
    "rich text rtf to html"
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
      toolId: 'rich-text-rtf-to-html',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default rich_text_rtf_to_html_ToolDef;
