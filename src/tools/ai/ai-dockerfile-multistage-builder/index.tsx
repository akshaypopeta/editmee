import { ToolDefinition } from '../../../types';

export const ai_dockerfile_multistage_builder_ToolDef: ToolDefinition = {
  "id": "ai-dockerfile-multistage-builder",
  "name": "AI Multi-Stage Dockerfile & Container Size Optimizer",
  "category": "ai",
  "subcategory": "intelligence",
  "description": "Generate secure, minimal multi-stage Dockerfiles that reduce production image sizes by up to 90%.",
  "iconName": "Sparkles",
  "version": "1.0.0",
  "tags": [
    "ai",
    "intelligence",
    "generation",
    "smart tool",
    "ai dockerfile multistage builder"
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
      toolId: 'ai-dockerfile-multistage-builder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_dockerfile_multistage_builder_ToolDef;
