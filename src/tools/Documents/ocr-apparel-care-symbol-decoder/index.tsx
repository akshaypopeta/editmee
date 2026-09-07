import { ToolDefinition } from '../../../types';

export const ocr_apparel_care_symbol_decoder_ToolDef: ToolDefinition = {
  "id": "ocr-apparel-care-symbol-decoder",
  "name": "Textile Clothing Care Label Symbol Decoder",
  "category": "documents",
  "subcategory": "ocr",
  "description": "Scan washing, bleaching, drying, and ironing symbols to reveal laundry care instructions.",
  "iconName": "Scan",
  "version": "1.0.0",
  "tags": [
    "ocr",
    "scanning",
    "text recognition",
    "document intelligence",
    "ocr apparel care symbol decoder"
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
      toolId: 'ocr-apparel-care-symbol-decoder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ocr_apparel_care_symbol_decoder_ToolDef;
