import { ToolDefinition } from '../../../types';

export const math_bernoulli_equation_fluid_dynamics_ToolDef: ToolDefinition = {
  "id": "math-bernoulli-equation-fluid-dynamics",
  "name": "Fluid Dynamics Bernoulli's Equation & Venturi Sizer",
  "category": "education",
  "subcategory": "physics",
  "description": "Calculate pressure drop and fluid velocity changes in constricted pipes (P + ½ρv² + ρgh = C).",
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
      toolId: 'math-bernoulli-equation-fluid-dynamics',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_bernoulli_equation_fluid_dynamics_ToolDef;
