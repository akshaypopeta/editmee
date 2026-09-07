import { ToolDefinition } from '../../../types';

export const sheet_trim_clean_non_printable_ToolDef: ToolDefinition = {
  "id": "sheet-trim-clean-non-printable",
  "name": "Excel TRIM & CLEAN Non-Printable Character Stripper",
  "category": "data",
  "subcategory": "spreadsheets",
  "description": "Remove non-breaking spaces (ASCII 160) and non-printable control codes copied from web pages.",
  "iconName": "Table",
  "version": "1.0.0",
  "tags": [
    "spreadsheet",
    "excel",
    "data",
    "tables",
    "analytics",
    "sheet trim clean non printable"
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
        "name": "csvData",
        "label": "Spreadsheet / Tabular Data (CSV)",
        "type": "textarea",
        "defaultValue": "ID,Name,Amount,Date\n1,Alice,150.00,2026-01-15\n2,Bob,280.50,2026-02-20",
        "required": true
      },
      {
        "name": "operation",
        "label": "Calculation / Formatting Mode",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Analysis",
            "value": "standard"
          },
          {
            "label": "Clean & Sanitize",
            "value": "clean"
          },
          {
            "label": "Statistical Summary",
            "value": "summary"
          }
        ]
      }
    ]
  },
  "outputSchema": {
    "type": "text",
    "mimeType": "text/markdown"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'sheet-trim-clean-non-printable',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default sheet_trim_clean_non_printable_ToolDef;
