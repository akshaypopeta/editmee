import { ToolDefinition } from '../../../types';

export const ai_competitor_swot_matrix_generator_ToolDef: ToolDefinition = {
  "id": "ai-competitor-swot-matrix-generator",
  "name": "AI Competitive Intelligence & SWOT Matrix Generator",
  "category": "ai",
  "subcategory": "intelligence",
  "description": "Generate Strengths, Weaknesses, Opportunities, and Threats analysis for any competitor or market.",
  "iconName": "Sparkles",
  "version": "1.0.0",
  "tags": [
    "ai",
    "intelligence",
    "generation",
    "smart tool",
    "ai competitor swot matrix generator"
  ],
  "executionMode": "hybrid",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": true,
  "capabilities": {
    "clientSide": true,
    "workerSupported": false,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": true,
    "offlineReady": false,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "prompt",
        "label": "Input Prompt / Requirements / Context",
        "type": "textarea",
        "defaultValue": "Provide high quality output for modern software development and business strategy.",
        "required": true
      },
      {
        "name": "tone",
        "label": "Tone of Voice",
        "type": "select",
        "defaultValue": "professional",
        "options": [
          {
            "label": "Executive & Professional",
            "value": "professional"
          },
          {
            "label": "Concise & Technical",
            "value": "technical"
          },
          {
            "label": "Creative & Engaging",
            "value": "creative"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/markdown"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'ai-competitor-swot-matrix-generator',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_competitor_swot_matrix_generator_ToolDef;
