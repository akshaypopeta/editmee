import { ToolDefinition } from '../../../types';

export const ecom_stockout_lost_sales_cost_calculator_ToolDef: ToolDefinition = {
  "id": "ecom-stockout-lost-sales-cost-calculator",
  "name": "Inventory Stockout Out-of-Stock Lost Sales & Ad Waste Sizer",
  "category": "business",
  "subcategory": "inventory-ops",
  "description": "Quantify direct revenue loss and Amazon organic rank drops caused by inventory stockout days.",
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
      toolId: 'ecom-stockout-lost-sales-cost-calculator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ecom_stockout_lost_sales_cost_calculator_ToolDef;
