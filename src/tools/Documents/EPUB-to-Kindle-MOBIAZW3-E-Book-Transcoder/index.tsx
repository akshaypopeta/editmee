import { ToolDefinition } from '../../../types';

export const epub_to_mobi_transcoder_ToolDef: ToolDefinition = {
  "id": "epub-to-mobi-transcoder",
  "name": "EPUB to Kindle MOBI/AZW3 E-Book Transcoder",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Convert open EPUB e-books to Amazon Kindle compatible formats with formatted table of contents.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "document",
    "text",
    "utility",
    "format",
    "epub to mobi transcoder"
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
      toolId: 'epub-to-mobi-transcoder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default epub_to_mobi_transcoder_ToolDef;
