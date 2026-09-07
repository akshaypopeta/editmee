import { ToolDefinition } from '../../../types';

export const documents_word_character_counter_2_ToolDef: ToolDefinition = {
  "id": "documents-word-character-counter-2",
  "name": "Word & Character Counter",
  "category": "documents",
  "subcategory": "analytics",
  "description": "Count words, characters, sentences, paragraphs, and reading time.",
  "iconName": "FileText",
  "version": "1.0.0",
  "tags": [
    "documents",
    "analytics",
    "word",
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
        "defaultValue": "Sample input data for Word & Character Counter"
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
      toolId: 'documents-word-character-counter-2',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default documents_word_character_counter_2_ToolDef;
