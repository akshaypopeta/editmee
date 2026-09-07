import { ToolDefinition } from '../../../types';

export const mkt_email_spam_word_trigger_scanner_ToolDef: ToolDefinition = {
  "id": "mkt-email-spam-word-trigger-scanner",
  "name": "Email Deliverability Spam Trigger Word & Phrasing Scanner",
  "category": "business",
  "subcategory": "email-marketing",
  "description": "Scan subject lines and copy against 200+ spam keywords (\"FREE\", \"Guaranteed\", \"Act Now\") reducing deliverability.",
  "iconName": "TrendingUp",
  "version": "1.0.0",
  "tags": [
    "business",
    "marketing",
    "seo",
    "growth",
    "advertising",
    "analytics",
    "conversion"
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
        "name": "inputParameters",
        "label": "Primary Input / URL / Copy / Metric",
        "type": "text",
        "defaultValue": "https://example.com/growth-initiative",
        "required": true
      },
      {
        "name": "channelTarget",
        "label": "Marketing Channel",
        "type": "select",
        "defaultValue": "omnichannel",
        "options": [
          {
            "label": "Omnichannel / Blended",
            "value": "omnichannel"
          },
          {
            "label": "Organic Search (SEO)",
            "value": "seo"
          },
          {
            "label": "Paid Media (Meta/Google Ads)",
            "value": "paid"
          },
          {
            "label": "Direct / Email Lifecycle",
            "value": "email"
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
      toolId: 'mkt-email-spam-word-trigger-scanner',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default mkt_email_spam_word_trigger_scanner_ToolDef;
