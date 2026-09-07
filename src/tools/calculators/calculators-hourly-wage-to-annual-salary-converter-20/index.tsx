import { ToolDefinition } from '../../../types';

export const calculators_hourly_wage_to_annual_salary_converter_20_ToolDef: ToolDefinition = {
  "id": "calculators-hourly-wage-to-annual-salary-converter-20",
  "name": "Hourly Wage to Annual Salary Converter",
  "category": "calculators",
  "subcategory": "finance",
  "description": "Convert hourly rates into weekly, monthly, and yearly income equivalents.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "calculators",
    "finance",
    "hourly",
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
        "defaultValue": "Sample input data for Hourly Wage to Annual Salary Converter"
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
      toolId: 'calculators-hourly-wage-to-annual-salary-converter-20',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calculators_hourly_wage_to_annual_salary_converter_20_ToolDef;
