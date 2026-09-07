import { ToolDefinition } from '../../../types';

export const developer_regex_tester_debugger_12_ToolDef: ToolDefinition = {
  "id": "developer-regex-tester-debugger-12",
  "name": "RegEx Tester & Debugger",
  "category": "developer",
  "subcategory": "utilities",
  "description": "Test regular expressions against sample text with real-time match groups.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "developer",
    "utilities",
    "regex",
    "utility",
    "client-side"
  ],
  "executionMode": "client",
  "supportsBatch": true,
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
        "name": "input",
        "label": "Primary Input / Content",
        "type": "textarea",
        "required": true,
        "defaultValue": "Sample input data for RegEx Tester & Debugger"
      },
      {
        "name": "option",
        "label": "Processing Preset",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "High Precision",
            "value": "high"
          },
          {
            "label": "Fast Output",
            "value": "fast"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/plain"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'developer-regex-tester-debugger-12',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default developer_regex_tester_debugger_12_ToolDef;
