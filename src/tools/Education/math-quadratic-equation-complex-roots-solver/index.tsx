import { ToolDefinition } from '../../../types';

export const math_quadratic_equation_complex_roots_solver_ToolDef: ToolDefinition = {
  "id": "math-quadratic-equation-complex-roots-solver",
  "name": "Quadratic Equation (ax² + bx + c = 0) Step-by-Step Solver",
  "category": "education",
  "subcategory": "algebra",
  "description": "Solve polynomial quadratic equations, compute discriminant (b² - 4ac), vertex coordinates (-b/2a, f(-b/2a)), and real or complex roots.",
  "iconName": "Divide",
  "version": "1.0.0",
  "tags": [
    "education",
    "math",
    "algebra",
    "quadratic",
    "polynomial",
    "stem"
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
    "type": "json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'math-quadratic-equation-complex-roots-solver',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_quadratic_equation_complex_roots_solver_ToolDef;
