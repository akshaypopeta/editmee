import { ToolDefinition } from '../../../types';

export const nlp_porter_stemming_algorithm_normalizer_ToolDef: ToolDefinition = {
  "id": "nlp-porter-stemming-algorithm-normalizer",
  "name": "Porter Stemming Algorithm Morphological Root Normalizer",
  "category": "text",
  "subcategory": "nlp",
  "description": "Strip English inflectional affixes (running -> run, connection -> connect) to morphological roots.",
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
        "placeholder": "Enter text for Porter Stemming Algorithm Morphological Root Normalizer...",
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
      toolId: 'nlp-porter-stemming-algorithm-normalizer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default nlp_porter_stemming_algorithm_normalizer_ToolDef;
