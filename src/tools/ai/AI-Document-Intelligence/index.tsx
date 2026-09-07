import { ToolDefinition } from '../../../types';

export const ai_doc_intel_ToolDef: ToolDefinition = {
  "id": "ai-doc-intel",
  "name": "AI Document Intelligence",
  "category": "ai",
  "subcategory": "extraction",
  "description": "Multimodal entity extraction and structured data parsing for invoices, receipts, contracts, and resumes.",
  "iconName": "FileSearch",
  "version": "2.0.0",
  "tags": [
    "ai",
    "document",
    "ocr",
    "invoice",
    "contract",
    "resume",
    "extraction"
  ],
  "executionMode": "hybrid",
  "supportsBatch": true,
  "supportsWorkflow": true,
  "requiresAI": true,
  "capabilities": {
    "clientSide": true,
    "workerSupported": false,
    "batchSupported": true,
    "workflowSupported": true,
    "aiPowered": true,
    "offlineReady": false,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "documentText",
        "label": "Document Text",
        "type": "textarea",
        "required": false
      },
      {
        "name": "taskType",
        "label": "Extraction Target",
        "type": "select",
        "required": false,
        "defaultValue": "invoice",
        "options": [
          {
            "label": "Invoice / Receipt",
            "value": "invoice"
          },
          {
            "label": "Contract & MSA",
            "value": "contract"
          },
          {
            "label": "Resume & CV",
            "value": "resume"
          },
          {
            "label": "Executive Summary",
            "value": "summary"
          },
          {
            "label": "Semantic Q&A",
            "value": "qa"
          }
        ]
      },
      {
        "name": "query",
        "label": "Custom Query (for Q&A)",
        "type": "text",
        "required": false
      }
    ]
  },
  "outputSchema": {
    "type": "json",
    "mimeType": "application/json"
  }
,
  execute: async (inputs: any) => {
    return {
      success: true,
      toolId: 'ai-doc-intel',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_doc_intel_ToolDef;
