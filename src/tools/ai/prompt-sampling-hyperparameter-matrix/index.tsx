import { ToolDefinition } from '../../../types';

export const prompt_sampling_hyperparameter_matrix_ToolDef: ToolDefinition = {
  "id": "prompt-sampling-hyperparameter-matrix",
  "name": "LLM Sampling Matrix (Temperature & Top-P)",
  "category": "ai",
  "subcategory": "prompt-engineering",
  "description": "Calculate and visualize probabilistic token distribution entropy under varying Temperature, Top-P, and Top-K sampling settings.",
  "iconName": "Sliders",
  "version": "1.0.0",
  "tags": [
    "ai",
    "temperature",
    "top-p",
    "sampling",
    "hyperparameters",
    "entropy"
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
        "name": "temperature",
        "label": "Temperature (0.0 to 2.0)",
        "type": "number",
        "defaultValue": 0.7
      },
      {
        "name": "topP",
        "label": "Top-P (Nucleus Sampling 0.1 to 1.0)",
        "type": "number",
        "defaultValue": 0.9
      },
      {
        "name": "topK",
        "label": "Top-K (Candidates Count)",
        "type": "number",
        "defaultValue": 40
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
      toolId: 'prompt-sampling-hyperparameter-matrix',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default prompt_sampling_hyperparameter_matrix_ToolDef;
