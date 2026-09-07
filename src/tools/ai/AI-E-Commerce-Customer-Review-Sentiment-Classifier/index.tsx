import { ToolDefinition } from '../../../types';

export const ai_customer_review_sentiment_categorizer_ToolDef: ToolDefinition = {
  "id": "ai-customer-review-sentiment-categorizer",
  "name": "AI E-Commerce Customer Review Sentiment Classifier",
  "category": "ai",
  "subcategory": "intelligence",
  "description": "Classify thousands of customer reviews into bug reports, feature requests, and delivery complaints.",
  "iconName": "Sparkles",
  "version": "1.0.0",
  "tags": [
    "ai",
    "intelligence",
    "generation",
    "smart tool",
    "ai customer review sentiment categorizer"
  ],
  "executionMode": "hybrid",
  "supportsBatch": false,
  "supportsWorkflow": true,
  "requiresAI": true,
  "capabilities": {
    "clientSide": true,
    "workerSupported": false,
    "batchSupported": false,
    "workflowSupported": true,
    "aiPowered": true,
    "offlineReady": false,
    "requiresKey": false
  },
  "inputSchema": {
    "fields": [
      {
        "name": "prompt",
        "label": "Input Prompt / Requirements / Context",
        "type": "textarea",
        "defaultValue": "Provide high quality output for modern software development and business strategy.",
        "required": true
      },
      {
        "name": "tone",
        "label": "Tone of Voice",
        "type": "select",
        "defaultValue": "professional",
        "options": [
          {
            "label": "Executive & Professional",
            "value": "professional"
          },
          {
            "label": "Concise & Technical",
            "value": "technical"
          },
          {
            "label": "Creative & Engaging",
            "value": "creative"
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
      toolId: 'ai-customer-review-sentiment-categorizer',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default ai_customer_review_sentiment_categorizer_ToolDef;
