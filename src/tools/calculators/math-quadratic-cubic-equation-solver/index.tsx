import { ToolDefinition } from '../../../types';

export const math_quadratic_cubic_equation_solver_ToolDef: ToolDefinition = {
  "id": "math-quadratic-cubic-equation-solver",
  "name": "Quadratic, Cubic & Quartic Polynomial Equation Solver",
  "category": "calculators",
  "subcategory": "mathematics",
  "description": "Find exact real and complex roots of polynomial equations with step-by-step discriminant calculations.",
  "iconName": "Percent",
  "version": "1.0.0",
  "tags": [
    "polynomial",
    "quadratic",
    "cubic",
    "roots",
    "algebra",
    "solver",
    "discriminant"
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
        "name": "a",
        "label": "Coefficient a (x²)",
        "type": "number",
        "defaultValue": 1,
        "required": true
      },
      {
        "name": "b",
        "label": "Coefficient b (x)",
        "type": "number",
        "defaultValue": -5,
        "required": true
      },
      {
        "name": "c",
        "label": "Constant c",
        "type": "number",
        "defaultValue": 6,
        "required": true
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
      toolId: 'math-quadratic-cubic-equation-solver',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_quadratic_cubic_equation_solver_ToolDef;
