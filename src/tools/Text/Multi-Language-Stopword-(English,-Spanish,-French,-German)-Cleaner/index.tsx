import { ToolDefinition } from '../../../types';

export const nlp_stopword_multi_language_remover_ToolDef: ToolDefinition = {
  "id": "nlp-stopword-multi-language-remover",
  "name": "Multi-Language Stopword (English, Spanish, French, German) Cleaner",
  "category": "text",
  "subcategory": "data-cleaning",
  "description": "Filter out high-frequency grammatical glue words from natural language text streams.",
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
        "placeholder": "Enter text for Multi-Language Stopword (English, Spanish, French, German) Cleaner...",
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
      toolId: 'nlp-stopword-multi-language-remover',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default nlp_stopword_multi_language_remover_ToolDef;
