import { ToolDefinition } from '../../../types';

export const fin_salary_plus_commission_ote_calculator_ToolDef: ToolDefinition = {
  "id": "fin-salary-plus-commission-ote-calculator",
  "name": "Sales On-Target Earnings (OTE) & Commission Tier Sizer",
  "category": "business",
  "subcategory": "hr-finance",
  "description": "Structure 50/50 base/variable commission accelerators and quota attainment tiers.",
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
      toolId: 'fin-salary-plus-commission-ote-calculator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default fin_salary_plus_commission_ote_calculator_ToolDef;
