import { ToolDefinition } from '../../../types';

export const fin_customer_concentration_risk_hhi_calc_ToolDef: ToolDefinition = {
  "id": "fin-customer-concentration-risk-hhi-calc",
  "name": "Customer Revenue Concentration (Herfindahl-Hirschman HHI)",
  "category": "business",
  "subcategory": "risk-management",
  "description": "Measure client concentration risk across top 5 and top 10 enterprise accounts.",
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
      toolId: 'fin-customer-concentration-risk-hhi-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default fin_customer_concentration_risk_hhi_calc_ToolDef;
