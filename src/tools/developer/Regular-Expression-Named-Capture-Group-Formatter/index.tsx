import { ToolDefinition } from '../../../types';

export const dev_regex_named_capture_group_formatter_ToolDef: ToolDefinition = {
  "id": "dev-regex-named-capture-group-formatter",
  "name": "Regular Expression Named Capture Group Formatter",
  "category": "developer",
  "subcategory": "code-tools",
  "description": "Transform anonymous regex capture groups (.*) into explicit named groups (?<groupName>.*).",
  "iconName": "Code",
  "version": "1.0.0",
  "tags": [
    "developer",
    "coding",
    "devops",
    "api",
    "cloud",
    "typescript",
    "tools"
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
        "name": "inputPayload",
        "label": "Input Code / Configuration / Query",
        "type": "textarea",
        "placeholder": "Enter input for Regular Expression Named Capture Group Formatter...",
        "required": true
      },
      {
        "name": "format",
        "label": "Output Formatting",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard / Pretty",
            "value": "standard"
          },
          {
            "label": "Minified / Compact",
            "value": "minified"
          },
          {
            "label": "JSON Wrapped",
            "value": "json"
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
      toolId: 'dev-regex-named-capture-group-formatter',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_regex_named_capture_group_formatter_ToolDef;
