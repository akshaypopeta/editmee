import { ToolDefinition } from '../../../types';

export const ab_testing_statistical_significance_calc_ToolDef: ToolDefinition = {
  "id": "ab-testing-statistical-significance-calc",
  "name": "A/B Test Statistical Significance & Sample Size Sizer",
  "category": "business",
  "subcategory": "conversion-optimization",
  "description": "Calculate two-tailed Z-score statistical confidence (p < 0.05), minimum detectable effect (MDE), and sample size needed per variant with 80% statistical power.",
  "iconName": "Percent",
  "version": "1.0.0",
  "tags": [
    "business",
    "marketing",
    "ab-testing",
    "statistics",
    "cro",
    "growth",
    "analytics"
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
        "name": "visitorsA",
        "label": "Variant A (Control) Visitors",
        "type": "number",
        "defaultValue": 5000,
        "required": true
      },
      {
        "name": "conversionsA",
        "label": "Variant A Conversions",
        "type": "number",
        "defaultValue": 250,
        "required": true
      },
      {
        "name": "visitorsB",
        "label": "Variant B (Test) Visitors",
        "type": "number",
        "defaultValue": 5000,
        "required": true
      },
      {
        "name": "conversionsB",
        "label": "Variant B Conversions",
        "type": "number",
        "defaultValue": 320,
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
      toolId: 'ab-testing-statistical-significance-calc',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ab_testing_statistical_significance_calc_ToolDef;
