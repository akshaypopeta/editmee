import { ToolDefinition } from '../../../types';

export const ai_context_window_visualizer_ToolDef: ToolDefinition = {
  "id": "ai-context-window-visualizer",
  "name": "LLM Context Window Layer Occupancy Visualizer",
  "category": "ai",
  "subcategory": "prompt-engineering",
  "description": "Visualize the breakdown of System, History, RAG Chunks, Tools, and User Query inside a context window.",
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
        "placeholder": "Enter data for LLM Context Window Layer Occupancy Visualizer...",
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
      toolId: 'ai-context-window-visualizer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_context_window_visualizer_ToolDef;
