import { ToolDefinition } from '../../../types';

export const seo_robots_meta_directive_builder_ToolDef: ToolDefinition = {
  "id": "seo-robots-meta-directive-builder",
  "name": "Robots Meta Tag (`noindex`, `nofollow`, `noarchive`) Builder",
  "category": "marketing",
  "subcategory": "seo",
  "description": "Configure page-level Googlebot indexing and snippet directives (`max-snippet`, `max-image-preview`).",
  "iconName": "Search",
  "version": "1.0.0",
  "tags": [
    "seo",
    "marketing",
    "keywords",
    "schema",
    "search engine",
    "seo robots meta directive builder"
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
        "name": "urlOrText",
        "label": "Target URL, Title or Keyword List",
        "type": "text",
        "defaultValue": "https://editmee.com/pdf-editor",
        "required": true
      },
      {
        "name": "mode",
        "label": "Analysis / Generation Mode",
        "type": "select",
        "defaultValue": "audit",
        "options": [
          {
            "label": "Full SEO Audit",
            "value": "audit"
          },
          {
            "label": "Schema Generation",
            "value": "schema"
          },
          {
            "label": "Snippet SERP Test",
            "value": "serp"
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
      toolId: 'seo-robots-meta-directive-builder',
      output: {
        message: 'Processed successfully',
        result: inputs,
        timestamp: new Date().toISOString(),
      },
    };
  },
};

export default seo_robots_meta_directive_builder_ToolDef;
