import { ToolDefinition } from '../../../types';

export const react_agent_loop_formatter_ToolDef: ToolDefinition = {
  "id": "react-agent-loop-formatter",
  "name": "ReAct Agent Thought-Action-Observation Loop Builder",
  "category": "ai",
  "subcategory": "agent-protocols",
  "description": "Format multi-step Reason+Act (ReAct) agent traces with structured Thought, Action, Action Input, and Observation envelopes.",
  "iconName": "Workflow",
  "version": "1.0.0",
  "tags": [
    "ai",
    "react",
    "agent",
    "chain-of-thought",
    "reasoning",
    "workflow"
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
        "name": "task",
        "label": "User Goal / Objective",
        "type": "text",
        "defaultValue": "Find the total Q3 revenue and compare with Q2 projection.",
        "required": true
      },
      {
        "name": "toolsAvailable",
        "label": "Available Tools List",
        "type": "textarea",
        "defaultValue": "query_db(sql: string) -> json\ncalculate_diff(a: number, b: number) -> percentage",
        "required": true
      }
    ]
  },
  "outputSchema": {
    "type": "text"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'react-agent-loop-formatter',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default react_agent_loop_formatter_ToolDef;
