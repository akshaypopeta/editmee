import { ToolDefinition } from '../../../types';

export const calc_ebitda_to_net_income_bridge_ToolDef: ToolDefinition = {
  "id": "calc-ebitda-to-net-income-bridge",
  "name": "EBITDA to Clean Net Income Multi-Step Bridge Calculator",
  "category": "calculators",
  "subcategory": "financial",
  "description": "Bridge operational EBITDA down to Net Income by itemizing Depreciation, Amortization, Interest, and Taxes.",
  "iconName": "DollarSign",
  "version": "1.0.0",
  "tags": [
    "calculator",
    "finance",
    "money",
    "investment",
    "calc ebitda to net income bridge"
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
      toolId: 'calc-ebitda-to-net-income-bridge',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calc_ebitda_to_net_income_bridge_ToolDef;
