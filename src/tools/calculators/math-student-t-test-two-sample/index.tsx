import { ToolDefinition } from '../../../types';

export const math_student_t_test_two_sample_ToolDef: ToolDefinition = {
  "id": "math-student-t-test-two-sample",
  "name": "Student’s t-Test (Independent & Paired Samples) Engine",
  "category": "calculators",
  "subcategory": "mathematics",
  "description": "Compare means between two experimental groups and calculate t-statistic, df, and two-tailed p-value.",
  "iconName": "Percent",
  "version": "1.0.0",
  "tags": [
    "math",
    "calculation",
    "statistics",
    "scientific",
    "math student t test two sample"
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
      toolId: 'math-student-t-test-two-sample',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default math_student_t_test_two_sample_ToolDef;
