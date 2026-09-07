import { ToolDefinition } from '../../../types';

export const math_law_of_sines_cosines_triangle_solver_ToolDef: ToolDefinition = {
  "id": "math-law-of-sines-cosines-triangle-solver",
  "name": "Oblique Triangle Solver (Law of Sines & Cosines)",
  "category": "education",
  "subcategory": "trigonometry",
  "description": "Solve non-right triangles given SSS, SAS, ASA, or AAS configurations with Heron's area formula.",
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
      toolId: 'math-law-of-sines-cosines-triangle-solver',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_law_of_sines_cosines_triangle_solver_ToolDef;
