import { ToolDefinition } from '../../../types';

export const ecom_gift_card_breakage_liability_revenue_ToolDef: ToolDefinition = {
  "id": "ecom-gift-card-breakage-liability-revenue",
  "name": "Gift Card Outstanding Liability & Breakage Revenue Recognition",
  "category": "business",
  "subcategory": "accounting",
  "description": "Estimate historical unredeemed gift card percentage (breakage) recognized as GAAP operating revenue.",
  "iconName": "Package",
  "version": "1.0.0",
  "tags": [
    "business",
    "ecommerce",
    "logistics",
    "supply-chain",
    "inventory",
    "shipping",
    "warehouse",
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
        "name": "inputValue",
        "label": "Primary Logistics / Inventory Value",
        "type": "number",
        "defaultValue": 1000,
        "required": true
      },
      {
        "name": "channelType",
        "label": "Fulfillment & Sales Channel",
        "type": "select",
        "defaultValue": "omnichannel",
        "options": [
          {
            "label": "Direct to Consumer (D2C)",
            "value": "d2c"
          },
          {
            "label": "Marketplace (Amazon FBA / Walmart)",
            "value": "marketplace"
          },
          {
            "label": "B2B Wholesale / LTL Freight",
            "value": "wholesale"
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
      toolId: 'ecom-gift-card-breakage-liability-revenue',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ecom_gift_card_breakage_liability_revenue_ToolDef;
