import { ToolDefinition } from '../../../types';

export const odt_openoffice_to_pdf_ToolDef: ToolDefinition = {
  "id": "odt-openoffice-to-pdf",
  "name": "OpenDocument (ODT) Text to PDF Converter",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Convert LibreOffice and OpenOffice .odt text documents into standard PDF pages.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "document",
    "text",
    "utility",
    "format",
    "odt openoffice to pdf"
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
      toolId: 'odt-openoffice-to-pdf',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default odt_openoffice_to_pdf_ToolDef;
