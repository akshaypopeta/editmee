import { ToolDefinition } from '../../../types';

export const ai_assistant_ToolDef: ToolDefinition = {
  "id": "ai-assistant",
  "name": "AI Work Assistant",
  "category": "ai",
  "subcategory": "assistant",
  "description": "Agentic assistant that plans, decomposes, and executes tasks using registered client-side tools.",
  "iconName": "Sparkles",
  "version": "2.0.0",
  "tags": [
    "ai",
    "agent",
    "assistant",
    "automation",
    "planner",
    "tool-router"
  ],
  "executionMode": "hybrid",
  "supportsBatch": true,
  "supportsWorkflow": true,
  "requiresAI": true,
  "capabilities": {
    "clientSide": true,
    "workerSupported": false,
    "batchSupported": true,
    "workflowSupported": true,
    "aiPowered": true,
    "offlineReady": false,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "prompt",
        "label": "Instruction / Goal",
        "type": "textarea",
        "required": true,
        "placeholder": "e.g. Generate an invoice for consulting and compress output PDF..."
      }
    ]
  },
  "outputSchema": {
    "type": "json",
    "mimeType": "application/json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'ai-assistant',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_assistant_ToolDef;
