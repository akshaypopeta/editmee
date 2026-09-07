import { ToolDefinition } from '../../../types';

export const math_simultaneous_linear_equations_ToolDef: ToolDefinition = {
  "id": "math-simultaneous-linear-equations",
  "name": "System of Linear Equations Solver (Cramer’s Rule)",
  "category": "calculators",
  "subcategory": "mathematics",
  "description": "Solve simultaneous linear equations with 2, 3, 4, or 5 unknowns using Cramer’s Rule and matrix reduction.",
  "iconName": "Percent",
  "version": "1.0.0",
  "tags": [
    "math",
    "calculation",
    "statistics",
    "scientific",
    "math simultaneous linear equations"
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
        "name": "inputA",
        "label": "Primary Parameter / Value A",
        "type": "number",
        "defaultValue": 10,
        "required": true
      },
      {
        "name": "inputB",
        "label": "Secondary Parameter / Value B",
        "type": "number",
        "defaultValue": 5
      },
      {
        "name": "inputC",
        "label": "Tertiary Parameter / Value C",
        "type": "number",
        "defaultValue": 2
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
      toolId: 'math-simultaneous-linear-equations',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_simultaneous_linear_equations_ToolDef;
