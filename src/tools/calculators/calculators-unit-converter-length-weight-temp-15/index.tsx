import { ToolDefinition } from '../../../types';

export const calculators_unit_converter_length_weight_temp_15_ToolDef: ToolDefinition = {
  "id": "calculators-unit-converter-length-weight-temp-15",
  "name": "Unit Converter (Length, Weight, Temp)",
  "category": "calculators",
  "subcategory": "conversion",
  "description": "Convert between metric and imperial measurement systems.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "calculators",
    "conversion",
    "unit",
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
        "defaultValue": "Sample input data for Unit Converter (Length, Weight, Temp)"
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
      toolId: 'calculators-unit-converter-length-weight-temp-15',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default calculators_unit_converter_length_weight_temp_15_ToolDef;
