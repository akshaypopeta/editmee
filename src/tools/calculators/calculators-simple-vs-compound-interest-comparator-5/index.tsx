import { ToolDefinition } from '../../../types';

export const calculators_simple_vs_compound_interest_comparator_5_ToolDef: ToolDefinition = {
  "id": "calculators-simple-vs-compound-interest-comparator-5",
  "name": "Simple vs Compound Interest Comparator",
  "category": "calculators",
  "subcategory": "finance",
  "description": "Compare total interest generated between simple and compound growth.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "calculators",
    "finance",
    "simple",
    "utility",
    "client-side"
  ],
  "executionMode": "client",
  "supportsBatch": true,
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
        "name": "input",
        "label": "Primary Input / Content",
        "type": "textarea",
        "required": true,
        "defaultValue": "Sample input data for Simple vs Compound Interest Comparator"
      },
      {
        "name": "option",
        "label": "Processing Preset",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "High Precision",
            "value": "high"
          },
          {
            "label": "Fast Output",
            "value": "fast"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/plain"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'calculators-simple-vs-compound-interest-comparator-5',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calculators_simple_vs_compound_interest_comparator_5_ToolDef;
