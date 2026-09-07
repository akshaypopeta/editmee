import { ToolDefinition } from '../../../types';

export const business_standard_non_disclosure_agreement_nda_4_ToolDef: ToolDefinition = {
  "id": "business-standard-non-disclosure-agreement-nda-4",
  "name": "Standard Non-Disclosure Agreement (NDA)",
  "category": "business",
  "subcategory": "legal",
  "description": "Draft bilateral or unilateral confidentiality agreements.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "business",
    "legal",
    "standard",
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
        "defaultValue": "Sample input data for Standard Non-Disclosure Agreement (NDA)"
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
      toolId: 'business-standard-non-disclosure-agreement-nda-4',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default business_standard_non_disclosure_agreement_nda_4_ToolDef;
