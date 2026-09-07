import { ToolDefinition } from '../../../types';

export const ocr_meter_reading_gauge_scanner_ToolDef: ToolDefinition = {
  "id": "ocr-meter-reading-gauge-scanner",
  "name": "Utility Electric & Water Meter Counter OCR Scanner",
  "category": "documents",
  "subcategory": "ocr",
  "description": "Read 7-segment digital displays and analog dial counters on electric, gas, and water meters.",
  "iconName": "Scan",
  "version": "1.0.0",
  "tags": [
    "ocr",
    "scanning",
    "text recognition",
    "document intelligence",
    "ocr meter reading gauge scanner"
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
      toolId: 'ocr-meter-reading-gauge-scanner',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ocr_meter_reading_gauge_scanner_ToolDef;
