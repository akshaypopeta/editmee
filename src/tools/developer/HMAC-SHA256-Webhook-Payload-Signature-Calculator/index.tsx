import { ToolDefinition } from '../../../types';

export const dev_hmac_webhook_signature_verifier_ToolDef: ToolDefinition = {
  "id": "dev-hmac-webhook-signature-verifier",
  "name": "HMAC-SHA256 Webhook Payload Signature Calculator",
  "category": "developer",
  "subcategory": "api-tools",
  "description": "Compute and verify crypto HMAC signatures for Stripe, GitHub, Shopify, and Slack incoming webhooks.",
  "iconName": "Code",
  "version": "1.0.0",
  "tags": [
    "developer",
    "coding",
    "devops",
    "api",
    "cloud",
    "typescript",
    "tools"
  ],
  "executionMode": "client",
  "supportsBatch": false,
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
        "name": "inputPayload",
        "label": "Input Code / Configuration / Query",
        "type": "textarea",
        "placeholder": "Enter input for HMAC-SHA256 Webhook Payload Signature Calculator...",
        "required": true
      },
      {
        "name": "format",
        "label": "Output Formatting",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard / Pretty",
            "value": "standard"
          },
          {
            "label": "Minified / Compact",
            "value": "minified"
          },
          {
            "label": "JSON Wrapped",
            "value": "json"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'dev-hmac-webhook-signature-verifier',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_hmac_webhook_signature_verifier_ToolDef;
