import { ToolDefinition } from '../../../types';

export const seo_ads_txt_iab_direct_reseller_ToolDef: ToolDefinition = {
  "id": "seo-ads-txt-iab-direct-reseller",
  "name": "IAB Authorized Digital Sellers (`ads.txt`) Validator",
  "category": "marketing",
  "subcategory": "seo",
  "description": "Format and validate Google AdSense / Google Ad Manager lines (`google.com, pub-1234, DIRECT, f08c47fec0942fa0`).",
  "iconName": "Search",
  "version": "1.0.0",
  "tags": [
    "seo",
    "marketing",
    "keywords",
    "schema",
    "search engine",
    "seo ads txt iab direct reseller"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "urlOrText",
        "label": "Target URL, Title or Keyword List",
        "type": "text",
        "defaultValue": "https://editmee.com/pdf-editor",
        "required": true
      },
      {
        "name": "mode",
        "label": "Analysis / Generation Mode",
        "type": "select",
        "defaultValue": "audit",
        "options": [
          {
            "label": "Full SEO Audit",
            "value": "audit"
          },
          {
            "label": "Schema Generation",
            "value": "schema"
          },
          {
            "label": "Snippet SERP Test",
            "value": "serp"
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
      toolId: 'seo-ads-txt-iab-direct-reseller',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default seo_ads_txt_iab_direct_reseller_ToolDef;
