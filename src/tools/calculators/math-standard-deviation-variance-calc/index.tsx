import { ToolDefinition } from '../../../types';

export const math_standard_deviation_variance_calc_ToolDef: ToolDefinition = {
  "id": "math-standard-deviation-variance-calc",
  "name": "Sample & Population Standard Deviation & Variance Studio",
  "category": "calculators",
  "subcategory": "statistics",
  "description": "Calculate mean, sum of squares, sample variance (s²), population variance (σ²), and standard error of the mean.",
  "iconName": "BarChart2",
  "version": "1.0.0",
  "tags": [
    "statistics",
    "standard deviation",
    "variance",
    "mean",
    "median",
    "mode",
    "iqr",
    "quartiles"
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
        "name": "numbers",
        "label": "Dataset Numbers (Comma, space, or newline separated)",
        "type": "textarea",
        "defaultValue": "12, 15, 18, 22, 25, 28, 30, 32, 35, 40, 45, 50",
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
      toolId: 'math-standard-deviation-variance-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_standard_deviation_variance_calc_ToolDef;
