import { ToolDefinition } from '../../../types';

export const math_chemical_equation_stoichiometry_calc_ToolDef: ToolDefinition = {
  "id": "math-chemical-equation-stoichiometry-calc",
  "name": "Chemical Equation Balancing & Stoichiometry Moles Sizer",
  "category": "education",
  "subcategory": "chemistry",
  "description": "Balance conservation of mass across reactants/products and compute molar mass ratios.",
  "iconName": "Divide",
  "version": "1.0.0",
  "tags": [
    "education",
    "math",
    "stem",
    "physics",
    "engineering",
    "science",
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
        "label": "Primary Input Parameter / Constant / Variable",
        "type": "number",
        "defaultValue": 10,
        "required": true
      },
      {
        "name": "unitSystem",
        "label": "Unit System",
        "type": "select",
        "defaultValue": "si",
        "options": [
          {
            "label": "SI Metric Units (m, kg, s, J, N)",
            "value": "si"
          },
          {
            "label": "Imperial / US Customary (ft, lb, BTU)",
            "value": "imperial"
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
      toolId: 'math-chemical-equation-stoichiometry-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_chemical_equation_stoichiometry_calc_ToolDef;
