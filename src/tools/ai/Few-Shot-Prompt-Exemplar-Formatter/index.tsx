import { ToolDefinition } from '../../../types';

export const few_shot_prompt_builder_ToolDef: ToolDefinition = {
  "id": "few-shot-prompt-builder",
  "name": "Few-Shot Prompt Exemplar Formatter",
  "category": "ai",
  "subcategory": "prompt-engineering",
  "description": "Structure raw input-output training pairs into pristine, formatted few-shot prompt exemplars for fine-tuning or in-context learning.",
  "iconName": "Sliders",
  "version": "1.0.0",
  "tags": [
    "ai",
    "prompt",
    "few-shot",
    "exemplars",
    "llm",
    "training"
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
        "name": "instruction",
        "label": "System Instruction / Task Definition",
        "type": "text",
        "defaultValue": "Classify the sentiment and extract key named entities.",
        "required": true
      },
      {
        "name": "examples",
        "label": "Examples (One per block, separated by \"---\")",
        "type": "textarea",
        "placeholder": "Input: I love the new EditMee UI update!\nOutput: {\"sentiment\": \"positive\", \"entity\": \"EditMee UI\"}\n---\nInput: The server failed to connect.\nOutput: {\"sentiment\": \"negative\", \"entity\": \"server\"}",
        "required": true
      },
      {
        "name": "formatStyle",
        "label": "Output Schema Format",
        "type": "select",
        "defaultValue": "chatml",
        "options": [
          {
            "label": "ChatML (<|im_start|>user / assistant)",
            "value": "chatml"
          },
          {
            "label": "Anthropic Human / Assistant Tags",
            "value": "anthropic"
          },
          {
            "label": "OpenAI JSON Message Array",
            "value": "openai-json"
          },
          {
            "label": "Markdown Q&A Delimited",
            "value": "markdown"
          }
        ]
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
      toolId: 'few-shot-prompt-builder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default few_shot_prompt_builder_ToolDef;
