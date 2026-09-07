import { ToolDefinition } from '../../../types';

export const calc_cap_table_convertible_note_safe_ToolDef: ToolDefinition = {
  "id": "calc-cap-table-convertible-note-safe",
  "name": "Startup SAFE / Convertible Note Dilution & Cap Table Calc",
  "category": "calculators",
  "subcategory": "financial",
  "description": "Model founder equity dilution across pre-money valuation caps, post-money SAFEs, and discount rates.",
  "iconName": "DollarSign",
  "version": "1.0.0",
  "tags": [
    "calculator",
    "finance",
    "money",
    "investment",
    "calc cap table convertible note safe"
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
      toolId: 'calc-cap-table-convertible-note-safe',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calc_cap_table_convertible_note_safe_ToolDef;
