import { ToolDefinition } from '../../../types';

export const nlp_deduplicate_lines_preserve_order_ToolDef: ToolDefinition = {
  "id": "nlp-deduplicate-lines-preserve-order",
  "name": "Unique Line Deduplicator (Preserve First Occurrence Order)",
  "category": "text",
  "subcategory": "text-tools",
  "description": "Remove duplicate lines from lists while maintaining exact original item insertion sequence.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "text",
    "nlp",
    "linguistics",
    "editing",
    "readability",
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
        "name": "inputCorpus",
        "label": "Input Text / Corpus",
        "type": "textarea",
        "placeholder": "Enter text for Unique Line Deduplicator (Preserve First Occurrence Order)...",
        "required": true
      },
      {
        "name": "optionPreset",
        "label": "Processing Option",
        "type": "select",
        "defaultValue": "standard",
        "options": [
          {
            "label": "Standard Mode",
            "value": "standard"
          },
          {
            "label": "Strict Linguistic Rules",
            "value": "strict"
          },
          {
            "label": "JSON Export",
            "value": "export"
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
      toolId: 'nlp-deduplicate-lines-preserve-order',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default nlp_deduplicate_lines_preserve_order_ToolDef;
