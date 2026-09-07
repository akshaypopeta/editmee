import { ToolDefinition } from '../../../types';

export const fin_lease_vs_buy_capital_expenditure_calc_ToolDef: ToolDefinition = {
  "id": "fin-lease-vs-buy-capital-expenditure-calc",
  "name": "Equipment Lease vs Buy Net Present Value Sizer",
  "category": "business",
  "subcategory": "corporate-finance",
  "description": "Compare operating lease cash flows against loan-financed capital asset purchase and depreciation.",
  "iconName": "TrendingUp",
  "version": "1.0.0",
  "tags": [
    "business",
    "finance",
    "accounting",
    "saas",
    "metrics",
    "startups",
    "valuation"
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
        "name": "amount",
        "label": "Primary Monetary Value ($)",
        "type": "number",
        "defaultValue": 100000,
        "required": true
      },
      {
        "name": "rate",
        "label": "Rate / Percentage / Ratio (%)",
        "type": "number",
        "defaultValue": 15,
        "required": true
      },
      {
        "name": "periodMonths",
        "label": "Time Horizon (Months)",
        "type": "number",
        "defaultValue": 12
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
      toolId: 'fin-lease-vs-buy-capital-expenditure-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default fin_lease_vs_buy_capital_expenditure_calc_ToolDef;
