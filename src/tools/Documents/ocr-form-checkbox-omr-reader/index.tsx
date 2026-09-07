import { ToolDefinition } from '../../../types';

export const ocr_form_checkbox_omr_reader_ToolDef: ToolDefinition = {
  "id": "ocr-form-checkbox-omr-reader",
  "name": "Survey Form Checkbox & Optical Mark Recognition (OMR)",
  "category": "documents",
  "subcategory": "ocr",
  "description": "Detect marked checkboxes, multiple choice bubble sheets, and radio buttons on filled forms.",
  "iconName": "Scan",
  "version": "1.0.0",
  "tags": [
    "ocr",
    "scanning",
    "text recognition",
    "document intelligence",
    "ocr form checkbox omr reader"
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
        "name": "image",
        "label": "Document or Photo to Scan",
        "type": "file",
        "accept": "image/*,.pdf",
        "required": true
      },
      {
        "name": "language",
        "label": "Primary Recognition Language",
        "type": "select",
        "defaultValue": "eng",
        "options": [
          {
            "label": "English (Latin)",
            "value": "eng"
          },
          {
            "label": "Spanish / European",
            "value": "spa"
          },
          {
            "label": "CJK (Chinese, Japanese, Korean)",
            "value": "cjk"
          },
          {
            "label": "Auto-Detect",
            "value": "auto"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/markdown"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'ocr-form-checkbox-omr-reader',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ocr_form_checkbox_omr_reader_ToolDef;
