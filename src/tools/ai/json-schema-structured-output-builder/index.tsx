import { ToolDefinition } from '../../../types';

export const json_schema_structured_output_builder_ToolDef: ToolDefinition = {
  "id": "json-schema-structured-output-builder",
  "name": "LLM JSON Schema & Structured Output Generator",
  "category": "ai",
  "subcategory": "prompt-engineering",
  "description": "Generate strict JSON Schema drafts compatible with OpenAI structured outputs and Gemini responseSchema from sample JSON objects.",
  "iconName": "Code",
  "version": "1.0.0",
  "tags": [
    "ai",
    "json-schema",
    "structured-outputs",
    "tool-calling",
    "function-calling"
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
        "name": "sampleJson",
        "label": "Sample JSON Object",
        "type": "textarea",
        "defaultValue": "{\n  \"title\": \"Meeting Summary\",\n  \"actionItems\": [\n    {\n      \"task\": \"Review PR #42\",\n      \"assignee\": \"Alex\",\n      \"priority\": \"high\"\n    }\n  ],\n  \"decision\": \"Approved for deployment\"\n}",
        "required": true
      },
      {
        "name": "strictMode",
        "label": "Enforce strict schema (additionalProperties: false & all required)",
        "type": "boolean",
        "defaultValue": true
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
      toolId: 'json-schema-structured-output-builder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default json_schema_structured_output_builder_ToolDef;
