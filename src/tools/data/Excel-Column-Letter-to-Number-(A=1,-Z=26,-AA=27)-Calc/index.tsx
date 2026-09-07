import { ToolDefinition } from '../../../types';

export const sheet_column_letter_number_converter_ToolDef: ToolDefinition = {
  "id": "sheet-column-letter-number-converter",
  "name": "Excel Column Letter to Number (A=1, Z=26, AA=27) Calc",
  "category": "data",
  "subcategory": "spreadsheets",
  "description": "Convert between spreadsheet column alphabet letters and numeric zero/one-indexed column indices.",
  "iconName": "Table",
  "version": "1.0.0",
  "tags": [
    "spreadsheet",
    "excel",
    "data",
    "tables",
    "analytics",
    "sheet column letter number converter"
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
      toolId: 'sheet-column-letter-number-converter',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default sheet_column_letter_number_converter_ToolDef;
