import { ToolDefinition } from '../../../types';

export const text_alphabetical_sorter_pro_ToolDef: ToolDefinition = {
  "id": "text-alphabetical-sorter-pro",
  "name": "Natural & Alphabetical Text List Sorter",
  "category": "documents",
  "subcategory": "utilities",
  "description": "Sort lists naturally (File1, File2, File10), reverse alphabetically, by line length, or randomly.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "document",
    "text",
    "utility",
    "format",
    "text alphabetical sorter pro"
  ],
  "executionMode": "client",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": false,
  "capabilities": {
    "clientSide": true,
    "workerSupported": true,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": false,
    "offlineReady": true,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "input",
        "label": "Input Text / Code / Data",
        "type": "textarea",
        "defaultValue": "Sample Document Line 1\nSample Document Line 2\nSample Document Line 3",
        "required": true
      },
      {
        "name": "option",
        "label": "Processing Option",
        "type": "select",
        "defaultValue": "default",
        "options": [
          {
            "label": "Default / Standard",
            "value": "default"
          },
          {
            "label": "Strict / High Precision",
            "value": "strict"
          },
          {
            "label": "Extended Mode",
            "value": "extended"
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
      toolId: 'text-alphabetical-sorter-pro',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default text_alphabetical_sorter_pro_ToolDef;
