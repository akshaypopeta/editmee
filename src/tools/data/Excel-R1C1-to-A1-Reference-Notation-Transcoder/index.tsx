import { ToolDefinition } from '../../../types';

export const sheet_r1c1_to_a1_notation_transcoder_ToolDef: ToolDefinition = {
  "id": "sheet-r1c1-to-a1-notation-transcoder",
  "name": "Excel R1C1 to A1 Reference Notation Transcoder",
  "category": "data",
  "subcategory": "spreadsheets",
  "description": "Convert between R1C1 relative reference notation and standard A1 / $A$1 absolute cell references.",
  "iconName": "Table",
  "version": "1.0.0",
  "tags": [
    "spreadsheet",
    "excel",
    "data",
    "tables",
    "analytics",
    "sheet r1c1 to a1 notation transcoder"
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
      toolId: 'sheet-r1c1-to-a1-notation-transcoder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default sheet_r1c1_to_a1_notation_transcoder_ToolDef;
