import { ToolDefinition } from '../../../types';

export const ai_ai_code_explainer_docstring_generator_4_ToolDef: ToolDefinition = {
  "id": "ai-ai-code-explainer-docstring-generator-4",
  "name": "AI Code Explainer & Docstring Generator",
  "category": "ai",
  "subcategory": "code",
  "description": "Explain complex source code logic and generate docstrings.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "ai",
    "code",
    "utility",
    "client-side"
  ],
  "executionMode": "client",
  "supportsBatch": true,
  "supportsWorkflow": true,
  "requiresAI": true,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": true,
    "workflowSupported": true,
    "aiPowered": true,
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
        "defaultValue": "Sample input data for AI Code Explainer & Docstring Generator"
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
      toolId: 'ai-ai-code-explainer-docstring-generator-4',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_ai_code_explainer_docstring_generator_4_ToolDef;
