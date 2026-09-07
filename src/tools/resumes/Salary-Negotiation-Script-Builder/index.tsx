import { ToolDefinition } from '../../../types';

export const resumes_salary_negotiation_script_builder_8_ToolDef: ToolDefinition = {
  "id": "resumes-salary-negotiation-script-builder-8",
  "name": "Salary Negotiation Script Builder",
  "category": "resumes",
  "subcategory": "career",
  "description": "Build persuasive compensation and benefits negotiation talking points.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "resumes",
    "career",
    "salary",
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
        "defaultValue": "Sample input data for Salary Negotiation Script Builder"
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
      toolId: 'resumes-salary-negotiation-script-builder-8',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default resumes_salary_negotiation_script_builder_8_ToolDef;
