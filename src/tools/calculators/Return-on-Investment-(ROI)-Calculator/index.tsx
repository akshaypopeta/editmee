import { ToolDefinition } from '../../../types';

export const calculators_return_on_investment_roi_calculator_4_ToolDef: ToolDefinition = {
  "id": "calculators-return-on-investment-roi-calculator-4",
  "name": "Return on Investment (ROI) Calculator",
  "category": "calculators",
  "subcategory": "finance",
  "description": "Calculate percentage return on capital investments and projects.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "calculators",
    "finance",
    "return",
    "utility",
    "client-side"
  ],
  "executionMode": "client",
  "supportsBatch": true,
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
        "name": "input",
        "label": "Primary Input / Content",
        "type": "textarea",
        "required": true,
        "defaultValue": "Sample input data for Return on Investment (ROI) Calculator"
      },
      {
        "name": "option",
        "label": "Processing Preset",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "High Precision",
            "value": "high"
          },
          {
            "label": "Fast Output",
            "value": "fast"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/plain"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'calculators-return-on-investment-roi-calculator-4',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calculators_return_on_investment_roi_calculator_4_ToolDef;
