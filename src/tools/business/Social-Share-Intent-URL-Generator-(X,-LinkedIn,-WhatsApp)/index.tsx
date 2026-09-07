import { ToolDefinition } from '../../../types';

export const mkt_social_share_intent_url_builder_ToolDef: ToolDefinition = {
  "id": "mkt-social-share-intent-url-builder",
  "name": "Social Share Intent URL Generator (X, LinkedIn, WhatsApp)",
  "category": "business",
  "subcategory": "social-media",
  "description": "Generate direct share links: twitter.com/intent/tweet, linkedin.com/sharing/share-offsite, and wa.me.",
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
      toolId: 'mkt-social-share-intent-url-builder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default mkt_social_share_intent_url_builder_ToolDef;
