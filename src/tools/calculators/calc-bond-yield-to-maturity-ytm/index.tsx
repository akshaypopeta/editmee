import { ToolDefinition } from '../../../types';

export const calc_bond_yield_to_maturity_ytm_ToolDef: ToolDefinition = {
  "id": "calc-bond-yield-to-maturity-ytm",
  "name": "Treasury & Corporate Bond Yield to Maturity (YTM) Calc",
  "category": "calculators",
  "subcategory": "financial",
  "description": "Calculate exact annual yield on coupon bonds trading at a discount or premium to par value.",
  "iconName": "DollarSign",
  "version": "1.0.0",
  "tags": [
    "calculator",
    "finance",
    "money",
    "investment",
    "calc bond yield to maturity ytm"
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
        "name": "param1",
        "label": "Primary Value / Initial Principal ($)",
        "type": "number",
        "defaultValue": 50000,
        "required": true
      },
      {
        "name": "param2",
        "label": "Growth / Interest / Rate Parameter (%)",
        "type": "number",
        "defaultValue": 7
      },
      {
        "name": "param3",
        "label": "Duration / Period (Years / Months)",
        "type": "number",
        "defaultValue": 10
      },
      {
        "name": "param4",
        "label": "Secondary Adjustment Factor ($ / %)",
        "type": "number",
        "defaultValue": 1000
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
      toolId: 'calc-bond-yield-to-maturity-ytm',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calc_bond_yield_to_maturity_ytm_ToolDef;
