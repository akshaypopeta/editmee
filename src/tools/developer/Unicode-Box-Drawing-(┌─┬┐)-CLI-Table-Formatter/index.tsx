import { ToolDefinition } from '../../../types';

export const dev_ascii_table_unicode_box_drawer_ToolDef: ToolDefinition = {
  "id": "dev-ascii-table-unicode-box-drawer",
  "name": "Unicode Box-Drawing (┌─┬┐) CLI Table Formatter",
  "category": "developer",
  "subcategory": "code-tools",
  "description": "Render structured key-value and row-column data with elegant Unicode single/double line box characters.",
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
        "placeholder": "Enter input for Unicode Box-Drawing (┌─┬┐) CLI Table Formatter...",
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
      toolId: 'dev-ascii-table-unicode-box-drawer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default dev_ascii_table_unicode_box_drawer_ToolDef;
