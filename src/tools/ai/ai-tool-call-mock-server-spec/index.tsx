import { ToolDefinition } from '../../../types';

export const ai_tool_call_mock_server_spec_ToolDef: ToolDefinition = {
  "id": "ai-tool-call-mock-server-spec",
  "name": "LLM Tool Mock Response Generator",
  "category": "ai",
  "subcategory": "prompt-engineering",
  "description": "Generate mock JSON payloads and error codes for testing agent function execution offline.",
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
        "placeholder": "Enter data for LLM Tool Mock Response Generator...",
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
      toolId: 'ai-tool-call-mock-server-spec',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_tool_call_mock_server_spec_ToolDef;
