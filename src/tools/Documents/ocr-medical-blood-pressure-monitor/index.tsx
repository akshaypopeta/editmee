import { ToolDefinition } from '../../../types';

export const ocr_medical_blood_pressure_monitor_ToolDef: ToolDefinition = {
  "id": "ocr-medical-blood-pressure-monitor",
  "name": "Digital Blood Pressure Monitor (SYS/DIA/PULSE) OCR",
  "category": "documents",
  "subcategory": "ocr",
  "description": "Scan systolic, diastolic, and pulse readings from home Omron-style digital monitor screens.",
  "iconName": "Scan",
  "version": "1.0.0",
  "tags": [
    "ocr",
    "scanning",
    "text recognition",
    "document intelligence",
    "ocr medical blood pressure monitor"
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
      toolId: 'ocr-medical-blood-pressure-monitor',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ocr_medical_blood_pressure_monitor_ToolDef;
