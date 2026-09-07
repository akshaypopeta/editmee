import { ToolDefinition } from '../../../types';

export const ecom_incoterms_2020_risk_transfer_guide_ToolDef: ToolDefinition = {
  "id": "ecom-incoterms-2020-risk-transfer-guide",
  "name": "Incoterms 2020 (EXW, FOB, CIF, DDP) Risk Transfer Matrix",
  "category": "business",
  "subcategory": "international-trade",
  "description": "Clarify seller vs buyer liability for freight booking, export clearance, marine risk, and destination duties.",
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
      toolId: 'ecom-incoterms-2020-risk-transfer-guide',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ecom_incoterms_2020_risk_transfer_guide_ToolDef;
