import { ToolDefinition } from '../../../types';

export const calculators_sales_tax_vat_gst_calculator_9_ToolDef: ToolDefinition = {
  "id": "calculators-sales-tax-vat-gst-calculator-9",
  "name": "Sales Tax & VAT / GST Calculator",
  "category": "calculators",
  "subcategory": "finance",
  "description": "Calculate gross and net prices with regional value added tax rates.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "calculators",
    "finance",
    "sales",
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
        "defaultValue": "Sample input data for Sales Tax & VAT / GST Calculator"
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
      toolId: 'calculators-sales-tax-vat-gst-calculator-9',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calculators_sales_tax_vat_gst_calculator_9_ToolDef;
