import { ToolDefinition } from '../../../types';

export const calc_ev_vs_gas_fuel_cost_savings_ToolDef: ToolDefinition = {
  "id": "calc-ev-vs-gas-fuel-cost-savings",
  "name": "Electric Vehicle (EV) vs Gasoline Car Annual Fuel Savings",
  "category": "calculators",
  "subcategory": "financial",
  "description": "Compare electricity cost per kWh and MPGe against gasoline price per gallon and vehicle MPG.",
  "iconName": "DollarSign",
  "version": "1.0.0",
  "tags": [
    "calculator",
    "finance",
    "money",
    "investment",
    "calc ev vs gas fuel cost savings"
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
      toolId: 'calc-ev-vs-gas-fuel-cost-savings',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calc_ev_vs_gas_fuel_cost_savings_ToolDef;
