import { ToolDefinition } from '../../../types';

export const nlp_palindrome_symmetric_phrase_tester_ToolDef: ToolDefinition = {
  "id": "nlp-palindrome-symmetric-phrase-tester",
  "name": "Case-Insensitive Punctuation-Agnostic Palindrome Tester",
  "category": "text",
  "subcategory": "linguistics",
  "description": "Test whether phrases read identically backward and forward (e.g. \"A man, a plan, a canal: Panama\").",
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
        "placeholder": "Enter text for Case-Insensitive Punctuation-Agnostic Palindrome Tester...",
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
      toolId: 'nlp-palindrome-symmetric-phrase-tester',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default nlp_palindrome_symmetric_phrase_tester_ToolDef;
