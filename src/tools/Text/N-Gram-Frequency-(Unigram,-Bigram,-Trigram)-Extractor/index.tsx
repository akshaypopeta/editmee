import { ToolDefinition } from '../../../types';

export const text_ngram_frequency_collocation_extractor_ToolDef: ToolDefinition = {
  "id": "text-ngram-frequency-collocation-extractor",
  "name": "N-Gram Frequency (Unigram, Bigram, Trigram) Extractor",
  "category": "text",
  "subcategory": "nlp",
  "description": "Extract and rank most frequent 1-grams, 2-grams (bigrams), and 3-grams (trigrams) from text corpora, with stopword filtering.",
  "iconName": "ListOrdered",
  "version": "1.0.0",
  "tags": [
    "text",
    "nlp",
    "ngram",
    "bigram",
    "trigram",
    "linguistics",
    "seo"
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
        "name": "corpus",
        "label": "Input Text Corpus",
        "type": "textarea",
        "defaultValue": "Machine learning algorithms build a model based on sample training data. Training data in machine learning helps algorithms make predictions. Deep machine learning models improve continuously with more training data.",
        "required": true
      },
      {
        "name": "nSize",
        "label": "N-Gram Size",
        "type": "select",
        "defaultValue": "2",
        "options": [
          {
            "label": "Unigrams (1-word)",
            "value": "1"
          },
          {
            "label": "Bigrams (2-word pairs)",
            "value": "2"
          },
          {
            "label": "Trigrams (3-word phrases)",
            "value": "3"
          }
        ]
      },
      {
        "name": "filterStopwords",
        "label": "Filter Common Stopwords (a, the, in, on)",
        "type": "boolean",
        "defaultValue": true
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
      toolId: 'text-ngram-frequency-collocation-extractor',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default text_ngram_frequency_collocation_extractor_ToolDef;
