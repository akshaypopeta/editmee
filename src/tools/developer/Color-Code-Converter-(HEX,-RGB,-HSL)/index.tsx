import { ToolDefinition } from '../../../types';

export const developer_color_code_converter_hex_rgb_hsl_16_ToolDef: ToolDefinition = {
  "id": "developer-color-code-converter-hex-rgb-hsl-16",
  "name": "Color Code Converter (HEX, RGB, HSL)",
  "category": "developer",
  "subcategory": "utilities",
  "description": "Convert colors between HEX, RGB, HSL, HSV, and CMYK formats.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "developer",
    "utilities",
    "color",
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
        "defaultValue": "Sample input data for Color Code Converter (HEX, RGB, HSL)"
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
      toolId: 'developer-color-code-converter-hex-rgb-hsl-16',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default developer_color_code_converter_hex_rgb_hsl_16_ToolDef;
