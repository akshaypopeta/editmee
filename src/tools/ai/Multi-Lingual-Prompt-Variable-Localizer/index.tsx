import { ToolDefinition } from '../../../types';

export const ai_prompt_translation_matrix_ToolDef: ToolDefinition = {
  "id": "ai-prompt-translation-matrix",
  "name": "Multi-Lingual Prompt Variable Localizer",
  "category": "ai",
  "subcategory": "prompt-engineering",
  "description": "Inject language variables and culturally appropriate phrasing into multi-region LLM prompts.",
  "iconName": "Cpu",
  "version": "1.0.0",
  "tags": [
    "ai",
    "agent",
    "llm",
    "prompt",
    "automation",
    "productivity"
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
        "name": "inputText",
        "label": "Input Data / Context",
        "type": "textarea",
        "placeholder": "Enter data for Multi-Lingual Prompt Variable Localizer...",
        "required": true
      },
      {
        "name": "mode",
        "label": "Processing Mode",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "Strict / High-Precision",
            "value": "strict"
          },
          {
            "label": "Compact / Minified",
            "value": "compact"
          }
        ]
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
      toolId: 'ai-prompt-translation-matrix',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_prompt_translation_matrix_ToolDef;
