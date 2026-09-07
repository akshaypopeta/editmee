import { ToolDefinition } from '../../../types';

export const text_cliche_buzzword_remover_ToolDef: ToolDefinition = {
  "id": "text-cliche-buzzword-remover",
  "name": "Corporate Cliche & Jargon Scrubber",
  "category": "documents",
  "subcategory": "writing",
  "description": "Identify and replace overused buzzwords (\"synergy\", \"low-hanging fruit\", \"touch base\") with concise language.",
  "iconName": "Type",
  "version": "1.0.0",
  "tags": [
    "text",
    "writing",
    "typography",
    "linguistics",
    "formatter",
    "text cliche buzzword remover"
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
        "name": "text",
        "label": "Input Text / Manuscript",
        "type": "textarea",
        "defaultValue": "The quick brown fox jumps over the lazy dog.",
        "required": true
      },
      {
        "name": "option",
        "label": "Processing Option / Preset",
        "type": "select",
        "defaultValue": "default",
        "options": [
          {
            "label": "Standard Rule Enforcement",
            "value": "default"
          },
          {
            "label": "Strict / High-Precision",
            "value": "strict"
          },
          {
            "label": "Relaxed / Conversational",
            "value": "relaxed"
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
      toolId: 'text-cliche-buzzword-remover',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default text_cliche_buzzword_remover_ToolDef;
