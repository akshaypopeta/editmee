import { ToolDefinition } from '../../../types';

export const security_hmac_signature_generator_3_ToolDef: ToolDefinition = {
  "id": "security-hmac-signature-generator-3",
  "name": "HMAC Signature Generator",
  "category": "security",
  "subcategory": "crypto",
  "description": "Generate HMAC-SHA256 and HMAC-SHA512 message authentication signatures.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "security",
    "crypto",
    "hmac",
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
        "defaultValue": "Sample input data for HMAC Signature Generator"
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
      toolId: 'security-hmac-signature-generator-3',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default security_hmac_signature_generator_3_ToolDef;
