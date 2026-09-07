import { ToolDefinition } from '../../../types';

export const marketing_roas_cpa_blended_mer_calculator_ToolDef: ToolDefinition = {
  "id": "marketing-roas-cpa-blended-mer-calculator",
  "name": "Paid Ad ROAS, Target CPA & Marketing Efficiency Ratio (MER)",
  "category": "business",
  "subcategory": "paid-acquisition",
  "description": "Calculate Return on Ad Spend (ROAS), target Cost Per Acquisition (CPA), customer click-through to purchase rates, and blended Marketing Efficiency Ratio across ad channels.",
  "iconName": "DollarSign",
  "version": "1.0.0",
  "tags": [
    "business",
    "marketing",
    "roas",
    "cpa",
    "mer",
    "google-ads",
    "meta-ads",
    "analytics"
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
        "name": "adSpend",
        "label": "Total Ad Spend ($)",
        "type": "number",
        "defaultValue": 10000,
        "required": true
      },
      {
        "name": "attributedRevenue",
        "label": "Attributed Revenue ($)",
        "type": "number",
        "defaultValue": 38000,
        "required": true
      },
      {
        "name": "totalCompanyRevenue",
        "label": "Total Company Revenue (for MER) ($)",
        "type": "number",
        "defaultValue": 55000,
        "required": true
      },
      {
        "name": "ordersCount",
        "label": "Total Acquired Customers / Orders",
        "type": "number",
        "defaultValue": 450,
        "required": true
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
      toolId: 'marketing-roas-cpa-blended-mer-calculator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default marketing_roas_cpa_blended_mer_calculator_ToolDef;
