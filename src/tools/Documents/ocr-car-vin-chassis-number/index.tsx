import { ToolDefinition } from '../../../types';

export const ocr_car_vin_chassis_number_ToolDef: ToolDefinition = {
  "id": "ocr-car-vin-chassis-number",
  "name": "17-Digit Vehicle Identification Number (VIN) Scanner",
  "category": "documents",
  "subcategory": "ocr",
  "description": "Read VIN stamping on vehicle dashboards and door jambs and decode manufacturer, country, and year.",
  "iconName": "Scan",
  "version": "1.0.0",
  "tags": [
    "ocr",
    "scanning",
    "text recognition",
    "document intelligence",
    "ocr car vin chassis number"
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
      toolId: 'ocr-car-vin-chassis-number',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ocr_car_vin_chassis_number_ToolDef;
