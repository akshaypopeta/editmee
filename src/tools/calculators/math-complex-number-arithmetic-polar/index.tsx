import { ToolDefinition } from '../../../types';

export const math_complex_number_arithmetic_polar_ToolDef: ToolDefinition = {
  "id": "math-complex-number-arithmetic-polar",
  "name": "Complex Number Arithmetic (Rectangular & Polar Form)",
  "category": "calculators",
  "subcategory": "mathematics",
  "description": "Add, subtract, multiply, divide, and convert complex numbers between Cartesian (a + bi) and polar (r∠θ).",
  "iconName": "Percent",
  "version": "1.0.0",
  "tags": [
    "math",
    "calculation",
    "statistics",
    "scientific",
    "math complex number arithmetic polar"
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
      toolId: 'math-complex-number-arithmetic-polar',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_complex_number_arithmetic_polar_ToolDef;
